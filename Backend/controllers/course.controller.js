import CourseModel from "../models/course.model.js";
import AttachmentModel from "../models/attachment.model.js";
import { courseSchema, courseUpdateSchema } from "../utils/courseValidation.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Create a new course (instructors only)
export const createCourse = async (req, res, next) => {
  try {
    console.log("Creating course with data:", req.body);

    // Validate input data
    const { error, value } = courseSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }

    // Check instructor role
    if (req.user.role !== "instructor") {
      const err = new Error("Only instructors can create courses");
      err.status = 403;
      throw err;
    }

    // Initialize course data
    const courseData = {
      title: req.body.title,
      description: req.body.description,
      instructor_id: req.user.id,
      category_id: req.body.category_id || null,
      level: req.body.level || "beginner",
      is_published:
        req.body.is_published === "true" ||
        req.body.is_published === true ||
        false,
    };

    // Handle thumbnail upload if file is present
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "lms/courses",
          resource_type: "image",
        });

        // Create attachment record
        const attachmentDTO = {
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          size: req.file.size,
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
        };

        const attachment = await AttachmentModel.createAttachment(attachmentDTO);

        // Set thumbnail URL to the secure URL from Cloudinary
        courseData.thumbnail_url = result.secure_url;
      } catch (uploadError) {
        console.error("Error uploading thumbnail:", uploadError);
        const err = new Error("Failed to upload thumbnail");
        err.status = 500;
        throw err;
      }
    }

    // Create the course
    const course = await CourseModel.createCourse(courseData);
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Error creating course:", error);
    next(error);
  }
};

// Update course with new Cloudinary integration
export const updateCourse = async (req, res, next) => {
  try {
    const { error, value } = courseUpdateSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }

    // Get existing course
    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    // Check permissions
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      const err = new Error("Unauthorized to update this course");
      err.status = 403;
      throw err;
    }

    // Build update data
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category_id: req.body.category_id,
      level: req.body.level,
      is_published: req.body.is_published,
      id: req.params.id,
    };

    // Handle thumbnail update if new file is uploaded
    if (req.file) {
      try {
        // Extract public_id from current thumbnail_url if exists
        if (course.thumbnail_url && course.thumbnail_url.includes("cloudinary.com")) {
          const urlParts = course.thumbnail_url.split("/");
          const fileNameWithExt = urlParts[urlParts.length - 1];
          const publicIdParts = fileNameWithExt.split(".");
          const publicId = `lms/courses/${publicIdParts[0]}`;

          // Try to delete old image
          try {
            await deleteFromCloudinary(publicId);
          } catch (deleteError) {
            console.error("Failed to delete old thumbnail:", deleteError);
            // Continue anyway
          }
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "lms/courses",
          resource_type: "image",
        });

        // Create attachment record
        const attachmentDTO = {
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          size: req.file.size,
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
        };

        await AttachmentModel.createAttachment(attachmentDTO);

        // Set thumbnail URL to the new secure URL
        updateData.thumbnail_url = result.secure_url;
      } catch (uploadError) {
        console.error("Error updating thumbnail:", uploadError);
        const err = new Error("Failed to update thumbnail");
        err.status = 500;
        throw err;
      }
    }

    // Update the course
    const updatedCourse = await CourseModel.updateCourse(updateData);
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
    if (req.query.limit) filter.limit = parseInt(req.query.limit);

    const courses = await CourseModel.getAllCourses(filter);
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};

// Get a single course (with unpublished check) - FIXED VERSION
export const getCourse = async (req, res, next) => {
  try {
    console.log(
      `Getting course with ID ${req.params.id} for user ${req.user?.id} (${req.user?.role})`
    );

    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    // Convert IDs to strings for consistent comparison
    const courseInstructorId = String(course.instructor_id);
    const userId = String(req.user?.id || "");

    console.log(
      `Course instructor ID: ${courseInstructorId}, User ID: ${userId}, User role: ${req.user?.role}`
    );

    // Check if user has access to this course
    if (
      !course.is_published &&
      req.user?.role !== "admin" &&
      courseInstructorId !== userId
    ) {
      console.log(
        "Access denied: Course not published and user is not owner or admin"
      );
      const err = new Error("Course not available");
      err.status = 403;
      throw err;
    }

    console.log("Access granted to course");
    res.json({ success: true, course });
  } catch (err) {
    console.error("Error in getCourse:", err);
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
// Update getMyCourses in course.controller.js
export const getMyCourses = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let courses;
    if (req.user.role === "instructor") {
      courses = await CourseModel.getInstructorCourses(req.user.id);
    } else if (req.user.role === "student") {
      // Handle student case if needed
      courses = [];
    } else {
      courses = [];
    }

    // Return consistent response structure with data field
    return res.json({
      success: true,
      data: courses || [],
    });
  } catch (err) {
    console.error("Error in getMyCourses:", err);
    next(err);
  }
};
