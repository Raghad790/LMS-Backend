import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import authLogger from "../middleware/authLogger.js";
import { getUpcomingTimelineEvents } from "../controllers/timeline.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get upcoming timeline events for instructor/admin
router.get(
  "/upcoming",
  authLogger,
  authorize("instructor", "admin"),
  getUpcomingTimelineEvents
);

export default router;
