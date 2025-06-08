import { query } from "../config/db.js";

const CategoryModel = {
  //Create a new category
  async createCategory({ name }) {
    try {
      const result = await query(
        `INSERT INTO categories (name) 
         VALUES ($1) 
         RETURNING *`,
        [name]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === "23505") {
        // Unique violation
        throw new Error("Category name already exists");
      }
      throw err;
    }
  },
  //Update a category
  async updateCategory(id, { name }) {
    try {
      const result = await query(
        `UPDATE categories SET name=$1 WHERE id=$2 RETURNING *`,
        [name, id]
      );
      return result.rows[0] || null;
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("Category name already exists");
      }
      throw err;
    }
  },
  //Delete a category
  async deleteCategory(id) {
    try {
      //First, remove category association from courses
      await query(`UPDATE courses SET category_id =NULL WHERE category_id=$1`, [
        id,
      ]);
      // Then delete the category
      const result = await query(
        `DELETE FROM categories WHERE id=$1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (err) {
      throw err;
    }
  },

  //Get all categories with course count
  async getAllCategories() {
    try {
      const result = await query(`SELECT c.*, 
                COUNT(co.id) as course_count
         FROM categories c
         LEFT JOIN courses co ON c.id = co.category_id AND co.is_published = true
         GROUP BY c.id
         ORDER BY c.name ASC `);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },
  //Get a single category by ID with course count
  async getCategoryById(id) {
    try {
      const result = await query(
        `SELECT c.*, 
                COUNT(co.id) as course_count
         FROM categories c
         LEFT JOIN courses co ON c.id = co.category_id AND co.is_published = true
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },
  //Get all published courses in a category

  async getAllCoursesByCategory(category_id) {
    try {
      const result = await query(
        `SELECT co.*, u.name as instructor_name
         FROM courses co
         JOIN users u ON co.instructor_id = u.id
         WHERE co.category_id = $1 AND co.is_published = true
         ORDER BY co.created_at DESC`,
        [category_id]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  },
};
export default CategoryModel;
