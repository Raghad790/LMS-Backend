import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const UserModel = {
  //Create User
  async createUser({ name, email, password, role = "student" }) {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    try {
      //Hash the password

      const result = await query(
        `INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,created_at,is_active`,
        [name, email, hashedPassword, role]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Email already exists");
      }
      throw error;
    }
  },

  //Find user by email
  async findByEmail(email) {
    try {
      const result = await query(`SELECT * FROM users WHERE email =$1`, [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  //Find user by Id
  async findById(id) {
    try {
      const result = await query(
        `SELECT id, name, email, role, created_at, updated_at, is_active  FROM users WHERE id=$1`,
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
  //Get all users (for admin)
  async getAllUsers() {
    try {
      const result = await query(
        `SELECT id,name,email,role,created_at,is_active FROM users`
      );
      return result.rows;
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  //Update User
 async updateUser(id, { name, email, role }) {
  const result = await query(
    `UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      role = COALESCE($3, role),
      updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, role, created_at, updated_at, is_active`,
    [name || null, email || null, role || null, id]
  );
  return result.rows[0];
},
  //Delete user
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
  //Verify password
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  },
  //Generate JWT
  generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  },
};
export default UserModel;
