import { useState } from 'react'
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/home";
import Header from "./components/header";

function App() {
  return (
    <BrowserRouter>
      <Routes>

  <Route path="/" element={<Login />} />

  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

  <Route
    path="/home"
    element={
      <>
        <Header />
        <Home />
      </>
    }
  />

</Routes>
    </BrowserRouter>
  );
}

export default App
