'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Property } from '@/types/game';
import { BOARD_POSITIONS } from '@/types/game';
import { CHANCE_CARDS, COMMUNITY_CARDS } from '@/data/properties';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionModal({ isOpen, onClose }: ActionModalProps) {
  const { state, currentPlayer, dispatch, buyProperty, calculateRent, getPropertyOwner, endTurn } = useGame();
  const [actionType, setActionType] = useState<'property' | 'chance' | 'community' | 'tax' | 'jail' | 'rent' | 'inJail' | null>(null);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [cardText, setCardText] = useState('');
  const [rentAmount, setRentAmount] = useState(0);
  const [rentOwner, setRentOwner] = useState<string>('');

  useEffect(() => {
    if (currentPlayer && isOpen) {
      // Show jail options before rolling
      if (currentPlayer.inJail && state.turnPhase === 'roll') {
        setActionType('inJail');
        return;
      }
      
      if (state.turnPhase === 'action') {
        handlePositionAction();
      }
    }
  }, [currentPlayer?.position, state.turnPhase, isOpen, currentPlayer?.inJail]);

  const handlePositionAction = () => {
    if (!currentPlayer) return;

    const position = currentPlayer.position;
    const boardPos = BOARD_POSITIONS.find(p => p.id === position);
    const property = state.properties.find(p => p.id === position);

    // GO
    if (position === 0) {
      setActionType(null);
      dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
      return;
    }

    // Go to Jail
    if (position === 30) {
      dispatch({ type: 'SEND_TO_JAIL', payload: currentPlayer.id });
      setActionType('jail');
      return;
    }

    // Just Visiting Jail
    if (position === 10) {
      setActionType(null);
      dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
      return;
    }

    // Free Parking
    if (position === 20) {
      setActionType(null);
      dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
      return;
    }

    // Income Tax
    if (position === 4) {
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: -200 } });
      setActionType('tax');
      setCardText('Income Tax: Pay $200');
      return;
    }

    // Luxury Tax
    if (position === 38) {
      dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: -100 } });
      setActionType('tax');
      setCardText('Luxury Tax: Pay $100');
      return;
    }

    // Chance
    if (position === 7 || position === 22 || position === 36) {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      setCardText(card.text);
      setActionType('chance');
      handleCardAction(card);
      return;
    }

    // Community Chest
    if (position === 2 || position === 17 || position === 33) {
      const card = COMMUNITY_CARDS[Math.floor(Math.random() * COMMUNITY_CARDS.length)];
      setCardText(card.text);
      setActionType('community');
      handleCardAction(card);
      return;
    }

    // Property
    if (property) {
      const owner = getPropertyOwner(property.id);
      
      if (!owner) {
        // Unowned property
        setCurrentProperty(property);
        setActionType('property');
      } else if (owner.id === currentPlayer.id) {
        // Own property
        setActionType(null);
        dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
      } else {
        // Pay rent
        const rent = calculateRent(property);
        setRentAmount(rent);
        setRentOwner(owner.name);
        setActionType('rent');
        dispatch({
          type: 'PAY_RENT',
          payload: { fromId: currentPlayer.id, toId: owner.id, amount: rent }
        });
      }
    }
  };

  const handleCardAction = (card: typeof CHANCE_CARDS[0]) => {
    if (!currentPlayer) return;

    switch (card.action) {
      case 'money':
        dispatch({
          type: 'UPDATE_MONEY',
          payload: { playerId: currentPlayer.id, amount: card.value || 0 }
        });
        break;
      case 'move':
        if (card.position !== undefined) {
          dispatch({
            type: 'MOVE_PLAYER',
            payload: { playerId: currentPlayer.id, position: card.position }
          });
        } else if (card.value) {
          const newPos = (currentPlayer.position + card.value + 40) % 40;
          dispatch({
            type: 'MOVE_PLAYER',
            payload: { playerId: currentPlayer.id, position: newPos }
          });
        }
        break;
      case 'jail':
        dispatch({ type: 'SEND_TO_JAIL', payload: currentPlayer.id });
        break;
      case 'jailFree':
        // Add jail free card
        break;
      case 'payAll':
        state.players.forEach(p => {
          if (p.id !== currentPlayer.id && !p.isBankrupt) {
            dispatch({
              type: 'PAY_RENT',
              payload: { fromId: currentPlayer.id, toId: p.id, amount: card.value || 0 }
            });
          }
        });
        break;
      case 'collectAll':
        state.players.forEach(p => {
          if (p.id !== currentPlayer.id && !p.isBankrupt) {
            dispatch({
              type: 'PAY_RENT',
              payload: { fromId: p.id, toId: currentPlayer.id, amount: card.value || 0 }
            });
          }
        });
        break;
    }
  };

  const handleBuyProperty = () => {
    if (currentProperty && currentPlayer && currentPlayer.money >= currentProperty.price) {
      buyProperty(currentProperty.id);
      setActionType(null);
      dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
    }
  };

  const handleSkip = () => {
    setActionType(null);
    dispatch({ type: 'SET_TURN_PHASE', payload: 'end' });
  };

  const handleEndTurn = () => {
    endTurn();
    setActionType(null);
    setCurrentProperty(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Property Modal */}
      {actionType === 'property' && currentProperty && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252035] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[#3d3654]">
            <div
              className="h-8 rounded-t-lg -mt-6 -mx-6 mb-4"
              style={{ backgroundColor: currentProperty.color }}
            />
            <h2 className="text-2xl font-bold text-white mb-2">{currentProperty.name}</h2>
            <div className="space-y-2 text-gray-400 mb-6">
              <p>Price: <span className="font-bold text-green-400">${currentProperty.price}</span></p>
              <p>Rent: <span className="font-bold text-white">${currentProperty.rent[0]}</span></p>
              {currentProperty.houseCost && (
                <p>House Cost: <span className="font-bold text-white">${currentProperty.houseCost}</span></p>
              )}
              <hr className="border-[#3d3654]" />
              <p>Your Balance: <span className="font-bold text-[#8b5cf6]">${currentPlayer?.money}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBuyProperty}
                disabled={!currentPlayer || currentPlayer.money < currentProperty.price}
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#3d3654] disabled:text-gray-500 text-white py-3 rounded-lg font-bold transition-colors"
              >
                Buy ${currentProperty.price}
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 bg-[#3d3654] hover:bg-[#4d4670] text-white py-3 rounded-lg font-bold transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {(actionType === 'chance' || actionType === 'community') && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border ${
            actionType === 'chance' 
              ? 'bg-[#252035] border-orange-500' 
              : 'bg-[#252035] border-blue-500'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              actionType === 'chance' ? 'text-orange-400' : 'text-blue-400'
            }`}>
              {actionType === 'chance' ? '❓ Surprise' : '📦 Treasure'}
            </h2>
            <p className="text-white text-lg mb-6">{cardText}</p>
            <button
              onClick={handleSkip}
              className="w-full btn-primary text-white py-3 rounded-lg font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Tax Modal */}
      {actionType === 'tax' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252035] border border-red-500 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">💰 Tax</h2>
            <p className="text-white text-lg mb-6">{cardText}</p>
            <button
              onClick={handleSkip}
              className="w-full btn-primary text-white py-3 rounded-lg font-bold"
            >
              Pay
            </button>
          </div>
        </div>
      )}

      {/* Rent Modal */}
      {actionType === 'rent' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252035] border border-yellow-500 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">🏠 Rent Due</h2>
            <p className="text-white text-lg mb-6">
              You paid <span className="font-bold text-red-400">${rentAmount}</span> rent to {rentOwner}
            </p>
            <button
              onClick={handleSkip}
              className="w-full btn-primary text-white py-3 rounded-lg font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* In Jail Modal - Options before rolling */}
      {actionType === 'inJail' && currentPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252035] border border-[#3d3654] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-300 mb-2">⛓️ You're in Prison</h2>
            <p className="text-gray-400 mb-4">
              Turn {currentPlayer.jailTurns + 1} of 3. Choose how to get out:
            </p>
            
            <div className="space-y-3">
              {/* Roll doubles option */}
              <button
                onClick={() => {
                  setActionType(null);
                  // DiceRoller will handle jail logic
                }}
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                🎲 Roll for Doubles
                <span className="text-xs opacity-70">(free if doubles)</span>
              </button>
              
              {/* Pay $50 option */}
              <button
                onClick={() => {
                  if (currentPlayer.money >= 50) {
                    dispatch({ type: 'PAY_JAIL_FINE', payload: currentPlayer.id });
                    setActionType(null);
                  }
                }}
                disabled={currentPlayer.money < 50}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-[#3d3654] disabled:text-gray-500 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                💵 Pay $50 Fine
                {currentPlayer.money < 50 && <span className="text-xs">(not enough money)</span>}
              </button>
              
              {/* Use Get Out of Jail Free card */}
              {currentPlayer.jailFreeCards > 0 && (
                <button
                  onClick={() => {
                    dispatch({ type: 'USE_JAIL_CARD', payload: currentPlayer.id });
                    setActionType(null);
                  }}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  🎫 Use Get Out of Jail Free Card
                  <span className="text-xs">({currentPlayer.jailFreeCards} remaining)</span>
                </button>
              )}
            </div>
            
            <p className="text-gray-500 text-sm text-center mt-4">
              {currentPlayer.jailTurns >= 2 
                ? "⚠️ This is your last turn - you must pay if you don't roll doubles!"
                : `${2 - currentPlayer.jailTurns} more turn(s) to roll doubles`}
            </p>
          </div>
        </div>
      )}

      {/* Jail Modal */}
      {actionType === 'jail' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252035] border border-[#3d3654] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">⛓️ Go to Prison!</h2>
            <p className="text-gray-400 text-lg mb-6">
              You have been sent to prison. You can pay $50 or roll doubles to get out.
            </p>
            <button
              onClick={handleSkip}
              className="w-full btn-primary text-white py-3 rounded-lg font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* End Turn Button */}
      {state.turnPhase === 'end' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleEndTurn}
            className="btn-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
          >
            End Turn →
          </button>
        </div>
      )}
    </>
  );
}
