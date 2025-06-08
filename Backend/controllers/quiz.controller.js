import QuizModel from "../models/quiz.model.js";
import LessonModel from "../models/lesson.model.js";
import UserEnrollment from "../models/enrollment.model.js";
import { quizCreateSchema, quizUpdateSchema, quizSubmissionSchema } from "../utils/quizValidation.js";

// Create a new quiz (instructor or admin)
export const createQuiz = async (req, res, next) => {
  try {
    const { error, value } = quizCreateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Verify lesson exists and user is the instructor or admin
    const lesson = await LessonModel.getLessonById(value.lesson_id);
    if (!lesson) throw new Error('Lesson not found');
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can create quizzes');
    }

    const quiz = await QuizModel.createQuiz({
      lesson_id: value.lesson_id,
      question: value.question,
      options: value.options,
      correct_answer: value.correct_answer,
      max_score: value.max_score || 10
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    next(err);
  }
};

// Update a quiz
export const updateQuiz = async (req, res, next) => {
  try {
    const { error, value } = quizUpdateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error('Quiz not found');

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can update quizzes');
    }

    const updatedQuiz = await QuizModel.updateQuiz(
      req.params.id,
      {
        question: value.question,
        options: value.options,
        correct_answer: value.correct_answer,
        max_score: value.max_score
      }
    );

    res.json({ success: true, quiz: updatedQuiz });
  } catch (err) {
    next(err);
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error('Quiz not found');

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can delete quizzes');
    }

    const success = await QuizModel.deleteQuiz(req.params.id);

    res.json({
      success,
      message: success ? 'Quiz deleted successfully' : 'Failed to delete quiz'
    });
  } catch (err) {
    next(err);
  }
};

// Get a single quiz by ID (students must be enrolled)
export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error('Quiz not found');

    // Students can only view if enrolled
    if (req.user.role === 'student') {
      const lesson = await LessonModel.getLessonById(quiz.lesson_id);
      const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
      const isEnrolled = enrollments.some(e => e.course_id === lesson.course_id);
      if (!isEnrolled) throw new Error('Not enrolled in this course');
    }

    res.json({ success: true, quiz });
  } catch (err) {
    next(err);
  }
};

// Submit a quiz (auto-grade)
export const submitQuiz = async (req, res, next) => {
  try {
    const { error, value } = quizSubmissionSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error('Quiz not found');

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
    const isEnrolled = enrollments.some(e => e.course_id === lesson.course_id);
    if (!isEnrolled) throw new Error('Not enrolled in this course');

    // Optionally: check if already submitted (if you have a submissions table for quizzes)

    // Auto-grade: assumes single-answer quiz
    const isCorrect = quiz.correct_answer === value.answers[0];
    const score = isCorrect ? quiz.max_score : 0;

    // Save submission (implement createQuizSubmission in your model if needed)
    // Example:
    // const submission = await QuizModel.createQuizSubmission({
    //   user_id: req.user.id,
    //   quiz_id: req.params.id,
    //   answers: value.answers,
    //   score
    // });

    res.status(201).json({
      success: true,
      // submission,
      is_correct: isCorrect,
      correct_answer: quiz.correct_answer,
      score
    });
  } catch (err) {
    next(err);
  }
};