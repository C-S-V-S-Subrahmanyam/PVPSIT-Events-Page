// ✅ models/Event.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: imageSchema,
  images: [imageSchema],
  department: [String],
  categories: [String],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
  googleForm: String,
  volunteerForm: String, // ✅ Added volunteer form link
  qrImage: imageSchema,
  organizers: [String],
  addedBy: { type: String, required: true },
  updatedBy: { type: String },
}, { timestamps: true });

export const EventModel = mongoose.model("Event", eventSchema); // ✅ Named export