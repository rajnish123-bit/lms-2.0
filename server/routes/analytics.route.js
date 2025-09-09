import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  getDashboardAnalytics, 
  getCourseAnalytics, 
  getStudentAnalytics 
} from "../controllers/analytics.controller.js";

const router = express.Router();

// Dashboard analytics route
router.route("/dashboard").get(isAuthenticated, getDashboardAnalytics);

// Course specific analytics
router.route("/course/:courseId").get(isAuthenticated, getCourseAnalytics);

// Student analytics
router.route("/students").get(isAuthenticated, getStudentAnalytics);

export default router;