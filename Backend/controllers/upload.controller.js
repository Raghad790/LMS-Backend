// controllers/upload.controller.js
import multer from "multer";
import AttachmentModel from "../models/attachment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { createResponse } from "../utils/helper.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // You can add file type validation here
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and PDF files are allowed!'));
  }
});

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(createResponse(
        false, 
        "No file uploaded", 
        null, 
        "Please select a file to upload"
      ));
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: "auto",
      folder: "lms/uploads"
    });

    // Save attachment info to database
    const attachmentDTO = {
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format
    };

    const attachment = await AttachmentModel.createAttachment(attachmentDTO);
    
    res.status(201).json(createResponse(
      true, 
      "File uploaded successfully", 
      attachment
    ));
  } catch (error) {
    console.error("Upload error details:", error);
    
    if (error.http_code === 401) {
      return res.status(500).json({ 
        success: false, 
        message: "Cloudinary authentication failed" 
      });
    }
    
    if (error.http_code === 420) {
      return res.status(429).json({ 
        success: false, 
        message: "Upload rate limit reached" 
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      success: false, 
      message: "Failed to upload file", 
      error: error.message 
    });
  }
};

export const getFileById = async (req, res, next) => {
  try {
    const attachment = await AttachmentModel.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json(createResponse(
        false, 
        "Attachment not found", 
        null, 
        `No attachment found with ID ${req.params.id}`
      ));
    }

    res.json(createResponse(true, "Attachment retrieved", attachment));
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const attachment = await AttachmentModel.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json(createResponse(
        false, 
        "Attachment not found", 
        null, 
        `No attachment found with ID ${req.params.id}`
      ));
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(attachment.public_id);
    
    // Delete from database
    await AttachmentModel.deleteAttachment(req.params.id);
    
    res.json(createResponse(true, "File deleted successfully"));
  } catch (error) {
    next(error);
  }
};