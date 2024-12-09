import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import Cards from "./components/card";
import Signup from "./components/signup";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>

          <Header />
          <main className="main-content">
            <h1>Celebrate the holiday season with Kahoot!</h1>
            <Routes>
              <Route path="/" element={<Cards />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
          <Footer />
      </Router>
    </div>
  );
}

export default App;
