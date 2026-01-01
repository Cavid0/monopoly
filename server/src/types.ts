// =============================================================================
// MONOPOLY GAME TYPES - SHARED BETWEEN SERVER AND CLIENT
// =============================================================================

// Player colors available for selection
export const PLAYER_COLORS = [
  { id: 'red', hex: '#ef4444', name: 'Red' },
  { id: 'blue', hex: '#3b82f6', name: 'Blue' },
  { id: 'green', hex: '#22c55e', name: 'Green' },
  { id: 'yellow', hex: '#f59e0b', name: 'Yellow' },
  { id: 'purple', hex: '#8b5cf6', name: 'Purple' },
  { id: 'pink', hex: '#ec4899', name: 'Pink' },
  { id: 'cyan', hex: '#06b6d4', name: 'Cyan' },
  { id: 'orange', hex: '#f97316', name: 'Orange' },
] as const;

export type ColorId = typeof PLAYER_COLORS[number]['id'];

// =============================================================================
// PLAYER TYPES
// =============================================================================

export interface Player {
  id: string;                    // Unique socket ID
  name: string;                  // Display name
  colorId: ColorId | null;       // Selected color
  color: string;                 // Hex color value
  money: number;                 // Current balance
  position: number;              // Board position (0-39)
  properties: number[];          // Owned property IDs
  inJail: boolean;               // Currently in jail
  jailTurns: number;             // Turns spent in jail
  jailFreeCards: number;         // Get out of jail free cards
  isBankrupt: boolean;           // Eliminated from game
  isConnected: boolean;          // Currently connected
  isReady: boolean;              // Ready to start game
  isHost: boolean;               // Room host
}

// =============================================================================
// PROPERTY TYPES
// =============================================================================

export type PropertyType = 'property' | 'railroad' | 'utility' | 'special';

export interface Property {
  id: number;
  name: string;
  price: number;
  rent: number[];                // Rent at different house levels
  mortgageValue: number;         // Half of price
  color: string;                 // Property group color
  colorGroup: string;            // Color group ID for set checking
  type: PropertyType;
  houseCost: number;             // Cost to build one house
  houses: number;                // 0-4 houses, 5 = hotel
  ownerId: string | null;        // Player ID who owns this
  isMortgaged: boolean;          // Currently mortgaged
}

// =============================================================================
// CARD TYPES
// =============================================================================

export type CardAction = 
  | 'collect'           // Collect money from bank
  | 'pay'               // Pay money to bank
  | 'payAll'            // Pay each player
  | 'collectAll'        // Collect from each player
  | 'move'              // Move to specific position
  | 'moveBack'          // Move backward
  | 'moveNearest'       // Move to nearest railroad/utility
  | 'jail'              // Go to jail
  | 'jailFree'          // Get out of jail free card
  | 'repairs'           // Pay per house/hotel
  | 'birthday';         // Collect from all players

export interface Card {
  id: number;
  type: 'chance' | 'community';
  text: string;
  action: CardAction;
  value?: number;                // Money amount
  position?: number;             // Target position
  perHouse?: number;             // Cost per house
  perHotel?: number;             // Cost per hotel
}

// =============================================================================
// AUCTION TYPES
// =============================================================================

export interface Auction {
  propertyId: number;
  currentBid: number;
  currentBidderId: string | null;
  participants: string[];        // Player IDs still in auction
  timeRemaining: number;         // Seconds until auction ends
  isActive: boolean;
}

// =============================================================================
// TRADE TYPES
// =============================================================================

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offerMoney: number;
  offerProperties: number[];
  offerJailCards: number;
  requestMoney: number;
  requestProperties: number[];
  requestJailCards: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: number;
}

// =============================================================================
// GAME STATE TYPES
// =============================================================================

export type GamePhase = 
  | 'lobby'              // Waiting for players
  | 'color-select'       // Players selecting colors
  | 'playing'            // Game in progress
  | 'auction'            // Auction in progress
  | 'trade'              // Trade in progress
  | 'ended';             // Game over

