'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { PLAYER_COLORS } from '@/types/socket';

// Board data for property display
const BOARD_DATA: Record<number, { flag?: string; name: string; price?: number; type: string; group?: string }> = {
  0: { name: 'START', type: 'corner' },
  1: { flag: '🇧🇷', name: 'Salvador', price: 60, type: 'property', group: 'brown' },
  2: { name: 'Treasure', type: 'chest' },
  3: { flag: '🇧🇷', name: 'Rio', price: 60, type: 'property', group: 'brown' },
  4: { name: 'Income Tax', type: 'tax' },
  5: { name: 'TLV Airport', price: 200, type: 'railroad' },
  6: { flag: '🇮🇱', name: 'Tel Aviv', price: 100, type: 'property', group: 'lightBlue' },
  7: { name: 'Surprise', type: 'chance' },
  8: { flag: '🇮🇱', name: 'Haifa', price: 100, type: 'property', group: 'lightBlue' },
  9: { flag: '🇮🇱', name: 'Jerusalem', price: 120, type: 'property', group: 'lightBlue' },
  10: { name: 'In Prison', type: 'corner' },
  11: { flag: '🇮🇹', name: 'Venice', price: 140, type: 'property', group: 'pink' },
  12: { name: 'Electric Company', price: 150, type: 'utility' },
  13: { flag: '🇮🇹', name: 'Milan', price: 140, type: 'property', group: 'pink' },
  14: { flag: '🇮🇹', name: 'Rome', price: 160, type: 'property', group: 'pink' },
  15: { name: 'MUC Airport', price: 200, type: 'railroad' },
  16: { flag: '🇩🇪', name: 'Frankfurt', price: 180, type: 'property', group: 'orange' },
  17: { name: 'Treasure', type: 'chest' },
  18: { flag: '🇩🇪', name: 'Munich', price: 180, type: 'property', group: 'orange' },
  19: { flag: '🇩🇪', name: 'Berlin', price: 200, type: 'property', group: 'orange' },
  20: { name: 'Vacation', type: 'corner' },
  21: { flag: '🇨🇳', name: 'Shenzhen', price: 220, type: 'property', group: 'red' },
  22: { name: 'Surprise', type: 'chance' },
  23: { flag: '🇨🇳', name: 'Beijing', price: 220, type: 'property', group: 'red' },
  24: { flag: '🇨🇳', name: 'Shanghai', price: 240, type: 'property', group: 'red' },
  25: { name: 'CDG Airport', price: 200, type: 'railroad' },
  26: { flag: '🇫🇷', name: 'Lyon', price: 260, type: 'property', group: 'yellow' },
  27: { flag: '🇫🇷', name: 'Toulouse', price: 260, type: 'property', group: 'yellow' },
  28: { name: 'Water Company', price: 150, type: 'utility' },
  29: { flag: '🇫🇷', name: 'Paris', price: 280, type: 'property', group: 'yellow' },
  30: { name: 'Go to prison', type: 'corner' },
  31: { flag: '🇬🇧', name: 'Liverpool', price: 300, type: 'property', group: 'green' },
  32: { flag: '🇬🇧', name: 'Manchester', price: 300, type: 'property', group: 'green' },
  33: { name: 'Treasure', type: 'chest' },
  34: { flag: '🇬🇧', name: 'London', price: 320, type: 'property', group: 'green' },
  35: { name: 'JFK Airport', price: 200, type: 'railroad' },
  36: { name: 'Surprise', type: 'chance' },
  37: { flag: '🇺🇸', name: 'San Francisco', price: 350, type: 'property', group: 'blue' },
  38: { name: 'Luxury Tax', type: 'tax' },
  39: { flag: '🇺🇸', name: 'New York', price: 400, type: 'property', group: 'blue' },
};

const GROUP_COLORS: Record<string, string> = {
  brown: '#8B6914',
  lightBlue: '#5BC0DE',
  pink: '#E91E8C',
  orange: '#FF8C00',
  red: '#DC143C',
  yellow: '#D4AF37',
  green: '#228B22',
  blue: '#0066CC',
};

// =============================================================================
// MULTIPLAYER LOBBY
// =============================================================================

