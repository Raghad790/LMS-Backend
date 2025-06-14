import { Router } from "express";
import { registerSchema, loginSchema, changePasswordSchema } from "../utils/userValidation.js";
import { validateBody } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import {
  googleAuth,
  googleCallBack,
  refreshToken,
  getCurrentLogInInfo,
  logout,
  login,
  register,
  getCurrentUser,
  changePassword
} from "../controllers/auth.controller.js";

const router = Router();

// Register a new user
router.post("/register", validateBody(registerSchema), register);

// User login
router.post("/login", validateBody(loginSchema), login);

// Refresh JWT access token
router.post("/refresh-token", refreshToken);

// Change user password (requires authentication)
router.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  changePassword
);

// Logout user (requires authentication)
router.post("/logout", authenticate, logout);

// Get current authenticated user's profile
router.get("/me", authenticate, getCurrentUser);

// Start Google OAuth authentication
router.get("/google", googleAuth);

// Handle Google OAuth callback
router.get("/google/callback", googleCallBack);

// Get current login info (alternative endpoint)
router.get("/current-user", authenticate, getCurrentLogInInfo);

export default router;