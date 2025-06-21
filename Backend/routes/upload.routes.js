// routes/upload.routes.js
import { Router } from "express";
import {
  upload,
  uploadFile,
  getFileById,
  deleteFile,
  uploadLessonFile,
  getLessonFiles,
} from "../controllers/upload.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Require authentication for all upload routes
router.use(authenticate);

// File upload routes - specific routes first
router.post("/", upload.single("file"), uploadFile);
// Lesson file routes - specific routes before parameterized routes
router.post(
  "/lesson/file",
  authorize("instructor", "admin"),
  upload.single("file"),
  uploadLessonFile
);
router.get("/lesson/:lessonId/files", getLessonFiles);

// Individual file operations - parameterized routes last
router.get("/:id", getFileById);
router.delete("/:id", deleteFile);

export default router;
