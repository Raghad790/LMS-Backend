import { query } from "../config/db.js";
const LessonModel = {
  //Create a new lesson for a module
  async createLesson({
    module_id,
    title,
    content_type,
    content_url,
    duration,
    order,
    is_free,
  }) {
    try {
      const result = await query(
        `INSERT INTO lessons(module_id,title,content_type,content_url,duration,"order",is_free) VALUES ($1,$2,$3,$4,$5,$6,$7)RETURNING*`,
        [module_id, title, content_type, content_url, duration, order, is_free]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
  //Update a lesson
  async updateLesson(id, updates) {
    try {
      const result = await query(
        `UPDATE lessons 
         SET title = COALESCE($1, title),
             content_type = COALESCE($2, content_type),
             content_url = COALESCE($3, content_url),
             duration = COALESCE($4, duration),
             "order" = COALESCE($5, "order"),
             is_free = COALESCE($6, is_free),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          updates.title,
          updates.content_type,
          updates.content_url,
          updates.duration,
          updates.order,
          updates.is_free,
          id,
        ]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  //Delete a lesson
  async deleteLesson(id) {
    try {
      const result = await query(
        `DELETE FROM lessons WHERE id=$1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      throw err;
    }
  },
  //Get all lessons for a module
  async getModuleLessons(module_id) {
    try {
      const result = await query(
        `SELECT *FROM lessons WHERE module_id=$1 ORDER BY "order" ASC`,
        [module_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },
  //Get a single lesson by ID (with module and course info)
  async getLessonById(id) {
    try {
      const result = await query(
        `SELECT l.*, m.course_id, c.instructor_id
         FROM lessons l
         JOIN modules m ON l.module_id = m.id
         JOIN courses c ON m.course_id = c.id
         WHERE l.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },
};
export default LessonModel;
