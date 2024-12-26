import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/header.css";
import LogoutButton from './logout';

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleSignupClick = () => {
    navigate("/signup");
  };
  
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo" onClick={() => navigate('/')}>
        Kahoot!
      </div>
      <nav className="nav-links">
        <a href="#work">Work</a>
        <a href="#school">School</a>
        <a href="#higher-ed">Higher Ed</a>
        <a href="/">Home</a>
        <a href="#study">Study</a>
        <a href="#discover">Discover</a>
      </nav>
      <div className="actions">
        <button className="btn-login" onClick={handleLoginClick}>
          Log in
        </button>
        <button className="btn-login" onClick={handleSignupClick}>
          Sign up FREE
        </button>
        <LogoutButton />
      </div>
    </header>
  );
};

export default Header;