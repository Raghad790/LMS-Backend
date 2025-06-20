// routes/upload.routes.js
import express from "express";
import { upload, uploadFile, getFileById, deleteFile } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Require authentication for all upload routes
router.use(authenticate);

// File upload routes
router.post("/upload", upload.single("file"), uploadFile);
router.get("/:id", getFileById);
router.delete("/:id", deleteFile);

export default router;