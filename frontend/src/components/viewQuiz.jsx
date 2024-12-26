import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/viewquiz.css';
const ViewQuiz = () => {
    const { quizId } = useParams(); // Get quiz ID from route params
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/quiz/${quizId}`, {
                    withCredentials: true // Include session cookies
                });
                setQuiz(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching quiz');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="view-quiz">
        <h1 className="view-quiz-title">{quiz.title}</h1>
        <ul className="view-quiz-list">
            {quiz.questions.map((question, index) => (
                <li key={question.id} className="view-quiz-question-item">
                    <p className="view-quiz-question-text">
                        <span className="view-quiz-question-number">Q{index + 1}:</span> 
                        {question.text}
                    </p>
                    <ul className="view-quiz-options-list">
                        {Object.entries(question.options).map(([key, value]) => (
                            <li 
                                key={key} 
                                className={`view-quiz-option-item ${key === question.correct_option ? 'correct' : ''}`}
                            >
                                {key}: {value}
                                {key === question.correct_option && ' (Correct)'}
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
        <button 
            className="view-quiz-back-button"
            onClick={() => navigate('/dashboard')}
        >
            Back to Dashboard
        </button>
    </div>
    );

    
};

export default ViewQuiz;
