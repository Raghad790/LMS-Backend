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
  "/",
  authorize("instructor", "admin"),
  validateBody(createLessonSchema),
  createLesson
);

// Get all lessons for a module - specific route needs to be before parameterized routes
router.get("/module/:module_id", getModuleLessons);

// Get a single lesson by ID
router.get("/:id", getLessonById);

// Update a lesson
router.put(
  "/:id",
  authorize("instructor", "admin"),
  validateBody(updateLessonSchema),
  updateLesson
);

// Delete a lesson
router.delete("/:id", authorize("instructor", "admin"), deleteLesson);

export default router;
