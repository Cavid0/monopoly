'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GameProvider, useGame } from '@/context/GameContext';
import ColorSelection, { PLAYER_COLORS, PlayerColorSelection } from '@/components/ColorSelection';
import GameBoard from '@/components/GameBoard';
import PlayerPanel from '@/components/PlayerPanel';
import DiceRoller from '@/components/DiceRoller';
import ActionModal from '@/components/ActionModal';
import GameLog from '@/components/GameLog';
import PropertyCard from '@/components/PropertyCard';
import TradeModal from '@/components/TradeModal';
import Chat from '@/components/Chat';
import SettingsPanel from '@/components/SettingsPanel';

// =============================================================================
// JOIN ROOM - NAME INPUT
// =============================================================================
function JoinRoom({ roomId, onJoin }: { roomId: string; onJoin: (name: string) => void }) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoin(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
          </h1>
          <p className="text-[#8b5cf6] text-lg">Rule the economy</p>
        </div>

        {/* Room Info */}
        <div className="bg-[#252035] rounded-xl p-6 mb-6 border border-[#3d3654] text-center">
          <p className="text-gray-400 text-sm mb-2">Otağa qoşulursunuz</p>
          <p className="text-2xl font-mono text-[#8b5cf6] font-bold">{roomId}</p>
        </div>

        {/* Name Input */}
        <form onSubmit={handleSubmit} className="bg-[#252035] rounded-xl p-6 border border-[#3d3654]">
          <label className="block text-gray-400 text-sm mb-2">Adınızı daxil edin</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ad..."
            className="w-full bg-[#1a1625] text-white px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-gray-500 mb-4"
            maxLength={15}
            autoFocus
          />
          <button
            type="submit"
            disabled={!playerName.trim()}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
              playerName.trim()
                ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer shadow-lg shadow-[#8b5cf6]/30'
                : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">»</span>
            Qoşul
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// COLOR SELECTION PHASE
// =============================================================================
function ColorSelectPhase() {
  const { state, dispatch } = useGame();
  const currentPlayerId = state.players[0]?.id || '';
  const roomLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/room/${state.roomId}` 
    : '';

  const players: PlayerColorSelection[] = state.players.map(p => ({
    playerId: p.id,
    playerName: p.name,
    colorId: PLAYER_COLORS.find(c => c.hex === p.color)?.id || null,
    isHost: p.isHost,
  }));

  const handleColorSelect = (colorId: string) => {
    const selectedColor = PLAYER_COLORS.find(c => c.id === colorId);
    if (selectedColor) {
      dispatch({
        type: 'UPDATE_PLAYER_SELECTION',
        payload: { playerId: currentPlayerId, colorId }
      });
      // Start game immediately after color selection
      setTimeout(() => {
        dispatch({ type: 'START_GAME' });
      }, 500);
    }
  };

  return (
    <ColorSelection
      currentPlayerId={currentPlayerId}
      players={players}
      onColorSelect={handleColorSelect}
      roomId={state.roomId}
      roomLink={roomLink}
    />
  );
}

// =============================================================================
// MAIN GAME PHASE
// =============================================================================
function GamePhase() {
  const { state, dispatch, currentPlayer } = useGame();
  const [isActionModalOpen, setIsActionModalOpen] = useState(true);
  const [showPropertyCard, setShowPropertyCard] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const roomLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/room/${state.roomId}` 
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <h3 className="text-gray-400 text-sm mb-2">Dostlarınızı dəvət edin</h3>
            <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-2">
              <span className="flex-1 text-xs font-mono text-[#8b5cf6] truncate">
                {roomLink}
              </span>
              <button
                onClick={copyLink}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] px-2 py-1 rounded text-sm text-white"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Game Timer (if enabled) */}
          {state.roomSettings.gameDuration > 0 && (
            <div className="p-4 border-b border-[#3d3654]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Qalan vaxt</span>
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
              <span className="text-white font-medium">{currentPlayer.name} oynayır</span>
            </div>
          )}
          
          {/* Game Board */}
          <div className="relative scale-90 xl:scale-100">
            <GameBoard onPropertyClick={(id) => setShowPropertyCard(id)} />
            
            {/* Dice Overlay in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <DiceRoller disabled={false} />
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
              <h3 className="text-white font-semibold">Mübadilə</h3>
              <button 
                onClick={() => setShowTradeModal(true)}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                + Yarat
              </button>
            </div>
            <p className="text-gray-500 text-xs text-center py-2">Aktiv mübadilə yoxdur</p>
          </div>

          {/* Room Settings Section */}
          <div className="p-4 border-b border-[#3d3654] max-h-[40vh] overflow-y-auto">
            <SettingsPanel />
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-[#3d3654] flex gap-2">
            <button className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-gray-300 py-2 px-3 rounded-lg text-xs transition-colors">
              👥 Səs ver
            </button>
            <button 
              onClick={() => currentPlayer && dispatch({ type: 'BANKRUPT_PLAYER', payload: currentPlayer.id })}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-xs transition-colors"
            >
              🏳️ Təslim ol
            </button>
          </div>

          {/* My Properties */}
          <div className="flex-1 p-4 overflow-auto">
            <h3 className="text-white font-semibold mb-3">
              Mülklərim ({currentPlayer ? state.properties.filter(p => p.ownerId === currentPlayer.id).length : 0})
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
              <p className="text-gray-500 text-sm text-center py-4">Hələ mülkünüz yoxdur</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActionModal 
        isOpen={isActionModalOpen} 
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
        <h1 className="text-5xl font-bold text-[#8b5cf6] mb-4">QALİB!</h1>
        <div
          className="w-32 h-32 rounded-2xl mx-auto mb-6 border-4 border-white shadow-xl flex items-center justify-center text-5xl"
          style={{ backgroundColor: state.winner.color }}
        >
          {state.winner.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{state.winner.name}</h2>
        <p className="text-2xl text-green-400 mb-8">${state.winner.money.toLocaleString()}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
        >
          Yenidən Oyna
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// ROOM GAME CONTENT
// =============================================================================
function RoomGameContent({ roomId }: { roomId: string }) {
  const { state, dispatch } = useGame();
  const [hasJoined, setHasJoined] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);

  // Check sessionStorage on mount for returning from main page
  useEffect(() => {
    if (!checkedStorage && typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('playerName');
      const isHost = sessionStorage.getItem('isHost') === 'true';
      
      if (storedName) {
        // Clear storage after reading
        sessionStorage.removeItem('playerName');
        sessionStorage.removeItem('isHost');
        
        // Auto-join with stored name
        dispatch({ type: 'SET_ROOM', payload: roomId });
        dispatch({
          type: 'ADD_PLAYER',
          payload: { name: storedName, isHost }
        });
        setHasJoined(true);
        setTimeout(() => {
          dispatch({ type: 'SET_GAME_PHASE', payload: 'character-select' });
        }, 100);
      }
      setCheckedStorage(true);
    }
  }, [checkedStorage, dispatch, roomId]);

  const handleJoin = (playerName: string) => {
    dispatch({ type: 'SET_ROOM', payload: roomId });
    dispatch({
      type: 'ADD_PLAYER',
      payload: { name: playerName, isHost: false }
    });
    setHasJoined(true);
    setTimeout(() => {
      dispatch({ type: 'SET_GAME_PHASE', payload: 'character-select' });
    }, 100);
  };

  // Not joined yet - show join form
  if (!hasJoined && state.gamePhase === 'lobby' && checkedStorage) {
    return <JoinRoom roomId={roomId} onJoin={handleJoin} />;
  }

  // Still checking storage
  if (!checkedStorage) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
          </h1>
          <p className="text-gray-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  switch (state.gamePhase) {
    case 'settings':
    case 'character-select':
      return <ColorSelectPhase />;
    case 'playing':
      return <GamePhase />;
    case 'ended':
      return <GameEndedPhase />;
    default:
      return <JoinRoom roomId={roomId} onJoin={handleJoin} />;
  }
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export default function RoomPage() {
  const params = useParams();
  const roomId = (params.roomId as string)?.toUpperCase() || '';

  return (
    <GameProvider>
      <RoomGameContent roomId={roomId} />
    </GameProvider>
  );
}
