import React, { useState } from "react";
import axios from "axios";
import "../css/login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            setError("Both fields are required.");
            setSuccess(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            setSuccess(false);
            return;
        }

        try {
            // API call to the Flask backend
            const response = await axios.post("http://localhost:5000/login", {
                email,
                password,
            });

            // If login is successful
            setSuccess(true);
            setError("");
            alert(`Welcome, ${response.data.name}!`);
        } catch (err) {
            // Handle errors from the backend
            setSuccess(false);
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Login</h1>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">Login Successful!</div>}
                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />

                    <button type="submit" className="btn-btn-login">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
