import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  createAssignment,
  getAssignment,
  getLessonAssignments,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controllers.js";
import {
  assignmentCreateSchema,
  assignmentUpdateSchema,
} from "../utils/assignmentValidation.js";
const router = Router();
// Create assignment
router.post(
  "/assignments",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(assignmentCreateSchema),
  createAssignment
);

// Update assignment
router.put(
  "/assignments/:id",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(assignmentUpdateSchema),
  updateAssignment
);

// Get assignment by ID (students must be enrolled, handled in controller)
router.get("/assignments/:id", authenticate, getAssignment);

// Get all assignments for a lesson (students must be enrolled, handled in controller)
router.get(
  "/lessons/:lesson_id/assignments",
  authenticate,
  getLessonAssignments
);

// Delete assignment (instructor or admin)
router.delete(
  "/assignments/:id",
  authenticate,
  authorize("instructor", "admin"),
  deleteAssignment
);

export default router;
