import { query } from "../config/db.js";

const TimelineModel = {
  async getUpcomingEvents(userId) {
    try {
      // Now that the table exists, this will work correctly
      const result = await query(
        `SELECT id, user_id, title, description, date, event_type, 
                reference_id, reference_type 
         FROM timeline_events 
         WHERE user_id = $1 AND date >= NOW() 
         ORDER BY date ASC 
         LIMIT 10`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching upcoming timeline events:", error);
      throw new Error("Failed to fetch upcoming timeline events");
    }
  },

  // Add a method to create timeline events
  async createEvent(eventData) {
    try {
      const {
        user_id,
        title,
        description,
        date,
        event_type,
        reference_id,
        reference_type,
      } = eventData;

      const result = await query(
        `INSERT INTO timeline_events
         (user_id, title, description, date, event_type, reference_id, reference_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          user_id,
          title,
          description,
          date,
          event_type,
          reference_id,
          reference_type,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating timeline event:", error);
      throw new Error("Failed to create timeline event");
    }
  },
};

export default TimelineModel;
