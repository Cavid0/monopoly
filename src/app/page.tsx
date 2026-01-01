'use client';

import { useState, useCallback } from 'react';
import { GameProvider, useGame } from '@/context/GameContext';
import GameBoard from '@/components/GameBoard';
import PlayerPanel from '@/components/PlayerPanel';
import DiceRoller from '@/components/DiceRoller';
import ActionModal from '@/components/ActionModal';
import GameLog from '@/components/GameLog';
import PropertyCard from '@/components/PropertyCard';
import TradeModal from '@/components/TradeModal';
import Chat from '@/components/Chat';
import Lobby from '@/components/Lobby';
import RoomSettingsPanel, { RoomSettings } from '@/components/RoomSettingsPanel';
import CharacterSelection, { PlayerSelection, CHARACTERS, PLAYER_COLORS } from '@/components/CharacterSelection';
import SettingsPanel from '@/components/SettingsPanel';

// =============================================================================
// SETTINGS PHASE SCREEN
// =============================================================================
function SettingsPhase() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[0];
  const isHost = currentPlayer?.isHost || false;

  const handleSettingsChange = (newSettings: RoomSettings) => {
    dispatch({ type: 'UPDATE_ROOM_SETTINGS', payload: newSettings });
  };

  const handleProceed = () => {
    dispatch({ type: 'PROCEED_TO_CHARACTER_SELECT' });
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex">
      {/* Left Side - Room Info & Players */}
      <div className="w-80 bg-[#252035] border-r border-[#3d3654] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#3d3654] text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
          </h1>
        </div>

        {/* Share Link */}
        <div className="p-4 border-b border-[#3d3654]">
          <h3 className="text-gray-400 text-sm mb-2">Share this game</h3>
          <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-2">
            <span className="flex-1 text-sm font-mono text-gray-300 truncate">
              richup.io/{state.roomId?.toLowerCase()}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(`https://richup.io/room/${state.roomId}`)}
              className="bg-[#3d3654] hover:bg-[#4d4670] px-3 py-1.5 rounded text-sm text-white transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        {/* Players in Room */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-gray-400 text-sm mb-3">
            Players ({state.players.length}/{state.roomSettings.maxPlayers})
          </h3>
          <div className="space-y-2">
            {state.players.map(player => (
              <div 
                key={player.id}
                className="flex items-center gap-3 bg-[#1a1625] rounded-lg p-3"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{player.name}</p>
                  {player.isHost && (
                    <span className="text-xs text-[#8b5cf6]">👑 Host</span>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Proceed Button (Host Only) */}
        {isHost && (
          <div className="p-4 border-t border-[#3d3654]">
            <button
              onClick={handleProceed}
              disabled={state.players.length < 2}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2
                ${state.players.length >= 2
                  ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/30'
                  : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
                }`}
            >
              {state.players.length >= 2 ? 'Continue →' : 'Need 2+ Players'}
            </button>
          </div>
        )}
      </div>

      {/* Right Side - Room Settings */}
      <div className="flex-1">
        <RoomSettingsPanel
          settings={state.roomSettings}
          onSettingsChange={handleSettingsChange}
          isHost={isHost}
        />
      </div>
    </div>
  );
}

// =============================================================================
// CHARACTER SELECTION PHASE SCREEN
// =============================================================================
function CharacterSelectPhase() {
  const { state, dispatch } = useGame();
  const currentPlayerId = state.players[0]?.id || '';
  const isHost = state.players[0]?.isHost || false;

  const players: PlayerSelection[] = state.players.map(p => ({
    playerId: p.id,
    playerName: p.name,
    characterId: p.characterId,
    colorId: PLAYER_COLORS.find(c => c.hex === p.color)?.id || null,
    isReady: p.isReady,
    isHost: p.isHost,
  }));

  const handleSelectionChange = useCallback((characterId: string | null, colorId: string | null) => {
    dispatch({
      type: 'UPDATE_PLAYER_SELECTION',
      payload: { playerId: currentPlayerId, characterId, colorId }
    });
  }, [currentPlayerId, dispatch]);

  const handleReady = () => {
    dispatch({ type: 'TOGGLE_READY', payload: currentPlayerId });
  };

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  return (
    <CharacterSelection
      currentPlayerId={currentPlayerId}
      players={players}
      onSelectionChange={handleSelectionChange}
      onReady={handleReady}
      onStartGame={handleStartGame}
      isHost={isHost}
    />
  );
}

// =============================================================================
// MAIN GAME PHASE SCREEN
// =============================================================================
function GamePhase() {
  const { state, dispatch, currentPlayer } = useGame();
  const [isActionModalOpen, setIsActionModalOpen] = useState(true);
  const [showPropertyCard, setShowPropertyCard] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const isWaitingForPlayers = state.players.length < 2;

  return (
    <div className="min-h-screen bg-[#1a1625] text-white overflow-hidden">
      <div className="flex h-screen">
        
        {/* Left Sidebar - Share & Chat */}
        <div className="w-80 bg-[#252035] border-r border-[#3d3654] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#3d3654]">
            <h1 className="text-xl font-bold">
              <span className="text-white">RICH</span>
              <span className="text-[#8b5cf6]">UP</span>
              <span className="text-gray-400">.IO</span>
            </h1>
          </div>

          {/* Share Section */}
          <div className="p-4 border-b border-[#3d3654]">
            <h3 className="text-gray-400 text-sm mb-2">Share this game</h3>
            <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-2">
              <span className="flex-1 text-xs font-mono text-gray-300 truncate">
                richup.io/{state.roomId?.toLowerCase()}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(`https://richup.io/room/${state.roomId}`)}
                className="bg-[#3d3654] hover:bg-[#4d4670] px-2 py-1 rounded text-sm text-white"
              >
                📋
              </button>
            </div>
          </div>

          {/* Advertisement */}
          <div className="p-4 border-b border-[#3d3654]">
            <div className="bg-[#1a1625] rounded-lg h-20 flex items-center justify-center text-gray-600 text-xs">
              advertisement
            </div>
          </div>

          {/* Game Timer (if enabled) */}
          {state.roomSettings.gameDuration > 0 && (
            <div className="p-4 border-b border-[#3d3654]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Time Remaining</span>
                <span className="text-white font-mono">
                  {state.roomSettings.gameDuration}:00
                </span>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <Chat />
          </div>
        </div>

        {/* Center - Game Board & Dice */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Current Turn Indicator */}
          {currentPlayer && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#252035] px-6 py-2 rounded-full border border-[#3d3654] flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentPlayer.color }}
              />
              <span className="text-white font-medium">{currentPlayer.name}'s Turn</span>
            </div>
          )}
          
          {/* Game Board */}
          <div className="relative scale-90 xl:scale-100">
            <GameBoard onPropertyClick={(id) => setShowPropertyCard(id)} />
            
            {/* Dice Overlay in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <DiceRoller disabled={isWaitingForPlayers} />
              </div>
            </div>
          </div>

          {/* Game Log */}
          <div className="w-full max-w-xl mt-4">
            <GameLog />
          </div>
        </div>

        {/* Right Sidebar - Players, Trades, Properties */}
        <div className="w-80 bg-[#252035] border-l border-[#3d3654] flex flex-col">
          {/* Players List */}
          <div className="p-4 border-b border-[#3d3654]">
            <PlayerPanel onPropertyClick={(id) => setShowPropertyCard(id)} />
          </div>

          {/* Trade Section */}
          <div className="p-4 border-b border-[#3d3654]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Trades</h3>
              <button 
                onClick={() => setShowTradeModal(true)}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                + Create
              </button>
            </div>
            <p className="text-gray-500 text-xs text-center py-2">No active trades</p>
          </div>

          {/* Room Settings Section */}
          <div className="p-4 border-b border-[#3d3654] max-h-[40vh] overflow-y-auto">
            <SettingsPanel />
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-[#3d3654] flex gap-2">
            <button className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-gray-300 py-2 px-3 rounded-lg text-xs transition-colors">
              👥 Votekick
            </button>
            <button 
              onClick={() => currentPlayer && dispatch({ type: 'BANKRUPT_PLAYER', payload: currentPlayer.id })}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-xs transition-colors"
            >
              🏳️ Surrender
            </button>
          </div>

          {/* My Properties */}
          <div className="flex-1 p-4 overflow-auto">
            <h3 className="text-white font-semibold mb-3">
              My Properties ({currentPlayer ? state.properties.filter(p => p.ownerId === currentPlayer.id).length : 0})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {currentPlayer && state.properties
                .filter(p => p.ownerId === currentPlayer.id)
                .map(prop => (
                  <div
                    key={prop.id}
                    onClick={() => setShowPropertyCard(prop.id)}
                    className="bg-[#1a1625] rounded-lg p-2 cursor-pointer hover:bg-[#3d3654] transition-colors"
                  >
                    <div 
                      className="w-full h-3 rounded-t mb-1"
                      style={{ backgroundColor: prop.color }}
                    />
                    <p className="text-[10px] text-gray-300 truncate">{prop.name}</p>
                    <p className="text-[10px] text-green-400">${prop.price}</p>
                  </div>
                ))
              }
            </div>
            {currentPlayer && state.properties.filter(p => p.ownerId === currentPlayer.id).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No properties yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActionModal 
        isOpen={isActionModalOpen && !isWaitingForPlayers} 
        onClose={() => setIsActionModalOpen(false)} 
      />

      {showPropertyCard !== null && (
        <PropertyCard 
          propertyId={showPropertyCard} 
          onClose={() => setShowPropertyCard(null)} 
        />
      )}

      {showTradeModal && (
        <TradeModal onClose={() => setShowTradeModal(false)} />
      )}
    </div>
  );
}

// =============================================================================
// GAME ENDED SCREEN
// =============================================================================
function GameEndedPhase() {
  const { state } = useGame();
  
  if (!state.winner) return null;

  return (
    <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
      <div className="text-center bg-[#252035] p-12 rounded-2xl border border-[#3d3654] max-w-lg">
        <div className="text-8xl mb-6">🏆</div>
        <h1 className="text-5xl font-bold text-[#8b5cf6] mb-4">WINNER!</h1>
        <div
          className="w-32 h-32 rounded-2xl mx-auto mb-6 border-4 border-white shadow-xl flex items-center justify-center text-5xl"
          style={{ backgroundColor: state.winner.color }}
        >
          {state.winner.characterId 
            ? CHARACTERS.find(c => c.id === state.winner!.characterId)?.icon 
            : state.winner.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{state.winner.name}</h2>
        <p className="text-2xl text-green-400 mb-8">${state.winner.money.toLocaleString()}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN GAME CONTENT ROUTER
// =============================================================================
function GameContent() {
  const { state } = useGame();

  switch (state.gamePhase) {
    case 'lobby':
      return <Lobby />;
    case 'settings':
      return <SettingsPhase />;
    case 'character-select':
      return <CharacterSelectPhase />;
    case 'playing':
      return <GamePhase />;
    case 'ended':
      return <GameEndedPhase />;
    default:
      return <Lobby />;
  }
}

// =============================================================================
// APP ENTRY POINT
// =============================================================================
export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
