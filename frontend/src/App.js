import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import Cards from "./components/card";
import Signup from "./components/signup";
import Login from "./components/login";
import QuizCreator from "./components/quiz.jsx";
import Dashboard from "./components/dashboard.jsx";
import ViewQuiz from "./components/viewQuiz.jsx";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>

          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Cards />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/quiz" element={<QuizCreator/>} />
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/quiz/:quizId" element={<ViewQuiz />} />
            </Routes>
          </main>
          <Footer />
      </Router>
    </div>
  );
}

export default App;
