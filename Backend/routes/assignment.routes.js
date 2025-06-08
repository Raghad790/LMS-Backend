import { Router } from "express";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignment,
  getLessonAssignments,
} from "../controllers/assignment.controllers.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public: Get a single assignment (students must be enrolled)
router.get("/:id", authenticate, getAssignment);

// Public: Get all assignments for a lesson (students must be enrolled)
router.get("/lesson/:lesson_id", authenticate, getLessonAssignments);

// Instructor/Admin: Create, update, delete assignment
router.post(
  "/",
  authenticate,
  authorize(["instructor", "admin"]),
  createAssignment
);
router.put(
  "/:id",
  authenticate,
  authorize(["instructor", "admin"]),
  updateAssignment
);
router.delete(
  "/:id",
  authenticate,
  authorize(["instructor", "admin"]),
  deleteAssignment
);

export default router;
