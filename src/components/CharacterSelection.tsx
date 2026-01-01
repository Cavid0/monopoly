'use client';

import { useState, useEffect } from 'react';

// Character tokens with Monopoly-style icons
const CHARACTERS = [
  { id: 'car', icon: '🚗', name: 'Race Car' },
  { id: 'ship', icon: '🚢', name: 'Battleship' },
  { id: 'hat', icon: '🎩', name: 'Top Hat' },
  { id: 'dog', icon: '🐕', name: 'Scottie Dog' },
  { id: 'boot', icon: '👢', name: 'Boot' },
  { id: 'iron', icon: '🔧', name: 'Iron' },
  { id: 'thimble', icon: '🧵', name: 'Thimble' },
  { id: 'cannon', icon: '💎', name: 'Diamond' },
] as const;

// Available player colors
const PLAYER_COLORS = [
  { id: 'red', hex: '#ef4444', name: 'Red' },
  { id: 'blue', hex: '#3b82f6', name: 'Blue' },
  { id: 'green', hex: '#22c55e', name: 'Green' },
  { id: 'amber', hex: '#f59e0b', name: 'Amber' },
  { id: 'violet', hex: '#8b5cf6', name: 'Violet' },
  { id: 'pink', hex: '#ec4899', name: 'Pink' },
  { id: 'cyan', hex: '#06b6d4', name: 'Cyan' },
  { id: 'orange', hex: '#f97316', name: 'Orange' },
] as const;

export interface PlayerSelection {
  playerId: string;
  playerName: string;
  characterId: string | null;
  colorId: string | null;
  isReady: boolean;
  isHost: boolean;
}

interface CharacterSelectionProps {
  currentPlayerId: string;
  players: PlayerSelection[];
  onSelectionChange: (characterId: string | null, colorId: string | null) => void;
  onReady: () => void;
  onStartGame: () => void;
  isHost: boolean;
}

export default function CharacterSelection({
  currentPlayerId,
  players,
  onSelectionChange,
  onReady,
  onStartGame,
  isHost,
}: CharacterSelectionProps) {
  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(currentPlayer?.characterId || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(currentPlayer?.colorId || null);

  // Get taken characters and colors (by other players)
  const takenCharacters = players
    .filter(p => p.playerId !== currentPlayerId && p.characterId)
    .map(p => p.characterId);
  
  const takenColors = players
    .filter(p => p.playerId !== currentPlayerId && p.colorId)
    .map(p => p.colorId);

  // Check if current player can be ready (has both selections)
  const canBeReady = selectedCharacter && selectedColor;
  
  // Check if all players are ready
  const allPlayersReady = players.every(p => p.isReady);
  
  // Minimum players check (allow 1 for testing)
  const hasEnoughPlayers = players.length >= 1;

  useEffect(() => {
    onSelectionChange(selectedCharacter, selectedColor);
  }, [selectedCharacter, selectedColor, onSelectionChange]);

  const handleCharacterSelect = (characterId: string) => {
    if (takenCharacters.includes(characterId)) return;
    setSelectedCharacter(characterId === selectedCharacter ? null : characterId);
  };

  const handleColorSelect = (colorId: string) => {
    if (takenColors.includes(colorId)) return;
    setSelectedColor(colorId === selectedColor ? null : colorId);
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex">
      {/* Left Side - Character & Color Selection */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Choose Your Token</h1>
            <p className="text-gray-400">Select a character and color to represent you on the board</p>
          </div>

          {/* Character Selection */}
          <div className="bg-[#252035] rounded-2xl p-6 mb-6 border border-[#3d3654]">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🎮</span> Select Character
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {CHARACTERS.map(char => {
                const isTaken = takenCharacters.includes(char.id);
                const isSelected = selectedCharacter === char.id;
                const takenBy = players.find(p => p.characterId === char.id && p.playerId !== currentPlayerId);
                
                return (
                  <button
                    key={char.id}
                    onClick={() => handleCharacterSelect(char.id)}
                    disabled={isTaken}
                    className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2
                      ${isTaken 
                        ? 'bg-[#1a1625] opacity-50 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-[#8b5cf6] ring-2 ring-[#a78bfa] shadow-lg shadow-[#8b5cf6]/30 scale-105'
                          : 'bg-[#1a1625] hover:bg-[#3d3654] hover:scale-105'
                      }`}
                  >
                    <span className="text-3xl">{char.icon}</span>
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {char.name}
                    </span>
                    
                    {/* Taken indicator */}
                    {isTaken && takenBy && (
                      <div 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#252035]"
                        style={{ backgroundColor: PLAYER_COLORS.find(c => c.id === takenBy.colorId)?.hex || '#666' }}
                        title={`Taken by ${takenBy.playerName}`}
                      />
                    )}
                    
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-[#252035] rounded-2xl p-6 mb-6 border border-[#3d3654]">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🎨</span> Select Color
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {PLAYER_COLORS.map(color => {
                const isTaken = takenColors.includes(color.id);
                const isSelected = selectedColor === color.id;
                const takenBy = players.find(p => p.colorId === color.id && p.playerId !== currentPlayerId);
                
                return (
                  <button
                    key={color.id}
                    onClick={() => handleColorSelect(color.id)}
                    disabled={isTaken}
                    className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2
                      ${isTaken 
                        ? 'opacity-40 cursor-not-allowed' 
                        : isSelected
                          ? 'ring-2 ring-white shadow-lg scale-105'
                          : 'hover:scale-105'
                      }`}
                    style={{
                      backgroundColor: isTaken ? '#1a1625' : color.hex,
                      boxShadow: isSelected ? `0 8px 24px ${color.hex}60` : undefined,
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white/30"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={`text-xs font-medium ${isTaken ? 'text-gray-600' : 'text-white'}`}>
                      {color.name}
                    </span>
                    
                    {/* Taken indicator */}
                    {isTaken && takenBy && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">{takenBy.playerName}</span>
                      </div>
                    )}
                    
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#1a1625] text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview & Ready Button */}
          <div className="bg-[#252035] rounded-2xl p-6 border border-[#3d3654]">
            <div className="flex items-center justify-between">
              {/* Preview */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-all duration-300"
                  style={{ 
                    backgroundColor: selectedColor 
                      ? PLAYER_COLORS.find(c => c.id === selectedColor)?.hex 
                      : '#3d3654',
                    boxShadow: selectedColor 
                      ? `0 8px 24px ${PLAYER_COLORS.find(c => c.id === selectedColor)?.hex}40`
                      : undefined,
                  }}
                >
                  {selectedCharacter 
                    ? CHARACTERS.find(c => c.id === selectedCharacter)?.icon 
                    : '?'}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {currentPlayer?.playerName || 'Player'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedCharacter && selectedColor 
                      ? 'Ready to play!' 
                      : 'Select character & color'}
                  </p>
                </div>
              </div>

              {/* Ready Button */}
              <button
                onClick={onReady}
                disabled={!canBeReady}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200
                  ${canBeReady
                    ? currentPlayer?.isReady
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/30'
                    : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
                  }`}
              >
                {currentPlayer?.isReady ? '✓ Ready!' : 'Ready'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Players List */}
      <div className="w-80 bg-[#252035] border-l border-[#3d3654] flex flex-col">
        <div className="p-6 border-b border-[#3d3654]">
          <h2 className="text-white font-bold text-lg">Players ({players.length}/8)</h2>
          <p className="text-gray-500 text-sm mt-1">Waiting for everyone to be ready</p>
        </div>

        {/* Players List */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {players.map(player => {
            const character = CHARACTERS.find(c => c.id === player.characterId);
            const color = PLAYER_COLORS.find(c => c.id === player.colorId);
            
            return (
              <div 
                key={player.playerId}
                className={`p-4 rounded-xl border transition-all duration-200
                  ${player.isReady 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-[#1a1625] border-[#3d3654]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: color?.hex || '#3d3654' }}
                  >
                    {character?.icon || '?'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {player.playerName}
                      </span>
                      {player.isHost && (
                        <span className="text-xs bg-[#8b5cf6] text-white px-2 py-0.5 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {player.isReady 
                        ? '✓ Ready to play' 
                        : player.characterId && player.colorId
                          ? 'Selecting...'
                          : 'Choosing token...'}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <div className="p-4 border-t border-[#3d3654]">
            <button
              onClick={onStartGame}
              disabled={!allPlayersReady || !hasEnoughPlayers}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2
                ${allPlayersReady && hasEnoughPlayers
                  ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-lg shadow-green-500/30'
                  : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
                }`}
            >
              <span className="text-xl">▶</span> 
              {!hasEnoughPlayers 
                ? 'Need 2+ Players' 
                : allPlayersReady 
                  ? 'Start Game' 
                  : 'Waiting for Players...'}
            </button>
            {hasEnoughPlayers && !allPlayersReady && (
              <p className="text-gray-500 text-xs text-center mt-2">
                {players.filter(p => !p.isReady).length} player(s) not ready
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export constants for use in other components
export { CHARACTERS, PLAYER_COLORS };
