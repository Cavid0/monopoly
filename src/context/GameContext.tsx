'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { GameState, Player, Property, PLAYER_COLORS, RoomSettings } from '@/types/game';
import { PROPERTIES, CHANCE_CARDS, COMMUNITY_CARDS } from '@/data/properties';

const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  roomName: 'My Game Room',
  maxPlayers: 4,
  gameDuration: 0,
  startingMoney: 1500,
  turnTimer: 60,
  isPrivate: false,
  x2RentFullSet: false,
  vacationCash: false,
  auction: false,
  noRentInPrison: false,
  mortgage: true,
  evenBuild: true,
  randomizeOrder: true,
};

type GameAction =
  | { type: 'SET_ROOM'; payload: string }
  | { type: 'ADD_PLAYER'; payload: { name: string; isHost?: boolean } }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'TOGGLE_READY'; payload: string }
  | { type: 'UPDATE_ROOM_SETTINGS'; payload: Partial<RoomSettings> }
  | { type: 'UPDATE_PLAYER_SELECTION'; payload: { playerId: string; characterId?: string | null; colorId?: string | null } }
  | { type: 'SET_GAME_PHASE'; payload: GameState['gamePhase'] }
  | { type: 'PROCEED_TO_CHARACTER_SELECT' }
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_PLAYER'; payload: { playerId: string; position: number } }
  | { type: 'BUY_PROPERTY'; payload: { playerId: string; propertyId: number } }
  | { type: 'PAY_RENT'; payload: { fromId: string; toId: string; amount: number } }
  | { type: 'UPDATE_MONEY'; payload: { playerId: string; amount: number } }
  | { type: 'SEND_TO_JAIL'; payload: string }
  | { type: 'LEAVE_JAIL'; payload: string }
  | { type: 'PAY_JAIL_FINE'; payload: string }
  | { type: 'USE_JAIL_CARD'; payload: string }
  | { type: 'BUILD_HOUSE'; payload: { propertyId: number } }
  | { type: 'MORTGAGE_PROPERTY'; payload: { propertyId: number } }
  | { type: 'UNMORTGAGE_PROPERTY'; payload: { propertyId: number } }
  | { type: 'NEXT_TURN' }
  | { type: 'BANKRUPT_PLAYER'; payload: string }
  | { type: 'END_GAME'; payload: Player }
  | { type: 'SET_TURN_PHASE'; payload: 'roll' | 'action' | 'end' };

