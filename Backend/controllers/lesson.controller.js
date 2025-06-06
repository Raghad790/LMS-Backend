import LessonModel from "../models/lesson.model.js";
import ModuleModel from "../models/module.model.js";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../utils/lessonValidation.js";

//Create a new Lesson
export const createLesson = async (req, res, next) => {
  try {
    const { error, value } = createLessonSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    //Verify module exists and user is the instructor or admin
    const module = await ModuleModel.getModuleById(value.module_id);
    if (!module) throw new Error("Module not found");
    if (module.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can add lessons ");
    }
    const lesson = await LessonModel.createLesson(value);
    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (err) {
    next(err);
  }
};
//Update a lesson
export const updateLesson = async (req, res, next) => {
  try {
    const { error, value } = updateLessonSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    const lesson = await LessonModel.getLessonById(req.params.id);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can update lessons");
    }
    const updatedLesson = await LessonModel.updateLesson(req.params.id, value);
    res.json({
      success: true,
      lesson: updatedLesson,
    });
  } catch (err) {
    next(err);
  }
};

//Delete a Lesson
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await LessonModel.getLessonById(req.params.id);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can delete lessons");
    }
    const success = await LessonModel.deleteLesson(req.params.id);
    res.json({
      success,
      message: success ? "Lesson deleted" : "Failed to delete lesson",
    });
  } catch (err) {
    next(err);
  }
};
// Get all lessons for a module
export const getModuleLessons = async (req, res, next) => {
  try {
    const lessons = await LessonModel.getModuleLessons(req.params.module_id);
    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (err) {
    next(err);
  }
};

// Get a single lesson by ID
export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await LessonModel.getLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    res.json({ success: true, lesson });
  } catch (err) {
    next(err);
  }
};