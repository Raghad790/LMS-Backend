import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getModuleLessons,
  getLessonById,
} from "../controllers/lesson.controller.js";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../utils/lessonValidation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a lesson (instructor or admin)
router.post(
  "/lessons",
  authorize("instructor", "admin"),
  validateBody(createLessonSchema),
  createLesson
);

// Update a lesson
router.put(
  "/lessons/:id",
  authorize("instructor", "admin"),
  validateBody(updateLessonSchema),
  updateLesson
);

// Delete a lesson
router.delete(
  "/lessons/:id",
  authorize("instructor", "admin"),
  deleteLesson
);

// Get all lessons for a module
router.get("/modules/:module_id/lessons", getModuleLessons);

// Get a single lesson by ID
router.get("/lessons/:id", getLessonById);

export default router;