export type TurnPhase = 
  | 'waiting'            // Waiting for turn
  | 'roll'               // Must roll dice
  | 'moving'             // Animation playing
  | 'action'             // Property action (buy/auction)
  | 'card'               // Drawing card
  | 'jail-decision'      // Choosing how to leave jail
  | 'end';               // Can end turn (or roll again if doubles)

export interface GameSettings {
  maxPlayers: number;
  startingMoney: number;
  turnTimeLimit: number;         // Seconds per turn, 0 = unlimited
  freeParking: boolean;          // Collect fines on Free Parking
  doubleOnGo: boolean;           // $400 for landing exactly on GO
  auctionEnabled: boolean;       // Auction when declining property
  evenBuildRule: boolean;        // Must build evenly across color set
  mortgageInterest: number;      // 10% default
}

export interface GameState {
  roomId: string;
  roomCode: string;              // Human-readable room code
  players: Player[];
  properties: Property[];
  currentPlayerId: string;
  gamePhase: GamePhase;
  turnPhase: TurnPhase;
  settings: GameSettings;
  
  // Dice state
  dice: [number, number];
  lastRoll: number;
  doublesCount: number;
  
  // Card decks
  chanceCards: number[];         // Shuffled card IDs
  communityCards: number[];
  chanceIndex: number;
  communityIndex: number;
  
  // Active auction
  auction: Auction | null;
  
  // Active trades
  trades: TradeOffer[];
  
  // Free parking pot (if enabled)
  freeParkingPot: number;
  
  // Game over
  winner: Player | null;
  
  // Timestamps
  turnStartTime: number;
  gameStartTime: number;
}

// =============================================================================
// ROOM TYPES
// =============================================================================

export interface Room {
  id: string;
  code: string;                  // 6-character invite code
  hostId: string;
  state: GameState;
  createdAt: number;
  isPrivate: boolean;
  isMatchmaking: boolean;        // Auto-matched room
}

// =============================================================================
// MATCHMAKING TYPES
// =============================================================================

export interface MatchmakingQueue {
  playerId: string;
  playerName: string;
  joinedAt: number;
  rating?: number;               // For future skill-based matching
}

// =============================================================================
// SOCKET EVENT TYPES
// =============================================================================

// Client -> Server Events
export interface ClientToServerEvents {
  // Room management
  'room:create': (data: { playerName: string; isPrivate: boolean }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  
  // Matchmaking
  'matchmaking:join': (data: { playerName: string }) => void;
  'matchmaking:leave': () => void;
  
  // Pre-game
  'player:selectColor': (data: { colorId: ColorId }) => void;
  'player:ready': () => void;
  'game:start': () => void;
  
  // Game actions
  'game:rollDice': () => void;
  'game:buyProperty': () => void;
  'game:declineProperty': () => void;
  'game:endTurn': () => void;
  
  // Jail actions
  'jail:payFine': () => void;
  'jail:useCard': () => void;
  'jail:rollDice': () => void;
  
  // Auction actions
  'auction:bid': (data: { amount: number }) => void;
  'auction:pass': () => void;
  
  // Trade actions
  'trade:propose': (data: Omit<TradeOffer, 'id' | 'status' | 'createdAt'>) => void;
  'trade:accept': (data: { tradeId: string }) => void;
  'trade:reject': (data: { tradeId: string }) => void;
  'trade:cancel': (data: { tradeId: string }) => void;
  
  // Building actions
  'property:buildHouse': (data: { propertyId: number }) => void;
  'property:sellHouse': (data: { propertyId: number }) => void;
  'property:mortgage': (data: { propertyId: number }) => void;
  'property:unmortgage': (data: { propertyId: number }) => void;
  
  // Chat
  'chat:message': (data: { message: string }) => void;
}

// Server -> Client Events
export interface ServerToClientEvents {
  // Connection
  'connection:established': (data: { playerId: string }) => void;
  'connection:error': (data: { message: string }) => void;
  
