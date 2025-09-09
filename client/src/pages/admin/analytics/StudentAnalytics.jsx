import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useGetStudentAnalyticsQuery } from "@/features/api/analyticsApi";
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
  Search,
  Award,
  Activity,
  Calendar,
  Target
} from "lucide-react";

const StudentAnalytics = () => {
  const { data, isLoading, isError } = useGetStudentAnalyticsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalSpent");

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Failed to Load Student Analytics</h1>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );

  const {
    totalStudents,
    topStudents,
    allStudents,
    registrationTrends,
    stats
  } = data.data;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Filter and sort students
  const filteredStudents = allStudents
    .filter(student => 
      student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'coursesCompleted':
          return b.coursesCompleted - a.coursesCompleted;
        case 'averageProgress':
          return b.averageProgress - a.averageProgress;
        case 'name':
          return a.student.name.localeCompare(b.student.name);
        default:
          return 0;
      }
    });

  // Prepare spending distribution data
  const spendingRanges = [
    { range: '₹0-₹1000', count: 0 },
    { range: '₹1000-₹5000', count: 0 },
    { range: '₹5000-₹10000', count: 0 },
    { range: '₹10000-₹25000', count: 0 },
    { range: '₹25000+', count: 0 }
  ];

  allStudents.forEach(student => {
    const spent = student.totalSpent;
    if (spent <= 1000) spendingRanges[0].count++;
    else if (spent <= 5000) spendingRanges[1].count++;
    else if (spent <= 10000) spendingRanges[2].count++;
    else if (spent <= 25000) spendingRanges[3].count++;
    else spendingRanges[4].count++;
  });

  // Format registration trends for chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formattedRegistrationTrends = registrationTrends.map(trend => ({
    month: monthNames[trend._id.month - 1],
    students: trend.studentCount
  }));

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive analysis of your student base and their learning patterns
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">Unique learners</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From all students</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Spending</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{Math.round(stats.averageSpending).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Per student</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Spender</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{stats.highestSpender?.totalSpent.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.highestSpender?.student.name || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Registration Trends */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Student Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedRegistrationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [value, 'New Students']}
                />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Student Spending Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [value, 'Students']}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Top 10 Students by Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {topStudents.map((studentData, index) => (
              <div key={studentData.student._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={studentData.student.photoUrl || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{studentData.student.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{studentData.student.name}</h4>
                    <p className="text-sm text-gray-500">{studentData.courses.length} courses</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">₹{studentData.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{studentData.coursesCompleted} completed</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Students Table */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            All Students
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="totalSpent">Sort by Spending</option>
              <option value="coursesCompleted">Sort by Completed</option>
              <option value="averageProgress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredStudents.map((studentData) => (
              <div key={studentData.student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={studentData.student.photoUrl || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{studentData.student.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{studentData.student.name}</h4>
                    <p className="text-sm text-gray-500">{studentData.student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">₹{studentData.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{studentData.courses.length}</div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{studentData.coursesCompleted}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{studentData.averageProgress.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Avg Progress</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalytics;