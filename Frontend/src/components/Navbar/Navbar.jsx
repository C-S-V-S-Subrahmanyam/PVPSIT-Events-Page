import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaCaretDown,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";

const menuItems = [
  {
    title: "Home",
    internal: true, // Home now navigates inside the app
    path: "/", // Navigates to home
  },
  {
    title: "Social Media",
    dropdown: true, // Enables dropdown functionality
    links: [
      {
        name: "Instagram",
        url: "https://www.instagram.com/pvpsiddhartha/",
        icon: <FaInstagram size={20} />,
        target: "_blank",
      },
      {
        name: "Twitter",
        url: "https://twitter.com/PVPsiddhartha",
        icon: <FaTwitter size={20} />,
        target: "_blank",
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/company/pvpsit/",
        icon: <FaLinkedin size={20} />,
        target: "_blank",
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/Prasad-V-Potluri-Siddhartha-Institute-of-Technology-108652668558012/",
        icon: <FaFacebook size={20} />,
        target: "_blank",
      },
      {
        name: "YouTube",
        url: "https://www.youtube.com/channel/UCCuJT9OE_acjW0Jk7Jf9Kvw/featured",
        icon: <FaYoutube size={20} />,
        target: "_blank",
      },
    ],
  },
];

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const fetchUserFromDatabase = async () => {
      const token = localStorage.getItem("userToken");

      if (!token) {
        setUserName("Guest");
        return;
      }

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
        if (data.success && data.name) {
          setUserName(data.name);
        } else {
          setUserName("Guest");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserName("Guest");
      }
    };

    fetchUserFromDatabase();
  }, [isAuthenticated]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserName("Guest");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className={`navbar-links ${isOpen ? "active" : ""}`}>
          {/* Home button always works */}
          <a
            className="dropbtn"
            href="https://www.pvpsiddhartha.ac.in/"
            rel="noopener noreferrer"
          >
            Home
          </a>

          {menuItems.map((menu, index) =>
            menu.dropdown ? (
              <div className="dropdown" key={index}>
                <button className="dropbtn">
                  {menu.title} <FaCaretDown />
                </button>
                <div className="dropdown-content">
                  {menu.links.map((link, idx) => (
                    <a
                      href={link.url}
                      target={link.target}
                      key={idx}
                      className="dropdown-item"
                      rel="noopener noreferrer"
                    >
                      {link.icon} {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="username-text">Hello, {userName}</span>
              <button className="auth-btn logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="auth-btn" onClick={() => navigate("/signin")}>
                Sign In
              </button>
              <button className="auth-btn" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
