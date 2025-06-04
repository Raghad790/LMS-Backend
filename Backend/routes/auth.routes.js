import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

//Registration
router.post("/register", AuthController.register);

//login
router.post("/login", AuthController.login);

//logout
router.post("/logout", authenticate, AuthController.logout);

// Get current user info (profile)
router.get("/me", authenticate, AuthController.getMe);

//Change password
router.put("/change-password", authenticate, AuthController.changePassword);

export default router;
