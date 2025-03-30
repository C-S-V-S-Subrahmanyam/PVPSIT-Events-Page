// No changes here...
import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/header.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import FilterBar from "./components/FilterBar/FilterBar.jsx";
import Event from "./components/EventComponent/Event.jsx";
import EventPage from "./components/EventPage/EventPage.jsx";
import Signin from "./components/Logins/SignIn/signin.jsx";
import Signup from "./components/Logins/SignUp/signup.jsx";
import Team from "./components/DesignedBy/Team.jsx";
import AddEvent from "./components/AddEvent/AddEvent.jsx";
import AddStudent from "./components/AddStudent/AddStudent.jsx";
import UpdateEvent from "./components/AddEvent/UpdateEvent.jsx";
import "./App.css";

function ProtectedRoute({ element, isAuthenticated }) {
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? element : <Navigate to="/signin" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [filters, setFilters] = useState({
    searchQuery: "",
    department: "",
    category: "",
    eventType: "all",
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("userToken");
      const email = localStorage.getItem("userEmail");

      if (token) {
        setIsAuthenticated(true);
        setUserEmail(email || "");
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <MainContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        filters={filters}
        setFilters={setFilters}
      />
    </Router>
  );
}

function MainContent({
  isAuthenticated,
  setIsAuthenticated,
  userEmail,
  setUserEmail,
  filters,
  setFilters,
}) {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [canAddEvent, setCanAddEvent] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchEvents = useCallback(async () => {
    try {
      let query = new URLSearchParams();

      if (filters.searchQuery) query.append("title", filters.searchQuery);
      if (filters.department) query.append("department", filters.department);
      if (filters.category) query.append("category", filters.category);

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/events?${query.toString()}`
      );
      const data = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const classifiedEvents = data.map((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          event.eventType = "past";
        } else if (eventDate.getTime() === today.getTime()) {
          event.eventType = "ongoing";
        } else {
          event.eventType = "upcoming";
        }

        return event;
      });

      // Sort by newest first
      classifiedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEvents(
        filters.eventType === "all"
          ? classifiedEvents
          : classifiedEvents.filter((event) => event.eventType === filters.eventType)
      );
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("userToken");

      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const data = await response.json();
          if (data.success) {
            setUserRole(data.role);
            setCanAddEvent(data.canAddEvent);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [isAuthenticated]);

  const hideFilterBar = ["/signin", "/signup", "/team"].includes(location.pathname);

  return (
    <>
      <Header />
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        userEmail={userEmail}
      />

      {!hideFilterBar && (
        <>
          <FilterBar onFilterChange={setFilters} />
          <div className="button-container">
            <div className="left-buttons">
              {isAuthenticated && userRole === "faculty" && (
                <>
                  <button
                    className="action-btn"
                    onClick={() => (window.location.href = "/add-event")}
                  >
                    Add Event
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => (window.location.href = "/add-student")}
                  >
                    Add Student
                  </button>
                </>
              )}
              {isAuthenticated && userRole === "student" && canAddEvent && (
                <button
                  className="action-btn"
                  onClick={() => (window.location.href = "/add-event")}
                >
                  Add Event
                </button>
              )}
            </div>
            <div className="right-buttons">
              <button
                className="designed-by-btn"
                onClick={() => (window.location.href = "/team")}
              >
                Designed by
              </button>
            </div>
          </div>
        </>
      )}

      <main className="mainContent">
        <Routes>
          <Route path="/" element={<Event eventData={events} filters={filters} />} />
          <Route path="/event-page/:id" element={<EventPage />} />
          <Route
            path="/signin"
            element={
              <Signin
                setIsAuthenticated={setIsAuthenticated}
                setUserEmail={setUserEmail}
              />
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/team" element={<Team />} />
          <Route
            path="/add-event"
            element={<ProtectedRoute element={<AddEvent />} isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/add-student"
            element={<ProtectedRoute element={<AddStudent />} isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/update-event/:eventId"
            element={<ProtectedRoute element={<UpdateEvent />} isAuthenticated={isAuthenticated} />}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
