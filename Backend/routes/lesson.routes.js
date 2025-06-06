import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getModuleLessons,
  getLessonById,
} from "../controllers/lesson.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a lesson (instructor or admin)
router.post("/", authorize(["instructor", "admin"]), createLesson);

// Update a lesson
router.put("/:id", authorize(["instructor", "admin"]), updateLesson);

// Delete a lesson
router.delete("/:id", authorize(["instructor", "admin"]), deleteLesson);

// Get all lessons for a module
router.get("/module/:module_id", getModuleLessons);

// Get a single lesson by ID
router.get("/:id", getLessonById);

export default router;