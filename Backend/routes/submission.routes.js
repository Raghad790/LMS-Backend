import { Router } from "express";
import {
  submitAssignment,
  gradeSubmission,
  getSubmission,
  getAssignmentSubmissions,
  getUserSubmissions,
} from "../controllers/submission.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  submissionCreateSchema,
  submissionGradeSchema,
} from "../utils/submissionValidation.js";

const router = Router();

// Student: Submit an assignment
router.post(
  "/",
  authenticate,
  authorize(["student"]),
  validateBody(submissionCreateSchema),
  submitAssignment
);

// Instructor/Admin: Grade a submission
router.put(
  "/:id/grade",
  authenticate,
  authorize(["instructor", "admin"]),
  validateBody(submissionGradeSchema),
  gradeSubmission
);

// Get a single submission (student who submitted, instructor, or admin)
router.get("/:id", authenticate, getSubmission);

// Instructor/Admin: Get all submissions for an assignment
router.get(
  "/assignment/:assignment_id",
  authenticate,
  authorize(["instructor", "admin"]),
  getAssignmentSubmissions
);

// Student/Admin: Get all submissions by a user
router.get("/user/:user_id", authenticate, getUserSubmissions);

export default router;