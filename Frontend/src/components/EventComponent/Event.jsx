import React from "react";
import { useNavigate } from "react-router-dom";
import "./Event.css";
import DefaultImage from "../../assets/default-event.png"; // ✅ Default fallback image

const Event = ({ eventData, filters }) => {
  const navigate = useNavigate();

  if (!eventData || eventData.length === 0) {
    return <div className="no-events">No Events Available</div>;
  }

  return (
    <div className="events-list">
      {eventData.map((event) => {
        if (!event) return null;

        const { _id, title, date, time, venue, googleForm } = event;
        const [startTime, endTime] = time ? time.split(" - ") : ["N/A", "N/A"];
        const formattedDate = new Date(date).toISOString().split("T")[0];

        // ✅ Get image from backend
        const eventImage = _id
          ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events/image/${_id}/main`
          : DefaultImage;

        // Filter logic
        if (
          filters.searchQuery &&
          !title.toLowerCase().includes(filters.searchQuery.toLowerCase())
        ) {
          return null;
        }

        if (
          filters.department &&
          !event.department.includes(filters.department)
        ) {
          return null;
        }

        if (filters.category && !event.categories.includes(filters.category)) {
          return null;
        }

        const today = new Date();
        const eventDateObj = new Date(date);
        const isPastEvent = eventDateObj < today;

        return (
          <div key={_id} className="event-container">
            <img
              src={eventImage}
              alt="Event"
              className="event-image"
              onError={(e) => (e.target.src = DefaultImage)}
            />
            <div className="event-content">
              <h2>{title}</h2>
              <p>
                <strong>Date:</strong> {formattedDate}
              </p>
              <p>
                <strong>Time:</strong> {startTime} - {endTime}
              </p>
              <p>
                <strong>Venue:</strong> {venue}
              </p>
            </div>
            <div className="event-actions">
              {isPastEvent ? (
                <button className="closed-btn" disabled>
                  Registrations Closed
                </button>
              ) : (
                googleForm && (
                  <a href={googleForm} target="_blank" rel="noopener noreferrer">
                    <button className="register-btn">Register Now!</button>
                  </a>
                )
              )}
              <button
                className="read-more-btn"
                onClick={() => navigate(`/event-page/${_id}`)}
              >
                Read more...
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Event;