import UserModel from "../models/user.model.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../utils/userValidation.js";

const AuthController = {
  async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.status = 400;
        throw err;
      }

      const { name, email, password, role } = value;
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        const err = new Error("Email already in use");
        err.status = 409;
        throw err;
      }

      const newUser = await UserModel.createUser({
        name,
        email,
        password,
        role,
      });
      const token = UserModel.generateToken(newUser);

      res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
      });
      res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.status = 400;
        throw err;
      }
      const { email, password } = value;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }

      const isMatch = await UserModel.verifyPassword(user, password);
      if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }

      const token = UserModel.generateToken(user);

      res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }
      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    try {
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.status = 400;
        throw err;
      }

      const { currentPassword, newPassword } = value;
      const user = await UserModel.findById(req.user.id);

      const isMatch = await UserModel.verifyPassword(user, currentPassword);
      if (!isMatch) {
        const err = new Error("Current password is incorrect");
        err.status = 401;
        throw err;
      }

      await UserModel.updatePassword(req.user.id, newPassword);

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("token");
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "logged out successfully" });
      });
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
