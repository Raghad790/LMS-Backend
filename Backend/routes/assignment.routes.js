import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  createAssignment,
  getAssignment,
  getLessonAssignments,
  updateAssignment,
  deleteAssignment,
  getPendingGradingAssignments,
} from "../controllers/assignment.controller.js";
import {
  assignmentCreateSchema,
  assignmentUpdateSchema,
} from "../utils/assignmentValidation.js";
import authLogger from "../middleware/authLogger.js";

const router = Router();

// Create assignment
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(assignmentCreateSchema),
  createAssignment
);

// Update assignment
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(assignmentUpdateSchema),
  updateAssignment
);

// Get assignment by ID
router.get("/:id", authenticate, getAssignment);

// Get all assignments for a lesson
router.get("/lesson/:lesson_id", authenticate, getLessonAssignments);

// Delete assignment
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  deleteAssignment
);

// Get assignments pending grading - note the path is now "/pending-grading"
router.get(
  "/pending-grading",
  authLogger,
  authenticate,
  authorize("instructor", "admin"),
  getPendingGradingAssignments
);

export default router;
