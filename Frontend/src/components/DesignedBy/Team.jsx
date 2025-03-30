import React from "react";
import "./Team.css";
import { FaEnvelope, FaLinkedin, FaGithub, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import gvsrImage from "../../assets/GVSR.jpg";
import csvssImage from "../../assets/CSVSS.jpg";
import aaImage from "../../assets/AA.jpg";
import nnImage from "../../assets/NN.jpg";

// Team members with updated links
const teamMembers = [
  {
    name: "GVSR",
    image: gvsrImage,
    email: "saigovvala2346@gmail.com",
    linkedin: "https://www.linkedin.com/in/gvsr/",
    github: "https://github.com/gvsrgh",
    id: "22501A0557",
  },
  {
    name: "CSVS Subrahmanyam",
    image: csvssImage,
    email: "subrahmanyam310308@gmail.com",
    linkedin: "https://www.linkedin.com/in/subrahmanyam25",
    github: "https://github.com/C-S-V-S-Subrahmanyam",
    id: "22501A0533",
  },
  {
    name: "Abdul Azeez",
    image: aaImage,
    email: "acefaisal13@gmail.com",
    linkedin: "https://www.linkedin.com/in/abdul-azeez-a07714271/",
    github: "https://github.com/AbdulAzeez132005  ",
    id: "22501A0502",
  },
  {
    name: "NithyaNanda",
    image: nnImage,
    email: "giri.induri@gmail.com",
    linkedin: "https://www.linkedin.com/in/nithyanandareddy-induri-70a711337",
    github: "https://github.com/nithyanandreddy",
    id: "22501A0566",
  },
];

const Team = () => {
  const navigate = useNavigate();

  return (
    <div className="team-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft className="back-icon" /> Back
      </button>

      <h1 className="team-title">Meet Our Team</h1>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <div className="card-header">
              <img src={member.image} alt={member.name} className="team-img" />
            </div>
            <div className="card-body">
              <h2 className="team-name">{member.name}</h2>
              <p className="team-id">{member.id}</p>
              <div className="team-icons">
                <a href={`mailto:${member.email}`} target="_blank" rel="noopener noreferrer">
                  <FaEnvelope className="icon email" />
                </a>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="icon linkedin" />
                </a>
                <a href={member.github} target="_blank" rel="noopener noreferrer">
                  <FaGithub className="icon github" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;