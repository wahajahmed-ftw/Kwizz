import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import '../css/joinsquiz.css';

const JoinQuiz = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {

    if (isJoining) return; // Prevent double clicks
    setIsJoining(true);
    console.log('Join button clicked:', { gamePin: pin, name });
    setError('');
    console.log("Emmiting things")
    socket.emit('join_game', { gamePin: pin, name });
  };
  
  useEffect(() => {
    const handleJoinGameResponse = (response) => {
      setIsJoining(false); // Re-enable button
      console.log('Server response:', response);
  
      if (response?.error) {
        setError(response.error);
        alert(response.error);
      } else if (response?.message) {
        console.log('Player joined successfully:', response.message);
        navigate(`/play-quiz/${pin}`);
        return
      } else {
       
        alert('An unexpected error occurred. Please try again.');
      }
    };
  
    socket.on('join_game_response', handleJoinGameResponse);
  
    return () => {
      socket.off('join_game_response', handleJoinGameResponse);
    };
  }, [navigate, pin]);
  
  return (
    <div className="quiz-join-container">
        <h1>Join Quiz</h1>
        <input
            type="text"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
        />
        <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleJoin} disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join'}
        </button>
        {error && <p className="error-message">{error}</p>}
    </div>
    
);
};

export default JoinQuiz;
