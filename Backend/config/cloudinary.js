// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Log configuration (remove in production)
console.log("Cloudinary Configuration:");
console.log("- Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "- API Key:",
  process.env.CLOUDINARY_API_KEY?.substring(0, 5) + "..."
);
console.log(
  "- API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "Configured" : "Missing"
);

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful!");
    console.log(result);
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
  }
}

testCloudinaryConnection();

export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
