import { Router } from "express";
import {
  enrollInCourse,
  updateProgress,
  getUserEnrollments,
  getCourseEnrollments,
  getEnrollmentById,
} from "../controllers/enrollment.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

//Enroll in a course
router.post("/", authenticate, enrollInCourse);
// Update enrollment progress
router.put("/progress", authenticate, updateProgress);

// Get all enrollments for a user
router.get("/user/:user_id", authenticate, getUserEnrollments);

// Get all enrollments for a course
router.get("/course/:course_id", authenticate, getCourseEnrollments);

// Get a single enrollment by ID
router.get("/:enrollment_id", authenticate, getEnrollmentById);
export default router;
