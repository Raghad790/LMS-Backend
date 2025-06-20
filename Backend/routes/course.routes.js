import { Router } from "express";
import multer from "multer";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getCourse,
  searchCourses,
  approveCourse,
  getMyCourses,
} from "../controllers/course.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import { courseSchema, courseUpdateSchema } from "../utils/courseValidation.js";

const router = Router();

// Configure multer for memory storage to work with Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      file.originalname.toLowerCase().split(".").pop()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Create a new course (instructor or admin)
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  upload.single("thumbnail"),
  validateBody(courseSchema),
  createCourse
);

// Update a course (instructor or admin)
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  upload.single("thumbnail"),
  validateBody(courseUpdateSchema),
  updateCourse
);

// Delete a course (instructor or admin)
router.delete("/:id", authenticate, authorize("instructor", "admin"), deleteCourse);

// Get all courses (with filters)
router.get("/", getCourses);

// Search courses
router.get("/search", searchCourses);

// Get a single course by ID (public or protected as needed)
router.get("/:id", getCourse);

// Approve a course (admin only)
router.post("/:id/approve", authenticate, authorize("admin"), approveCourse);

// Get courses for the current instructor
router.get("/me/mine", authenticate, authorize("instructor"), getMyCourses);

export default router;