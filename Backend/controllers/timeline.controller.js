import TimelineModel from "../models/timeline.model.js";

export const getUpcomingTimelineEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching timeline events for user: ${userId}`);

    // Get real timeline events from the database
    let events = [];
    try {
      events = await TimelineModel.getUpcomingEvents(userId);
      console.log(`Found ${events.length} timeline events for user ${userId}`);
    } catch (dbError) {
      console.error("Database error fetching timeline events:", dbError);
      events = []; // Empty array on error
    }

    // If no events found, generate fallback events
    if (!events || events.length === 0) {
      console.log("No timeline events found, generating fallback events");
      events = generateFallbackEvents(userId);
    }

    // Format and sanitize events for front-end
    const formattedEvents = events.map((event) => ({
      id: event.id || `fallback-${Math.random().toString(36).substring(2, 9)}`,
      title: event.title || "Unnamed Event",
      description: event.description || "No description available",
      date: event.date
        ? new Date(event.date).toISOString()
        : new Date().toISOString(),
      event_type: event.event_type || "task",
    }));

    return res.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    console.error("Error in getUpcomingTimelineEvents handler:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve timeline events",
      error: error.message,
    });
  }
};

// Helper function to generate fallback events when no real events exist
function generateFallbackEvents(userId) {
  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return [
    {
      id: "fallback-1",
      user_id: userId,
      title: "Review Student Submissions",
      description: "Check for new assignment submissions that need grading",
      date: tomorrow,
      event_type: "task",
    },
    {
      id: "fallback-2",
      user_id: userId,
      title: "Prepare Course Materials",
      description: "Create and upload new content for your courses",
      date: nextWeek,
      event_type: "task",
    },
  ];
}
