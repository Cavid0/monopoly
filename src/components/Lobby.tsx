'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';

// 3D Dice SVG component for lobby
function Dice3D() {
  return (
    <div className="float-animation">
      <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-2xl">
        {/* Dice body */}
        <defs>
          <linearGradient id="diceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="10" y="10" width="80" height="80" rx="12" fill="url(#diceGrad)" filter="url(#shadow)" />
        {/* Dots */}
        <circle cx="30" cy="30" r="6" fill="#1a1625" />
        <circle cx="70" cy="30" r="6" fill="#1a1625" />
        <circle cx="30" cy="70" r="6" fill="#1a1625" />
        <circle cx="70" cy="70" r="6" fill="#1a1625" />
        <circle cx="50" cy="50" r="6" fill="#1a1625" />
      </svg>
    </div>
  );
}

export default function Lobby() {
  const { state, dispatch } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [showRooms, setShowRooms] = useState(false);

  const handlePlay = () => {
    if (!playerName.trim()) return;
    
    // Create room and add player
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    dispatch({ type: 'SET_ROOM', payload: code });
    dispatch({
      type: 'ADD_PLAYER',
      payload: { name: playerName, isHost: true }
    });
    // Go to character selection phase
    setTimeout(() => {
      dispatch({ type: 'SET_GAME_PHASE', payload: 'character-select' });
    }, 100);
  };

  const handleCreatePrivate = () => {
    if (!playerName.trim()) {
      alert('Please enter your name first!');
      return;
    }
    // Create private room
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    dispatch({ type: 'SET_ROOM', payload: code });
    dispatch({
      type: 'ADD_PLAYER',
      payload: { name: playerName, isHost: true }
    });
    // Go to character selection phase
    setTimeout(() => {
      dispatch({ type: 'SET_GAME_PHASE', payload: 'character-select' });
    }, 100);
  };

  // Room is created, waiting for phase change
  if (state.gamePhase !== 'lobby') {
    return null; // Will be handled by other phases in page.tsx
  }

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          🔊
        </button>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            🛒 Store
          </button>
          <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            →| Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 -mt-16">
        {/* 3D Dice */}
        <div className="mb-6">
          <Dice3D />
        </div>

        {/* Logo */}
        <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-wide">
          <span className="text-white">RICH</span>
          <span className="text-[#8b5cf6]">UP</span>
          <span className="text-gray-400">.IO</span>
        </h1>
        <p className="text-[#8b5cf6] text-lg mb-10">Rule the economy</p>

        {/* Name Input */}
        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full bg-[#3d3654] text-white px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-gray-400"
            maxLength={15}
          />
        </div>

        {/* Play Button */}
        <button
          onClick={handlePlay}
          disabled={!playerName.trim()}
          className={`w-full max-w-md py-4 rounded-xl font-bold text-xl mb-6 transition-all flex items-center justify-center gap-3 ${
            playerName.trim()
              ? 'btn-primary text-white cursor-pointer pulse-glow'
              : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-2xl">»</span>
          Play
        </button>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setShowRooms(true)}
            className="bg-[#252035] hover:bg-[#3d3654] border border-[#3d3654] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            👥 All rooms
          </button>
          <button 
            onClick={handleCreatePrivate}
            className="bg-[#252035] hover:bg-[#3d3654] border border-[#3d3654] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            🔑 Create a private game
          </button>
        </div>
      </main>

      {/* Decorative background icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute bottom-20 left-10 text-6xl opacity-10">🏠</div>
        <div className="absolute bottom-40 left-40 text-4xl opacity-10">💰</div>
        <div className="absolute bottom-10 right-20 text-5xl opacity-10">🎲</div>
        <div className="absolute bottom-60 right-40 text-4xl opacity-10">✈️</div>
        <div className="absolute top-40 left-20 text-3xl opacity-10">⚡</div>
        <div className="absolute top-60 right-10 text-4xl opacity-10">❓</div>
      </div>

      {/* Footer Discord Icon */}
      <div className="fixed bottom-4 right-4">
        <button className="bg-[#5865F2] hover:bg-[#4752C4] w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors">
          💬
        </button>
      </div>
    </div>
  );
}
