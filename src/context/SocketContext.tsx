'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  GameState,
  Player,
  Property,
  Card,
  Auction,
  TradeOffer,
  ColorId,
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socket';

// =============================================================================
// SOCKET CONTEXT TYPE
// =============================================================================

interface SocketContextType {
  // Connection state
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  playerId: string | null;
  error: string | null;
  
  // Game state
  gameState: GameState | null;
  currentPlayer: Player | null;
  isMyTurn: boolean;
  
  // Room state
  roomCode: string | null;
  isInRoom: boolean;
  isHost: boolean;
  
  // Matchmaking
  isSearching: boolean;
  queuePosition: number;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // UI state
  lastDiceRoll: [number, number] | null;
  lastCard: Card | null;
  
  // Room actions
  createRoom: (playerName: string, isPrivate?: boolean) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  
  // Matchmaking actions
  joinMatchmaking: (playerName: string) => void;
  leaveMatchmaking: () => void;
  
  // Pre-game actions
  selectColor: (colorId: ColorId) => void;
  setReady: () => void;
  startGame: () => void;
  
  // Game actions
  rollDice: () => void;
  buyProperty: () => void;
  declineProperty: () => void;
  endTurn: () => void;
  
  // Jail actions
  payJailFine: () => void;
  useJailCard: () => void;
  
  // Auction actions
  placeBid: (amount: number) => void;
  passAuction: () => void;
  
  // Trade actions
  proposeTrade: (trade: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'fromPlayerId'>) => void;
  acceptTrade: (tradeId: string) => void;
  rejectTrade: (tradeId: string) => void;
  cancelTrade: (tradeId: string) => void;
  
  // Building actions
  buildHouse: (propertyId: number) => void;
  sellHouse: (propertyId: number) => void;
  mortgageProperty: (propertyId: number) => void;
  unmortgageProperty: (propertyId: number) => void;
  
  // Chat
  sendMessage: (message: string) => void;
  
  // Utility
  getPropertyOwner: (propertyId: number) => Player | undefined;
  canBuildHouse: (propertyId: number) => boolean;
  hasMonopoly: (colorGroup: string) => boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

// =============================================================================
// SOCKET PROVIDER
// =============================================================================

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  // Connection state
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Room state
  const [roomCode, setRoomCode] = useState<string | null>(null);
  
  // Matchmaking
  const [isSearching, setIsSearching] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // UI state
  const [lastDiceRoll, setLastDiceRoll] = useState<[number, number] | null>(null);
  const [lastCard, setLastCard] = useState<Card | null>(null);

