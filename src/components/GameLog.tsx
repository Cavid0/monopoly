'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';

interface LogEntry {
  id: number;
  type: 'roll' | 'move' | 'buy' | 'rent' | 'card' | 'jail' | 'system';
  message: string;
  playerColor?: string;
  timestamp: Date;
}

export default function GameLog() {
  const { state } = useGame();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Detect dice roll
    if (state.lastRoll !== prevState.lastRoll && state.lastRoll > 0) {
      const player = state.players.find(p => p.id === state.currentPlayerId);
      if (player) {
        addLog('roll', `${player.name} rolled ${state.dice[0]} + ${state.dice[1]} = ${state.lastRoll}`, player.color);
      }
    }

    // Detect property purchase
    state.properties.forEach(prop => {
      const prevProp = prevState.properties.find(p => p.id === prop.id);
      if (prop.ownerId && !prevProp?.ownerId) {
        const player = state.players.find(p => p.id === prop.ownerId);
        if (player) {
          addLog('buy', `${player.name} bought ${prop.name} for $${prop.price}`, player.color);
        }
      }
    });

    // Detect money changes (rent)
    state.players.forEach(player => {
      const prevPlayer = prevState.players.find(p => p.id === player.id);
      if (prevPlayer && player.money < prevPlayer.money) {
        const diff = prevPlayer.money - player.money;
        if (diff > 0 && diff !== 200 && diff !== 100) { // Not tax
          addLog('rent', `${player.name} paid $${diff}`, player.color);
        }
      }
    });

    // Detect jail
    state.players.forEach(player => {
      const prevPlayer = prevState.players.find(p => p.id === player.id);
      if (player.inJail && !prevPlayer?.inJail) {
        addLog('jail', `${player.name} went to jail! 🔒`, player.color);
      }
      if (!player.inJail && prevPlayer?.inJail) {
        addLog('jail', `${player.name} got out of jail! 🔓`, player.color);
      }
    });

    prevStateRef.current = state;
  }, [state]);

  const addLog = (type: LogEntry['type'], message: string, playerColor?: string) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      playerColor,
      timestamp: new Date()
    }].slice(-50)); // Keep last 50 logs
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'roll': return '🎲';
      case 'move': return '👣';
      case 'buy': return '🏠';
      case 'rent': return '💰';
      case 'card': return '🃏';
      case 'jail': return '🔒';
      default: return '📢';
    }
  };

  return (
    <div className="text-center py-2">
      {logs.length === 0 ? (
        <div className="text-gray-500 text-sm">
          <p>Game started with a randomized players order. Good luck!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.slice(-3).map(log => (
            <div 
              key={log.id} 
              className="flex items-center justify-center gap-2 text-sm text-gray-400"
            >
              <span className="flex-shrink-0 text-base">{getIcon(log.type)}</span>
              <span 
                className="font-medium"
                style={{ color: log.playerColor || '#9ca3af' }}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
