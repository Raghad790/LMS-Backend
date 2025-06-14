import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  createModule,
  updateModule,
  deleteModule,
  getCourseModules,
  getModuleById,
} from "../controllers/module.controller.js";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../utils/moduleValidation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a new module (instructor or admin)
router.post(
  "/modules",
  authorize("instructor", "admin"),
  validateBody(createModuleSchema),
  createModule
);

// Update a module
router.put(
  "/modules/:id",
  authorize("instructor", "admin"),
  validateBody(updateModuleSchema),
  updateModule
);

// Delete a module
router.delete("/modules/:id", authorize("instructor", "admin"), deleteModule);

// Get all modules for a course
router.get("/courses/:course_id/modules", getCourseModules);

// Get a single module by ID
router.get("/modules/:id", getModuleById);

export default router;