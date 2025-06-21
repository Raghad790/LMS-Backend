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
  "/",
  authorize("instructor", "admin"),
  validateBody(createModuleSchema),
  createModule
);

// Get modules for a course - specific route before parameterized routes
router.get("/course/:course_id", getCourseModules);

// Get a single module by ID
router.get("/:id", getModuleById);

// Update a module
router.put(
  "/:id",
  authorize("instructor", "admin"),
  validateBody(updateModuleSchema),
  updateModule
);

// Delete a module
router.delete("/:id", authorize("instructor", "admin"), deleteModule);

export default router;
