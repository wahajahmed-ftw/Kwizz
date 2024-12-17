import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            <h1>{quiz.title}</h1>
            <ul>
                {quiz.questions.map((question, index) => (
                    <li key={question.id}>
                        <p>
                            <strong>Q{index + 1}:</strong> {question.text}
                        </p>
                        <ul>
                            {question.options.map((option, oIndex) => (
                                <li key={oIndex}>
                                    {oIndex + 1}. {option}
                                    {oIndex === question.correct_option && ' (Correct)'}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default ViewQuiz;
