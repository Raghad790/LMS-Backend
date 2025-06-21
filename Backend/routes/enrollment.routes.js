import { Router } from "express";
import {
  enrollInCourse,
  unenrollCourse,
  updateProgress,
  getUserEnrollments,
  getCourseEnrollments,
  getEnrollmentById,
  isUserEnrolled,
  getAllEnrollments,
} from "../controllers/enrollment.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Get all enrollments (admin) - most general route needs to be first
router.get("/", authenticate, authorize("admin"), getAllEnrollments);

// Get all enrollments for the current user - specific routes before parameterized
router.get("/my-courses", authenticate, getUserEnrollments);

// Update enrollment progress - specific routes before parameterized
router.put("/progress", authenticate, updateProgress);

// Get all enrollments for a user (admin or self)
router.get("/user/:user_id", authenticate, getUserEnrollments);

// Get a single enrollment by ID
router.get("/:enrollment_id", authenticate, getEnrollmentById);

// Enroll in a course
router.post(
  "/courses/:course_id/enroll/:user_id",
  authenticate,
  enrollInCourse
);

// Unenroll from a course
router.delete(
  "/courses/:course_id/enroll/:user_id",
  authenticate,
  unenrollCourse
);

// Get all enrollments for a course
router.get("/courses/:course_id", authenticate, getCourseEnrollments);

// Check if a user is enrolled in a course
router.get(
  "/courses/:course_id/user/:user_id/status",
  authenticate,
  isUserEnrolled
);
export default router;
