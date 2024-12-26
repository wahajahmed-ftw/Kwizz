import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/quiz.css';

const QuizCreator = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A' }
    ]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const navigate = useNavigate();

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { text: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A' }
        ]);
        setCurrentQuestionIndex(questions.length); // Focus on the newly added question
    };

    const handleQuestionChange = (value) => {
        if (questions[currentQuestionIndex]) {
            const newQuestions = [...questions];
            newQuestions[currentQuestionIndex].text = value;
            setQuestions(newQuestions);
        }
    };

    const handleOptionChange = (option, value) => {
        if (questions[currentQuestionIndex]) {
            const newQuestions = [...questions];
            newQuestions[currentQuestionIndex].options[option] = value;
            setQuestions(newQuestions);
        }
    };

    const handleCorrectOptionChange = (value) => {
        if (questions[currentQuestionIndex]) {
            const newQuestions = [...questions];
            newQuestions[currentQuestionIndex].correctOption = value;
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async () => {
        if (!quizTitle.trim() || questions.some(q => !q.text.trim() || Object.values(q.options).some(opt => !opt.trim()))) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        const payload = {
            title: quizTitle,
            questions: questions.map(q => ({
                text: q.text,
                options: q.options,
                correctOption: q.correctOption
            }))
        };

        try {
            const response = await axios.post(
                'http://localhost:5000/create-quiz',
                payload,
                { withCredentials: true }
            );
            alert('Quiz created successfully!');
            console.log(response.data);

            setQuizTitle('');
            setQuestions([{ text: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A' }]);
        } catch (error) {
            console.error("Error creating quiz:", error.response?.data || error.message);
        }
    };

    return (
        <div className="quiz-creator">
            <div className="sidebar">
                <button className="add-question" onClick={handleAddQuestion}>
                    Add Question
                </button>
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={`question-preview ${index === currentQuestionIndex ? 'active' : ''}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                    >
                        {`Question ${index + 1}`}
                    </div>
                ))}
            </div>
            <div className="main-content">
                <div className="quiz-header">
                    <h1>Create Quiz</h1>
                    <input
                        type="text"
                        className="quiz-title-input"
                        placeholder="Quiz Title"
                        value={quizTitle}
                        onChange={e => setQuizTitle(e.target.value)}
                    />
                </div>
                {questions[currentQuestionIndex] ? (
                    <div className="question-editor">
                        <input
                            type="text"
                            className="question-input"
                            placeholder="Type your question here"
                            value={questions[currentQuestionIndex]?.text || ''}
                            onChange={e => handleQuestionChange(e.target.value)}
                        />
                        
                        <div className="options-grid">
                            {Object.keys(questions[currentQuestionIndex].options).map((option, oIndex) => (
                                <div key={oIndex} className="option-item">
                                    <input
                                        type="text"
                                        className="option-input"
                                        placeholder={`Add answer ${option}`}
                                        value={questions[currentQuestionIndex].options[option]}
                                        onChange={e => handleOptionChange(option, e.target.value)}
                                    />
                                    <label className="correct-option-label">
                                        <input
                                            type="radio"
                                            name={`correctOption`}
                                            checked={questions[currentQuestionIndex].correctOption === option}
                                            onChange={() => handleCorrectOptionChange(option)}
                                        />
                                        Correct
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No question selected.</p>
                )}
                <div className="action-buttons">
                    <button className="submit-quiz" onClick={handleSubmit}>
                        Submit Quiz
                    </button>
                    <button className="back-dashboard" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCreator;