function MultiplayerLobby() {
  const {
    isConnected,
    error,
    createRoom,
    joinRoom,
    joinMatchmaking,
    isSearching,
    queuePosition,
    leaveMatchmaking,
  } = useSocket();

  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handlePlay = () => {
    if (!playerName.trim()) return;
    joinMatchmaking(playerName.trim());
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim(), false);
  };

  const handleCreatePrivateRoom = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim(), true);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    joinRoom(joinCode.trim(), playerName.trim());
    setShowJoinModal(false);
  };

  if (isSearching) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6 animate-bounce">🎲</div>
          <h1 className="text-3xl font-bold text-white mb-4">Oyunçu axtarılır...</h1>
          <p className="text-gray-400 mb-8">Növbədəki mövqeyiniz: {queuePosition}</p>
          <div className="w-full bg-[#252035] rounded-full h-2 mb-8">
            <div className="bg-[#8b5cf6] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <button
            onClick={leaveMatchmaking}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-8 py-3 rounded-xl font-medium transition-all"
          >
            Ləğv et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400 text-sm">
            {isConnected ? 'Bağlantı var' : 'Bağlantı yoxdur'}
          </span>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="mx-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="text-6xl mb-6">🎲</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-wide">
          <span className="text-white">MONO</span>
          <span className="text-[#8b5cf6]">POLY</span>
          <span className="text-gray-400">.AZ</span>
        </h1>
        <p className="text-[#8b5cf6] text-lg mb-10">Real-time Multiplayer</p>

        {/* Name Input */}
        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Adınızı daxil edin..."
            className="w-full bg-[#3d3654] text-white px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-gray-400"
            maxLength={15}
          />
        </div>

        {/* Play Button - Matchmaking */}
        <button
          onClick={handlePlay}
          disabled={!playerName.trim() || !isConnected}
          className={`w-full max-w-md py-4 rounded-xl font-bold text-xl mb-6 transition-all flex items-center justify-center gap-3 ${
            playerName.trim() && isConnected
              ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer shadow-lg shadow-[#8b5cf6]/30'
              : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-2xl">»</span>
          Oyna (Avtomatik Match)
        </button>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => setShowJoinModal(true)}
            disabled={!playerName.trim()}
            className="bg-[#252035] hover:bg-[#3d3654] border border-[#3d3654] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            🔗 Otağa qoşul
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || !isConnected}
            className="bg-[#252035] hover:bg-[#3d3654] border border-[#3d3654] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            👥 Açıq otaq yarat
          </button>
          <button
            onClick={handleCreatePrivateRoom}
            disabled={!playerName.trim() || !isConnected}
            className="bg-[#252035] hover:bg-[#3d3654] border border-[#3d3654] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            🔑 Gizli otaq yarat
          </button>
        </div>
      </main>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252035] rounded-2xl p-6 w-full max-w-md border border-[#3d3654]">
            <h2 className="text-xl font-bold text-white mb-4">Otağa qoşul</h2>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Otaq kodu (məs: ABC123)"
              className="w-full bg-[#1a1625] text-white px-4 py-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-gray-500 uppercase"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-white py-3 rounded-xl font-medium"
              >
                Ləğv et
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim()}
                className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                Qoşul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COLOR SELECTION
// =============================================================================

function ColorSelection() {
  const {
    gameState,
    playerId,
    currentPlayer,
    roomCode,
    isHost,
    selectColor,
    setReady,
    startGame,
  } = useSocket();

  const [copied, setCopied] = useState(false);

  if (!gameState) return null;

  const roomLink = typeof window !== 'undefined'
    ? `${window.location.origin}/multiplayer?room=${roomCode}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const takenColors = gameState.players
    .filter(p => p.id !== playerId && p.colorId)
    .map(p => p.colorId);

  const allReady = gameState.players.every(p => p.isReady);
  const canStart = gameState.players.length >= 2 && allReady;

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">MONO</span>
            <span className="text-[#8b5cf6]">POLY</span>
            <span className="text-gray-400">.AZ</span>
          </h1>
          <p className="text-gray-400">Rəng seçin və hazır olun!</p>
        </div>

        {/* Share Link */}
        <div className="bg-[#252035] rounded-xl p-4 mb-6 border border-[#3d3654]">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>🔗</span> Otaq kodu: <span className="text-[#8b5cf6] font-mono">{roomCode}</span>
          </h3>
          <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-3">
            <span className="flex-1 text-sm font-mono text-[#8b5cf6] truncate">
              {roomLink}
            </span>
            <button
              onClick={copyLink}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] px-4 py-2 rounded-lg text-sm text-white transition-colors"
            >
              {copied ? '✓ Kopyalandı!' : '📋 Kopyala'}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-[#252035] rounded-xl p-4 mb-6 border border-[#3d3654]">
          <h3 className="text-white font-semibold mb-3">
            Oyunçular ({gameState.players.length}/8)
          </h3>
          <div className="space-y-2">
            {gameState.players.map(player => {
              const colorData = PLAYER_COLORS.find(c => c.id === player.colorId);
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    player.isReady ? 'bg-green-500/10 border border-green-500/30' : 'bg-[#1a1625]'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colorData?.hex || '#3d3654' }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{player.name}</span>
                      {player.isHost && <span className="text-xs text-[#8b5cf6]">👑 Host</span>}
                      {player.id === playerId && <span className="text-xs text-green-400">(Siz)</span>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {player.isReady ? '✓ Hazır' : player.colorId ? 'Rəng seçdi' : 'Seçir...'}
                    </span>
                  </div>
                  {player.isReady && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="bg-[#252035] rounded-xl p-6 mb-6 border border-[#3d3654]">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span> Rəng seçin
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {PLAYER_COLORS.map(color => {
              const isTaken = takenColors.includes(color.id);
              const isSelected = currentPlayer?.colorId === color.id;

              return (
                <button
                  key={color.id}
                  onClick={() => selectColor(color.id)}
                  disabled={isTaken || currentPlayer?.isReady}
                  className={`relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                    isTaken
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'ring-2 ring-white scale-105'
                      : 'hover:scale-105 cursor-pointer'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs font-bold text-white">{color.name}</span>
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

        {/* Actions */}
        <div className="flex gap-4">
          {!currentPlayer?.isReady ? (
            <button
              onClick={setReady}
              disabled={!currentPlayer?.colorId}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                currentPlayer?.colorId
                  ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/30'
                  : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
              }`}
            >
              Hazıram
            </button>
          ) : isHost ? (
            <button
              onClick={startGame}
              disabled={!canStart}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                canStart
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
              }`}
            >
              {canStart ? '▶ Oyunu Başlat' : `Gözləyin (${gameState.players.filter(p => p.isReady).length}/${gameState.players.length} hazır)`}
            </button>
          ) : (
            <div className="flex-1 py-4 rounded-xl font-bold text-lg bg-[#3d3654] text-gray-400 text-center">
              Host-un oyunu başlatmasını gözləyin...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PROPERTY DETAIL MODAL
// =============================================================================

interface PropertyModalProps {
  property: any;
  owner: any;
  canBuild: boolean;
  canSell: boolean;
  canMortgage: boolean;
  onClose: () => void;
  onBuildHouse: () => void;
  onSellHouse: () => void;
  onMortgage: () => void;
  onUnmortgage: () => void;
}

function PropertyModal({ 
  property, 
  owner, 
  canBuild, 
  canSell, 
  canMortgage, 
  onClose, 
  onBuildHouse, 
  onSellHouse,
  onMortgage,
  onUnmortgage
}: PropertyModalProps) {
  const boardData = BOARD_DATA[property.id];
  const groupColor = boardData?.group ? GROUP_COLORS[boardData.group] : '#666';
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#252035] rounded-2xl p-6 w-full max-w-sm border border-[#3d3654]"
        onClick={e => e.stopPropagation()}
      >
        {/* Property Header */}
        <div 
          className="h-16 rounded-t-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: groupColor }}
        >
          <span className="text-2xl mr-2">{boardData?.flag || '🏠'}</span>
          <h2 className="text-xl font-bold text-white">{property.name}</h2>
        </div>
        
        {/* Property Info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-300">
            <span>Qiymət:</span>
            <span className="text-white font-bold">${property.price}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Girov dəyəri:</span>
            <span className="text-white">${property.mortgageValue}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Ev qiyməti:</span>
            <span className="text-white">${property.houseCost}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Hazırki evlər:</span>
            <span className="text-yellow-400">
              {property.houses === 5 ? '🏨 Hotel' : property.houses > 0 ? '🏠'.repeat(property.houses) : 'Yoxdur'}
            </span>
          </div>
          {owner && (
            <div className="flex justify-between items-center text-gray-300">
              <span>Sahib:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: owner.color }}
                />
                <span className="text-white">{owner.name}</span>
              </div>
            </div>
          )}
          {property.isMortgaged && (
            <div className="text-center py-2 bg-red-500/20 rounded-lg text-red-400">
              ⚠️ Bu mülk girovdadır
            </div>
          )}
        </div>
        
        {/* Rent Table */}
        <div className="bg-[#1a1625] rounded-lg p-3 mb-6">
          <h3 className="text-gray-400 text-sm mb-2">Kira cədvəli</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-300">Əsas kira:</div>
            <div className="text-white text-right">${property.rent?.[0] || 0}</div>
            <div className="text-gray-300">1 ev ilə:</div>
            <div className="text-white text-right">${property.rent?.[1] || 0}</div>
            <div className="text-gray-300">2 ev ilə:</div>
            <div className="text-white text-right">${property.rent?.[2] || 0}</div>
            <div className="text-gray-300">3 ev ilə:</div>
            <div className="text-white text-right">${property.rent?.[3] || 0}</div>
            <div className="text-gray-300">4 ev ilə:</div>
            <div className="text-white text-right">${property.rent?.[4] || 0}</div>
            <div className="text-gray-300">Hotel ilə:</div>
            <div className="text-white text-right">${property.rent?.[5] || 0}</div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          {canBuild && !property.isMortgaged && (
            <button
              onClick={onBuildHouse}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold"
            >
              🏠 Ev tik (${property.houseCost})
            </button>
          )}
          {canSell && (
            <button
              onClick={onSellHouse}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold"
            >
              💰 Ev sat (+${property.houseCost / 2})
            </button>
          )}
          {canMortgage && !property.isMortgaged && property.houses === 0 && (
            <button
              onClick={onMortgage}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold"
            >
              📜 Girov qoy (+${property.mortgageValue})
            </button>
          )}
          {property.isMortgaged && (
            <button
              onClick={onUnmortgage}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              🔓 Girovdan çıxar (-${Math.ceil(property.mortgageValue * 1.1)})
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-[#3d3654] hover:bg-[#4d4670] text-white py-3 rounded-xl font-medium"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// AUCTION MODAL
// =============================================================================

interface AuctionModalProps {
  auction: any;
  property: any;
  players: any[];
  currentPlayerId: string | null;
  timeLeft: number;
  onBid: (amount: number) => void;
  onPass: () => void;
}

function AuctionModal({ auction, property, players, currentPlayerId, timeLeft, onBid, onPass }: AuctionModalProps) {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const boardData = BOARD_DATA[property?.id];
  const groupColor = boardData?.group ? GROUP_COLORS[boardData.group] : '#666';
  const currentBidder = players.find(p => p.id === auction.currentBidderId);
  const isParticipant = auction.participants.includes(currentPlayerId);
  
  const quickBids = [10, 25, 50, 100];
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#252035] rounded-2xl p-6 w-full max-w-md border border-[#3d3654]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#8b5cf6] mb-2">🔨 HƏRRAC</h2>
          <div 
            className="inline-block px-6 py-3 rounded-xl"
            style={{ backgroundColor: groupColor }}
          >
            <span className="text-xl mr-2">{boardData?.flag || '🏠'}</span>
            <span className="text-lg font-bold text-white">{property?.name}</span>
          </div>
        </div>
        
        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </div>
          <div className="w-full bg-[#1a1625] rounded-full h-2 mt-2">
            <div 
              className="bg-[#8b5cf6] h-2 rounded-full transition-all"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Current Bid */}
        <div className="bg-[#1a1625] rounded-xl p-4 mb-6 text-center">
          <div className="text-gray-400 text-sm mb-1">Hazırki təklif</div>
          <div className="text-3xl font-bold text-green-400">${auction.currentBid}</div>
          {currentBidder && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: currentBidder.color }}
              />
              <span className="text-white">{currentBidder.name}</span>
            </div>
          )}
        </div>
        
        {/* Bid Controls */}
        {isParticipant && (
          <>
            <div className="flex gap-2 mb-4">
              {quickBids.map(add => (
                <button
                  key={add}
                  onClick={() => setBidAmount(auction.currentBid + add)}
                  className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-white py-2 rounded-lg text-sm"
                >
                  +${add}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(Math.max(auction.currentBid + 1, parseInt(e.target.value) || 0))}
                className="flex-1 bg-[#1a1625] text-white text-center text-xl font-bold px-4 py-3 rounded-xl"
                min={auction.currentBid + 1}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onPass}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-bold"
              >
                ❌ Çıx
              </button>
              <button
                onClick={() => onBid(bidAmount)}
                disabled={bidAmount <= auction.currentBid}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                💰 Təklif ver
              </button>
            </div>
          </>
        )}
        
        {!isParticipant && (
          <div className="text-center text-gray-400 py-4">
            Hərracdan çıxmısınız
          </div>
        )}
        
        {/* Participants */}
        <div className="mt-4 pt-4 border-t border-[#3d3654]">
          <div className="text-gray-400 text-sm mb-2">İştirakçılar ({auction.participants.length})</div>
          <div className="flex gap-2 flex-wrap">
            {players.filter(p => auction.participants.includes(p.id)).map(p => (
              <div 
                key={p.id}
                className="flex items-center gap-1 bg-[#1a1625] px-2 py-1 rounded-lg"
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-white text-sm">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// GAME SCREEN - RICHUP.IO STYLE
// =============================================================================

function GameScreen() {
  const {
    gameState,
    playerId,
    currentPlayer,
    isMyTurn,
    lastDiceRoll,
    roomCode,
    rollDice,
    buyProperty,
    declineProperty,
    endTurn,
    payJailFine,
    useJailCard,
    chatMessages,
    sendMessage,
    getPropertyOwner,
    declareBankruptcy,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    placeBid,
    passAuction,
    canBuildHouse,
    hasMonopoly,
    socket,
  } = useSocket();

  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(60);
  const [auctionTimeLeft, setAuctionTimeLeft] = useState(30);
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [animatedDice, setAnimatedDice] = useState<[number, number]>([1, 1]);

  // Listen for auction ticks
  useEffect(() => {
    if (!socket) return;
    
    const handleAuctionTick = (data: { timeRemaining: number; currentBid: number; currentBidderId: string | null }) => {
      setAuctionTimeLeft(data.timeRemaining);
    };
    
    const handleTurnStarted = (data: { playerId: string; timeLimit: number }) => {
      setTurnTimeLeft(data.timeLimit);
    };
    
    socket.on('auction:tick', handleAuctionTick);
    socket.on('turn:started', handleTurnStarted);
    
    return () => {
      socket.off('auction:tick', handleAuctionTick);
      socket.off('turn:started', handleTurnStarted);
    };
  }, [socket]);
  
  // Turn countdown timer
  useEffect(() => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    if (gameState.auction) return; // Don't count down during auction
    
    const timer = setInterval(() => {
      setTurnTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState?.currentPlayerId, gameState?.gamePhase, gameState?.auction]);

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const landedProperty = gameState.properties[currentPlayer?.position || 0];
  const myProperties = gameState.properties.filter(p => p.ownerId === playerId);

  const roomLink = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleRollDice = () => {
    setDiceAnimating(true);
    // Animate dice for 1 second
    const animationInterval = setInterval(() => {
      setAnimatedDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(animationInterval);
      setDiceAnimating(false);
      rollDice();
    }, 1000);
  };

  // Dice face rendering
  const renderDiceFace = (value: number) => {
    const dots: Record<number, string[]> = {
      1: ['center'],
      2: ['top-right', 'bottom-left'],
      3: ['top-right', 'center', 'bottom-left'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const positions: Record<string, string> = {
      'top-left': 'top-2 left-2',
      'top-right': 'top-2 right-2',
      'middle-left': 'top-1/2 -translate-y-1/2 left-2',
      'middle-right': 'top-1/2 -translate-y-1/2 right-2',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'bottom-left': 'bottom-2 left-2',
      'bottom-right': 'bottom-2 right-2',
    };

    return (
      <div className={`w-20 h-20 bg-white rounded-xl relative shadow-lg ${diceAnimating ? 'animate-bounce' : ''}`}>
        {dots[value]?.map((pos, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-[#1a1625] rounded-full ${positions[pos]}`}
          />
        ))}
      </div>
    );
  };

  // Game ended
  if (gameState.gamePhase === 'ended' && gameState.winner) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="text-center bg-[#252035] p-12 rounded-2xl border border-[#3d3654]">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-bold text-[#8b5cf6] mb-4">QALİB!</h1>
          <div
            className="w-32 h-32 rounded-2xl mx-auto mb-6 border-4 border-white shadow-xl flex items-center justify-center text-5xl"
            style={{ backgroundColor: gameState.winner.color }}
          >
            {gameState.winner.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{gameState.winner.name}</h2>
          <p className="text-2xl text-green-400 mb-8">${gameState.winner.money.toLocaleString()}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-bold text-xl"
          >
            Yenidən Oyna
          </button>
        </div>
      </div>
    );
  }

  const displayDice = diceAnimating ? animatedDice : (lastDiceRoll || [1, 1]);

  return (
    <div className="min-h-screen bg-[#1a1625] text-white flex">
      {/* ==================== LEFT PANEL ==================== */}
      <div className="w-72 bg-[#1e1a2e] flex flex-col border-r border-[#2d2640]">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <h1 className="text-xl font-bold">
            <span className="text-white">MONO</span>
            <span className="text-[#8b5cf6]">POLY</span>
            <span className="text-gray-500">.AZ</span>
          </h1>
          <div className="flex items-center gap-2 ml-auto">
            <button className="text-gray-400 hover:text-white">❓</button>
            <button className="text-gray-400 hover:text-white">🔊</button>
            <button className="text-gray-400 hover:text-white">🔍</button>
          </div>
        </div>

        {/* Share Game */}
        <div className="px-4 pb-4">
          <div className="bg-[#252035] rounded-xl p-3 border border-[#3d3654]">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <span>ℹ️</span>
              <span>Share this game</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a1625] rounded-lg px-3 py-2 text-xs text-gray-400 truncate font-mono">
                {roomLink}
              </div>
              <button
                onClick={copyLink}
                className="bg-[#3d3654] hover:bg-[#4d4670] px-3 py-2 rounded-lg text-sm transition-all"
              >
                {copied ? '✓' : '📋'} Copy
              </button>
            </div>
          </div>
        </div>

        {/* View Room Settings */}
        <div className="px-4 pb-4">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            ⚙️ View room settings
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-600 text-sm">advertisement</span>
        </div>

        {/* Chat Section */}
        <div className="border-t border-[#2d2640]">
          <div className="flex items-center gap-2 p-3 text-gray-400">
            <button className="hover:text-white">🔊</button>
            <button className="hover:text-white">⚙️</button>
            <span className="font-medium text-white ml-2">Chat</span>
          </div>
          
          {/* Chat Messages */}
          <div className="h-40 overflow-auto px-3 space-y-1">
            {chatMessages.slice(-15).map((msg, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: msg.playerColor || '#8b5cf6' }}
                >
                  {msg.playerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-gray-400">{msg.playerName}</span>
                  <p className="text-gray-300">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Typing Indicator */}
          <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-1">
            <span className="animate-pulse">●</span>
            <span>...</span>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2d2640]">
            <div className="flex items-center gap-2 bg-[#252035] rounded-lg px-3 py-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                maxLength={200}
              />
              <button type="submit" className="text-gray-400 hover:text-white">
                ➤
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ==================== CENTER - GAME BOARD ==================== */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Game Board */}
        <GameBoardRichup 
          gameState={gameState} 
          playerId={playerId}
          currentPlayer={currentPlayer}
        />

        {/* Dice and Roll Button - Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Turn Timer */}
          {currentTurnPlayer && (
            <div className="mb-4 flex items-center gap-3 bg-[#252035] px-4 py-2 rounded-xl border border-[#3d3654] pointer-events-auto">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: currentTurnPlayer.color }}
              />
              <span className="text-white font-medium">{currentTurnPlayer.name}</span>
              <div className={`ml-2 px-3 py-1 rounded-lg text-sm font-bold ${turnTimeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-[#8b5cf6]'}`}>
                ⏱️ {turnTimeLeft}s
              </div>
            </div>
          )}
          
          {/* Dice Display */}
          <div className="flex items-center gap-6 mb-6 pointer-events-auto">
            {renderDiceFace(displayDice[0])}
            {renderDiceFace(displayDice[1])}
          </div>

          {/* Roll Button */}
          {isMyTurn && gameState.turnPhase === 'roll' && !currentPlayer?.inJail && (
            <button
              onClick={handleRollDice}
              disabled={diceAnimating}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#8b5cf6]/40 flex items-center gap-3 pointer-events-auto disabled:opacity-50"
            >
              <span className="text-2xl">🎲</span>
              Roll the dice
            </button>
          )}

          {/* Jail Options */}
          {isMyTurn && gameState.turnPhase === 'jail-decision' && currentPlayer?.inJail && (
            <div className="flex gap-3 pointer-events-auto">
              <button
                onClick={handleRollDice}
                disabled={diceAnimating}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-bold"
              >
                🎲 Cüt üçün at
              </button>
              <button
                onClick={payJailFine}
                disabled={(currentPlayer?.money || 0) < 50}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
              >
                💰 $50 ödə
              </button>
              {(currentPlayer?.jailFreeCards || 0) > 0 && (
                <button
                  onClick={useJailCard}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  🃏 Kart
                </button>
              )}
            </div>
          )}

          {/* Buy Property */}
          {isMyTurn && gameState.turnPhase === 'action' && landedProperty && !landedProperty.ownerId && landedProperty.type !== 'special' && (
            <div className="flex gap-3 pointer-events-auto">
              <button
                onClick={buyProperty}
                disabled={(currentPlayer?.money || 0) < landedProperty.price}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
              >
                🏠 Al (${landedProperty.price})
              </button>
              <button
                onClick={declineProperty}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                ❌ Keç
              </button>
            </div>
          )}

          {/* End Turn */}
          {isMyTurn && gameState.turnPhase === 'end' && (
            <button
              onClick={endTurn}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg pointer-events-auto"
            >
              ✓ Növbəni bitir
            </button>
          )}

          {/* Game Log - Bottom */}
          <div className="absolute bottom-4 text-center text-sm text-gray-400">
            <p>Game started with a randomized players order. Good luck!</p>
            {currentTurnPlayer && (
              <p className="text-[#8b5cf6]">● {currentTurnPlayer.name} is playing</p>
            )}
          </div>
        </div>
      </div>

      {/* ==================== RIGHT PANEL ==================== */}
      <div className="w-80 bg-[#1e1a2e] border-l border-[#2d2640] flex flex-col">
        {/* Passing by indicator */}
        <div className="p-4 border-b border-[#2d2640] text-center">
          <span className="text-gray-500 text-sm">Passing by</span>
        </div>

        {/* Players List */}
        <div className="p-4 space-y-2 border-b border-[#2d2640]">
          {gameState.players.map(player => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                player.id === gameState.currentPlayerId ? 'bg-[#8b5cf6]/10' : ''
              } ${player.isBankrupt ? 'opacity-50' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">
                    {player.name}
                  </span>
                  {player.isHost && <span className="text-yellow-400 text-xs">👑</span>}
                  {player.inJail && <span className="text-gray-400 text-xs">🔒</span>}
                </div>
              </div>
              <span className={`text-sm font-bold ${player.money < 0 ? 'text-red-400' : 'text-white'}`}>
                ${player.money.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-2 border-b border-[#2d2640]">
          <button className="flex-1 bg-[#252035] hover:bg-[#3d3654] text-gray-400 py-2 px-4 rounded-lg text-sm transition-all">
            👥 Votekick
          </button>
          <button 
            onClick={declareBankruptcy}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg text-sm flex items-center gap-1 transition-all"
          >
            ▶ Bankrupt
          </button>
        </div>

        {/* Trades Section */}
        <div className="p-4 border-b border-[#2d2640]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Trades</span>
            <button
              onClick={() => setShowTradeModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              ➕ Create
            </button>
          </div>
        </div>

        {/* My Properties */}
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="text-gray-400 text-sm mb-3">My properties ({myProperties.length})</h3>
          <div className="space-y-2">
            {myProperties.map(prop => {
              const boardData = BOARD_DATA[prop.id];
              const groupColor = boardData?.group ? GROUP_COLORS[boardData.group] : '#666';
              
              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className="bg-[#252035] rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-[#302548] transition-colors"
                >
                  <div
                    className="w-8 h-10 rounded flex items-center justify-center text-lg"
                    style={{ backgroundColor: groupColor }}
                  >
                    {boardData?.flag || '🏠'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{prop.name}</p>
                    <p className="text-gray-500 text-xs">${prop.price}</p>
                  </div>
                  {prop.houses > 0 && (
                    <span className="text-yellow-400 text-xs">
                      {prop.houses === 5 ? '🏨' : '🏠'.repeat(prop.houses)}
                    </span>
                  )}
                  {prop.isMortgaged && (
                    <span className="text-red-400 text-xs">⚠️</span>
                  )}
                </div>
              );
            })}
            {myProperties.length === 0 && (
              <p className="text-gray-600 text-center py-8 text-sm">No properties yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Auction Modal */}
      {gameState.auction && (
        <AuctionModal
          auction={gameState.auction}
          property={gameState.properties.find((p: any) => p.id === gameState.auction?.propertyId)}
          players={gameState.players}
          currentPlayerId={playerId}
          timeLeft={auctionTimeLeft}
          onBid={placeBid}
          onPass={passAuction}
        />
      )}

      {/* Property Modal */}
      {selectedProperty && (() => {
        const propOwner = gameState.players.find((p: any) => p.id === selectedProperty.ownerId);
        const canSell = selectedProperty.houses > 0;
        const canMort = !selectedProperty.isMortgaged && selectedProperty.houses === 0;
        return (
          <PropertyModal
            property={selectedProperty}
            owner={propOwner}
            canBuild={canBuildHouse(selectedProperty.id)}
            canSell={canSell}
            canMortgage={canMort}
            onClose={() => setSelectedProperty(null)}
            onBuildHouse={() => buildHouse(selectedProperty.id)}
            onSellHouse={() => sellHouse(selectedProperty.id)}
            onMortgage={() => mortgageProperty(selectedProperty.id)}
            onUnmortgage={() => unmortgageProperty(selectedProperty.id)}
          />
        );
      })()}
    </div>
  );
}

// =============================================================================
// GAME BOARD COMPONENT - RICHUP STYLE
// =============================================================================

interface GameBoardRichupProps {
  gameState: any;
  playerId: string | null;
  currentPlayer: any;
}

function GameBoardRichup({ gameState, playerId, currentPlayer }: GameBoardRichupProps) {
  const getPlayersOnPosition = (position: number) => {
    return gameState.players.filter((p: any) => p.position === position && !p.isBankrupt);
  };

  // Board dimensions
  const boardSize = 600;
  const cornerSize = 60;
  const cellCount = 9;
  const cellWidth = (boardSize - 2 * cornerSize) / cellCount;
  const cellHeight = cornerSize;

  const renderCell = (posId: number, style: React.CSSProperties, isVertical = false, isFlipped = false) => {
    const data = BOARD_DATA[posId];
    if (!data) return null;

    const property = gameState.properties.find((p: any) => p.id === posId);
    const players = getPlayersOnPosition(posId);
    const isCurrentPosition = currentPlayer?.position === posId;
    const groupColor = data.group ? GROUP_COLORS[data.group] : null;
    const owner = property?.ownerId ? gameState.players.find((p: any) => p.id === property.ownerId) : null;

    // Corner cells
    if (data.type === 'corner') {
      return (
        <div
          key={posId}
          className={`absolute flex flex-col items-center justify-center ${isCurrentPosition ? 'ring-2 ring-[#8b5cf6]' : ''}`}
          style={{
            ...style,
            background: posId === 0 
              ? 'linear-gradient(135deg, #2d5a3d 0%, #1a3d2a 100%)' 
              : 'linear-gradient(135deg, #252035 0%, #1a1625 100%)',
            borderRadius: 4,
          }}
        >
          {posId === 0 && <span className="text-2xl">🐦</span>}
          {posId === 10 && <span className="text-2xl">⛓️</span>}
          {posId === 20 && <span className="text-2xl">🏖️</span>}
          {posId === 30 && <span className="text-2xl">👮</span>}
          <span className="text-[8px] text-gray-400 mt-1">{data.name}</span>
          
          {players.length > 0 && (
            <div className="absolute bottom-1 flex gap-0.5">
              {players.slice(0, 4).map((p: any) => (
                <div key={p.id} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: p.color }} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular cells
    const content = (
      <div className="w-full h-full flex flex-col" style={isVertical ? { transform: isFlipped ? 'rotate(-90deg)' : 'rotate(90deg)' } : (isFlipped ? { flexDirection: 'column-reverse' } : {})}>
        {/* Color bar with houses */}
        {groupColor && (
          <div className="w-full h-2 flex-shrink-0 relative flex items-center justify-center" style={{ background: groupColor }}>
            {/* Houses indicator */}
            {property?.houses > 0 && property.houses < 5 && (
              <div className="flex gap-0.5">
                {Array.from({ length: property.houses }).map((_, i) => (
                  <span key={i} className="text-[6px]">🏠</span>
                ))}
              </div>
            )}
            {property?.houses === 5 && <span className="text-[8px]">🏨</span>}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-0.5">
          {data.flag && <span className="text-sm">{data.flag}</span>}
          {data.type === 'railroad' && <span className="text-sm">✈️</span>}
          {data.type === 'utility' && data.name.includes('Electric') && <span className="text-sm">⚡</span>}
          {data.type === 'utility' && data.name.includes('Water') && <span className="text-sm">💧</span>}
          {data.type === 'chest' && <span className="text-sm">📦</span>}
          {data.type === 'chance' && <span className="text-sm">❓</span>}
          {data.type === 'tax' && <span className="text-sm">💵</span>}
          
          <span className="text-[7px] text-gray-300 text-center leading-tight truncate w-full">{data.name}</span>
          {data.price && <span className="text-[8px] text-gray-400">{data.price}$</span>}
        </div>
      </div>
    );

    return (
      <div
        key={posId}
        className={`absolute overflow-hidden ${isCurrentPosition ? 'ring-2 ring-[#8b5cf6] z-10' : ''}`}
        style={{
          ...style,
          background: 'linear-gradient(180deg, #252035 0%, #1a1625 100%)',
          borderRadius: 3,
        }}
      >
        {content}
        
        {/* Owner indicator */}
        {owner && (
          <div
            className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white"
            style={{ backgroundColor: owner.color }}
          />
        )}
        
        {/* Players */}
        {players.length > 0 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
            {players.slice(0, 3).map((p: any) => (
              <div key={p.id} className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: p.color }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative rounded-xl"
      style={{
        width: boardSize,
        height: boardSize,
        background: '#0f0c18',
        border: '2px solid #2d2640',
      }}
    >
      {/* Corners */}
      {renderCell(0, { top: 0, left: 0, width: cornerSize, height: cornerSize })}
      {renderCell(10, { top: 0, right: 0, width: cornerSize, height: cornerSize })}
      {renderCell(20, { bottom: 0, right: 0, width: cornerSize, height: cornerSize })}
      {renderCell(30, { bottom: 0, left: 0, width: cornerSize, height: cornerSize })}

      {/* Top row (1-9) */}
      {Array.from({ length: 9 }, (_, i) => renderCell(i + 1, {
        top: 0,
        left: cornerSize + (i * cellWidth),
        width: cellWidth - 1,
        height: cellHeight,
      }))}

      {/* Right column (11-19) */}
      {Array.from({ length: 9 }, (_, i) => renderCell(i + 11, {
        top: cornerSize + (i * cellWidth),
        right: 0,
        width: cornerSize,
        height: cellWidth - 1,
      }, true, true))}

      {/* Bottom row (21-29) */}
      {Array.from({ length: 9 }, (_, i) => renderCell(21 + i, {
        bottom: 0,
        right: cornerSize + (i * cellWidth),
        width: cellWidth - 1,
        height: cellHeight,
      }, false, true))}

      {/* Left column (31-39) */}
      {Array.from({ length: 9 }, (_, i) => renderCell(31 + i, {
        bottom: cornerSize + (i * cellWidth),
        left: 0,
        width: cornerSize,
        height: cellWidth - 1,
      }, true, false))}
    </div>
  );
}

// =============================================================================
// MAIN MULTIPLAYER PAGE
// =============================================================================

export default function MultiplayerGame() {
  const { isInRoom, gameState } = useSocket();

  // Show lobby if not in room
  if (!isInRoom) {
    return <MultiplayerLobby />;
  }

  // Show color selection
  if (gameState?.gamePhase === 'lobby' || gameState?.gamePhase === 'color-select') {
    return <ColorSelection />;
  }

  // Show game
  return <GameScreen />;
}
