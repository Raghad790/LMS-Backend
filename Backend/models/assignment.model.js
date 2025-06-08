import { query } from "../config/db.js";
const AssignmentModel = {
  //Create a new assignment
  async createAssignment({
    lesson_id,
    title,
    description,
    deadline,
    max_score = 100,
  }) {
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
      throw err;
    }
  },
  // Get all assignments for a lesson
  async getLessonAssignments(lesson_id) {
    try {
      const result = await query(
        `SELECT * FROM assignments WHERE lesson_id = $1`,
        [lesson_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Get a single assignment by ID

  async getAssignmentById(id) {
    try {
      const result = await query(`SELECT *FROM assignments WHERE id=$1 `, [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },
  //update an assignment
  async updateAssignment(id, { title, description, deadline, max_score }) {
    try {
      const result = await query(
        `UPDATE assignments SET title=COALESCE($1,title), description = COALESCE($2, description),
             deadline = COALESCE($3, deadline),
             max_score = COALESCE($4, max_score), updated_at=NOW() WHERE id=$5 RETURNING *`,
        [title, description, deadline, max_score, id]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
  //Delete an assignment
  async deleteAssignment(id) {
    try {
      const result = await query(
        `DELETE FROM assignments WHERE id=$1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      throw err;
    }
  },
};
export default AssignmentModel;
