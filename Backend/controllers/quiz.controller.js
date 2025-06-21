import QuizModel from "../models/quiz.model.js";
import LessonModel from "../models/lesson.model.js";
import UserEnrollment from "../models/enrollment.model.js";
import {
  quizCreateSchema,
  quizUpdateSchema,
  quizSubmissionSchema,
} from "../utils/quizValidation.js";

// Create a new quiz (instructor or admin)
export const createQuiz = async (req, res, next) => {
  try {
    const { error, value } = quizCreateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Verify lesson exists and user is the instructor or admin
    const lesson = await LessonModel.getLessonById(value.lesson_id);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can create quizzes");
    }

    const quiz = await QuizModel.createQuiz({
      lesson_id: value.lesson_id,
      question: value.question,
      options: value.options,
      correct_answer: value.correct_answer,
      max_score: value.max_score || 10,
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
    if (!quiz) throw new Error("Quiz not found");

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can update quizzes");
    }

    const updatedQuiz = await QuizModel.updateQuiz(req.params.id, {
      question: value.question,
      options: value.options,
      correct_answer: value.correct_answer,
      max_score: value.max_score,
    });

    res.json({ success: true, quiz: updatedQuiz });
  } catch (err) {
    next(err);
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error("Quiz not found");

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can delete quizzes");
    }

    const success = await QuizModel.deleteQuiz(req.params.id);

    res.json({
      success,
      message: success ? "Quiz deleted successfully" : "Failed to delete quiz",
    });
  } catch (err) {
    next(err);
  }
};

// Get all quizzes for a course
export const getCourseQuizzes = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);

    // Fetch all quizzes for the course (grouped by lesson)
    const allQuizQuestions = await QuizModel.getCourseQuizzes(courseId);

    // Group questions by lesson
    const quizzesByLesson = {};

    allQuizQuestions.forEach((question) => {
      // Create lesson group if it doesn't exist
      if (!quizzesByLesson[question.lesson_id]) {
        quizzesByLesson[question.lesson_id] = {
          lesson_id: question.lesson_id,
          lesson_title: question.lesson_title,
          module_title: question.module_title,
          questions: [],
          questions_count: 0,
          module_id: question.module_id,
        };
      }

      // Add question to the lesson group
      quizzesByLesson[question.lesson_id].questions.push(question);
      quizzesByLesson[question.lesson_id].questions_count++;
    });

    // Convert to array format
    const formattedQuizzes = Object.values(quizzesByLesson).map((lesson) => ({
      id: lesson.lesson_id, // Use lesson_id as the quiz "container" id
      title: `Quiz: ${lesson.lesson_title}`,
      lesson_title: lesson.lesson_title,
      module_title: lesson.module_title,
      questions_count: lesson.questions_count,
      lesson_id: lesson.lesson_id,
      module_id: lesson.module_id,
      time_limit: 30, // Default value
      passing_score: 70, // Default value
    }));

    res.json({
      success: true,
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single quiz with all questions
export const getQuiz = async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);

    // Fetch the lesson to verify it exists
    const lesson = await LessonModel.getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Get all quiz questions for this lesson
    const questions = await QuizModel.getLessonQuizzes(lessonId);

    res.json({
      success: true,
      data: {
        id: lessonId, // Using lesson id as the quiz "container" id
        title: `Quiz: ${lesson.title}`,
        lesson_id: lessonId,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit a quiz (auto-grade)
export const submitQuiz = async (req, res, next) => {
  try {
    const { error, value } = quizSubmissionSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const quiz = await QuizModel.getQuizById(req.params.id);
    if (!quiz) throw new Error("Quiz not found");

    const lesson = await LessonModel.getLessonById(quiz.lesson_id);
    const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
    const isEnrolled = enrollments.some(
      (e) => e.course_id === lesson.course_id
    );
    if (!isEnrolled) throw new Error("Not enrolled in this course");

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
      score,
    });
  } catch (err) {
    next(err);
  }
};

// Add a quiz question
export const addQuizQuestion = async (req, res, next) => {
  try {
    const {
      lesson_id,
      question,
      options,
      correct_answer,
      max_score = 10,
    } = req.body;

    // Verify lesson exists
    const lesson = await LessonModel.getLessonById(lesson_id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Check instructor permission
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add questions to this lesson",
      });
    }

    // Create the quiz question
    const newQuestion = await QuizModel.createQuiz({
      lesson_id,
      question,
      options,
      correct_answer,
      max_score,
    });

    res.status(201).json({
      success: true,
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};
