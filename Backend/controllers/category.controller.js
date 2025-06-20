import CategoryModel from "../models/category.model.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../utils/categoryValidation.js";

//Create a new category (admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    // Only admin can create categories
    if (req.user.role !== "admin") {
      throw new Error("Only administrators can create categories");
    }
    const category = await CategoryModel.createCategory(value);
    res.status(201).json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
};
// Update a category (admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    //only admins can update categories
    if (req.user.role !== "admin") {
      throw new Error("Only administrators can update categories");
    }
    const category = await CategoryModel.updateCategory(req.params.id, value);
    if (!category) throw new Error("Category not found");
    res.json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
};
//Delete a category(admin)
export const deleteCategory = async (req, res, next) => {
  try {
    // Only admin can delete categories
    if (req.user.role !== "admin") {
      throw new Error("Only administrators can delete categories");
    }
    const success = await CategoryModel.deleteCategory(req.params.id);
    res.json({
      success,
      message: success ? "Category deleted" : "Category not found",
    });
  } catch (err) {
    next(err);
  }
};
// Update getCategories in category.controller.js
export const getCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.getAllCategories();
    
    // Return consistent response structure with data field
    return res.json({ 
      success: true, 
      data: categories || [] 
    });
  } catch (err) {
    console.error("Error in getCategories:", err);
    next(err);
  }
};
//Get a single single category by ID (with course count)
export const getCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.getCategoryById(req.params.id);
    if (!category) throw new Error("Category not found");
    res.json({
        success: true,
        category,
      });
  } catch (err) {
    next(err);
  }
};

// Get all published courses in a category
export const getCategoryCourses = async (req, res, next) => {
  try {
    const courses = await CategoryModel.getAllCoursesByCategory(req.params.id);
    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (err) {
    next(err);
  }
};
