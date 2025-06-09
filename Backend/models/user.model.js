import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const UserModel = {
  // Create User (supports OAuth fields)
  async createUser({
    name,
    email,
    password = null,
    role = "student",
    avatar = null,
    oauth_provider = null,
    oauth_id = null,
  }) {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );
    }
    try {
      const result = await query(
        `INSERT INTO users (name, email, password_hash, role, avatar, oauth_provider, oauth_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, role, created_at, is_active, avatar, oauth_provider, oauth_id`,
        [name, email, hashedPassword, role, avatar, oauth_provider, oauth_id]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Email already exists");
      }
      throw error;
    }
  },

  // Find user by email (returns OAuth fields)
  async findByEmail(email) {
    try {
      const result = await query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Find user by Id (returns OAuth fields)
  async findById(id) {
    try {
      const result = await query(
        `SELECT id, name, email, role, created_at, updated_at, is_active, avatar, oauth_provider, oauth_id
         FROM users WHERE id = $1`,
        [id]
      );
      if (!result.rows[0]) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }
      return result.rows[0];
    } catch (error) {
      error.status = error.status || 500;
      throw error;
    }
  },

  // Get all users (for admin)
  async getAllUsers() {
    try {
      const result = await query(
        `SELECT id, name, email, role, created_at, is_active, avatar, oauth_provider, oauth_id FROM users`
      );
      return result.rows;
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  // Update User (add avatar, oauth fields if needed)
  async updateUser(
    id,
    { name, email, role, avatar, oauth_provider, oauth_id }
  ) {
    const result = await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        avatar = COALESCE($4, avatar),
        oauth_provider = COALESCE($5, oauth_provider),
        oauth_id = COALESCE($6, oauth_id),
        updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, role, created_at, updated_at, is_active, avatar, oauth_provider, oauth_id`,
      [
        name || null,
        email || null,
        role || null,
        avatar || null,
        oauth_provider || null,
        oauth_id || null,
        id,
      ]
    );
    return result.rows[0];
  },

  // Delete user (soft delete)
  async deleteUser(id) {
    const result = await query(
      `UPDATE users 
       SET is_active = false, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  },

  // Update user password
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    const result = await query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [hashedPassword, id]
    );
    return result.rows[0];
  },

  // Verify password
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  },

  async getUserbyGoogleId(oauth_id) {
    try {
      const result = await query(
        `SELECT id, name, email, role, created_at, updated_at, is_active, avatar, oauth_provider, oauth_id
         FROM users WHERE oauth_id = $1 AND oauth_provider = 'google'`,
        [oauth_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
};

export default UserModel;
