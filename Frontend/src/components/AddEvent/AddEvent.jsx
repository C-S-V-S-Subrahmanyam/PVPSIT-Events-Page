import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const AddEvent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("form");
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    department: [],
    categories: [],
    organizers: "",
    contactEmail: "",
    contactPhone: "",
    googleForm: "",
    volunteerForm: "",
    addedBy: localStorage.getItem("userName") || "Unknown",
    updatedBy: localStorage.getItem("userName") || "Unknown",
    userRole: localStorage.getItem("userRole") || "student",
  });

  const [mainImage, setMainImage] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [sideImages, setSideImages] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const userRole = localStorage.getItem("userRole");
      const endpoint =
        userRole === "faculty"
          ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/faculty`
          : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (selectedOptions) => {
    setEventData({ ...eventData, department: selectedOptions || [] });
  };

  const handleCategoryChange = (selectedOptions) => {
    setEventData({ ...eventData, categories: selectedOptions || [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.date ||
      !eventData.time ||
      !eventData.venue ||
      !mainImage
    ) {
      alert("Please fill in all required fields and upload a main image.");
      return;
    }

    const isDuplicate = events.some(
      (ev) =>
        ev.title.trim().toLowerCase() === eventData.title.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("An event with this title already exists.");
      return;
    }

    if (!isImageFile(mainImage)) {
      alert("Main image must be an image file.");
      return;
    }
    if (qrImage && !isImageFile(qrImage)) {
      alert("QR image must be an image file.");
      return;
    }
    if (sideImages.some((img) => !isImageFile(img))) {
      alert("Side images must be valid image files.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", eventData.title);
    formData.append("description", eventData.description);
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("venue", eventData.venue);
    formData.append("organizers", eventData.organizers);
    formData.append("contactEmail", eventData.contactEmail);
    formData.append("contactPhone", eventData.contactPhone);
    formData.append("googleForm", eventData.googleForm);
    formData.append("volunteerForm", eventData.volunteerForm);
    formData.append("addedBy", eventData.addedBy);
    formData.append("updatedBy", eventData.updatedBy);
    formData.append("userRole", eventData.userRole);
    formData.append(
      "department",
      JSON.stringify(eventData.department.map((dep) => dep.value))
    );
    formData.append(
      "categories",
      JSON.stringify(eventData.categories.map((cat) => cat.value))
    );
    formData.append("mainImage", mainImage);
    if (qrImage) formData.append("qrImage", qrImage);
    for (let img of sideImages) {
      formData.append("images", img);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/add`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Event added successfully!");
        fetchEvents();
        setEventData({
          ...eventData,
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          department: [],
          categories: [],
          organizers: "",
          contactEmail: "",
          contactPhone: "",
          googleForm: "",
          volunteerForm: "",
        });
        setMainImage(null);
        setQrImage(null);
        setSideImages([]);
        setActiveTab("list");
      } else {
        alert("Failed to add event: " + data.message);
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert(error?.message || "Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/delete/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event.");
      }

      alert("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const editEvent = (eventId) => {
    navigate(`/update-event/${eventId}`);
  };

  return (
    <div className="addevent-container">
      <button className="addevent-back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="addevent-back-icon" /> Back
      </button>

      <div className="addevent-nav">
        <button
          className={activeTab === "form" ? "active-tab" : ""}
          onClick={() => setActiveTab("form")}
        >
          Add Event
        </button>
        <button
          className={activeTab === "list" ? "active-tab" : ""}
          onClick={() => setActiveTab("list")}
        >
          View Events
        </button>
      </div>

      {/* Add Event Form */}
      {activeTab === "form" && (
        <form className="addevent-form" onSubmit={handleSubmit}>
          <label>Event Title *</label>
          <input
            name="title"
            value={eventData.title}
            onChange={handleChange}
            required
          />

          <label>Description *</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            required
          />

          <label>Date *</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
          />

          <label>Time *</label>
          <input
            name="time"
            placeholder="e.g. 10:00 AM - 5:00 PM"
            value={eventData.time}
            onChange={handleChange}
            required
          />

          <label>Venue *</label>
          <input
            name="venue"
            value={eventData.venue}
            onChange={handleChange}
            required
          />

          <label>Department *</label>
          <Select
            options={departmentOptions}
            isMulti
            onChange={handleDepartmentChange}
            className="multi-select"
          />

          <label>Categories *</label>
          <Select
            options={categoryOptions}
            isMulti
            onChange={handleCategoryChange}
            className="multi-select"
          />

          <label>Organizers (Comma-separated)</label>
          <input
            name="organizers"
            value={eventData.organizers}
            onChange={handleChange}
          />

          <label>Contact Email</label>
          <input
            name="contactEmail"
            value={eventData.contactEmail}
            onChange={handleChange}
          />

          <label>Contact Phone</label>
          <input
            name="contactPhone"
            value={eventData.contactPhone}
            onChange={handleChange}
          />

          <label>Google Form Link</label>
          <input
            name="googleForm"
            value={eventData.googleForm}
            onChange={handleChange}
          />

          <label>Volunteer Form Link</label>
          <input
            name="volunteerForm"
            value={eventData.volunteerForm}
            onChange={handleChange}
          />

          <label>Main Event Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainImage(e.target.files[0])}
            required
          />

          <label>QR Code Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setQrImage(e.target.files[0])}
          />

          <label>Side Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setSideImages([...e.target.files])}
          />

          <button
            type="submit"
            className="addevent-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Event"}
          </button>
        </form>
      )}

      {/* Event List Table with Search */}
      {activeTab === "list" && (
        <div>
          <div className="event-list-header">
            <h3>Event List</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Added By</th>
                  <th>Updated By</th>
                  {localStorage.getItem("userRole") === "faculty" && (
                    <th>Verified By</th>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events
                  .filter((event) =>
                    event.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>{event.time}</td>
                      <td>{event.venue}</td>
                      <td>{event.addedBy}</td>
                      <td>{event.updatedBy || event.addedBy}</td>
                      {localStorage.getItem("userRole") === "faculty" && (
                        <td>{event.verifiedBy}</td>
                      )}
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => editEvent(event._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteEvent(event._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
