import SubmissionModel from "../models/submission.model.js";
import AssignmentModel from "../models/assignment.model.js";
import EnrollmentModel from "../models/enrollment.model.js";
import LessonModel from "../models/lesson.model.js";
import {
  submissionCreateSchema,
  submissionGradeSchema,
} from "../utils/submissionValidation.js";

export const submitAssignment = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = submissionCreateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Get the assignment
    const assignment = await AssignmentModel.getAssignmentById(
      value.assignment_id
    );
    if (!assignment) throw new Error("Assignment not found");

    // Verify user is enrolled
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    const enrollments = await EnrollmentModel.getUserEnrollments(req.user.id);
    const isEnrolled = enrollments.some(
      (e) => e.course_id === lesson.course_id
    );
    if (!isEnrolled) throw new Error("Not enrolled in this course");

    // Check if already submitted
    const existingSubmission =
      await SubmissionModel.getSubmissionByUserAndAssignment(
        req.user.id,
        value.assignment_id
      );
    if (existingSubmission)
      throw new Error("Already submitted this assignment");

    // Check deadline
    if (new Date(assignment.deadline) < new Date()) {
      throw new Error("Assignment deadline has passed");
    }

    // Create submission
    const submission = await SubmissionModel.createSubmission({
      assignment_id: value.assignment_id,
      user_id: req.user.id,
      submission_url: value.submission_url,
      feedback: null,
      grade: null,
    });

    res.status(201).json({
      success: true,
      submission,
    });
  } catch (err) {
    next(err);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = submissionGradeSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Get the submission
    const submission = await SubmissionModel.getSubmissionById(req.params.id);
    if (!submission) throw new Error("Submission not found");

    // Verify user is the instructor or admin
    const assignment = await AssignmentModel.getAssignmentById(
      submission.assignment_id
    );
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only the course instructor can grade submissions");
    }

    // Grade the submission
    const gradedSubmission = await SubmissionModel.updateSubmission(
      req.params.id,
      {
        grade: value.grade,
        feedback: value.feedback || null,
      }
    );

    res.json({
      success: true,
      submission: gradedSubmission,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubmission = async (req, res, next) => {
  try {
    const submission = await SubmissionModel.getSubmissionById(req.params.id);
    if (!submission) throw new Error("Submission not found");

    // Verify access (student who submitted, instructor, or admin)
    const assignment = await AssignmentModel.getAssignmentById(
      submission.assignment_id
    );
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (
      req.user.id !== submission.user_id &&
      req.user.id !== lesson.instructor_id &&
      req.user.role !== "admin"
    ) {
      throw new Error("Unauthorized to view this submission");
    }

    res.json({
      success: true,
      submission,
    });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    // Verify requesting user is instructor or admin
    const assignment = await AssignmentModel.getAssignmentById(
      req.params.assignment_id
    );
    if (!assignment) throw new Error("Assignment not found");

    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (req.user.id !== lesson.instructor_id && req.user.role !== "admin") {
      throw new Error("Unauthorized to view these submissions");
    }

    const submissions = await SubmissionModel.getSubmissionsByAssignment(
      req.params.assignment_id
    );
    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserSubmissions = async (req, res, next) => {
  try {
    // Users can only view their own submissions unless admin
    if (
      req.user.id !== parseInt(req.params.user_id) &&
      req.user.role !== "admin"
    ) {
      throw new Error("Unauthorized to view these submissions");
    }

    const submissions = await SubmissionModel.getSubmissionsByUser(
      req.params.user_id
    );
    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    next(err);
  }
};
