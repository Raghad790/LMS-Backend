import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import passport from "../config/passport.js";

const router = Router();

// Registration
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

// Logout
router.post("/logout", authenticate, AuthController.logout);

// Get current user info (profile)
router.get("/me", authenticate, AuthController.getMe);

// Change password
router.put("/change-password", authenticate, AuthController.changePassword);

// --- Google OAuth Routes ---
// Start Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  AuthController.googleCallback
);

export default router;