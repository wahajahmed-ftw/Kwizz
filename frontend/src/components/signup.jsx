import { useState } from "react";
import "../css/signup.css";
import axios from "axios";
export default function Form() {
    // State for form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    // State for form feedback
    const [feedback, setFeedback] = useState({ submitted: false, error: false });

    // Handling form input changes dynamically
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFeedback({ submitted: false, error: false });
    };

    // Handling form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, password } = formData;

        if (!name || !email || !password) {
            setFeedback({ submitted: false, error: true });
        } else {
            setFeedback({ submitted: true, error: false });
            const response= axios.post('http://localhost:5000/signup', {
                name,
                password,
                email
              })
              

        }
    };

    // Feedback messages
    const message = feedback.submitted
        ? `User ${formData.name} successfully registered!`
        : feedback.error
        ? "Please enter all the fields"
        : "";

    return (
        <div className="form">
            <h1>User Registration</h1>

            {/* Feedback Message */}
            {message && (
                <div className={feedback.error ? "error" : "success"}>
                    <h1>{message}</h1>
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
                />

                <label className="label">Email</label>
                <input
                    name="email"
                    onChange={handleChange}
                    className="input"
                    value={formData.email}
                    type="email"
                />

                <label className="label">Password</label>
                <input
                    name="password"
                    onChange={handleChange}
                    className="input"
                    value={formData.password}
                    type="password"
                />

                <button className="btn-grad" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}
