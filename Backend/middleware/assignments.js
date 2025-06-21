const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Endpoint to fetch pending grading assignments
router.get("/pending-grading", authenticate, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      status: "pending",
      instructorId: req.user.id,
    });
    res.json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching pending assignments:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
