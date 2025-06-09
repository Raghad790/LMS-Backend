import { query } from "../config/db.js";

const ModuleModel = {
  // Create a new module for a course
  async createModule({ course_id, title, description, order }) {
    if (!Number.isInteger(course_id)) {
      throw new Error("Invalid course_id");
    }
    try {
      const result = await query(
        `INSERT INTO modules (course_id, title, description, "order" ,created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [course_id, title, description, order]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get all modules for a course
  async getCourseModules(course_id) {
    if (!Number.isInteger(course_id)) {
      throw new Error("Invalid course_id");
    }
    try {
      const result = await query(
        `SELECT * FROM modules WHERE course_id = $1 ORDER BY id ASC`,
        [course_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Get a single module by ID
  async getModuleById(module_id) {
    if (!Number.isInteger(module_id)) {
      throw new Error("Invalid module_id");
    }
    try {
      const result = await query(
        `SELECT m.*, c.title as course_title, c.instructor_id
         FROM modules m
         JOIN courses c ON m.course_id = c.id
         WHERE m.id = $1`,
        [module_id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },

  // Update a module
  async updateModule(module_id, { title, description, order }) {
    if (!Number.isInteger(module_id)) {
      throw new Error("Invalid module_id");
    }
    try {
      const result = await query(
        `UPDATE modules 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             "order" = COALESCE($3, "order"),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [title, description, order, module_id]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Delete a module
  async deleteModule(module_id) {
    if (!Number.isInteger(module_id)) {
      throw new Error("Invalid module_id");
    }
    try {
      const result = await query(
        `DELETE FROM modules WHERE id=$1 RETURNING id`,
        [module_id]
      );
      return result.rowCount > 0;
    } catch (err) {
      throw err;
    }
  },
};

export default ModuleModel;