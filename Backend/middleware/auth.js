import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";

// Main authentication middleware: supports session and JWT (cookie or header)
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
      req.cookies?.accessToken ||
      req.cookies?.token || // fallback for legacy clients
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      return res
        .status(401)
        .json(createResponse(false, "Authentication required", null, "No token or session"));
    }

    // 3. Verify token and fetch user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json(createResponse(false, "Invalid or expired token", null, "User not found or inactive"));
    }

    // Renew session for convenience
    req.session.userId = user.id;
    req.session.authenticated = true;
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(createResponse(false, "Authentication failed", null, error.message));
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Support both JWT and session-based user
    const user = req.user || req.session?.user;
    if (!user || (roles.length && !roles.includes(user.role))) {
      return res
        .status(403)
        .json(
          createResponse(
            false,
            "Forbidden: insufficient permissions",
            null,
            `Role ${user?.role || "unknown"} is not authorized`
          )
        );
    }
    next();
  };
};

// Passport session-based authentication check
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json(
      createResponse(
        false,
        "Authentication required",
        null,
        "User not authenticated"
      )
    );
};

// JWT authentication from Authorization header (Bearer)
export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json(createResponse(false, "Access token required", null, "No token provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json(createResponse(false, "Invalid token", null, "User not found or inactive"));
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(createResponse(false, "Invalid token", null, error.message));
  }
};

// Optional JWT authentication (doesn't fail if no token)
export const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      if (user && user.is_active) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};