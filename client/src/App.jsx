import { useState } from "react";
import "./App.css";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import PlayerPage from "./components/PlayerPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
}

export default App;