  // Room events
  'room:created': (data: { roomCode: string; roomId: string }) => void;
  'room:joined': (data: { state: GameState }) => void;
  'room:left': () => void;
  'room:playerJoined': (data: { player: Player }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
  'room:playerReconnected': (data: { playerId: string }) => void;
  
  // Matchmaking
  'matchmaking:searching': (data: { queuePosition: number }) => void;
  'matchmaking:found': (data: { roomCode: string }) => void;
  'matchmaking:cancelled': () => void;
  
  // Game state sync
  'game:stateUpdate': (data: { state: GameState }) => void;
  'game:started': (data: { state: GameState }) => void;
  'game:ended': (data: { winner: Player }) => void;
  
  // Turn events
  'turn:started': (data: { playerId: string; timeLimit: number }) => void;
  'turn:diceRolled': (data: { playerId: string; dice: [number, number]; isDoubles: boolean }) => void;
  'turn:playerMoved': (data: { playerId: string; from: number; to: number; passedGo: boolean }) => void;
  'turn:ended': (data: { playerId: string; nextPlayerId: string }) => void;
  
  // Property events
  'property:bought': (data: { playerId: string; propertyId: number }) => void;
  'property:rentPaid': (data: { fromId: string; toId: string; amount: number; propertyId: number }) => void;
  'property:houseBuilt': (data: { propertyId: number; houses: number }) => void;
  'property:houseSold': (data: { propertyId: number; houses: number }) => void;
  'property:mortgaged': (data: { propertyId: number }) => void;
  'property:unmortgaged': (data: { propertyId: number }) => void;
  
  // Card events
  'card:drawn': (data: { playerId: string; card: Card }) => void;
  
  // Jail events
  'jail:playerSent': (data: { playerId: string }) => void;
  'jail:playerReleased': (data: { playerId: string; method: 'roll' | 'pay' | 'card' }) => void;
  
  // Auction events
  'auction:started': (data: { auction: Auction; property: Property }) => void;
  'auction:bid': (data: { playerId: string; amount: number }) => void;
  'auction:playerPassed': (data: { playerId: string }) => void;
  'auction:ended': (data: { winnerId: string | null; propertyId: number; amount: number }) => void;
  'auction:tick': (data: { timeRemaining: number; currentBid: number; currentBidderId: string | null }) => void;
  
  // Turn timeout
  'turn:timeout': (data: { playerId: string }) => void;
  
  // Trade events
  'trade:proposed': (data: { trade: TradeOffer }) => void;
  'trade:accepted': (data: { tradeId: string }) => void;
  'trade:rejected': (data: { tradeId: string }) => void;
  'trade:cancelled': (data: { tradeId: string }) => void;
  'trade:executed': (data: { trade: TradeOffer }) => void;
  
  // Player events
  'player:colorSelected': (data: { playerId: string; colorId: ColorId }) => void;
  'player:ready': (data: { playerId: string; isReady: boolean }) => void;
  'player:moneyChanged': (data: { playerId: string; amount: number; newBalance: number }) => void;
  'player:bankrupt': (data: { playerId: string }) => void;
  
  // Chat
  'chat:message': (data: { playerId: string; playerName: string; message: string; timestamp: number }) => void;
  
  // Errors
  'error': (data: { code: string; message: string }) => void;
}

// =============================================================================
// ERROR CODES
// =============================================================================

export const ErrorCodes = {
  // Room errors
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  ROOM_ALREADY_STARTED: 'ROOM_ALREADY_STARTED',
  ALREADY_IN_ROOM: 'ALREADY_IN_ROOM',
  
  // Player errors
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  INVALID_ACTION: 'INVALID_ACTION',
  COLOR_TAKEN: 'COLOR_TAKEN',
  NOT_HOST: 'NOT_HOST',
  
  // Property errors
  CANNOT_BUY: 'CANNOT_BUY',
  NOT_OWNER: 'NOT_OWNER',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CANNOT_BUILD: 'CANNOT_BUILD',
  CANNOT_MORTGAGE: 'CANNOT_MORTGAGE',
  
  // Trade errors
  INVALID_TRADE: 'INVALID_TRADE',
  TRADE_NOT_FOUND: 'TRADE_NOT_FOUND',
  
  // Auction errors
  INVALID_BID: 'INVALID_BID',
  NOT_IN_AUCTION: 'NOT_IN_AUCTION',
} as const;
