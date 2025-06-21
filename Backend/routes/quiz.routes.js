import { Router } from "express";
import {
  addQuizQuestion,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  getCourseQuizzes,
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

// All routes require authentication
router.use(authenticate);

// Course quizzes (list all)
router.get("/course/:courseId", getCourseQuizzes);

// Get quiz questions for a specific lesson
router.get("/lesson/:lessonId", getQuiz);

// Instructor/Admin: Create a quiz
router.post(
  "/",
  authorize("instructor", "admin"),
  validateBody(quizCreateSchema),
  createQuiz
);

// Add a question to a lesson's quiz - specific route should come before parameterized routes
router.post("/questions", authorize("instructor", "admin"), addQuizQuestion);

// Submit quiz answers (for students)
router.post(
  "/:lessonId/submit",
  authorize("student"),
  validateBody(quizSubmissionSchema),
  submitQuiz
);

// Instructor/Admin: Update a quiz
router.put(
  "/:id",
  authorize("instructor", "admin"),
  validateBody(quizUpdateSchema),
  updateQuiz
);

// Instructor/Admin: Delete a quiz
router.delete("/:id", authorize("instructor", "admin"), deleteQuiz);

export default router;
