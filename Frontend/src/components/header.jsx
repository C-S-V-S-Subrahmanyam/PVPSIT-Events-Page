import React from "react";
import headerImage from "../assets/Header.jpg"; // Adjust the path if necessary

const Header = () => {
  return (
    <div className="headerContainer">
      <img src={headerImage} alt="PVPSIT" className="headerImage" />
    </div>
  );
};

export default Header;