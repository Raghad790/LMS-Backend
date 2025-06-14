import { Router } from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  submitQuiz,
} from "../controllers/quiz.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  quizCreateSchema,
  quizUpdateSchema,
  quizSubmissionSchema,
} from "../utils/quizValidation.js";

const router = Router();

// Get a quiz by ID (students must be enrolled)
router.get("/:id", authenticate, getQuiz);

// Instructor/Admin: Create a quiz
router.post(
  "/",
  authenticate,
  authorize(["instructor", "admin"]),
  validateBody(quizCreateSchema),
  createQuiz
);

// Instructor/Admin: Update a quiz
router.put(
  "/:id",
  authenticate,
  authorize(["instructor", "admin"]),
  validateBody(quizUpdateSchema),
  updateQuiz
);

// Instructor/Admin: Delete a quiz
router.delete(
  "/:id",
  authenticate,
  authorize(["instructor", "admin"]),
  deleteQuiz
);

// Student: Submit a quiz (auto-grade)
router.post(
  "/:id/submit",
  authenticate,
  authorize(["student"]),
  validateBody(quizSubmissionSchema),
  submitQuiz
);

export default router;