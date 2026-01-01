'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';

interface TradeModalProps {
  onClose: () => void;
}

export default function TradeModal({ onClose }: TradeModalProps) {
  const { state, currentPlayer, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [offerMoney, setOfferMoney] = useState(0);
  const [requestMoney, setRequestMoney] = useState(0);
  const [offerProperties, setOfferProperties] = useState<number[]>([]);
  const [requestProperties, setRequestProperties] = useState<number[]>([]);

  if (!currentPlayer) return null;

  const otherPlayers = state.players.filter(p => p.id !== currentPlayer.id && !p.isBankrupt);
  const targetPlayer = otherPlayers.find(p => p.id === selectedPlayer);

  const myProperties = state.properties.filter(p => p.ownerId === currentPlayer.id);
  const theirProperties = targetPlayer 
    ? state.properties.filter(p => p.ownerId === targetPlayer.id)
    : [];

  const toggleOfferProperty = (id: number) => {
    setOfferProperties(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleRequestProperty = (id: number) => {
    setRequestProperties(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleTrade = () => {
    if (!targetPlayer) return;

    // Transfer money
    if (offerMoney > 0) {
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: -offerMoney } });
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: targetPlayer.id, amount: offerMoney } });
    }
    if (requestMoney > 0) {
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: targetPlayer.id, amount: -requestMoney } });
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: requestMoney } });
    }

    // Transfer properties (simplified - in real game would need more state updates)
    // For now just close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#252035] rounded-2xl w-[800px] max-h-[90vh] overflow-hidden shadow-2xl border border-[#3d3654]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3d3654] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#8b5cf6]">🔄 Trade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Select Player */}
          {!selectedPlayer ? (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Select a player to trade with:</h3>
              <div className="grid grid-cols-2 gap-3">
                {otherPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className="bg-[#1a1625] hover:bg-[#8b5cf6] p-4 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-xl font-bold"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold">{player.name}</p>
                      <p className="text-green-400 text-sm">${player.money.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Your Offer */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: currentPlayer.color }}
                  />
                  <span className="text-white font-bold">You offer:</span>
                </div>

                {/* Money */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm">Money:</label>
                  <input
                    type="number"
                    value={offerMoney}
                    onChange={(e) => setOfferMoney(Math.max(0, Math.min(currentPlayer.money, Number(e.target.value))))}
                    className="w-full bg-[#1a1625] text-white px-4 py-2 rounded-lg mt-1 border border-[#3d3654] focus:border-[#8b5cf6] focus:outline-none"
                    max={currentPlayer.money}
                  />
                </div>

                {/* Properties */}
                <div>
                  <label className="text-gray-400 text-sm">Properties:</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {myProperties.map(prop => (
                      <button
                        key={prop.id}
                        onClick={() => toggleOfferProperty(prop.id)}
                        className={`p-2 rounded-lg text-xs text-left transition-colors ${
                          offerProperties.includes(prop.id)
                            ? 'bg-[#8b5cf6] text-white'
                            : 'bg-[#1a1625] text-gray-300 hover:bg-[#3d3654]'
                        }`}
                      >
                        <div 
                          className="w-full h-2 rounded mb-1"
                          style={{ backgroundColor: prop.color }}
                        />
                        {prop.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Their Offer */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: targetPlayer?.color }}
                  />
                  <span className="text-white font-bold">You request:</span>
                </div>

                {/* Money */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm">Money:</label>
                  <input
                    type="number"
                    value={requestMoney}
                    onChange={(e) => setRequestMoney(Math.max(0, Math.min(targetPlayer?.money || 0, Number(e.target.value))))}
                    className="w-full bg-[#1a1625] text-white px-4 py-2 rounded-lg mt-1 border border-[#3d3654] focus:border-[#8b5cf6] focus:outline-none"
                    max={targetPlayer?.money}
                  />
                </div>

                {/* Properties */}
                <div>
                  <label className="text-gray-400 text-sm">Properties:</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {theirProperties.map(prop => (
                      <button
                        key={prop.id}
                        onClick={() => toggleRequestProperty(prop.id)}
                        className={`p-2 rounded-lg text-xs text-left transition-colors ${
                          requestProperties.includes(prop.id)
                            ? 'bg-[#8b5cf6] text-white'
                            : 'bg-[#1a1625] text-gray-300 hover:bg-[#3d3654]'
                        }`}
                      >
                        <div 
                          className="w-full h-2 rounded mb-1"
                          style={{ backgroundColor: prop.color }}
                        />
                        {prop.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedPlayer && (
          <div className="bg-[#3d3654] px-6 py-4 flex justify-between">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="bg-[#1a1625] hover:bg-[#252035] text-white px-6 py-2 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleTrade}
              className="btn-primary text-white px-8 py-2 rounded-lg font-bold"
            >
              Propose Trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
