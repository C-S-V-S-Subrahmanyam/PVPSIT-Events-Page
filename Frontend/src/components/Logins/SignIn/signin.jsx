import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./signin.css";

const Signin = ({ setIsAuthenticated }) => {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setLoading(true);
  
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });
  
      const data = await response.json();
      setLoading(false);
  
      if (data.success) {
        setMessage("Signin successful! Redirecting...");
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userEmail", data.email); // Store email
        localStorage.setItem("userName", data.name);   // Store name from database
  
        setTimeout(() => {
          setIsAuthenticated(true);
          navigate("/"); // Redirect to home page
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setErrorMessage("Failed to connect to the server. Please try again.");
    }
  };
  

  return (
    <div className="signin-container">
      <button className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </button>

      <h2>Sign In</h2>
      <form onSubmit={handleSignin}>
        <label>Email or Username</label>
        <input 
          type="text" 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)} 
          required 
        />
        
        <label>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <p>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
};

export default Signin;
