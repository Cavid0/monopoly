'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Player } from '@/types/game';

interface PlayerPanelProps {
  showAddPlayer?: boolean;
  onPropertyClick?: (id: number) => void;
}

export default function PlayerPanel({ showAddPlayer = false, onPropertyClick }: PlayerPanelProps) {
  const { state, currentPlayer, dispatch } = useGame();

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getPlayerProperties = (player: Player) => {
    return state.properties.filter(p => p.ownerId === player.id);
  };

  return (
    <div className="space-y-2">
      {state.players.map((player, index) => {
        const isActive = player.id === currentPlayer?.id;
        const properties = getPlayerProperties(player);
        
        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              player.isBankrupt
                ? 'opacity-50'
                : isActive
                  ? 'bg-[#3d3654]'
                  : 'hover:bg-[#1a1625]'
            }`}
          >
            {/* Player Avatar with color indicator */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#252035]" />
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium truncate text-sm">
                  {player.name}
                </span>
                {player.isHost && (
                  <span className="text-yellow-400 text-xs">👑</span>
                )}
                {player.inJail && (
                  <span className="text-xs text-gray-400">In Prison</span>
                )}
              </div>
              {player.isBankrupt && (
                <span className="text-xs text-red-400">BANKRUPT</span>
              )}
            </div>

            {/* Money */}
            <div className={`text-sm font-bold ${player.money < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatMoney(player.money)}
            </div>

            {/* Active indicator */}
            {isActive && !player.isBankrupt && (
              <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse" />
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {state.players.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No players yet</p>
        </div>
      )}
    </div>
  );
}
