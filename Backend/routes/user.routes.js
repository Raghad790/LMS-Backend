import { Router } from "express";
import { validateBody } from "../middleware/validation.js";
import { registerSchema, updateUserSchema, changePasswordSchema } from "../utils/userValidation.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
  changeUserPassword,
} from "../controllers/user.controller.js";

const router = Router();

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), getUsers);

// Get user by ID (admin or self)
router.get("/:id", authenticate, getUser);

// Create user (admin only)
router.post("/", authenticate, authorize("admin"), validateBody(registerSchema), createUser);

// Update user (admin or self)
router.put("/:id", authenticate, validateBody(updateUserSchema), updateUser);

// Delete user (admin only)
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

// Change user password (user themselves)
router.put("/:id/password", authenticate, validateBody(changePasswordSchema), changeUserPassword);

export default router;