import { Router } from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  submitQuiz,
} from "../controllers/quiz.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
const router=Router();


// Public: Get a quiz (students must be enrolled)
router.get("/:id", authenticate, getQuiz);

// Instructor/Admin: Create, update, delete quiz
router.post("/", authenticate, authorize(["instructor", "admin"]), createQuiz);
router.put("/:id", authenticate, authorize(["instructor", "admin"]), updateQuiz);
router.delete("/:id", authenticate, authorize(["instructor", "admin"]), deleteQuiz);

// Student: Submit a quiz
router.post("/:id/submit", authenticate, authorize(["student"]), submitQuiz);

export default router;