// models/attachment.model.js
import { query } from "../config/db.js";

const AttachmentModel = {
  async createAttachment(attachmentDTO) {
    try {
      const { original_name, mime_type, size, public_id, secure_url, format } = attachmentDTO;

      const result = await query(
        `INSERT INTO attachments (original_name, mime_type, size, public_id, secure_url, format)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [original_name, mime_type, size, public_id, secure_url, format]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating attachment:", error);
      throw error;
    }
  },

  async getAttachmentById(id) {
    try {
      const result = await query(
        `SELECT * FROM attachments WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting attachment:", error);
      throw error;
    }
  },

  async deleteAttachment(id) {
    try {
      const result = await query(
        `DELETE FROM attachments WHERE id = $1 RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  },
  
  async findByPublicId(publicId) {
    try {
      const result = await query(
        `SELECT * FROM attachments WHERE public_id = $1`,
        [publicId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding attachment by public_id:", error);
      throw error;
    }
  }
};

export default AttachmentModel;