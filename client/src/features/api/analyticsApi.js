import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ANALYTICS_API = "http://localhost:8080/api/v1/analytics";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ANALYTICS_API,
    credentials: "include",
  }),
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      providesTags: ["Analytics"],
    }),
    getCourseAnalytics: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Analytics"],
    }),
    getStudentAnalytics: builder.query({
      query: () => ({
        url: "/students",
        method: "GET",
      }),
      providesTags: ["Analytics"],
    }),
  getStudentDetail: builder.query({
    query: (studentId) => ({
      url: `/student/${studentId}`,
      method: "GET",
    }),
    providesTags: ["Analytics"],
  }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetStudentAnalyticsQuery,
  useGetStudentDetailQuery,
} = analyticsApi;