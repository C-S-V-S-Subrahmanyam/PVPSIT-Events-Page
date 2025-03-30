import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./AddStudent.css";

const AddStudent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("form");
  const [identifier, setIdentifier] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search state

  useEffect(() => {
    fetchVerifiedStudents();
  }, []);

  const fetchVerifiedStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/students`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!identifier) {
      alert("Please enter a student name or email.");
      return;
    }

    try {
      const studentResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/student/${identifier}`, {
        method: "GET",
        credentials: "include",
      });

      if (!studentResponse.ok) {
        alert("Student not found.");
        return;
      }

      const studentData = await studentResponse.json();
      const studentId = studentData.student._id;

      const verifyResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/verify-student/${studentId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (verifyResponse.ok) {
        alert(`Student verified successfully! (ID: ${studentId})`);
        setIdentifier("");
        fetchVerifiedStudents();
        setActiveTab("list");
      } else {
        alert("Failed to verify student.");
      }
    } catch (error) {
      console.error("Error verifying student:", error);
    }
  };

  const handleUnverify = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/unverify-student/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        alert("Student unverified successfully!");
        fetchVerifiedStudents();
      } else {
        alert("Failed to unverify student.");
      }
    } catch (error) {
      console.error("Error unverifying student:", error);
    }
  };

  return (
    <div className="addstudent-container">
      <button className="addstudent-back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="addstudent-back-icon" /> Back
      </button>

      {/* Navigation Tabs */}
      <div className="addstudent-nav">
        <button className={activeTab === "form" ? "active-tab" : ""} onClick={() => setActiveTab("form")}>
          Add Student
        </button>
        <button className={activeTab === "list" ? "active-tab" : ""} onClick={() => setActiveTab("list")}>
          Manage Students
        </button>
      </div>

      {/* Add Student Form */}
      {activeTab === "form" && (
        <form className="addstudent-form" onSubmit={handleAddStudent}>
          <label>Student Name or Email *</label>
          <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          <button type="submit" className="addstudent-submit-btn">Verify Student</button>
        </form>
      )}

      {/* Verified Students List */}
      {activeTab === "list" && (
        <div>
          <div className="student-list-header">
            <h3>Verified Students</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verified By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter((student) =>
                  (student.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  student.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((student) => (
                  <tr key={student._id}>
                    <td>{student.name || "N/A"}</td>
                    <td>{student.email}</td>
                    <td>{student.verifiedBy?.name || "Not Verified"}</td>
                    <td>{student.isFacultyVerified ? "Verified" : "Not Verified"}</td>
                    <td>
                      <button className="unverify-btn" onClick={() => handleUnverify(student._id)}>
                        Unverify
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddStudent;