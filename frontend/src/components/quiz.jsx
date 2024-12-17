import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [totalPages, setTotalPages] = useState(1);   // Total pages for pagination

    const navigate = useNavigate();

    // Fetch quizzes when the component mounts or the current page changes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/get-quizzes?page=${currentPage}&limit=5`,
                    { withCredentials: true } // Include session cookies
                );

                setQuizzes(response.data.quizzes);
                setTotalPages(response.data.totalPages); // Set total pages for pagination
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching quizzes');
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, [currentPage]);

    // View Quiz: Navigate to quiz details page
    const handleViewQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`); // Redirect to detailed quiz page
    };

    // Delete Quiz: Remove quiz from database and update UI
    const handleDeleteQuiz = async (quizId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this quiz?');
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:5000/delete-quiz/${quizId}`, {
                withCredentials: true
            });
            setQuizzes(quizzes.filter(quiz => quiz.id !== quizId)); // Update state to reflect deletion
            alert('Quiz deleted successfully!');
        } catch (err) {
            console.error('Error deleting quiz:', err);
            alert('Failed to delete the quiz.');
        }
    };

    // Handle pagination
    const handlePagination = (direction) => {
        if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Display loading indicator
    if (loading) {
        return <div>Loading...</div>;
    }

    // Display error message if fetching quizzes fails
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <h2>Your Quizzes</h2>
            {quizzes.length === 0 ? (
                <p>You haven't created any quizzes yet.</p>
            ) : (
                <ul className="quiz-list">
                    {quizzes.map(quiz => (
                        <li key={quiz.id} className="quiz-item">
                            <h3>{quiz.title}</h3>
                            <p>Created on: {quiz.created_at}</p>
                            <ul>
                                {quiz.questions.map(question => (
                                    <li key={question.id}>
                                        <strong>Q:</strong> {question.text} | <strong>Options:</strong> {question.options.join(', ')}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => handleViewQuiz(quiz.id)}>View Quiz</button>
                            <button onClick={() => handleDeleteQuiz(quiz.id)}>Delete Quiz</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePagination('prev')}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePagination('next')}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