  // ===========================================================================
  // SOCKET CONNECTION
  // ===========================================================================

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Could not connect to server');
    });

    newSocket.on('connection:established', ({ playerId }) => {
      console.log('🎮 Player ID:', playerId);
      setPlayerId(playerId);
    });

    // Room events
    newSocket.on('room:created', ({ roomCode }) => {
      setRoomCode(roomCode);
    });

    newSocket.on('room:joined', ({ state }) => {
      setGameState(state);
      setRoomCode(state.roomCode);
      setChatMessages([]);
    });

    newSocket.on('room:left', () => {
      setGameState(null);
      setRoomCode(null);
      setChatMessages([]);
    });

    newSocket.on('room:playerJoined', ({ player }) => {
      console.log('👤 Player joined:', player.name);
    });

    newSocket.on('room:playerLeft', ({ playerId }) => {
      console.log('👤 Player left:', playerId);
    });

    // Matchmaking events
    newSocket.on('matchmaking:searching', ({ queuePosition }) => {
      setIsSearching(true);
      setQueuePosition(queuePosition);
    });

    newSocket.on('matchmaking:found', ({ roomCode }) => {
      setIsSearching(false);
      setRoomCode(roomCode);
    });

    newSocket.on('matchmaking:cancelled', () => {
      setIsSearching(false);
      setQueuePosition(0);
    });

    // Game state updates
    newSocket.on('game:stateUpdate', ({ state }) => {
      setGameState(state);
    });

    newSocket.on('game:started', ({ state }) => {
      setGameState(state);
      console.log('🎲 Game started!');
    });

    newSocket.on('game:ended', ({ winner }) => {
      console.log('🏆 Game ended! Winner:', winner.name);
    });

    // Turn events
    newSocket.on('turn:diceRolled', ({ dice, isDoubles }) => {
      setLastDiceRoll(dice);
      console.log(`🎲 Dice: ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}${isDoubles ? ' (DOUBLES!)' : ''}`);
    });

    newSocket.on('turn:playerMoved', ({ playerId, from, to, passedGo }) => {
      console.log(`📍 Player moved: ${from} -> ${to}${passedGo ? ' (Passed GO!)' : ''}`);
    });

    // Card events
    newSocket.on('card:drawn', ({ card }) => {
      setLastCard(card);
      console.log(`🃏 Card drawn: ${card.text}`);
    });

    // Property events
    newSocket.on('property:bought', ({ playerId, propertyId }) => {
      console.log(`🏠 Property ${propertyId} bought by ${playerId}`);
    });

    // Auction events
    newSocket.on('auction:started', ({ auction, property }) => {
      console.log(`🔨 Auction started for ${property.name}`);
    });

    newSocket.on('auction:ended', ({ winnerId, propertyId, amount }) => {
      console.log(`🔨 Auction ended: ${winnerId} won for $${amount}`);
    });

    // Trade events
    newSocket.on('trade:proposed', ({ trade }) => {
      console.log('📦 Trade proposed');
    });

    newSocket.on('trade:executed', ({ trade }) => {
      console.log('📦 Trade executed');
    });

    // Chat
    newSocket.on('chat:message', (message) => {
      setChatMessages(prev => [...prev.slice(-99), message]);
    });

    // Errors
    newSocket.on('error', ({ code, message }) => {
      console.error(`Error [${code}]:`, message);
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================

  const currentPlayer = gameState?.players.find(p => p.id === playerId) || null;
  const isMyTurn = gameState?.currentPlayerId === playerId;
  const isInRoom = !!gameState;
  const isHost = currentPlayer?.isHost || false;

  // ===========================================================================
  // ROOM ACTIONS
  // ===========================================================================

  const createRoom = useCallback((playerName: string, isPrivate = false) => {
    socket?.emit('room:create', { playerName, isPrivate });
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socket?.emit('room:join', { roomCode: roomCode.toUpperCase(), playerName });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket?.emit('room:leave');
  }, [socket]);

  // ===========================================================================
  // MATCHMAKING ACTIONS
  // ===========================================================================

  const joinMatchmaking = useCallback((playerName: string) => {
    socket?.emit('matchmaking:join', { playerName });
  }, [socket]);

  const leaveMatchmaking = useCallback(() => {
    socket?.emit('matchmaking:leave');
  }, [socket]);

  // ===========================================================================
  // PRE-GAME ACTIONS
  // ===========================================================================

  const selectColor = useCallback((colorId: ColorId) => {
    socket?.emit('player:selectColor', { colorId });
  }, [socket]);

  const setReady = useCallback(() => {
    socket?.emit('player:ready');
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('game:start');
  }, [socket]);

  // ===========================================================================
  // GAME ACTIONS
  // ===========================================================================

  const rollDice = useCallback(() => {
    socket?.emit('game:rollDice');
  }, [socket]);

  const buyProperty = useCallback(() => {
    socket?.emit('game:buyProperty');
  }, [socket]);

  const declineProperty = useCallback(() => {
    socket?.emit('game:declineProperty');
  }, [socket]);

  const endTurn = useCallback(() => {
    socket?.emit('game:endTurn');
  }, [socket]);

  // ===========================================================================
  // JAIL ACTIONS
  // ===========================================================================

  const payJailFine = useCallback(() => {
    socket?.emit('jail:payFine');
  }, [socket]);

  const useJailCard = useCallback(() => {
    socket?.emit('jail:useCard');
  }, [socket]);

  // ===========================================================================
  // AUCTION ACTIONS
  // ===========================================================================

  const placeBid = useCallback((amount: number) => {
    socket?.emit('auction:bid', { amount });
  }, [socket]);

  const passAuction = useCallback(() => {
    socket?.emit('auction:pass');
  }, [socket]);

  // ===========================================================================
  // TRADE ACTIONS
  // ===========================================================================

  const proposeTrade = useCallback((trade: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'fromPlayerId'>) => {
    if (!playerId) return;
    socket?.emit('trade:propose', { ...trade, fromPlayerId: playerId } as any);
  }, [socket, playerId]);

  const acceptTrade = useCallback((tradeId: string) => {
    socket?.emit('trade:accept', { tradeId });
  }, [socket]);

  const rejectTrade = useCallback((tradeId: string) => {
    socket?.emit('trade:reject', { tradeId });
  }, [socket]);

  const cancelTrade = useCallback((tradeId: string) => {
    socket?.emit('trade:cancel', { tradeId });
  }, [socket]);

  // ===========================================================================
  // BUILDING ACTIONS
  // ===========================================================================

  const buildHouse = useCallback((propertyId: number) => {
    socket?.emit('property:buildHouse', { propertyId });
  }, [socket]);

  const sellHouse = useCallback((propertyId: number) => {
    socket?.emit('property:sellHouse', { propertyId });
  }, [socket]);

  const mortgageProperty = useCallback((propertyId: number) => {
    socket?.emit('property:mortgage', { propertyId });
  }, [socket]);

  const unmortgageProperty = useCallback((propertyId: number) => {
    socket?.emit('property:unmortgage', { propertyId });
  }, [socket]);

  // ===========================================================================
  // CHAT
  // ===========================================================================

  const sendMessage = useCallback((message: string) => {
    socket?.emit('chat:message', { message });
  }, [socket]);

  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================

  const getPropertyOwner = useCallback((propertyId: number): Player | undefined => {
    const property = gameState?.properties.find(p => p.id === propertyId);
    if (!property?.ownerId) return undefined;
    return gameState?.players.find(p => p.id === property.ownerId);
  }, [gameState]);

  const canBuildHouse = useCallback((propertyId: number): boolean => {
    if (!playerId || !gameState) return false;
    
    const property = gameState.properties.find(p => p.id === propertyId);
    if (!property || property.ownerId !== playerId) return false;
    if (property.type !== 'property') return false;
    if (property.isMortgaged || property.houses >= 5) return false;
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || player.money < property.houseCost) return false;
    
    // Check monopoly
    const groupProperties = gameState.properties.filter(
      p => p.colorGroup === property.colorGroup && p.type === 'property'
    );
    const ownedInGroup = groupProperties.filter(p => p.ownerId === playerId && !p.isMortgaged);
    if (groupProperties.length !== ownedInGroup.length) return false;
    
    return true;
  }, [playerId, gameState]);

  const hasMonopoly = useCallback((colorGroup: string): boolean => {
    if (!playerId || !gameState) return false;
    
    const groupProperties = gameState.properties.filter(
      p => p.colorGroup === colorGroup && p.type === 'property'
    );
    const ownedInGroup = groupProperties.filter(p => p.ownerId === playerId && !p.isMortgaged);
    return groupProperties.length === ownedInGroup.length;
  }, [playerId, gameState]);

  // ===========================================================================
  // CONTEXT VALUE
  // ===========================================================================

  const value: SocketContextType = {
    socket,
    isConnected,
    playerId,
    error,
    gameState,
    currentPlayer,
    isMyTurn,
    roomCode,
    isInRoom,
    isHost,
    isSearching,
    queuePosition,
    chatMessages,
    lastDiceRoll,
    lastCard,
    createRoom,
    joinRoom,
    leaveRoom,
    joinMatchmaking,
    leaveMatchmaking,
    selectColor,
    setReady,
    startGame,
    rollDice,
    buyProperty,
    declineProperty,
    endTurn,
    payJailFine,
    useJailCard,
    placeBid,
    passAuction,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    sendMessage,
    getPropertyOwner,
    canBuildHouse,
    hasMonopoly,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
