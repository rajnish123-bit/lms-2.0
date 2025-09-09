import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetStudentDetailQuery } from "@/features/api/analyticsApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  PlayCircle,
  CheckCircle2,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Video,
  FileText,
  Target
} from "lucide-react";

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetStudentDetailQuery(studentId);
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Failed to Load Student Details</h1>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );

  const {
    student,
    purchasedCourses,
    progressData,
    stats,
    activityTimeline,
    completionTrends
  } = data.data;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare course completion data for pie chart
  const courseCompletionData = [
    { name: 'Completed', value: stats.completedCourses, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressCourses, color: '#f59e0b' },
    { name: 'Not Started', value: stats.notStartedCourses, color: '#ef4444' }
  ];

  // Calculate overall progress percentage
  const overallProgress = stats.totalCourses > 0 ? 
    ((stats.completedCourses + (stats.inProgressCourses * 0.5)) / stats.totalCourses) * 100 : 0;

  // Prepare detailed course progress data
  const detailedCourseProgress = purchasedCourses.map(courseData => {
    const progress = progressData.find(p => p.courseId._id === courseData.course._id);
    const progressPercentage = progress ? 
      (progress.lectureProgress.filter(lp => lp.viewed).length / progress.lectureProgress.length) * 100 : 0;
    
    return {
      ...courseData,
      progress,
      progressPercentage,
      status: progress?.completed ? 'Completed' : progressPercentage > 0 ? 'In Progress' : 'Not Started'
    };
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/analytics/students")}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Detailed learning analytics and progress</p>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photoUrl || "https://github.com/shadcn.png"} />
              <AvatarFallback className="text-2xl">{student.name?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹{stats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{overallProgress.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="progress">Detailed Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Course Completion Overview */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Course Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={courseCompletionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {courseCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold">{stats.totalLecturesWatched}</div>
                      <div className="text-sm text-gray-600">Lectures Watched</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-lg font-bold">{Math.round(stats.totalWatchTime / 60)}h</div>
                      <div className="text-sm text-gray-600">Watch Time</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-lg font-bold">{stats.averageProgress.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Avg Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchased Courses List with Enhanced Details */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Purchased Courses ({purchasedCourses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedCourseProgress.map((courseData) => {
                  const { course, progress, progressPercentage, status } = courseData;
                  
                  return (
                    <div 
                      key={course._id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={course.courseThumbnail} 
                            alt={course.courseTitle}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-lg">{course.courseTitle}</h4>
                            <p className="text-sm text-gray-500">
                              Purchased on {new Date(courseData.purchaseDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={status === 'Completed' ? "default" : status === 'In Progress' ? "secondary" : "outline"}>
                                {status}
                              </Badge>
                              <span className="text-sm text-gray-500">₹{courseData.amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(1)}%</div>
                          <Progress value={progressPercentage} className="w-32 mt-2" />
                        </div>
                      </div>

                      {/* Lecture Progress Details */}
                      {progress && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-3 flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            Lecture Progress ({progress.lectureProgress.filter(lp => lp.viewed).length}/{progress.lectureProgress.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {progress.lectureProgress.map((lectureProgress, index) => (
                              <div key={lectureProgress.lectureId} className="flex items-center gap-2 p-2 bg-white rounded">
                                {lectureProgress.viewed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">Lecture {index + 1}</span>
                                {lectureProgress.viewed && (
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {selectedCourse ? (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-700">
                    Course Progress: {selectedCourse.course.courseTitle}
                  </CardTitle>
                  <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                    View All Courses
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const progress = progressData.find(p => p.courseId._id === selectedCourse.course._id);
                  if (!progress) {
                    return <p className="text-gray-500">No progress data available for this course.</p>;
                  }

                  const completedLectures = progress.lectureProgress.filter(lp => lp.viewed).length;
                  const totalLectures = progress.lectureProgress.length;
                  const progressPercentage = (completedLectures / totalLectures) * 100;

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h3 className="text-lg font-semibold">Overall Progress</h3>
                          <p className="text-sm text-gray-600">
                            {completedLectures} of {totalLectures} lectures completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(1)}%</div>
                          <Progress value={progressPercentage} className="w-32 mt-2" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg">Lecture Progress</h4>
                        {progress.lectureProgress.map((lectureProgress, index) => (
                          <div key={lectureProgress.lectureId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {lectureProgress.viewed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="font-medium">Lecture {index + 1}</span>
                            </div>
                            <Badge variant={lectureProgress.viewed ? "default" : "secondary"}>
                              {lectureProgress.viewed ? "Completed" : "Not Started"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Course Progress Overview */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-700">Detailed Course Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {detailedCourseProgress.map((courseData) => {
                      const { course, progress, progressPercentage, status } = courseData;
                      
                      return (
                        <div key={course._id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-lg">{course.courseTitle}</h4>
                                <p className="text-sm text-gray-500">₹{courseData.amount}</p>
                              </div>
                            </div>
                            <Badge variant={status === 'Completed' ? "default" : status === 'In Progress' ? "secondary" : "outline"}>
                              {status}
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Overall Progress</span>
                              <span className="text-sm font-bold">{progressPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="w-full" />

                            {progress && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">
                                    {progress.lectureProgress.length}
                                  </div>
                                  <div className="text-xs text-gray-600">Total Lectures</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">
                                    {progress.lectureProgress.filter(lp => lp.viewed).length}
                                  </div>
                                  <div className="text-xs text-gray-600">Completed</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                  <div className="text-lg font-bold text-orange-600">
                                    {progress.lectureProgress.filter(lp => !lp.viewed).length}
                                  </div>
                                  <div className="text-xs text-gray-600">Remaining</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <div className="text-lg font-bold text-purple-600">
                                    {progress.completed ? '100%' : progressPercentage.toFixed(0) + '%'}
                                  </div>
                                  <div className="text-xs text-gray-600">Completion</div>
                                </div>
                              </div>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCourse(courseData)}
                              className="mt-4"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Detailed Progress
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Completion Trends */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Learning Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={completionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, 'Progress']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Performance */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">Course Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detailedCourseProgress.map(cp => ({
                    course: cp.course.courseTitle.substring(0, 15) + '...',
                    progress: cp.progressPercentage,
                    amount: cp.amount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="course" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'progress' ? `${value.toFixed(1)}%` : `₹${value}`,
                        name === 'progress' ? 'Progress' : 'Amount Paid'
                      ]}
                    />
                    <Bar dataKey="progress" fill="#10b981" name="progress" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-700">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.averageProgress.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
                  <div className="text-sm text-gray-600">Courses Completed</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{Math.round(stats.totalWatchTime / 60)}</div>
                  <div className="text-sm text-gray-600">Hours Watched</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Investment</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityTimeline.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'course_purchased' && <DollarSign className="h-5 w-5 text-green-500" />}
                      {activity.type === 'lecture_completed' && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'course_completed' && <Award className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetail;