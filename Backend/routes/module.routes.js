import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createModule,
  updateModule,
  deleteModule,
  getCourseModules,
  getModuleById,
} from "../controllers/module.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a new module (instructor or admin)
router.post("/", authorize(["instructor", "admin"]), createModule);

// Update a module
router.put("/:id", authorize(["instructor", "admin"]), updateModule);

// Delete a module
router.delete("/:id", authorize(["instructor", "admin"]), deleteModule);

// Get all modules for a course
router.get("/course/:course_id", getCourseModules);

// Get a single module by ID
router.get("/:id", getModuleById);

export default router;