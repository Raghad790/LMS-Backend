import { Router } from "express";
import { validateBody } from "../middleware/validation.js";
import {
  registerSchema,
  updateUserSchema,
  changePasswordSchema,
} from "../utils/userValidation.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
  changeUserPassword,
  changeUserRole,
} from "../controllers/user.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get("/", authorize("admin"), getUsers);

// Create user (admin only)
router.post("/", authorize("admin"), validateBody(registerSchema), createUser);

// Get user by ID (admin or self)
router.get("/:id", getUser);

// Update user (admin or self)
router.put(
  "/:id",
  authorize("admin", "self"),
  validateBody(updateUserSchema),
  updateUser
);

// Delete user (admin only)
router.delete("/:id", authorize("admin"), deleteUser);

// Change user password (user themselves)
router.patch(
  "/:id/password",
  validateBody(changePasswordSchema),
  changeUserPassword
);

// Change user role (admin only)
router.patch("/:id/role", authorize("admin"), changeUserRole);

export default router;
