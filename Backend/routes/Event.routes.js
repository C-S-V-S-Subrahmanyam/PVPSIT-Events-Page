import express from "express";
import multer from "multer";
import { EventModel } from "../models/Event.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

// ✅ Helper to safely parse JSON fields
const safeParseJSON = (value, fallback = []) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// ✅ Create Event (POST)
router.post("/add", upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "qrImage", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      title, description, date, time, venue,
      department, categories, organizers, addedBy,
      contactEmail, contactPhone, googleForm, volunteerForm, userRole
    } = req.body;

    if (!title || !description || !date || !time || !venue || !addedBy || !userRole) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const newEvent = new EventModel({
      title,
      description,
      date: new Date(date),
      time,
      venue,
      department: safeParseJSON(department),
      categories: safeParseJSON(categories),
      organizers: organizers ? organizers.split(",").map(o => o.trim()) : [],
      addedBy,
      contactEmail,
      contactPhone,
      googleForm,
      volunteerForm,
      verifiedBy: userRole === "faculty" ? "N/A" : "Pending",
    });

    if (req.files["mainImage"]) {
      newEvent.mainImage = {
        data: req.files["mainImage"][0].buffer,
        contentType: req.files["mainImage"][0].mimetype,
      };
    }

    if (req.files["qrImage"]) {
      newEvent.qrImage = {
        data: req.files["qrImage"][0].buffer,
        contentType: req.files["qrImage"][0].mimetype,
      };
    }

    if (req.files["images"]) {
      newEvent.images = req.files["images"].map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }

    await newEvent.save();
    res.status(201).json({ success: true, message: "Event created!", event: newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ success: false, message: "Error creating event", error: error.message });
  }
});

router.put("/update/:id", upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "qrImage", maxCount: 1 },
]), async (req, res) => {
  try {
    const eventId = req.params.id;

    const {
      title,
      description,
      date,
      time,
      venue,
      organizers,
      contactEmail,
      contactPhone,
      googleForm,
      volunteerForm,
      department,
      categories,
      updatedBy, // ✅ NEW field from frontend
    } = req.body;

    const updatedData = {
      title,
      description,
      date,
      time,
      venue,
      contactEmail,
      contactPhone,
      googleForm,
      volunteerForm,
      department: safeParseJSON(department),
      categories: safeParseJSON(categories),
      organizers: organizers ? organizers.split(",").map(o => o.trim()) : [],
      updatedBy: updatedBy || "Unknown", // ✅ fallback to prevent empty value
    };

    // ✅ Image fields (optional)
    if (req.files["mainImage"]) {
      updatedData.mainImage = {
        data: req.files["mainImage"][0].buffer,
        contentType: req.files["mainImage"][0].mimetype,
      };
    }

    if (req.files["qrImage"]) {
      updatedData.qrImage = {
        data: req.files["qrImage"][0].buffer,
        contentType: req.files["qrImage"][0].mimetype,
      };
    }

    if (req.files["images"]) {
      updatedData.images = req.files["images"].map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully!",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


// ✅ Get All Events
router.get("/", async (req, res) => {
  try {
    const events = await EventModel.find({}, "-verifiedBy");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

// ✅ Get Event Images (main, qr, side)
router.get("/image/:id/:type/:index?", async (req, res) => {
  try {
    const { id, type, index } = req.params;
    const event = await EventModel.findById(id);
    if (!event) return res.status(404).send("Event not found");

    let image;
    if (type === "main") image = event.mainImage;
    else if (type === "qr") image = event.qrImage;
    else if (type === "side" && event.images[index]) image = event.images[index];

    if (!image || !image.data) return res.status(404).send("Image not found");

    res.contentType(image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching image");
  }
});

// ✅ Get Events for Faculty
router.get("/faculty", async (req, res) => {
  try {
    const events = await EventModel.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

// ✅ Delete Event
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

// ✅ Get Event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching event" });
  }
});

export default router;
