import { query } from "../config/db.js";
const SubmissionModel = {
  // Create a new submission
  async createSubmission({
    assignment_id,
    user_id,
    submission_url,
    feedback = null,
    grade = null,
  }) {
    if (!Number.isInteger(assignment_id) || !Number.isInteger(user_id)) {
      throw new Error("Invalid assignment_id or user_id");
    }
    try {
      const result = await query(
        `INSERT INTO submissions 
       (assignment_id, user_id, submission_url, feedback, grade) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
        [assignment_id, user_id, submission_url, feedback, grade]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === "23503") {
        // Foreign key violation
        throw new Error("Invalid assignment or user ID");
      }
      console.error("Error in createSubmission:", err);
      throw err;
    }
  },

  // Get a single submission by ID (with assignment and user info)
  async getSubmissionById(id) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid submission id");
    }
    try {
      const result = await query(
        `SELECT s.*, 
              a.title as assignment_title,
              a.description as assignment_description,
              a.deadline as assignment_deadline,
              u.name as student_name,
              u.email as student_email
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error("Error in getSubmissionById:", err);
      throw err;
    }
  },

  // Get all submissions for an assignment (with user info)
  async getSubmissionsByAssignment(assignment_id) {
    if (!Number.isInteger(assignment_id)) {
      throw new Error("Invalid assignment_id");
    }
    try {
      const result = await query(
        `SELECT s.*, 
              u.name as student_name,
              u.email as student_email
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
        [assignment_id]
      );
      return result.rows;
    } catch (err) {
      console.error("Error in getSubmissionsByAssignment:", err);
      throw err;
    }
  },

  // Get all submissions by a user (with assignment info)
  async getSubmissionsByUser(user_id) {
    if (!Number.isInteger(user_id)) {
      throw new Error("Invalid user_id");
    }
    try {
      const result = await query(
        `SELECT s.*, 
              a.title as assignment_title,
              a.description as assignment_description,
              a.deadline as assignment_deadline
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.user_id = $1
       ORDER BY s.submitted_at DESC`,
        [user_id]
      );
      return result.rows;
    } catch (err) {
      console.error("Error in getSubmissionsByUser:", err);
      throw err;
    }
  },

  // Update (grade/feedback) a submission
  async updateSubmission(id, { feedback, grade }) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid submission id");
    }
    try {
      const result = await query(
        `UPDATE submissions 
       SET feedback = COALESCE($1, feedback),
           grade = COALESCE($2, grade),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
        [feedback, grade, id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error("Error in updateSubmission:", err);
      throw err;
    }
  },

  // Delete a submission
  async deleteSubmission(id) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid submission id");
    }
    try {
      const result = await query(
        `DELETE FROM submissions 
       WHERE id = $1 
       RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      console.error("Error in deleteSubmission:", err);
      throw err;
    }
  },
};
export default SubmissionModel;
