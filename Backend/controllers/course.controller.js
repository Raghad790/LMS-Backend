import CourseModel from "../models/course.model.js";
import { courseSchema, courseUpdateSchema } from "../utils/courseValidation.js";
//Create a new course (instructors only)
export const createCourse = async (req, res, next) => {
  try {
    const { error, value } = courseSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    if (req.user.role !== "instructor") {
      const err = new Error("Only instructors can create courses");
      err.status = 403;
      throw err;
    }
    const course = await CourseModel.createCourse({
      ...value,
      instructor_id: req.user.id,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

//Update course (only owner or admin)
export const updateCourse = async (req, res, next) => {
  try {
    const { error, value } = courseUpdateSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      const err = new Error("Unauthorized to update this course");
      err.status = 403;
      throw err;
    }
    const updatedCourse = await CourseModel.updateCourse({
      ...value,
      id: req.params.id,
    });
    res.json({ success: true, course: updatedCourse });
  } catch (err) {
    next(err);
  }

};

// Delete course (only owner or admin)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      const err = new Error("Unauthorized to delete this course");
      err.status = 403;
      throw err;
    }
    const success = await CourseModel.deleteCourse(req.params.id);
    if (!success) {
      const err = new Error("Failed to delete course");
      err.status = 500;
      throw err;
    }
    res.json({ success: true, message: "Course deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all courses (with filters)
export const getCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.instructor_id) filter.instructor_id = req.query.instructor_id;
    if (req.query.category_id) filter.category_id = req.query.category_id;
    if (req.query.min_price) filter.min_price = parseFloat(req.query.min_price);
    if (req.query.max_price) filter.max_price = parseFloat(req.query.max_price);
    if (req.query.limit) filter.limit = parseInt(req.query.limit);

    const courses = await CourseModel.getAllCourses(filter);
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};

// Get a single course (with unpublished check)
export const getCourse = async (req, res, next) => {
  try {
    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }
    if (
      !course.is_published &&
      req.user?.role !== "admin" &&
      course.instructor_id !== req.user?.id
    ) {
      const err = new Error("Course not available");
      err.status = 403;
      throw err;
    }
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// Search courses
export const searchCourses = async (req, res, next) => {
  try {
    if (!req.query.q || req.query.q.trim().length < 2) {
      const err = new Error("Search query must be at least 2 characters");
      err.status = 400;
      throw err;
    }
    const courses = await CourseModel.searchCourses(req.query.q);
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};

// Approve course (admin only)
export const approveCourse = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      const err = new Error("Only admins can approve courses");
      err.status = 403;
      throw err;
    }
    const course = await CourseModel.approveCourse(req.params.id, req.user.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// Get courses for the current instructor
export const getMyCourses = async (req, res, next) => {
  try {
    let courses;
    if (req.user.role === "instructor") {
      courses = await CourseModel.getInstructorCourses(req.user.id);
    } else {
      const err = new Error("Not implemented for this role");
      err.status = 501;
      throw err;
    }
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};