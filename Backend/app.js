import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/error.js";
import { createResponse } from "./utils/helper.js";
import "./config/db.js";

// Routers
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.Routes.js";
import categoryRoutes from "./routes/category.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import uploadRoutes from "./routes/upload.routes.js"; // Added upload routes

// App setup
const app = express();
const isDevelopment = process.env.NODE_ENV !== "production";

// Favicon handling
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Security and parsing middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: createResponse(
    false,
    "Too many requests",
    null,
    "Rate limit exceeded"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: createResponse(
    false,
    "Too many authentication attempts",
    null,
    "Please try again later"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

if (!isDevelopment) {
  app.use(generalLimiter);
  console.log("Rate limiting enabled for production");
} else {
  console.log("Rate limiting disabled for development");
}

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies and sessions
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "lms.session",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isDevelopment ? "lax" : "strict",
      domain: isDevelopment ? "localhost" : undefined,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debugging middleware for development
if (isDevelopment) {
  app.use((req, res, next) => {
    next();
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    rateLimitingActive: !isDevelopment,
  });
});

// API documentation/info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "LMS API v1.0",
    documentation: "/api/docs",
    environment: process.env.NODE_ENV || "development",
    rateLimitingActive: !isDevelopment,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      courses: "/api/courses",
      categories: "/api/categories",
      enrollments: "/api/enrollments",
      lessons: "/api/lessons",
      modules: "/api/modules",
      quizzes: "/api/quizzes",
      assignments: "/api/assignments",
      submissions: "/api/submission",
      upload:"/api/uploads",
    },
  });
});

// Mount routes (auth with optional rate limiting)
if (!isDevelopment) {
  app.use("/api/auth", authLimiter, authRoutes);
} else {
  app.use("/api/auth", authRoutes);
}
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/uploads",uploadRoutes)

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;