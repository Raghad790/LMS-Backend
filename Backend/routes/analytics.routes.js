// routes/analytics.routes.js
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getCourseAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.get('/courses/:courseId/analytics', authenticate, authorize('instructor', 'admin'), getCourseAnalytics);

export default router;