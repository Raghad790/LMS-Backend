import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
// Generate access token (JWT)
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    issuer: "lms-app",
    audience: "lms-users",
  });
};

// Generate refresh token (longer expiry)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
    issuer: "lms-app",
    audience: "lms-users",
  });
};

// Verify any JWT (access or refresh)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};