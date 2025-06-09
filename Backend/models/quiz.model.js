import { query } from "../config/db.js";

const QuizModel = {
  // Create a new quiz
  async createQuiz({
    lesson_id,
    question,
    options,
    correct_answer,
    max_score = 10,
  }) {
    if (!Number.isInteger(lesson_id)) {
      throw new Error("Invalid lesson_id");
    }
    try {
      const result = await query(
        `INSERT INTO quizzes 
         (lesson_id, question, options, correct_answer, max_score) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          lesson_id,
          question,
          JSON.stringify(options),
          correct_answer,
          max_score,
        ]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error in createQuiz:", err);
      throw err;
    }
  },

  // Get all quizzes for a lesson
  async getLessonQuizzes(lesson_id) {
    if (!Number.isInteger(lesson_id)) {
      throw new Error("Invalid lesson_id");
    }
    try {
      const result = await query("SELECT * FROM quizzes WHERE lesson_id = $1", [
        lesson_id,
      ]);
      return result.rows;
    } catch (err) {
      console.error("Error in getLessonQuizzes:", err);
      throw err;
    }
  },

  // Get a single quiz by ID
  async getQuizById(id) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid quiz id");
    }
    try {
      const result = await query("SELECT * FROM quizzes WHERE id = $1", [id]);
      return result.rows[0] || null;
    } catch (err) {
      console.error("Error in getQuizById:", err);
      throw err;
    }
  },

  // Update a quiz
  async updateQuiz(id, { question, options, correct_answer, max_score }) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid quiz id");
    }
    try {
      const result = await query(
        `UPDATE quizzes
         SET question = COALESCE($1, question),
             options = COALESCE($2, options),
             correct_answer = COALESCE($3, correct_answer),
             max_score = COALESCE($4, max_score),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          question,
          options ? JSON.stringify(options) : undefined,
          correct_answer,
          max_score,
          id,
        ]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error in updateQuiz:", err);
      throw err;
    }
  },

  // Delete a quiz
  async deleteQuiz(id) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid quiz id");
    }
    try {
      const result = await query(
        `DELETE FROM quizzes WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      console.error("Error in deleteQuiz:", err);
      throw err;
    }
  },

  // Grade a quiz submission (for quiz_submissions table)
  async gradeQuiz(submission_id, score) {
    if (!Number.isInteger(submission_id)) {
      throw new Error("Invalid submission_id");
    }
    try {
      const result = await query(
        `UPDATE quiz_submissions 
         SET score = $1, graded_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [score, submission_id]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error in gradeQuiz:", err);
      throw err;
    }
  },
};

export default QuizModel;
