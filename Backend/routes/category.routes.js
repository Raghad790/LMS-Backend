import {Router} from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createCategory,updateCategory,deleteCategory,getCategories,getCategory,getCategoryCourses } from "../controllers/category.controller.js";

const router=Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategory);
router.get("/:id/courses", getCategoryCourses);


// Admin-only routes
router.use(authenticate);
router.post("/", authorize(["admin"]), createCategory);
router.put("/:id", authorize(["admin"]), updateCategory);
router.delete("/:id", authorize(["admin"]), deleteCategory);

export default router;