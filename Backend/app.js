import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.Routes.js";
import categoryRoutes from "./routes/category.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import assignmentRoutes from "./routes/assignment.routes";
import submissionRoutes from "./routes/submission.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";
import "./config/db.js";
import session from "express-session";
import cookieParser from "cookie-parser";
//Backend application
const app = express();
//Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

//Body-Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookies and sessions
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    },
  })
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submission", submissionRoutes);
// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
