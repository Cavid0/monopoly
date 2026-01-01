'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SocketProvider, useSocket } from '@/context/SocketContext';
import MultiplayerGame from '@/components/MultiplayerGame';

function MultiplayerContent() {
  const searchParams = useSearchParams();
  const { joinRoom, isInRoom } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);

  const roomCode = searchParams.get('room');

  useEffect(() => {
    // Check if we have a room code in URL and we're not in a room
    if (roomCode && !isInRoom) {
      setShowJoinPrompt(true);
    }
  }, [roomCode, isInRoom]);

  const handleJoin = () => {
    if (roomCode && playerName.trim()) {
      joinRoom(roomCode, playerName.trim());
      setShowJoinPrompt(false);
    }
  };

  // Show join prompt if there's a room code in URL
  if (showJoinPrompt && roomCode) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center p-4">
        <div className="bg-[#252035] rounded-2xl p-8 w-full max-w-md border border-[#3d3654]">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">RICH</span>
              <span className="text-[#8b5cf6]">UP</span>
              <span className="text-gray-400">.IO</span>
            </h1>
            <p className="text-gray-400">Otağa qoşulun</p>
          </div>

          <div className="bg-[#1a1625] rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Otaq Kodu</p>
            <p className="text-2xl font-bold text-[#8b5cf6] font-mono">{roomCode}</p>
          </div>

          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Adınızı daxil edin..."
            className="w-full bg-[#1a1625] text-white px-4 py-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-gray-500"
            maxLength={15}
          />

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowJoinPrompt(false);
                window.history.replaceState({}, '', '/multiplayer');
              }}
              className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-white py-4 rounded-xl font-medium"
            >
              Ləğv et
            </button>
            <button
              onClick={handleJoin}
              disabled={!playerName.trim()}
              className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              Qoşul
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <MultiplayerGame />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-bounce">🎲</div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-white">RICH</span>
          <span className="text-[#8b5cf6]">UP</span>
          <span className="text-gray-400">.IO</span>
        </h1>
        <p className="text-gray-400 animate-pulse">Yüklənir...</p>
      </div>
    </div>
  );
}

export default function MultiplayerPage() {
  return (
    <SocketProvider>
      <Suspense fallback={<LoadingScreen />}>
        <MultiplayerContent />
      </Suspense>
    </SocketProvider>
  );
}
