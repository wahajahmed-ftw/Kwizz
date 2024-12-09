// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("/signup"); // Navigate to the Signup component
  };
  const handleLoginClick = () => {
    navigate("/login"); // Navigate to the Signup component
  };

  return (
    <header className="header">
      <div className="logo">Kahoot!</div>
      <nav className="nav-links">
        <a href="#work">Work</a>
        <a href="#school">School</a>
        <a href="#higher-ed">Higher Education</a>
        <a href="/">Home</a>
        <a href="#study">Study</a>
        <a href="#discover">Discover</a>
      </nav>
      <div className="actions">
        <button className="btn-login" onClick={handleLoginClick}>Log in</button>
        <button className="btn-login" onClick={handleSignupClick}>
          Sign up FREE
        </button>
      </div>
    </header>
  );
};

export default Header;
