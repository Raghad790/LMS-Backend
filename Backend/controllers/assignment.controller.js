import AssignmentModel from '../models/assignment.model.js';
import LessonModel from '../models/lesson.model.js';
import UserEnrollment from '../models/enrollment.model.js';
import { assignmentCreateSchema, assignmentUpdateSchema } from '../utils/assignmentValidation.js';

export const createAssignment = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = assignmentCreateSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // Verify lesson exists and user is the instructor or admin
    const lesson = await LessonModel.getLessonById(value.lesson_id);
    if (!lesson) throw new Error('Lesson not found');
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can create assignments');
    }

    // Create the assignment
    const assignment = await AssignmentModel.createAssignment({
      lesson_id: value.lesson_id,
      title: value.title,
      description: value.description || null,
      deadline: value.deadline,
      max_score: value.max_score || 100
    });

    res.status(201).json({
      success: true,
      assignment
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
    if (!assignment) throw new Error('Assignment not found');

    // Verify user is the instructor or admin
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can update assignments');
    }

    // Update the assignment
    const updatedAssignment = await AssignmentModel.updateAssignment(
      req.params.id,
      {
        title: value.title,
        description: value.description,
        deadline: value.deadline,
        max_score: value.max_score
      }
    );

    res.json({
      success: true,
      assignment: updatedAssignment
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    // Get existing assignment
    const assignment = await AssignmentModel.getAssignmentById(req.params.id);
    if (!assignment) throw new Error('Assignment not found');

    // Verify user is the instructor or admin
    const lesson = await LessonModel.getLessonById(assignment.lesson_id);
    if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Only the course instructor can delete assignments');
    }

    // Delete the assignment
    const success = await AssignmentModel.deleteAssignment(req.params.id);
    
    res.json({
      success,
      message: success ? 'Assignment deleted successfully' : 'Failed to delete assignment'
    });
  } catch (err) {
    next(err);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.getAssignmentById(req.params.id);
    if (!assignment) throw new Error('Assignment not found');

    // Students can only view if enrolled
    if (req.user.role === 'student') {
      const lesson = await LessonModel.getLessonById(assignment.lesson_id);
      const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
      const isEnrolled = enrollments.some(e => e.course_id === lesson.course_id);
      if (!isEnrolled) throw new Error('Not enrolled in this course');
    }

    res.json({
      success: true,
      assignment
    });
  } catch (err) {
    next(err);
  }
};

export const getLessonAssignments = async (req, res, next) => {
  try {
    const assignments = await AssignmentModel.getLessonAssignments(req.params.lesson_id);

    // Students can only view if enrolled
    if (req.user.role === 'student') {
      const lesson = await LessonModel.getLessonById(req.params.lesson_id);
      const enrollments = await UserEnrollment.getUserEnrollments(req.user.id);
      const isEnrolled = enrollments.some(e => e.course_id === lesson.course_id);
      if (!isEnrolled) throw new Error('Not enrolled in this course');
    }

    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (err) {
    next(err);
  }
};