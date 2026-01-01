// =============================================================================
// SHARED TYPES BETWEEN CLIENT AND SERVER
// =============================================================================

// Player colors available for selection
export const PLAYER_COLORS = [
  { id: 'red', hex: '#ef4444', name: 'Qırmızı' },
  { id: 'blue', hex: '#3b82f6', name: 'Mavi' },
  { id: 'green', hex: '#22c55e', name: 'Yaşıl' },
  { id: 'yellow', hex: '#f59e0b', name: 'Sarı' },
  { id: 'purple', hex: '#8b5cf6', name: 'Bənövşəyi' },
  { id: 'pink', hex: '#ec4899', name: 'Çəhrayı' },
  { id: 'cyan', hex: '#06b6d4', name: 'Göy' },
  { id: 'orange', hex: '#f97316', name: 'Narıncı' },
] as const;

export type ColorId = typeof PLAYER_COLORS[number]['id'];

// =============================================================================
// PLAYER TYPES
// =============================================================================

export interface Player {
  id: string;
  name: string;
  colorId: ColorId | null;
  color: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
  isConnected: boolean;
  isReady: boolean;
  isHost: boolean;
}

// =============================================================================
// PROPERTY TYPES
// =============================================================================

export type PropertyType = 'property' | 'railroad' | 'utility' | 'special';