const initialState: GameState = {
  roomId: '',
  players: [],
  currentPlayerId: '',
  properties: [...PROPERTIES],
  gamePhase: 'lobby',
  roomSettings: { ...DEFAULT_ROOM_SETTINGS },
  dice: [1, 1],
  lastRoll: 0,
  doublesCount: 0,
  winner: null,
  turnPhase: 'roll',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, roomId: action.payload, gamePhase: 'settings' };

    case 'ADD_PLAYER': {
      if (state.players.length >= state.roomSettings.maxPlayers) return state;
      const newPlayer: Player = {
        id: generateId(),
        name: action.payload.name,
        color: PLAYER_COLORS[state.players.length],
        characterId: null,
        money: state.roomSettings.startingMoney,
        position: 0,
        properties: [],
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        isBankrupt: false,
        isReady: false,
        isHost: action.payload.isHost || false,
      };
      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      };

    case 'TOGGLE_READY':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload ? { ...p, isReady: !p.isReady } : p
        ),
      };

    case 'UPDATE_ROOM_SETTINGS':
      return {
        ...state,
        roomSettings: { ...state.roomSettings, ...action.payload },
      };

    case 'UPDATE_PLAYER_SELECTION':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { 
                ...p, 
                characterId: action.payload.characterId !== undefined ? action.payload.characterId : p.characterId,
                color: action.payload.colorId !== undefined 
                  ? PLAYER_COLORS.find((_, i) => ['red', 'blue', 'green', 'amber', 'violet', 'pink', 'cyan', 'orange'][i] === action.payload.colorId) || p.color
                  : p.color,
              }
            : p
        ),
      };

    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };

    case 'PROCEED_TO_CHARACTER_SELECT':
      return { ...state, gamePhase: 'character-select' };

    case 'START_GAME': {
      let players = [...state.players];
      
      // Randomize order if enabled
      if (state.roomSettings.randomizeOrder) {
        players = players.sort(() => Math.random() - 0.5);
      }
      
      // Apply starting money from settings
      players = players.map(p => ({
        ...p,
        money: state.roomSettings.startingMoney,
        isReady: false, // Reset ready state for game
      }));
      
      return {
        ...state,
        players,
        gamePhase: 'playing',
        currentPlayerId: players[0]?.id || '',
        turnPhase: 'roll',
      };
    }

    case 'ROLL_DICE': {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const isDoubles = die1 === die2;
      const newDoublesCount = isDoubles ? state.doublesCount + 1 : 0;
      
      // 3 doubles in a row = Go to jail (Monopoly rule)
      if (newDoublesCount >= 3) {
        const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
        if (currentPlayer) {
          return {
            ...state,
            dice: [die1, die2],
            lastRoll: die1 + die2,
            doublesCount: 0,
            turnPhase: 'end',
            players: state.players.map(p =>
              p.id === state.currentPlayerId
                ? { ...p, position: 10, inJail: true, jailTurns: 0 }
                : p
            ),
          };
        }
      }
      
      return {
        ...state,
        dice: [die1, die2],
        lastRoll: die1 + die2,
        doublesCount: newDoublesCount,
        turnPhase: 'action',
      };
    }

    case 'MOVE_PLAYER': {
      const currentPos = state.players.find(p => p.id === action.payload.playerId)?.position || 0;
      const newPos = action.payload.position;
      // Passed GO if new position is smaller than current (wrapped around) OR explicitly passing GO
      const passedGo = newPos < currentPos && newPos !== 10; // Don't give $200 if going to jail
      
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? {
                ...p,
                position: newPos,
                money: passedGo ? p.money + 200 : p.money, // Collect $200 for passing GO
              }
            : p
        ),
      };
    }

    case 'BUY_PROPERTY': {
      const property = state.properties.find(p => p.id === action.payload.propertyId);
      if (!property) return state;
      
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? {
                ...p,
                money: p.money - property.price,
                properties: [...p.properties, property.id],
              }
            : p
        ),
        properties: state.properties.map(p =>
          p.id === action.payload.propertyId
            ? { ...p, ownerId: action.payload.playerId }
            : p
        ),
      };
    }

    case 'PAY_RENT':
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id === action.payload.fromId) {
            return { ...p, money: p.money - action.payload.amount };
          }
          if (p.id === action.payload.toId) {
            return { ...p, money: p.money + action.payload.amount };
          }
          return p;
        }),
      };

    case 'UPDATE_MONEY':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, money: p.money + action.payload.amount }
            : p
        ),
      };

    case 'SEND_TO_JAIL':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, position: 10, inJail: true, jailTurns: 0 }
            : p
        ),
        doublesCount: 0,
      };

    case 'LEAVE_JAIL':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, inJail: false, jailTurns: 0 }
            : p
        ),
      };

    case 'PAY_JAIL_FINE':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, inJail: false, jailTurns: 0, money: p.money - 50 }
            : p
        ),
      };

    case 'USE_JAIL_CARD':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, inJail: false, jailTurns: 0, jailFreeCards: p.jailFreeCards - 1 }
            : p
        ),
      };

    case 'BUILD_HOUSE': {
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.propertyId && p.houses < 5
            ? { ...p, houses: p.houses + 1 }
            : p
        ),
      };
    }

    case 'MORTGAGE_PROPERTY': {
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.propertyId
            ? { ...p, isMortgaged: true }
            : p
        ),
      };
    }

    case 'UNMORTGAGE_PROPERTY': {
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.propertyId
            ? { ...p, isMortgaged: false }
            : p
        ),
      };
    }

    case 'NEXT_TURN': {
      const activePlayers = state.players.filter(p => !p.isBankrupt);
      const currentIndex = activePlayers.findIndex(p => p.id === state.currentPlayerId);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      
      return {
        ...state,
        currentPlayerId: activePlayers[nextIndex]?.id || '',
        turnPhase: 'roll',
        doublesCount: 0,
        players: state.players.map(p =>
          p.id === state.currentPlayerId && p.inJail
            ? { ...p, jailTurns: p.jailTurns + 1 }
            : p
        ),
      };
    }

    case 'BANKRUPT_PLAYER':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, isBankrupt: true, money: 0, properties: [] }
            : p
        ),
        properties: state.properties.map(p =>
          p.ownerId === action.payload
            ? { ...p, ownerId: null, houses: 0 }
            : p
        ),
      };

    case 'END_GAME':
      return {
        ...state,
        gamePhase: 'ended',
        winner: action.payload,
      };

    case 'SET_TURN_PHASE':
      return {
        ...state,
        turnPhase: action.payload,
      };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentPlayer: Player | undefined;
  rollDice: () => void;
  buyProperty: (propertyId: number) => void;
  endTurn: () => void;
  getPropertyOwner: (propertyId: number) => Player | undefined;
  calculateRent: (property: Property) => number;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);

  const getPropertyOwner = useCallback((propertyId: number) => {
    const property = state.properties.find(p => p.id === propertyId);
    if (!property?.ownerId) return undefined;
    return state.players.find(p => p.id === property.ownerId);
  }, [state.properties, state.players]);

  const calculateRent = useCallback((property: Property): number => {
    if (!property.ownerId) return 0;
    
    // Mortgaged properties don't collect rent
    if (property.isMortgaged) return 0;
    
    const owner = state.players.find(p => p.id === property.ownerId);
    if (!owner) return 0;
    
    // No rent while in prison (if setting enabled)
    if (state.roomSettings.noRentInPrison && owner.inJail) return 0;

    if (property.type === 'railroad') {
      const railroadsOwned = state.properties.filter(
        p => p.type === 'railroad' && p.ownerId === owner.id && !p.isMortgaged
      ).length;
      return property.rent[railroadsOwned - 1] || 25;
    }

    if (property.type === 'utility') {
      const utilitiesOwned = state.properties.filter(
        p => p.type === 'utility' && p.ownerId === owner.id && !p.isMortgaged
      ).length;
      return state.lastRoll * property.rent[utilitiesOwned - 1];
    }

    // For regular properties
    let rent = property.rent[property.houses] || property.rent[0];
    
    // Double rent for full color set (if setting enabled and no houses)
    if (state.roomSettings.x2RentFullSet && property.houses === 0) {
      const colorProperties = state.properties.filter(p => p.color === property.color && p.type === 'property');
      const ownedColorProperties = colorProperties.filter(p => p.ownerId === owner.id && !p.isMortgaged);
      if (colorProperties.length === ownedColorProperties.length) {
        rent *= 2;
      }
    }
    
    return rent;
  }, [state.properties, state.players, state.lastRoll, state.roomSettings]);

  const rollDice = useCallback(() => {
    dispatch({ type: 'ROLL_DICE' });
  }, []);

  const buyProperty = useCallback((propertyId: number) => {
    if (!currentPlayer) return;
    dispatch({ type: 'BUY_PROPERTY', payload: { playerId: currentPlayer.id, propertyId } });
  }, [currentPlayer]);

  const endTurn = useCallback(() => {
    dispatch({ type: 'NEXT_TURN' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        currentPlayer,
        rollDice,
        buyProperty,
        endTurn,
        getPropertyOwner,
        calculateRent,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
