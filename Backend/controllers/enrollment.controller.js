import UserEnrollment from "../models/enrollment.model.js";
import {
  createEnrollmentSchema,
  updateEnrollmentProgressSchema,
} from "../utils/enrollmentValidation.js";

// Enroll a user in a course
export const enrollInCourse = async (req, res, next) => {
  try {
    const { error, value } = createEnrollmentSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }
    const enrollment = await UserEnrollment.createEnrollment(value);
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    next(err);
  }
};

// Update enrollment progress
export const updateProgress = async (req, res, next) => {
  try {
    const { error, value } = updateEnrollmentProgressSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }
    const updated = await UserEnrollment.updateEnrollmentProgress(value);
    res.json({ success: true, enrollment: updated });
  } catch (err) {
    next(err);
  }
};

// Updated getUserEnrollments function for enrollment.controller.js
export const getUserEnrollments = async (req, res, next) => {
  try {
    // Get user ID either from URL parameter or from authenticated user
    const userId = req.params.user_id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }
    
    const enrollments = await UserEnrollment.getUserEnrollments(userId);
    
    // Return consistent response structure with data field
    return res.json({ 
      success: true, 
      data: enrollments || [] // Ensure we return at least an empty array
    });
  } catch (err) {
    console.error("Error in getUserEnrollments:", err);
    next(err);
  }
};

// Get all enrollments for a course
export const getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await UserEnrollment.getCourseEnrollments(req.params.course_id);
    res.json({ success: true, enrollments });
  } catch (err) {
    next(err);
  }
};

// Get a single enrollment by ID
export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await UserEnrollment.getEnrollmentById(req.params.enrollment_id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }
    res.json({ success: true, enrollment });
  } catch (err) {
    next(err);
  }
};

// Check if a user is enrolled in a course
export const isUserEnrolled = async (req, res, next) => {
  try {
    const { user_id, course_id } = req.params;
    if (!user_id || !course_id) {
      return res.status(400).json({ success: false, error: "User ID and Course ID are required" });
    }
    const enrolled = await UserEnrollment.isUserEnrolled({ user_id: Number(user_id), course_id: Number(course_id) });
    res.json({ success: true, enrolled: !!enrolled });
  } catch (err) {
    next(err);
  }
};

// Unenroll a user from a course
export const unenrollCourse = async (req, res, next) => {
  try {
    const { user_id, course_id } = req.params;
    if (!user_id || !course_id) {
      return res.status(400).json({ success: false, error: "User ID and Course ID are required" });
    }
    await UserEnrollment.unenrollCourse({ user_id: Number(user_id), course_id: Number(course_id) });
    res.json({ success: true, message: "User unenrolled from course" });
  } catch (err) {
    next(err);
  }
};

// Get all enrollments (admin)
export const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await UserEnrollment.getAllEnrollments();
    res.json({ success: true, enrollments });
  } catch (err) {
    next(err);
  }
};