export interface Property {
  id: number;
  name: string;
  price: number;
  rent: number[];
  mortgageValue: number;
  color: string;
  colorGroup: string;
  type: PropertyType;
  houseCost: number;
  houses: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

// =============================================================================
// CARD TYPES
// =============================================================================

export type CardAction = 
  | 'collect' | 'pay' | 'payAll' | 'collectAll' | 'move' 
  | 'moveBack' | 'moveNearest' | 'jail' | 'jailFree' | 'repairs' | 'birthday';

export interface Card {
  id: number;
  type: 'chance' | 'community';
  text: string;
  action: CardAction;
  value?: number;
  position?: number;
  perHouse?: number;
  perHotel?: number;
}

// =============================================================================
// AUCTION TYPES
// =============================================================================

export interface Auction {
  propertyId: number;
  currentBid: number;
  currentBidderId: string | null;
  participants: string[];
  timeRemaining: number;
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

export type GamePhase = 'lobby' | 'color-select' | 'playing' | 'auction' | 'trade' | 'ended';
export type TurnPhase = 'waiting' | 'roll' | 'moving' | 'action' | 'card' | 'jail-decision' | 'end';

export interface GameSettings {
  maxPlayers: number;
  startingMoney: number;
  turnTimeLimit: number;
  freeParking: boolean;
  doubleOnGo: boolean;
  auctionEnabled: boolean;
  evenBuildRule: boolean;
  mortgageInterest: number;
}

export interface GameState {
  roomId: string;
  roomCode: string;
  players: Player[];
  properties: Property[];
  currentPlayerId: string;
  gamePhase: GamePhase;
  turnPhase: TurnPhase;
  settings: GameSettings;
  dice: [number, number];
  lastRoll: number;
  doublesCount: number;
  chanceCards: number[];
  communityCards: number[];
  chanceIndex: number;
  communityIndex: number;
  auction: Auction | null;
  trades: TradeOffer[];
  freeParkingPot: number;
  winner: Player | null;
  turnStartTime: number;
  gameStartTime: number;
}

// =============================================================================
// SOCKET EVENT TYPES
// =============================================================================

export interface ClientToServerEvents {
  'room:create': (data: { playerName: string; isPrivate: boolean }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  'matchmaking:join': (data: { playerName: string }) => void;
  'matchmaking:leave': () => void;
  'player:selectColor': (data: { colorId: ColorId }) => void;
  'player:ready': () => void;
  'game:start': () => void;
  'game:rollDice': () => void;
  'game:buyProperty': () => void;
  'game:declineProperty': () => void;
  'game:endTurn': () => void;
  'jail:payFine': () => void;
  'jail:useCard': () => void;
  'jail:rollDice': () => void;
  'auction:bid': (data: { amount: number }) => void;
  'auction:pass': () => void;
  'trade:propose': (data: Omit<TradeOffer, 'id' | 'status' | 'createdAt'>) => void;
  'trade:accept': (data: { tradeId: string }) => void;
  'trade:reject': (data: { tradeId: string }) => void;
  'trade:cancel': (data: { tradeId: string }) => void;
  'property:buildHouse': (data: { propertyId: number }) => void;
  'property:sellHouse': (data: { propertyId: number }) => void;
  'property:mortgage': (data: { propertyId: number }) => void;
  'property:unmortgage': (data: { propertyId: number }) => void;
  'chat:message': (data: { message: string }) => void;
}

export interface ServerToClientEvents {
  'connection:established': (data: { playerId: string }) => void;
  'connection:error': (data: { message: string }) => void;
  'room:created': (data: { roomCode: string; roomId: string }) => void;
  'room:joined': (data: { state: GameState }) => void;
  'room:left': () => void;
  'room:playerJoined': (data: { player: Player }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
  'room:playerReconnected': (data: { playerId: string }) => void;
  'matchmaking:searching': (data: { queuePosition: number }) => void;
  'matchmaking:found': (data: { roomCode: string }) => void;
  'matchmaking:cancelled': () => void;
  'game:stateUpdate': (data: { state: GameState }) => void;
  'game:started': (data: { state: GameState }) => void;
  'game:ended': (data: { winner: Player }) => void;
  'turn:started': (data: { playerId: string; timeLimit: number }) => void;
  'turn:diceRolled': (data: { playerId: string; dice: [number, number]; isDoubles: boolean }) => void;
  'turn:playerMoved': (data: { playerId: string; from: number; to: number; passedGo: boolean }) => void;
  'turn:ended': (data: { playerId: string; nextPlayerId: string }) => void;
  'property:bought': (data: { playerId: string; propertyId: number }) => void;
  'property:rentPaid': (data: { fromId: string; toId: string; amount: number; propertyId: number }) => void;
  'property:houseBuilt': (data: { propertyId: number; houses: number }) => void;
  'property:houseSold': (data: { propertyId: number; houses: number }) => void;
  'property:mortgaged': (data: { propertyId: number }) => void;
  'property:unmortgaged': (data: { propertyId: number }) => void;
  'card:drawn': (data: { playerId: string; card: Card }) => void;
  'jail:playerSent': (data: { playerId: string }) => void;
  'jail:playerReleased': (data: { playerId: string; method: 'roll' | 'pay' | 'card' }) => void;
  'auction:started': (data: { auction: Auction; property: Property }) => void;
  'auction:bid': (data: { playerId: string; amount: number }) => void;
  'auction:playerPassed': (data: { playerId: string }) => void;
  'auction:ended': (data: { winnerId: string | null; propertyId: number; amount: number }) => void;
  'trade:proposed': (data: { trade: TradeOffer }) => void;
  'trade:accepted': (data: { tradeId: string }) => void;
  'trade:rejected': (data: { tradeId: string }) => void;
  'trade:cancelled': (data: { tradeId: string }) => void;
  'trade:executed': (data: { trade: TradeOffer }) => void;
  'player:colorSelected': (data: { playerId: string; colorId: ColorId }) => void;
  'player:ready': (data: { playerId: string; isReady: boolean }) => void;
  'player:moneyChanged': (data: { playerId: string; amount: number; newBalance: number }) => void;
  'player:bankrupt': (data: { playerId: string }) => void;
  'chat:message': (data: { playerId: string; playerName: string; message: string; timestamp: number }) => void;
  'error': (data: { code: string; message: string }) => void;
}

// =============================================================================
// CHAT MESSAGE TYPE
// =============================================================================

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}
