import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './loginPage'; // LoginPage
import HomePage from './homePage';

function App() {
  return (
    <Router>
            <Routes>
                <Route exact path="/login" element={<LoginPage/>} />
                <Route exact path="/home" element={<HomePage/>} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
    </Router>
  );
}

export default App;
