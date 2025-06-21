import AssignmentModel from "../models/assignment.model.js";
import LessonModel from "../models/lesson.model.js";
import UserEnrollment from "../models/enrollment.model.js";
import TimelineModel from "../models/timeline.model.js";
import {
  assignmentCreateSchema,
  assignmentUpdateSchema,
} from "../utils/assignmentValidation.js";

export const createAssignment = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = assignmentCreateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Verify lesson exists and user is the instructor or admin
    const lesson = await LessonModel.getLessonById(value.lesson_id);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can create assignments");
    }

    // Create the assignment
    const assignment = await AssignmentModel.createAssignment({
      lesson_id: value.lesson_id,
      title: value.title,
      description: value.description || null,
      deadline: value.deadline,
      max_score: value.max_score || 100,
    });

    // Add a timeline event for the assignment deadline
    await TimelineModel.createEvent({
      user_id: lesson.instructor_id, // The instructor who owns this course
      title: `Assignment Due: ${assignment.title}`,
      description: `Assignment \"${assignment.title}\" deadline is approaching`,
      date: assignment.deadline,
      event_type: "assignment_deadline",
      reference_id: assignment.id,
      reference_type: "assignment",
    });

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = assignmentUpdateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Get existing assignment
    const assignment = await AssignmentModel.getAssignmentById(req.params.id);
    if (!assignment) throw new Error("Assignment not found");

    // Verify user is the instructor or admin
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can update assignments");
    }

    // Update the assignment
    const updatedAssignment = await AssignmentModel.updateAssignment(
      req.params.id,
      {
        title: value.title,
        description: value.description,
        deadline: value.deadline,
        max_score: value.max_score,
      }
    );

    res.json({
      success: true,
      assignment: updatedAssignment,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    // Get existing assignment
    const assignment = await AssignmentModel.getAssignmentById(req.params.id);
    if (!assignment) throw new Error("Assignment not found");

    // Verify user is the instructor or admin
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can delete assignments");
    }

    // Delete the assignment
    const success = await AssignmentModel.deleteAssignment(req.params.id);

    res.json({
      success,
      message: success
        ? "Assignment deleted successfully"
        : "Failed to delete assignment",
    });
  } catch (err) {
    next(err);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.getAssignmentById(req.params.id);
    if (!assignment) throw new Error("Assignment not found");

    // Students can only view if enrolled
    if (req.user.role === "student") {
      const lesson = await LessonModel.getLessonById(assignment.lesson_id);
      const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
      const isEnrolled = enrollments.some(
        (e) => e.course_id === lesson.course_id
      );
      if (!isEnrolled) throw new Error("Not enrolled in this course");
    }

    res.json({
      success: true,
      assignment,
    });
  } catch (err) {
    next(err);
  }
};

export const getLessonAssignments = async (req, res, next) => {
  try {
    const assignments = await AssignmentModel.getLessonAssignments(
      req.params.lesson_id
    );

    // Students can only view if enrolled
    if (req.user.role === "student") {
      const lesson = await LessonModel.getLessonById(req.params.lesson_id);
      const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
      const isEnrolled = enrollments.some(
        (e) => e.course_id === lesson.course_id
      );
      if (!isEnrolled) throw new Error("Not enrolled in this course");
    }

    res.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingGradingAssignments = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    console.log(
      `Fetching pending grading assignments for instructor: ${instructorId}`
    );

    // Query submissions that need grading
    const result = await query(
      `
      SELECT s.id, s.submission_url, s.submitted_at, s.grade, 
             a.id as assignment_id, a.title as assignment_title, 
             u.id as student_id, u.name as student_name, u.email as student_email,
             c.id as course_id, c.title as course_title
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE c.instructor_id = $1 AND s.grade IS NULL
      ORDER BY s.submitted_at DESC
    `,
      [instructorId]
    );

    console.log(`Found ${result.rows.length} pending submissions to grade`);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching pending grading assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending assignments",
      error: error.message,
    });
  }
};
