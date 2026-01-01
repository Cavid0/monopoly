'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';

interface DiceRollerProps {
  disabled?: boolean;
}

// 3D Dice Component
function Dice3D({ value, isRolling, index }: { value: number; isRolling: boolean; index: number }) {
  const dotPositions: Record<number, { x: number; y: number }[]> = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
    3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
    4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
    5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
    6: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  };

  return (
    <div 
      className={`dice-3d w-20 h-20 relative ${isRolling ? 'dice-bounce' : ''}`}
      style={{
        transform: isRolling ? `rotate(${index * 15}deg)` : 'rotate(0deg)',
        transition: isRolling ? 'none' : 'transform 0.3s ease',
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`diceGrad${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#d0d0d0" />
          </linearGradient>
          <filter id={`shadow${index}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="3" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>
        <rect 
          x="5" y="5" 
          width="90" height="90" 
          rx="15" 
          fill={`url(#diceGrad${index})`} 
          filter={`url(#shadow${index})`}
          stroke="#c0c0c0"
          strokeWidth="1"
        />
        {dotPositions[value].map((pos, i) => (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r="10"
            className="dice-dot"
            fill="#1a1625"
          />
        ))}
      </svg>
    </div>
  );
}

export default function DiceRoller({ disabled = false }: DiceRollerProps) {
  const { state, rollDice, currentPlayer, dispatch } = useGame();
  const [isRolling, setIsRolling] = useState(false);
  const [showDice, setShowDice] = useState(true);

  const canRoll = !disabled &&
                  state.gamePhase === 'playing' && 
                  state.turnPhase === 'roll' && 
                  currentPlayer && 
                  !currentPlayer.isBankrupt;

  const handleRoll = async () => {
    if (!canRoll) return;

    setIsRolling(true);
    setShowDice(true);

    // Animate dice
    await new Promise(resolve => setTimeout(resolve, 800));
    
    rollDice();
    setIsRolling(false);
  };

  useEffect(() => {
    if (state.turnPhase === 'action' && currentPlayer) {
      // Check if player is in jail
      if (currentPlayer.inJail) {
        const isDoubles = state.dice[0] === state.dice[1];
        
        if (isDoubles) {
          // Rolled doubles - get out of jail free!
          dispatch({ type: 'LEAVE_JAIL', payload: currentPlayer.id });
          // Move player
          const newPosition = (currentPlayer.position + state.lastRoll) % 40;
          setTimeout(() => {
            dispatch({ 
              type: 'MOVE_PLAYER', 
              payload: { playerId: currentPlayer.id, position: newPosition } 
            });
          }, 500);
        } else if (currentPlayer.jailTurns >= 2) {
          // 3rd turn in jail - must pay $50 and get out
          dispatch({ type: 'PAY_JAIL_FINE', payload: currentPlayer.id });
          // Move player
          const newPosition = (currentPlayer.position + state.lastRoll) % 40;
          setTimeout(() => {
            dispatch({ 
              type: 'MOVE_PLAYER', 
              payload: { playerId: currentPlayer.id, position: newPosition } 
            });
          }, 500);
        }
        // Otherwise, stay in jail (turn ends)
        return;
      }
      
      // Normal movement
      const newPosition = (currentPlayer.position + state.lastRoll) % 40;
      
      setTimeout(() => {
        dispatch({ 
          type: 'MOVE_PLAYER', 
          payload: { playerId: currentPlayer.id, position: newPosition } 
        });
        
        // Check if landed on Go To Jail (position 30)
        if (newPosition === 30) {
          dispatch({ type: 'SEND_TO_JAIL', payload: currentPlayer.id });
        }
      }, 500);
    }
  }, [state.turnPhase, state.lastRoll]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Dice Display */}
      <div className="flex gap-6 items-center justify-center min-h-[100px]">
        {showDice && (
          <>
            <Dice3D value={state.dice[0]} isRolling={isRolling} index={0} />
            <Dice3D value={state.dice[1]} isRolling={isRolling} index={1} />
          </>
        )}
      </div>

      {/* Roll Result */}
      {showDice && !isRolling && state.lastRoll > 0 && (
        <div className="text-center">
          {state.dice[0] === state.dice[1] && (
            <span className="text-green-400 text-sm font-bold animate-pulse block mb-1">
              DOUBLES! 🎲
            </span>
          )}
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll || isRolling || disabled}
        className={`px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-3
          ${canRoll && !isRolling && !disabled
            ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-[#3d3654] text-gray-500 cursor-not-allowed'
          }`}
      >
        {disabled ? (
          '⏳ Waiting for players'
        ) : isRolling ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">🎲</span>
            Rolling...
          </span>
        ) : (
          <>
            🎲 Roll the dice
          </>
        )}
      </button>
    </div>
  );
}
