import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetCourseAnalyticsQuery } from "@/features/api/analyticsApi";
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
  Cell
} from "recharts";
import {
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
  Award,
  Activity,
  Eye,
  Clock
} from "lucide-react";

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useGetCourseAnalyticsQuery(courseId);
  const [selectedMetric, setSelectedMetric] = useState("enrollments");

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Failed to Load Course Analytics</h1>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );

  const {
    course,
    purchases,
    progressData,
    lectureCompletion,
    dailyEnrollments,
    stats
  } = data.data;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Prepare lecture completion data for chart
  const lectureCompletionData = Object.entries(lectureCompletion).map(([lectureId, data], index) => ({
    lecture: `Lecture ${index + 1}`,
    completed: data.viewed,
    total: data.total,
    completionRate: (data.viewed / data.total) * 100
  }));

  // Prepare student progress distribution
  const progressDistribution = [
    { name: 'Not Started', value: purchases.length - progressData.length, color: '#ff6b6b' },
    { name: 'In Progress', value: progressData.filter(p => !p.completed).length, color: '#feca57' },
    { name: 'Completed', value: progressData.filter(p => p.completed).length, color: '#48dbfb' }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{course.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEnrollments}</div>
            <p className="text-xs text-gray-500 mt-1">Students enrolled</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From this course</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Students completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Course Price</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{course.price}</div>
            <p className="text-xs text-gray-500 mt-1">Current price</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Daily Enrollments */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Daily Enrollments (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyEnrollments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="_id" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [value, 'Enrollments']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Progress Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Student Progress Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lecture Completion Analysis */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Lecture-wise Completion Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={lectureCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="lecture" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'completionRate' ? `${value.toFixed(1)}%` : value,
                  name === 'completionRate' ? 'Completion Rate' : 
                  name === 'completed' ? 'Completed' : 'Total'
                ]}
              />
              <Bar dataKey="completed" fill="#10b981" name="completed" />
              <Bar dataKey="total" fill="#e5e7eb" name="total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Enrolled Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const progress = progressData.find(p => p.userId._id === purchase.userId._id);
              return (
                <div key={purchase._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={purchase.userId.photoUrl || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{purchase.userId.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{purchase.userId.name}</h4>
                      <p className="text-sm text-gray-500">{purchase.userId.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={progress?.completed ? "default" : "secondary"}>
                      {progress?.completed ? "Completed" : progress ? "In Progress" : "Not Started"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Enrolled: {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseAnalytics;