'use client';

import { useState, useEffect } from 'react';

// Available player colors
const PLAYER_COLORS = [
  { id: 'red', hex: '#ef4444', name: 'Qırmızı' },
  { id: 'blue', hex: '#3b82f6', name: 'Mavi' },
  { id: 'green', hex: '#22c55e', name: 'Yaşıl' },
  { id: 'amber', hex: '#f59e0b', name: 'Sarı' },
  { id: 'violet', hex: '#8b5cf6', name: 'Bənövşəyi' },
  { id: 'pink', hex: '#ec4899', name: 'Çəhrayı' },
  { id: 'cyan', hex: '#06b6d4', name: 'Göy' },
  { id: 'orange', hex: '#f97316', name: 'Narıncı' },
] as const;

export interface PlayerColorSelection {
  playerId: string;
  playerName: string;
  colorId: string | null;
  isHost: boolean;
}

interface ColorSelectionProps {
  currentPlayerId: string;
  players: PlayerColorSelection[];
  onColorSelect: (colorId: string) => void;
  roomId: string;
  roomLink: string;
}

export default function ColorSelection({
  currentPlayerId,
  players,
  onColorSelect,
  roomId,
  roomLink,
}: ColorSelectionProps) {
  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const [copied, setCopied] = useState(false);

  // Get taken colors (by other players)
  const takenColors = players
    .filter(p => p.playerId !== currentPlayerId && p.colorId)
    .map(p => p.colorId);

  const handleColorSelect = (colorId: string) => {
    if (takenColors.includes(colorId)) return;
    onColorSelect(colorId);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
          </h1>
          <p className="text-gray-400">Rəng seçin və oyuna başlayın!</p>
        </div>

        {/* Share Link */}
        <div className="bg-[#252035] rounded-xl p-4 mb-6 border border-[#3d3654]">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>🔗</span> Dostlarınızı dəvət edin
          </h3>
          <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-3">
            <span className="flex-1 text-sm font-mono text-[#8b5cf6] truncate">
              {roomLink}
            </span>
            <button
              onClick={copyLink}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] px-4 py-2 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              {copied ? '✓ Kopyalandı!' : '📋 Kopyala'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Bu linki dostlarınıza göndərin - onlar da bu otağa qoşula biləcəklər
          </p>
        </div>

        {/* Player Name */}
        <div className="bg-[#252035] rounded-xl p-4 mb-6 border border-[#3d3654]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3d3654] rounded-full flex items-center justify-center text-white text-xl font-bold">
              {currentPlayer?.playerName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold">{currentPlayer?.playerName || 'Oyunçu'}</p>
              {currentPlayer?.isHost && (
                <span className="text-xs text-[#8b5cf6]">👑 Host</span>
              )}
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="bg-[#252035] rounded-xl p-6 border border-[#3d3654]">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span> Rəng seçin
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {PLAYER_COLORS.map(color => {
              const isTaken = takenColors.includes(color.id);
              const takenBy = players.find(p => p.colorId === color.id && p.playerId !== currentPlayerId);
              
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  disabled={isTaken}
                  className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2
                    ${isTaken 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'hover:scale-110 hover:shadow-lg cursor-pointer'
                    }`}
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: !isTaken ? `0 8px 24px ${color.hex}40` : undefined,
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full border-4 border-white/30 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`text-xs font-bold ${isTaken ? 'text-gray-600' : 'text-white'}`}>
                    {color.name}
                  </span>
                  
                  {/* Taken indicator */}
                  {isTaken && takenBy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                      <span className="text-white text-xs font-medium">{takenBy.playerName}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <p className="text-gray-400 text-sm text-center mt-6">
            👆 Rəng seçin - oyun avtomatik başlayacaq
          </p>
        </div>

        {/* Players in room */}
        {players.length > 1 && (
          <div className="mt-6 bg-[#252035] rounded-xl p-4 border border-[#3d3654]">
            <h3 className="text-gray-400 text-sm mb-3">Otaqdakı oyunçular ({players.length}/8)</h3>
            <div className="flex flex-wrap gap-2">
              {players.map(player => (
                <div 
                  key={player.playerId}
                  className="flex items-center gap-2 bg-[#1a1625] rounded-lg px-3 py-2"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ 
                      backgroundColor: player.colorId 
                        ? PLAYER_COLORS.find(c => c.id === player.colorId)?.hex 
                        : '#3d3654' 
                    }}
                  >
                    {player.playerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm">{player.playerName}</span>
                  {player.isHost && <span className="text-[#8b5cf6] text-xs">👑</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { PLAYER_COLORS };
