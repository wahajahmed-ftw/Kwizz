import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../services/socket'; // Assuming WebSocket setup is in `services/socket.js`
import '../css/hostquiz.css'; // Import the CSS

const HostQuiz = () => {
    const { quizId } = useParams();
    const [gamePin, setGamePin] = useState('');
    const [players, setPlayers] = useState([]);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // Error state
    const [quizMessage, setQuizMessage] = useState("");

    useEffect(() => {
        // Listen for the 'quiz_end' event
        socket.on('quiz_end', (data) => {
            setQuizMessage(data.message); // Set the message when the quiz ends
        });

        // Clean up listener on unmount
        return () => {
            socket.off('quiz_end');
        };
    }, []);

    useEffect(() => {
        // Request the server to start hosting the quiz
        socket.emit('host_quiz', { quizId });

        // Handle host_quiz response from server
        socket.on('host_quiz', (response) => {
            if (response.gamePin) {
                setGamePin(response.gamePin);
                setLoading(false);
            }
        });

        // Handle errors
        socket.on('error', (errorResponse) => {
            if (errorResponse && errorResponse.message) {
                setError(errorResponse.message);
                setLoading(false);
            }
        });

        // Listen for new players joining
        socket.on('player_joined', (player) => {
            setPlayers((prevPlayers) => [...prevPlayers, player]);
        });

        // Listen for question updates
        socket.on('new_question', (newQuestion) => {
            console.log("Received new question:", newQuestion);  // Debugging
            setQuestion(newQuestion);
        });

        return () => {
            // Cleanup listeners
            socket.off('host_quiz');
            socket.off('error');
            socket.off('player_joined');
            socket.off('new_question');
        };
    }, [quizId]);

    const handleStartQuiz = () => {
        socket.emit('start_quiz', { gamePin });
        console.log("Game Pin on Start Quiz:", gamePin); // Log for debugging
        localStorage.setItem('gamePin', gamePin);
    };

    const handleNextQuestion = () => {
        const gamePin = localStorage.getItem('gamePin');
        console.log("Game Pin on Next Question:", gamePin); // Log for debugging
        if (!gamePin) {
            console.error("No Game Pin found in local storage!");
            return;
        }
        socket.emit('next_question', { gamePin });
    };

    return (
        <div className="host-quiz-container">
            {quizMessage ? (
                <div className="quiz-end">
                    <p>{quizMessage}</p>
                </div>
            ) : loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    <h1>Hosting Quiz</h1>
                    <p className="game-pin">Game PIN: <strong>{gamePin}</strong></p>
                    <h2 className="player-header">Players:</h2>
                    <ul className="player-list">
                        {players.map((player, index) => (
                            <li className="player-item" key={index}>{player.name}</li>
                        ))}
                    </ul>
    
                    {question ? (
                        <div className="question-section">
                            <h3 className="question-text">Question: {question.text}</h3>
                            <ul className="options-list">
                                {Object.keys(question.options).map((optionKey, index) => (
                                    <li className="option-item" key={index}>
                                        {optionKey}: {question.options[optionKey]}
                                    </li>
                                ))}
                            </ul>
                            <button className="next-question-btn" onClick={handleNextQuestion}>Next Question</button>
                        </div>
                    ) : (
                        <button className="start-quiz-btn" onClick={handleStartQuiz}>Start Quiz</button>
                    )}
                </>
            )}
    
            {/* Display error if any */}
            {error && !quizMessage && <div className="error-message">Error: {error}</div>}
        </div>
    );
};

export default HostQuiz;
