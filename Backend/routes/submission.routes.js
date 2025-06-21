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

// All routes require authentication
router.use(authenticate);

// Student: Submit an assignment
router.post(
  "/",
  authorize("student"),
  validateBody(submissionCreateSchema),
  submitAssignment
);

// Instructor/Admin: Get all submissions for an assignment - specific routes first
router.get(
  "/assignment/:assignment_id",
  authorize("instructor", "admin"),
  getAssignmentSubmissions
);

// Student/Admin: Get all submissions by a user - specific routes first
router.get("/user/:user_id", getUserSubmissions);

// Instructor/Admin: Grade a submission
router.put(
  "/:id/grade",
  authorize("instructor", "admin"),
  validateBody(submissionGradeSchema),
  gradeSubmission
);

// Get a single submission (student who submitted, instructor, or admin)
router.get("/:id", getSubmission);

export default router;
