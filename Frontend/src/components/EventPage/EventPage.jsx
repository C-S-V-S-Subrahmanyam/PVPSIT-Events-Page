import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./EventPage.css";
import DefaultImage from "../../assets/default-event.png";

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event.");
        const data = await res.json();

        if (!Array.isArray(data.images)) {
          data.images = [];
        }

        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Event not found or server error.");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event?.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === event.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }

    return () => clearInterval(intervalRef.current);
  }, [event]);

  const handleNext = () => {
    clearInterval(intervalRef.current);
    setCurrentIndex((prev) =>
      prev === event.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    clearInterval(intervalRef.current);
    setCurrentIndex((prev) =>
      prev === 0 ? event.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="event-page-container">
        <h2>Loading event...</h2>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-page-container">
        <h2>{error || "Event Not Found"}</h2>
      </div>
    );
  }

  const mainImageUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/image/${id}/main`;
  const qrImageUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/image/${id}/qr`;
  const formattedDate = event.date
    ? new Date(event.date).toISOString().split("T")[0]
    : "Not specified";
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="event-page-container">
      <div className="back-button-container">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft className="back-icon" /> Back
        </button>
      </div>

      <img
        src={mainImageUrl}
        alt="Main Event"
        className="event-main-image"
        onError={(e) => (e.target.src = DefaultImage)}
      />

      <div className="event-details">
        <h1>{event.title}</h1>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
        {event.department?.length > 0 && (
          <p>
            <strong>Department(s):</strong> {event.department.join(", ")}
          </p>
        )}
        {event.categories?.length > 0 && (
          <p>
            <strong>Categories:</strong> {event.categories.join(", ")}
          </p>
        )}
        <p>
          <strong>Date:</strong> {formattedDate}
        </p>
        {event.time && (
          <p>
            <strong>Time:</strong> {event.time}
          </p>
        )}
        {event.venue && (
          <p>
            <strong>Venue:</strong> {event.venue}
          </p>
        )}
      </div>

      {event.images.length > 0 && (
        <div className="image-gallery">
          <h3>Event Gallery</h3>
          <button className="slider-btn left" onClick={handlePrev}>
            ❮
          </button>
          <div className="carousel-container">
            <img
              src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/image/${id}/side/${currentIndex}`}
              alt={`Event Side ${currentIndex + 1}`}
              className="slider-image"
              onError={(e) => (e.target.src = DefaultImage)}
            />
          </div>
          <button className="slider-btn right" onClick={handleNext}>
            ❯
          </button>
        </div>
      )}

      {event.contactEmail && (
        <p>
          <strong>Email:</strong> {event.contactEmail}
        </p>
      )}
      {event.contactPhone && (
        <p>
          <strong>Phone:</strong> {event.contactPhone}
        </p>
      )}

      {event.organizers?.length > 0 && (
        <>
          <h3>Organizers</h3>
          <p>{event.organizers.join(", ")}</p>
        </>
      )}

      {event.qrImage && (
        <div className="qr-section">
          <h3>Payment QR Code</h3>
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="qr-image"
            onError={(e) => (e.target.src = DefaultImage)}
          />
        </div>
      )}

      {/* Registration & Volunteer Buttons */}
      {isPastEvent ? (
        <button className="closed-btn" disabled>
          Registrations Closed
        </button>
      ) : (
        <>
          {event.googleForm?.trim() && (
            <div className="google-form">
              <a
                href={event.googleForm}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="form-btn">Register via Google Form</button>
              </a>
            </div>
          )}
          {event.volunteerForm?.trim() && (
            <div className="google-form">
              <a
                href={event.volunteerForm}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="volunteer-btn">Apply to be a Volunteer</button>
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventPage;