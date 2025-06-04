import { Router } from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getCourse,
  searchCourses,
  approveCourse,
  getMyCourses,
} from "../controllers/course.controller.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Create a new course (instructors only)
router.post("/", authenticate, authorize("instructor"), createCourse);

// Update a course (owner or admin)
router.put("/:id", authenticate, updateCourse);

// Delete a course (owner or admin)
router.delete("/:id", authenticate, deleteCourse);

// Get all courses (with filters)
router.get("/", getCourses);

// Search courses
router.get("/search", searchCourses);

// Get a single course by ID (put this AFTER /search)
router.get("/:id", authenticate, getCourse);

// Approve a course (admin only)
router.post("/:id/approve", authenticate, authorize("admin"), approveCourse);

// Get courses for the current instructor
router.get("/me/mine", authenticate, authorize("instructor"), getMyCourses);

export default router;