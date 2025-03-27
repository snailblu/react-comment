import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Game from './components/Game';
import TitleScreen from './components/TitleScreen'; // Import TitleScreen

function App() {
  return (
    <div className="App">
      {/* Set up routes */}
      <Routes>
        <Route path="/" element={<TitleScreen />} /> {/* Root path shows TitleScreen */}
        <Route path="/game" element={<Game />} /> {/* /game path shows Game */}
      </Routes>
    </div>
  );
}

export default App;
