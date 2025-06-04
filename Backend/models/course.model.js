import { query } from "../config/db.js";

const CourseModel = {
  //Create a new course
  async createCourse(courseInfo) {
    try {
      const result = await query(
        `INSERT INTO courses (title,description,price,thumbnail_url,instructor_id, category_id)VALUES($1,$2,$3,$4,$5,$6)RETURNING *`,
        [
          courseInfo.title,
          courseInfo.description,
          courseInfo.price || 0.0,
          courseInfo.thumbnail_url,
          courseInfo.instructor_id,
          courseInfo.category_id || null,
        ]
      );
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === "23503") {
        //Foreign key violation
        throw new Error("Invalid instructor or category");
      }
      throw error;
    }
  },
  async updateCourse(courseInfo) {
    try {
      const updatedCourse = await query(
        `UPDATE courses
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             price = COALESCE($3, price),
             thumbnail_url = COALESCE($4, thumbnail_url),
             category_id = COALESCE($5, category_id),
             is_published = COALESCE($6, is_published),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          courseInfo.title,
          courseInfo.description,
          courseInfo.price,
          courseInfo.thumbnail_url,
          courseInfo.category_id,
          courseInfo.is_published,
          courseInfo.id,
        ]
      );
      return updatedCourse.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
  async deleteCourse(id) {
    try {
      const result = await query(
        `UPDATE courses 
         SET is_published = false, updated_at = NOW() 
         WHERE id = $1 
         RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  },
  async getAllCourses(filter = {}) {
    try {
      let queryStr = `
        SELECT c.*, u.name as instructor_name, cat.name as category_name 
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.is_published = true
      `;
      const params = [];

      if (filter.instructor_id) {
        params.push(filter.instructor_id);
        queryStr += ` AND c.instructor_id = $${params.length}`;
      }
      if (filter.category_id) {
        params.push(filter.category_id);
        queryStr += ` AND c.category_id = $${params.length}`;
      }
      if (filter.min_price) {
        params.push(filter.min_price);
        queryStr += ` AND c.price >= $${params.length}`;
      }
      if (filter.max_price) {
        params.push(filter.max_price);
        queryStr += ` AND c.price <= $${params.length}`;
      }

      queryStr += " ORDER BY c.created_at DESC";

      if (filter.limit) {
        params.push(filter.limit);
        queryStr += ` LIMIT $${params.length}`;
      }

      const result = await query(queryStr, params);
      return result.rows;
    } catch (error) {}
  },
  async getCourseById(id) {
    try {
      const course = await query(
        `SELECT c.*, u.name as instructor_name, cat.name as category_name 
         FROM courses c
         JOIN users u ON c.instructor_id = u.id
         LEFT JOIN categories cat ON c.category_id = cat.id
         WHERE c.id = $1`,
        [id]
      );
      return course.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
  async searchCourses(queryString) {
    try {
      const result = await query(
        `SELECT * FROM courses WHERE title ILIKE $1 OR description ILIKE $1`,
        [`%${queryString}%`]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
  async approveCourse(id, adminId) {
    try {
      const result = await query(
        `UPDATE courses 
         SET is_approved = true, approved_by = $1, approved_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [id, adminId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
  async getInstructorCourses() {
    try {
      const result = await query(
        `SELECT * FROM courses 
         WHERE instructor_id = $1 
         ORDER BY created_at DESC`,
        [instructorId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};
export default CourseModel;
