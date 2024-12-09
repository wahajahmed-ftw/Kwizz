import { useState } from "react";
import "../css/signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Form() {
    // State for form data
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    // State for form feedback
    const [feedback, setFeedback] = useState({
        message: "",
        type: "", // "success" or "error"
    });

    // Handling form input changes dynamically
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFeedback({ message: "", type: "" }); // Reset feedback on input change
    };

    // Handling form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = formData;

        // Frontend validation
        if (!name || !email || !password) {
            setFeedback({
                message: "Please fill in all the fields.",
                type: "error",
            });
            return;
        }

        if (password.length < 6) {
            setFeedback({
                message: "Password must be at least 6 characters long.",
                type: "error",
            });
            return;
        }

        try {
            // Make the POST request to the backend
            const response = await axios.post("http://localhost:5000/signup", {
                name,
                email,
                password,
            });

            // Handle success response
            setFeedback({
                message: response.data.message || "User successfully registered!",
                type: "success",
            });
            setTimeout(() => {
                navigate("/login"); // Replace "/login" with the correct path to your login page
            }, 1500);

            // Clear form fields on success
            setFormData({ name: "", email: "", password: "" });
        } catch (error) {
            // Handle server errors
            if (error.response && error.response.data.message) {
                setFeedback({
                    message: error.response.data.message,
                    type: "error",
                });
            } else {
                setFeedback({
                    message: "An unexpected error occurred. Please try again.",
                    type: "error",
                });
            }
        }
    };

    return (
        <div className="form">
            <h1>User Registration</h1>

            {/* Feedback Message */}
            {feedback.message && (
                <div className={feedback.type === "error" ? "error" : "success"}>
                    <h1>{feedback.message}</h1>
                </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
                <label className="label">Name</label>
                <input
                    name="name"
                    onChange={handleChange}
                    className="input"
                    value={formData.name}
                    type="text"
                    placeholder="Enter your name"
                />

                <label className="label">Email</label>
                <input
                    name="email"
                    onChange={handleChange}
                    className="input"
                    value={formData.email}
                    type="email"
                    placeholder="Enter your email"
                />

                <label className="label">Password</label>
                <input
                    name="password"
                    onChange={handleChange}
                    className="input"
                    value={formData.password}
                    type="password"
                    placeholder="Enter your password"
                />

                <button className="btn-grad" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}
