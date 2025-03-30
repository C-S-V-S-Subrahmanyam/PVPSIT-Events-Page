import express from "express";
import { EventModel } from "../models/Event.js";

const router = express.Router();

/** 
 * ✅ Create Event Route
 * Faculty events are automatically verified, while student-created events remain "Pending"
 */
router.post("/add", async (req, res) => {
  try {
    const { 
      title, description, date, time, venue, department, categories, organizers, 
      addedBy, mainImage, images, contactEmail, contactPhone, googleForm, qrImage, volunteerForm, userRole
    } = req.body;

    if (!title || !description || !date || !time || !venue || !addedBy || !userRole) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const newEvent = new EventModel({
      title,
      description,
      date: new Date(date), // Ensure date is stored in Date format
      time,
      venue,
      department: Array.isArray(department) ? department : [department], // Store as array
      categories: Array.isArray(categories) ? categories : [categories], // Store as array
      organizers: organizers ? organizers.split(",").map(org => org.trim()) : [], // Convert comma-separated to array
      addedBy,
      mainImage,
      images,
      contactEmail,
      contactPhone,
      googleForm,
      qrImage,
      volunteerForm,
      verifiedBy: userRole === "faculty" ? "N/A" : "Pending" // ✅ Auto-verified if faculty
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: "Event added successfully!", event: newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

/** 
 * ✅ Get Events with Filtering 
 * Filters by title, department, category, and eventType (ongoing, upcoming, past)
 */
router.get("/", async (req, res) => {
  try {
    const { title, department, category, eventType } = req.query;
    let filters = {};
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Extract the current date in ISO format

    if (title) filters.title = new RegExp(title, "i"); // Case-insensitive search
    if (department) filters.department = { $in: [department] }; // Matches any department in array
    if (category) filters.categories = { $in: [category] }; // Matches any category in array

    // Handling eventType for filtering
    if (eventType === "ongoing") {
      filters.date = today; // Match events with today's date
    } else if (eventType === "upcoming") {
      filters.date = { $gt: today }; // Match events with dates in the future
    } else if (eventType === "past") {
      filters.date = { $lt: today }; // Match events with dates in the past
    }

    console.log("Applied Filters:", filters); // Debug: Log the filters for review
    const events = await EventModel.find(filters, "-verifiedBy"); // Exclude "verifiedBy" field for non-faculty
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

/** 
 * ✅ Get Events for Faculty (Includes Verified By Field)
 * Faculty can see events with "verifiedBy" field
 */
router.get("/faculty", async (req, res) => {
  try {
    const events = await EventModel.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching faculty events:", error);
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

/** 
 * ✅ Delete Event by ID
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedEvent = await EventModel.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;