import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to determine role based on email
  const getRoleFromEmail = (email) => {
    const domain = email.split("@")[1];
    const prefix = email.substring(0, 3).toLowerCase();

    if (domain === "pvpsit.ac.in") return "student";
    if (domain === "pvpsiddhartha.ac.in") {
      return prefix === "hod" ? "hod" : "faculty";
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const role = getRoleFromEmail(email);

    if (!role) {
      setErrorMessage("Invalid email domain. Please use a valid institutional email.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }), // Include role in request
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setOtpSent(true);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during signup:", error);
      setErrorMessage("Failed to connect to the server. Please try again later.");
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/verifyEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: otp }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setOtpVerified(true);
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setOtpVerified(false);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error verifying OTP:", error);
      setErrorMessage("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </button>

      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>

      {otpSent && (
        <form onSubmit={handleOtpVerification}>
          <label>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {otpVerified === true && <p style={{ color: "green" }}>OTP Verified! Redirecting...</p>}
      {otpVerified === false && <p style={{ color: "red" }}>OTP Verification Failed!</p>}

      <p>
        Already have an account? <a href="/signin">Sign in here</a>
      </p>
    </div>
  );
};

export default Signup;
