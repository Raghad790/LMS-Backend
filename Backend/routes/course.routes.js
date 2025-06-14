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
import { validateBody } from "../middleware/validation.js";
import { courseSchema, courseUpdateSchema } from "../utils/courseValidation.js";

const router = Router();

// Create a new course (instructor or admin)
router.post("/", authenticate, authorize("instructor", "admin"), validateBody(courseSchema), createCourse);

// Update a course (instructor or admin)
router.put("/:id", authenticate, authorize("instructor", "admin"), validateBody(courseUpdateSchema), updateCourse);

// Delete a course (instructor or admin)
router.delete("/:id", authenticate, authorize("instructor", "admin"), deleteCourse);

// Get all courses (with filters)
router.get("/", getCourses);

// Search courses
router.get("/search", searchCourses);

// Get a single course by ID (public or protected as needed)
router.get("/:id", getCourse);

// Approve a course (admin only)
router.post("/:id/approve", authenticate, authorize("admin"), approveCourse);

// Get courses for the current instructor
router.get("/me/mine", authenticate, authorize("instructor"), getMyCourses);

export default router;