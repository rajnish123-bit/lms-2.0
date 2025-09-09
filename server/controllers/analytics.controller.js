import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import mongoose from "mongoose";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const instructorId = req.id;

    // Get all courses created by this instructor
    const instructorCourses = await Course.find({ creator: instructorId });
    const courseIds = instructorCourses.map(course => course._id);

    // Get all purchases for instructor's courses
    const purchases = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed"
    }).populate("courseId").populate("userId", "name email photoUrl");

    // Calculate total revenue
    const totalRevenue = purchases.reduce((acc, purchase) => acc + (purchase.amount || 0), 0);

    // Calculate total sales
    const totalSales = purchases.length;

    // Get total students (unique users who purchased courses)
    const uniqueStudents = [...new Set(purchases.map(purchase => purchase.userId._id.toString()))];
    const totalStudents = uniqueStudents.length;

    // Get total courses
    const totalCourses = instructorCourses.length;

    // Get published courses count
    const publishedCourses = instructorCourses.filter(course => course.isPublished).length;

    // Get course completion rates
    const courseCompletionData = await Promise.all(
      instructorCourses.map(async (course) => {
        const enrolledCount = course.enrolledStudents.length;
        const completedCount = await CourseProgress.countDocuments({
          courseId: course._id,
          completed: true
        });
        
        return {
          courseId: course._id,
          courseTitle: course.courseTitle,
          enrolledCount,
          completedCount,
          completionRate: enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0
        };
      })
    );

    // Monthly revenue data for chart
    const monthlyRevenue = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          status: "completed",
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } // Current year
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$amount" },
          sales: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Format monthly data for chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const formattedMonthlyData = monthNames.map((month, index) => {
      const monthData = monthlyRevenue.find(item => item._id.month === index + 1);
      return {
        month,
        revenue: monthData ? monthData.revenue : 0,
        sales: monthData ? monthData.sales : 0
      };
    });

    // Top performing courses
    const topCourses = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          status: "completed"
        }
      },
      {
        $group: {
          _id: "$courseId",
          revenue: { $sum: "$amount" },
          sales: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $unwind: "$course"
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          courseTitle: "$course.courseTitle",
          revenue: 1,
          sales: 1,
          coursePrice: "$course.coursePrice"
        }
      }
    ]);

    // Recent enrollments
    const recentEnrollments = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed"
    })
    .populate("courseId", "courseTitle courseThumbnail")
    .populate("userId", "name email photoUrl")
    .sort({ createdAt: -1 })
    .limit(10);

    // Student engagement data
    const studentEngagement = await CourseProgress.aggregate([
      {
        $match: {
          courseId: { $in: courseIds }
        }
      },
      {
        $group: {
          _id: "$courseId",
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: {
              $cond: [
                { $gt: [{ $size: "$lectureProgress" }, 0] },
                1,
                0
              ]
            }
          },
          completedStudents: {
            $sum: {
              $cond: ["$completed", 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $unwind: "$course"
      },
      {
        $project: {
          courseTitle: "$course.courseTitle",
          totalStudents: 1,
          activeStudents: 1,
          completedStudents: 1,
          engagementRate: {
            $cond: [
              { $gt: ["$totalStudents", 0] },
              { $multiply: [{ $divide: ["$activeStudents", "$totalStudents"] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalSales,
          totalStudents,
          totalCourses,
          publishedCourses
        },
        monthlyRevenue: formattedMonthlyData,
        topCourses,
        recentEnrollments,
        courseCompletionData,
        studentEngagement,
        purchasedCourses: purchases // Keep for backward compatibility
      }
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics"
    });
  }
};

export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.id;

    // Verify course belongs to instructor
    const course = await Course.findOne({ _id: courseId, creator: instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unauthorized"
      });
    }

    // Get course purchases
    const purchases = await CoursePurchase.find({
      courseId,
      status: "completed"
    }).populate("userId", "name email photoUrl");

    // Get course progress data
    const progressData = await CourseProgress.find({ courseId })
      .populate("userId", "name email photoUrl");

    // Calculate lecture-wise completion
    const lectureCompletion = {};
    progressData.forEach(progress => {
      progress.lectureProgress.forEach(lecture => {
        if (!lectureCompletion[lecture.lectureId]) {
          lectureCompletion[lecture.lectureId] = { viewed: 0, total: 0 };
        }
        lectureCompletion[lecture.lectureId].total++;
        if (lecture.viewed) {
          lectureCompletion[lecture.lectureId].viewed++;
        }
      });
    });

    // Get daily enrollment data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEnrollments = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId),
          status: "completed",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          enrollments: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.courseTitle,
          thumbnail: course.courseThumbnail,
          price: course.coursePrice,
          isPublished: course.isPublished
        },
        purchases,
        progressData,
        lectureCompletion,
        dailyEnrollments,
        stats: {
          totalEnrollments: purchases.length,
          totalRevenue: purchases.reduce((acc, p) => acc + p.amount, 0),
          completionRate: progressData.length > 0 ? 
            (progressData.filter(p => p.completed).length / progressData.length) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error("Course analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course analytics"
    });
  }
};

export const getStudentAnalytics = async (req, res) => {
  try {
    const instructorId = req.id;

    // Get all courses by instructor
    const instructorCourses = await Course.find({ creator: instructorId });
    const courseIds = instructorCourses.map(course => course._id);

    // Get all students who purchased instructor's courses
    const students = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed"
    })
    .populate("userId", "name email photoUrl createdAt")
    .populate("courseId", "courseTitle");

    // Group by student and calculate their progress
    const studentMap = new Map();
    
    for (const purchase of students) {
      const studentId = purchase.userId._id.toString();
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: purchase.userId,
          courses: [],
          totalSpent: 0,
          coursesCompleted: 0,
          averageProgress: 0
        });
      }
      
      const studentData = studentMap.get(studentId);
      studentData.courses.push({
        course: purchase.courseId,
        purchaseDate: purchase.createdAt,
        amount: purchase.amount
      });
      studentData.totalSpent += purchase.amount;
    }

    // Get progress data for each student
    for (const [studentId, studentData] of studentMap) {
      const progressRecords = await CourseProgress.find({
        userId: studentId,
        courseId: { $in: courseIds }
      });

      let totalProgress = 0;
      let completedCourses = 0;

      progressRecords.forEach(progress => {
        if (progress.completed) {
          completedCourses++;
          totalProgress += 100;
        } else {
          // Calculate partial progress
          const viewedLectures = progress.lectureProgress.filter(lp => lp.viewed).length;
          const totalLectures = progress.lectureProgress.length;
          const courseProgress = totalLectures > 0 ? (viewedLectures / totalLectures) * 100 : 0;
          totalProgress += courseProgress;
        }
      });

      studentData.coursesCompleted = completedCourses;
      studentData.averageProgress = progressRecords.length > 0 ? 
        totalProgress / progressRecords.length : 0;
    }

    // Convert map to array and sort by total spent
    const studentsArray = Array.from(studentMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Get top students by spending
    const topStudents = studentsArray.slice(0, 10);

    // Get student registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const registrationTrends = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          status: "completed",
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          newStudents: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          _id: 1,
          studentCount: { $size: "$newStudents" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: studentMap.size,
        topStudents,
        allStudents: studentsArray,
        registrationTrends,
        stats: {
          averageSpending: studentsArray.length > 0 ? 
            studentsArray.reduce((acc, s) => acc + s.totalSpent, 0) / studentsArray.length : 0,
          highestSpender: studentsArray.length > 0 ? studentsArray[0] : null,
          totalRevenue: studentsArray.reduce((acc, s) => acc + s.totalSpent, 0)
        }
      }
    });

  } catch (error) {
    console.error("Student analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student analytics"
    });
  }
};