import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from '../services/socket'; // Assuming WebSocket setup is in `services/socket.js`
import "../css/playquiz.css";

const PlayQuiz = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [gamePin, setGamePin] = useState(useParams().pin);
  const [isLocked, setIsLocked] = useState(false); // Track input lock state
  const [currentQuestion, setCurrentQuestion] = useState(null); // Track current question
  const navigate = useNavigate();
  const name = useParams().name;

  useEffect(() => {
    // Listen for new question event from the server
    socket.on("new_question", (question) => {
      setCurrentQuestion(question);
      setIsLocked(false); // Unlock input fields for the next question
      setSelectedOption(""); // Clear previous selection
      setMessage(""); // Clear previous message
    });

    // Listen for game over event
    socket.on("game_over", (data) => {
      alert("Quiz is over! Scores:\n" + JSON.stringify(data.scores, null, 2));
    });

    return () => {
      socket.off("new_question");
      socket.off("game_over");
    };
  }, [navigate]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError("Please select an option before submitting.");
      return;
    }

    // Emit answer to the backend
    console.log("Submitting answer:", selectedOption);
    socket.emit("submit_answer", { gamePin, answer: selectedOption });

    // Disable inputs and button after submission
    setIsLocked(true);

    // Listen for server response
    socket.on("answer_feedback", (response) => {
      if (response.correct) {
        setMessage("Correct answer! 🎉");
      } else {
        setMessage(`Wrong answer. The correct answer is ${response.correctAnswer}.`);
      }
    });
  };

  return (
    <div className="quiz-play-container">
  <h1 className="quiz-title">Play Quiz</h1>
  {currentQuestion && <h2 className="quiz-question">{currentQuestion.text}</h2>}
  <form className="quiz-options-form" onSubmit={handleSubmit}>
    <div>
      <input
        type="radio"
        id="option-a"
        value="A"
        checked={selectedOption === "A"}
        onChange={handleOptionChange}
        disabled={isLocked}
        className="quiz-option-input"
      />
      <label htmlFor="option-a" className="quiz-option-label">
        <span className="quiz-option-text">Option A</span>
      </label>
    </div>
    <div>
      <input
        type="radio"
        id="option-b"
        value="B"
        checked={selectedOption === "B"}
        onChange={handleOptionChange}
        disabled={isLocked}
        className="quiz-option-input"
      />
      <label htmlFor="option-b" className="quiz-option-label">
        <span className="quiz-option-text">Option B</span>
      </label>
    </div>
    <div>
      <input
        type="radio"
        id="option-c"
        value="C"
        checked={selectedOption === "C"}
        onChange={handleOptionChange}
        disabled={isLocked}
        className="quiz-option-input"
      />
      <label htmlFor="option-c" className="quiz-option-label">
        <span className="quiz-option-text">Option C</span>
      </label>
    </div>
    <div>
      <input
        type="radio"
        id="option-d"
        value="D"
        checked={selectedOption === "D"}
        onChange={handleOptionChange}
        disabled={isLocked}
        className="quiz-option-input"
      />
      <label htmlFor="option-d" className="quiz-option-label">
        <span className="quiz-option-text">Option D</span>
      </label>
    </div>
    {error && <p className="quiz-error">{error}</p>}
    {message && <p className="quiz-message">{message}</p>}
    <div className="quiz-submit-container">
      <button className="quiz-submit-button" type="submit" disabled={isLocked}>
        Submit Answer
      </button>
    </div>
  </form>
</div>

  );
  
};

export default PlayQuiz;
