import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import "./AddEvent.css";

const departmentOptions = [
  { value: "CSE", label: "Computer Science and Engineering (CSE)" },
  { value: "CSM", label: "Computer Science (AI & ML) (CSM)" },
  { value: "CSD", label: "Computer Science (Data Science) (CSD)" },
  { value: "INF", label: "Information Technology (INF)" },
  { value: "ECE", label: "Electronics and Communication Engineering (ECE)" },
  { value: "MEC", label: "Mechanical Engineering (MEC)" },
  { value: "EEE", label: "Electrical & Electronics Engineering (EEE)" },
  { value: "CIV", label: "Civil Engineering (CIV)" },
  { value: "MBA", label: "Business Administration (MBA)" },
  { value: "FED", label: "Freshman Engineering (FED)" },
];

const categoryOptions = [
  { value: "Cultural", label: "Cultural Events" },
  { value: "Technical", label: "Technical Events" },
  { value: "Sports", label: "Sports" },
  { value: "Workshops", label: "Workshops & Seminars" },
  { value: "Competitions", label: "Competitions & Hackathons" },
];

const isImageFile = (file) => file && file.type.startsWith("image/");

const UpdateEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainImage, setMainImage] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [sideImages, setSideImages] = useState([]);

  const fetchEventDetails = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to load event details.");
      const data = await response.json();

      setEventData({
        ...data,
        department: data.department.map((dep) =>
          departmentOptions.find((opt) => opt.value === dep)
        ),
        categories: data.categories.map((cat) =>
          categoryOptions.find((opt) => opt.value === cat)
        ),
        organizers: data.organizers.join(", "),
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Error fetching event details.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (selected) => {
    setEventData({ ...eventData, department: selected || [] });
  };

  const handleCategoryChange = (selected) => {
    setEventData({ ...eventData, categories: selected || [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["title", "description", "date", "time", "venue"];
    for (const field of requiredFields) {
      if (!eventData[field]?.trim()) {
        alert(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (mainImage && !isImageFile(mainImage)) {
      return alert("Main image must be an image file.");
    }
    if (qrImage && !isImageFile(qrImage)) {
      return alert("QR image must be an image file.");
    }
    if (sideImages.some((img) => !isImageFile(img))) {
      return alert("Side images must be valid image files.");
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", eventData.title.trim());
    formData.append("description", eventData.description.trim());
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("venue", eventData.venue.trim());
    formData.append("organizers", eventData.organizers.trim());
    formData.append("contactEmail", eventData.contactEmail || "");
    formData.append("contactPhone", eventData.contactPhone || "");
    formData.append("googleForm", eventData.googleForm || "");
    formData.append("volunteerForm", eventData.volunteerForm || "");
    formData.append("updatedBy", localStorage.getItem("userName") || "Unknown");

    formData.append(
      "department",
      JSON.stringify(eventData.department.map((d) => d.value))
    );
    formData.append(
      "categories",
      JSON.stringify(eventData.categories.map((c) => c.value))
    );

    if (mainImage) formData.append("mainImage", mainImage);
    if (qrImage) formData.append("qrImage", qrImage);
    for (let img of sideImages) {
      formData.append("images", img);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/update/${eventId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Event updated successfully!");
        navigate("/");
      } else {
        alert("Failed to update event: " + result.message);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert(error?.message || "Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !eventData) return <p>Loading event details...</p>;

  return (
    <div className="addevent-container">
      <button className="addevent-back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="addevent-back-icon" /> Back
      </button>

      <h2>Update Event</h2>

      <form className="addevent-form" onSubmit={handleSubmit}>
        <label>Event Title *</label>
        <input type="text" name="title" value={eventData.title} onChange={handleChange} required />

        <label>Description *</label>
        <textarea name="description" value={eventData.description} onChange={handleChange} required />

        <label>Date *</label>
        <input type="date" name="date" value={eventData.date} onChange={handleChange} required />

        <label>Time *</label>
        <input type="text" name="time" value={eventData.time} onChange={handleChange} required />

        <label>Venue *</label>
        <input type="text" name="venue" value={eventData.venue} onChange={handleChange} required />

        <label>Department *</label>
        <Select isMulti options={departmentOptions} value={eventData.department} onChange={handleDepartmentChange} className="multi-select" />

        <label>Categories *</label>
        <Select isMulti options={categoryOptions} value={eventData.categories} onChange={handleCategoryChange} className="multi-select" />

        <label>Organizers (comma-separated)</label>
        <input type="text" name="organizers" value={eventData.organizers} onChange={handleChange} />

        <label>Contact Email</label>
        <input type="email" name="contactEmail" value={eventData.contactEmail} onChange={handleChange} />

        <label>Contact Phone</label>
        <input type="text" name="contactPhone" value={eventData.contactPhone} onChange={handleChange} />

        <label>Google Form Link</label>
        <input type="text" name="googleForm" value={eventData.googleForm} onChange={handleChange} />

        <label>Volunteer Form Link</label>
        <input type="text" name="volunteerForm" value={eventData.volunteerForm} onChange={handleChange} />

        <label>Update Main Event Image</label>
        <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} />

        <label>Update QR Code Image</label>
        <input type="file" accept="image/*" onChange={(e) => setQrImage(e.target.files[0])} />

        <label>Upload New Side Images</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setSideImages([...e.target.files])} />

        <button type="submit" className="addevent-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Event"}
        </button>
      </form>
    </div>
  );
};

export default UpdateEvent;