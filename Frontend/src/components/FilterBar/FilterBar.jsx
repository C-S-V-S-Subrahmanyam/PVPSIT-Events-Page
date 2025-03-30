import React, { useState, useEffect } from "react";
import "./FilterBar.css";

const FilterBar = ({ onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [eventType, setEventType] = useState("all"); // ✅ Default to show all

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onFilterChange({ searchQuery, department, category, eventType });
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, department, category, eventType, onFilterChange]);

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">All Departments</option>
        <option value="CSE">Computer Science and Engineering (CSE)</option>
        <option value="CSM">Computer Science (AI & ML) (CSM)</option>
        <option value="CSD">Computer Science (Data Science) (CSD)</option>
        <option value="INF">Information Technology (INF)</option>
        <option value="ECE">
          Electronics and Communication Engineering (ECE)
        </option>
        <option value="MEC">Mechanical Engineering (MEC)</option>
        <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
        <option value="CIV">Civil Engineering (CIV)</option>
        <option value="MBA">Business Administration (MBA)</option>
        <option value="FED">Freshman Engineering (FED)</option>
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Cultural">Cultural Events</option>
        <option value="Technical">Technical Events</option>
        <option value="Sports">Sports</option>
        <option value="Workshops">Workshops & Seminars</option>
        <option value="Competitions">Competitions & Hackathons</option>
      </select>
      <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
        <option value="all">All</option> {/* 👈 Add this */}
        <option value="ongoing">Ongoing</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
      </select>
    </div>
  );
};

export default FilterBar;
