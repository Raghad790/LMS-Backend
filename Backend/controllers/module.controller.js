import ModuleModel from "../models/module.model.js";
import CourseModel from "../models/course.model.js";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../utils/moduleValidation.js";
//Create a new module
export const createModule = async (req, res, next) => {
  try {
    const { error, value } = createModuleSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    // Verify course exists and user is the instructor or admin
    const course = await CourseModel.getCourseById(value.course_id);
    if (!course) throw new Error("Course not found");
    if (course.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can add modules");
    }
    const module = await ModuleModel.createModule(value);
    res.status(201).json({ success: true, module });
  } catch (err) {
    next(err);
  }
};

//Update a module
export const updateModule = async (req, res, next) => {
  try {
    const { error, value } = updateModuleSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    const module = await ModuleModel.getModuleById(req.params.id);
    if (!module) throw new Error("Module not found");
    if (module.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can update modules");
    }
    const updatedModule = await ModuleModel.updateModule(req.params.id, value);
    res.json({ success: true, module: updatedModule });
  } catch (err) {
    next(err);
  }
};
//Delete a module
export const deleteModule = async (req, res, next) => {
  try {
    const module = await ModuleModel.getModuleById(req.params.id);
    if (!module) throw new Error("Module not found");
    if (module.instructor_id !== req.user.id && req.user.role !== "admin") {
      throw new Error("Only course instructor can delete modules");
    }
    const success = await ModuleModel.deleteModule(req.params.id);
    res.json({
      success,
      message: success ? "Module deleted" : "Failed to delete module",
    });
  } catch (err) {
    next(err);
  }
};

// Get all modules for a course
export const getCourseModules = async (req, res, next) => {
  try {
    const modules = await ModuleModel.getCourseModules(req.params.course_id);
    res.json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (err) {
    next(err);
  }
};

// Get a single module by ID
export const getModuleById = async (req, res, next) => {
  try {
    const module = await ModuleModel.getModuleById(req.params.id);
    if (!module) {
      return res
        .status(404)
        .json({ success: false, error: "Module not found" });
    }
    res.json({ success: true, module });
  } catch (err) {
    next(err);
  }
};
