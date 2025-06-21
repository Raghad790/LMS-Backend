import { query } from "../config/db.js";
const AssignmentModel = {
  // Create a new assignment
  async createAssignment({
    lesson_id,
    title,
    description,
    deadline,
    max_score = 100,
  }) {
    if (!Number.isInteger(lesson_id)) {
      throw new Error("Invalid lesson_id");
    }
    try {
      const result = await query(
        `INSERT INTO assignments 
         (lesson_id, title, description, deadline, max_score) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [lesson_id, title, description, deadline, max_score]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error in createAssignment:", err);
      throw err;
    }
  },

  // Get all assignments for a lesson
  async getLessonAssignments(lesson_id) {
    if (!Number.isInteger(lesson_id)) {
      throw new Error("Invalid lesson_id");
    }
    try {
      const result = await query(
        `SELECT * FROM assignments WHERE lesson_id = $1`,
        [lesson_id]
      );
      return result.rows;
    } catch (err) {
      console.error("Error in getLessonAssignments:", err);
      throw err;
    }
  },
  // Get a single assignment by ID
  async getAssignmentById(id) {
    try {
      // Convert id to integer if it's a string
      const assignmentId = typeof id === "string" ? parseInt(id, 10) : id;

      // Check if conversion was successful and we have a valid integer
      if (isNaN(assignmentId)) {
        throw new Error("Invalid assignment id");
      }

      const result = await query(`SELECT * FROM assignments WHERE id=$1`, [
        assignmentId,
      ]);
      return result.rows[0] || null;
    } catch (err) {
      console.error("Error in getAssignmentById:", err);
      throw err;
    }
  },

  // Update an assignment
  async updateAssignment(id, { title, description, deadline, max_score }) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid assignment id");
    }
    try {
      const result = await query(
        `UPDATE assignments SET title=COALESCE($1,title), description = COALESCE($2, description),
             deadline = COALESCE($3, deadline),
             max_score = COALESCE($4, max_score), updated_at=NOW() WHERE id=$5 RETURNING *`,
        [title, description, deadline, max_score, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error in updateAssignment:", err);
      throw err;
    }
  },

  // Delete an assignment
  async deleteAssignment(id) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid assignment id");
    }
    try {
      const result = await query(
        `DELETE FROM assignments WHERE id=$1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      console.error("Error in deleteAssignment:", err);
      throw err;
    }
  },
};

export default AssignmentModel;
