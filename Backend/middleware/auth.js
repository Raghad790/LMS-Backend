import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

// Authenticate user via session or JWT
export const authenticate = async (req, res, next) => {
  try {
    // 1. Check session authentication first
    if (req.session?.authenticated && req.session.userId) {
      const user = await UserModel.findById(req.session.userId);
      if (user && user.is_active) {
        req.user = user;
        return next();
      }
    }

    // 2. Check JWT in cookies or Authorization header
    let token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      const err = new Error("Authentication required");
      err.status = 401;
      throw err;
    }

    // 3. Verify token and fetch user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      const err = new Error("Invalid or expired token");
      err.status = 401;
      throw err;
    }

    // Renew session for convenience
    req.session.userId = user.id;
    req.session.authenticated = true;
    req.user = user;
    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      const err = new Error(
        `Role ${req.user?.role || "unknown"} is not authorized`
      );
      err.status = 403;
      return next(err);
    }
    next();
  };
};