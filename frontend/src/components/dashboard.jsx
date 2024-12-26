import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import '../css/dashboard.css';
import Swal from 'sweetalert2';


const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Pagination: Current page
    const [totalPages, setTotalPages] = useState(1);   // Pagination: Total pages

    const navigate = useNavigate();

    // Fetch quizzes when the component mounts or the current page changes
    useEffect(() => {
        const fetchQuizzes = async (e) => {
            try {
                const response = await axios.get(`http://localhost:5000/get-quizzes?page=${currentPage}&limit=5`, {
                    withCredentials: true
                });
                setQuizzes(response.data.quizzes);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("Error fetching quizzes:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Error fetching quizzes");
            } finally {
                setLoading(false);
            }
        };
    
        fetchQuizzes();
    }, [currentPage]);

    const handleViewQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`); // Redirect to a quiz details page
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                background: '#ffffff',
                borderRadius: '16px',
                customClass: {
                    popup: 'rounded-lg shadow-xl',
                    title: 'text-xl font-semibold text-gray-800',
                    htmlContainer: 'text-gray-600',
                    confirmButton: 'rounded-lg text-sm px-5 py-2.5',
                    cancelButton: 'rounded-lg text-sm px-5 py-2.5'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp animate__faster'
                }
            });
    
            if (result.isConfirmed) {
                await axios.delete(`http://localhost:5000/delete-quiz/${quizId}`, {
                    withCredentials: true
                });
                
                setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Your quiz has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-lg shadow-xl',
                        title: 'text-xl font-semibold text-gray-800',
                        htmlContainer: 'text-gray-600'
                    }
                });
            }
        } catch (err) {
            console.error('Error deleting quiz:', err);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to delete the quiz.',
                icon: 'error',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-lg shadow-xl',
                    title: 'text-xl font-semibold text-gray-800',
                    htmlContainer: 'text-gray-600',
                    confirmButton: 'rounded-lg text-sm px-5 py-2.5'
                }
            });
        }
    };

    const handleHostGame = (quizId) => {
        navigate(`/host-quiz/${quizId}`); // Redirect to the host quiz page
    };

    const handlePagination = (direction) => {
        if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard">
            <Header/>
            <h1>Dashboard</h1>
            <h2>Your Quizzes</h2>
            <button className="create-quiz" onClick={() => navigate('/create-quiz')}>Create New Quiz</button>
            {quizzes.length === 0 ? (
                <p>You haven't created any quizzes yet.</p>
            ) : (
                <ul className="quiz-list">
                    {quizzes.map(quiz => (
                        <li key={quiz.id} className="quiz-item">
                            <h3>{quiz.title}</h3>
                            <p>Created on: {quiz.created_at}</p>
                            <button className='dashboard-button' onClick={() => handleViewQuiz(quiz.id)}>View Quiz</button>
                            <button className='dashboard-button' onClick={() => handleDeleteQuiz(quiz.id)}>Delete Quiz</button>
                            <button className='dashboard-button' onClick={() => handleHostGame(quiz.id)}>Host Game</button> {/* Host game button */}
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
