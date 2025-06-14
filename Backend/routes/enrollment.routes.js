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

// Update enrollment progress
router.put("/enrollments/progress", authenticate, updateProgress);

// Get all enrollments for the current user
router.get("/enrollments/my-courses", authenticate, getUserEnrollments);

// Get all enrollments for a user (admin or self)
router.get("/enrollments/user/:user_id", authenticate, getUserEnrollments);

// Get all enrollments for a course
router.get(
  "/courses/:course_id/enrollments",
  authenticate,
  getCourseEnrollments
);

// Get a single enrollment by ID
router.get("/enrollments/:enrollment_id", authenticate, getEnrollmentById);

// Check if a user is enrolled in a course
router.get(
  "/courses/:course_id/enrollments/:user_id/status",
  authenticate,
  isUserEnrolled
);

// Get all enrollments (admin)

router.get("/enrollments", authenticate, authorize("admin"), getAllEnrollments);
export default router;
