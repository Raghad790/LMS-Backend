import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategory,
  getCategoryCourses,
} from "../controllers/category.controller.js";

const router = Router();

// Public routes: anyone can view categories and courses in a category
router.get("/", getCategories);
router.get("/:id", getCategory);
router.get("/:id/courses", getCategoryCourses);

// Admin-only routes: must be authenticated and have admin role
router.post("/", authenticate, authorize("admin"), createCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

export default router;