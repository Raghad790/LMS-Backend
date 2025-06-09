import UserModel from "../models/user.model.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../utils/userValidation.js";
import {
  generateTokens,
  generateRefreshTokens,
  verifyPassword,
} from "../utils/jwt.js";
import jwt from "jsonwebtoken";

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

      // Generate tokens
      const tokenPayload = { id: newUser.id, email: newUser.email, role: newUser.role };
      const accessToken = generateTokens(tokenPayload);
      const refreshToken = generateRefreshTokens(tokenPayload);

      // Set httpOnly cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
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
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }

      // Generate tokens
      const tokenPayload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateTokens(tokenPayload);
      const refreshToken = generateRefreshTokens(tokenPayload);

      // Set httpOnly cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
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

      const isMatch = await verifyPassword(currentPassword, user.password_hash);
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
      if (req.session) {
        req.session.destroy((err) => {
          if (err) return next(err);
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
          res.clearCookie("connect.sid");
          res.json({ success: true, message: "logged out successfully" });
        });
      } else {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ success: true, message: "logged out successfully" });
      }
    } catch (error) {
      next(error);
    }
  },

  // Google OAuth callback (secure, no token in URL)
  async googleCallback(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }
      const tokenPayload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateTokens(tokenPayload);
      const refreshToken = generateRefreshTokens(tokenPayload);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend (no token in URL)
      res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  },

  // Refresh token endpoint
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token required" });
      }
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ success: false, message: "Invalid refresh token" });
      }
      const newAccessToken = generateTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ success: true, accessToken: newAccessToken });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  },
};

export default AuthController;