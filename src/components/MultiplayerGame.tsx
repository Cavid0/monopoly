'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { PLAYER_COLORS } from '@/types/socket';

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
          <span className="text-white">RICH</span>
          <span className="text-[#8b5cf6]">UP</span>
          <span className="text-gray-400">.IO</span>
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
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
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
// GAME SCREEN
// =============================================================================

function GameScreen() {
  const {
    gameState,
    playerId,
    currentPlayer,
    isMyTurn,
    lastDiceRoll,
    rollDice,
    buyProperty,
    declineProperty,
    endTurn,
    payJailFine,
    useJailCard,
    chatMessages,
    sendMessage,
    getPropertyOwner,
  } = useSocket();

  const [chatInput, setChatInput] = useState('');

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const landedProperty = gameState.properties[currentPlayer?.position || 0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput.trim());
      setChatInput('');
    }
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

  return (
    <div className="min-h-screen bg-[#1a1625] text-white flex">
      {/* Left Panel - Game Info */}
      <div className="w-80 bg-[#252035] border-r border-[#3d3654] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#3d3654]">
          <h1 className="text-xl font-bold">
            <span className="text-white">RICH</span>
            <span className="text-[#8b5cf6]">UP</span>
            <span className="text-gray-400">.IO</span>
          </h1>
          <p className="text-xs text-gray-500">Otaq: {gameState.roomCode}</p>
        </div>

        {/* Turn Indicator */}
        <div className="p-4 border-b border-[#3d3654]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: currentTurnPlayer?.color || '#666' }}
            >
              {currentTurnPlayer?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">
                {currentTurnPlayer?.name}{currentTurnPlayer?.id === playerId ? ' (Siz)' : ''}
              </p>
              <p className="text-xs text-gray-400">
                {isMyTurn ? 'Sizin növbəniz!' : 'Gözləyin...'}
              </p>
            </div>
          </div>
        </div>

        {/* Dice Display */}
        {lastDiceRoll && (
          <div className="p-4 border-b border-[#3d3654] text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-[#1a1625]">
                {lastDiceRoll[0]}
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-[#1a1625]">
                {lastDiceRoll[1]}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Cəmi: {lastDiceRoll[0] + lastDiceRoll[1]}
              {lastDiceRoll[0] === lastDiceRoll[1] && <span className="text-yellow-400"> (CÜT!)</span>}
            </p>
          </div>
        )}

        {/* Players List */}
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="text-gray-400 text-sm mb-3">Oyunçular</h3>
          <div className="space-y-2">
            {gameState.players.map(player => (
              <div
                key={player.id}
                className={`p-3 rounded-xl ${
                  player.isBankrupt
                    ? 'bg-red-500/10 opacity-50'
                    : player.id === gameState.currentPlayerId
                    ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/50'
                    : 'bg-[#1a1625]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{player.name}</p>
                    <p className="text-green-400 text-xs">${player.money.toLocaleString()}</p>
                  </div>
                  {player.inJail && <span className="text-lg">🔒</span>}
                  {player.isBankrupt && <span className="text-lg">💀</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="h-48 border-t border-[#3d3654] flex flex-col">
          <div className="flex-1 p-2 overflow-auto">
            {chatMessages.slice(-10).map((msg, i) => (
              <div key={i} className="text-xs mb-1">
                <span className="text-[#8b5cf6] font-medium">{msg.playerName}:</span>{' '}
                <span className="text-gray-300">{msg.message}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t border-[#3d3654]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Mesaj yazın..."
              className="w-full bg-[#1a1625] text-white text-sm px-3 py-2 rounded-lg focus:outline-none"
              maxLength={200}
            />
          </form>
        </div>
      </div>

      {/* Center - Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Current Position Info */}
        <div className="bg-[#252035] rounded-xl p-6 mb-8 border border-[#3d3654] text-center">
          <p className="text-gray-400 mb-2">Mövqe: {currentPlayer?.position}</p>
          <h2 className="text-2xl font-bold text-white mb-2">{landedProperty?.name}</h2>
          {landedProperty?.type !== 'special' && (
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-400">Qiyməti: ${landedProperty?.price}</span>
              {landedProperty?.ownerId && (
                <span className="text-[#8b5cf6]">
                  Sahibi: {getPropertyOwner(landedProperty.id)?.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isMyTurn && (
          <div className="flex gap-4 flex-wrap justify-center">
            {gameState.turnPhase === 'roll' && !currentPlayer?.inJail && (
              <button
                onClick={rollDice}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#8b5cf6]/30"
              >
                🎲 Zər at
              </button>
            )}

            {gameState.turnPhase === 'jail-decision' && currentPlayer?.inJail && (
              <>
                <button
                  onClick={rollDice}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-bold"
                >
                  🎲 Cüt üçün zər at
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
                    🃏 Kart istifadə et
                  </button>
                )}
              </>
            )}

            {gameState.turnPhase === 'action' && landedProperty && !landedProperty.ownerId && (
              <>
                <button
                  onClick={buyProperty}
                  disabled={(currentPlayer?.money || 0) < landedProperty.price}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50"
                >
                  🏠 Al (${landedProperty.price})
                </button>
                <button
                  onClick={declineProperty}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg"
                >
                  ❌ Keç (Hərrac)
                </button>
              </>
            )}

            {gameState.turnPhase === 'end' && (
              <button
                onClick={endTurn}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg"
              >
                ✓ Növbəni bitir
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-[#252035] border-l border-[#3d3654] p-4 overflow-auto">
        <h3 className="text-white font-semibold mb-4">Mülkləriniz</h3>
        <div className="space-y-2">
          {gameState.properties
            .filter(p => p.ownerId === playerId)
            .map(prop => (
              <div
                key={prop.id}
                className="bg-[#1a1625] rounded-lg p-3"
              >
                <div
                  className="h-2 rounded-t mb-2"
                  style={{ backgroundColor: prop.color }}
                />
                <p className="text-white text-sm font-medium truncate">{prop.name}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">${prop.price}</span>
                  <span className="text-yellow-400">
                    {prop.houses === 5 ? '🏨' : '🏠'.repeat(prop.houses)}
                  </span>
                </div>
                {prop.isMortgaged && (
                  <span className="text-xs text-red-400">Girovda</span>
                )}
              </div>
            ))}
          {gameState.properties.filter(p => p.ownerId === playerId).length === 0 && (
            <p className="text-gray-500 text-center py-8">Hələ mülkünüz yoxdur</p>
          )}
        </div>
      </div>
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
