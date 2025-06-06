import { query } from "../config/db.js";

const UserEnrollment = {
  async createEnrollment({ user_id, course_id }) {
    try {
      // Check if enrollment already exists
      const exicting = await query(
        "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [user_id, course_id]
      );
      if (exicting.rows.length > 0) {
        throw new Error("User is already enrolled in this course");
      }
      const result = await query(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at) 
         VALUES ($1, $2, NOW()) 
         RETURNING *`,
        [user_id, course_id]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
  //Update the progress of an enrollment
 async updateEnrollmentProgress({ enrollment_id, progress }) {
    try {
      const result = await query(
        `UPDATE enrollments 
           SET progress = $1
         WHERE id = $2 
         RETURNING *`,
        [progress, enrollment_id]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
  /**
   * Get all enrollments for a user, including course and instructor info.
   * Only returns enrollments for published courses.
   */
  async getUserEnrollments(user_id) {
    try {
      const result = await query(
        `SELECT e.*, c.title as course_title, c.thumbnail_url,
                u.name as instructor_name, c.price as course_price
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN users u ON c.instructor_id = u.id
         WHERE e.user_id = $1 AND c.is_published = true
         ORDER BY e.enrolled_at DESC`,
        [user_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },
  /**
   * Get all enrollments for a course, including student info.
   */
  async getCourseEnrollments(course_id) {
    try {
      const result = await query(
        `SELECT e.*, u.name as student_name, u.email as student_email
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         WHERE e.course_id = $1
         ORDER BY e.enrolled_at DESC`,
        [course_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Get a single enrollment by its ID, including course and student info.
   */
  async getEnrollmentById(enrollment_id) {
    try {
      const result = await query(
        `SELECT e.*, c.title as course_title, u.name as student_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN users u ON e.user_id = u.id
         WHERE e.id = $1`,
        [enrollment_id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },
};
export default UserEnrollment;
