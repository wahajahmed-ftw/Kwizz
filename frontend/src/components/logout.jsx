import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/header.css'
const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Call the backend logout API
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });

            // Clear any client-side user data (like localStorage)
            localStorage.removeItem('user');

            // Redirect to the login page
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    return (
        <button onClick={handleLogout} className="btn-login">
            Logout
        </button>
    );
};

export default LogoutButton;
