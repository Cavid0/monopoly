export interface Player {
  id: string;
  name: string;
  color: string;
  characterId: string | null; // NEW: Selected character token
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
  isReady: boolean;
  isHost: boolean;
}

export interface RoomSettings {
  roomName: string;
  maxPlayers: number;
  gameDuration: number;
  startingMoney: number;
  turnTimer: number;
  isPrivate: boolean;
  x2RentFullSet: boolean;
  vacationCash: boolean;
  auction: boolean;
  noRentInPrison: boolean;
  mortgage: boolean;
  evenBuild: boolean;
  randomizeOrder: boolean;
}

export interface Property {
  id: number;
  name: string;
  price: number;
  rent: number[];
  color: string;
  type: 'property' | 'railroad' | 'utility' | 'special';
  houseCost?: number;
  houses: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayerId: string;
  properties: Property[];
  gamePhase: 'lobby' | 'settings' | 'character-select' | 'playing' | 'ended';
  roomSettings: RoomSettings;
  dice: [number, number];
  lastRoll: number;
  doublesCount: number;
  winner: Player | null;
  turnPhase: 'roll' | 'action' | 'end';
}

export interface ChanceCard {
  id: number;
  text: string;
  action: 'money' | 'move' | 'jail' | 'jailFree' | 'repairs' | 'payAll' | 'collectAll';
  value?: number;
  position?: number;
}

export interface CommunityCard {
  id: number;
  text: string;
  action: 'money' | 'move' | 'jail' | 'jailFree' | 'repairs' | 'payAll' | 'collectAll';
  value?: number;
  position?: number;
}

export const PLAYER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const BOARD_POSITIONS = [
  { id: 0, name: 'GO', type: 'special', side: 'bottom' },
  { id: 1, name: 'Mediterranean Avenue', type: 'property', color: '#8B4513', side: 'bottom' },
  { id: 2, name: 'Community Chest', type: 'special', side: 'bottom' },
  { id: 3, name: 'Baltic Avenue', type: 'property', color: '#8B4513', side: 'bottom' },
  { id: 4, name: 'Income Tax', type: 'special', side: 'bottom' },
  { id: 5, name: 'Reading Railroad', type: 'railroad', side: 'bottom' },
  { id: 6, name: 'Oriental Avenue', type: 'property', color: '#87CEEB', side: 'bottom' },
  { id: 7, name: 'Chance', type: 'special', side: 'bottom' },
  { id: 8, name: 'Vermont Avenue', type: 'property', color: '#87CEEB', side: 'bottom' },
  { id: 9, name: 'Connecticut Avenue', type: 'property', color: '#87CEEB', side: 'bottom' },
  { id: 10, name: 'Jail', type: 'special', side: 'left' },
  { id: 11, name: 'St. Charles Place', type: 'property', color: '#FF69B4', side: 'left' },
  { id: 12, name: 'Electric Company', type: 'utility', side: 'left' },
  { id: 13, name: 'States Avenue', type: 'property', color: '#FF69B4', side: 'left' },
  { id: 14, name: 'Virginia Avenue', type: 'property', color: '#FF69B4', side: 'left' },
  { id: 15, name: 'Pennsylvania Railroad', type: 'railroad', side: 'left' },
  { id: 16, name: 'St. James Place', type: 'property', color: '#FFA500', side: 'left' },
  { id: 17, name: 'Community Chest', type: 'special', side: 'left' },
  { id: 18, name: 'Tennessee Avenue', type: 'property', color: '#FFA500', side: 'left' },
  { id: 19, name: 'New York Avenue', type: 'property', color: '#FFA500', side: 'left' },
  { id: 20, name: 'Free Parking', type: 'special', side: 'top' },
  { id: 21, name: 'Kentucky Avenue', type: 'property', color: '#DC143C', side: 'top' },
  { id: 22, name: 'Chance', type: 'special', side: 'top' },
  { id: 23, name: 'Indiana Avenue', type: 'property', color: '#DC143C', side: 'top' },
  { id: 24, name: 'Illinois Avenue', type: 'property', color: '#DC143C', side: 'top' },
  { id: 25, name: 'B. & O. Railroad', type: 'railroad', side: 'top' },
  { id: 26, name: 'Atlantic Avenue', type: 'property', color: '#FFD700', side: 'top' },
  { id: 27, name: 'Ventnor Avenue', type: 'property', color: '#FFD700', side: 'top' },
  { id: 28, name: 'Water Works', type: 'utility', side: 'top' },
  { id: 29, name: 'Marvin Gardens', type: 'property', color: '#FFD700', side: 'top' },
  { id: 30, name: 'Go To Jail', type: 'special', side: 'right' },
  { id: 31, name: 'Pacific Avenue', type: 'property', color: '#228B22', side: 'right' },
  { id: 32, name: 'North Carolina Avenue', type: 'property', color: '#228B22', side: 'right' },
  { id: 33, name: 'Community Chest', type: 'special', side: 'right' },
  { id: 34, name: 'Pennsylvania Avenue', type: 'property', color: '#228B22', side: 'right' },
  { id: 35, name: 'Short Line', type: 'railroad', side: 'right' },
  { id: 36, name: 'Chance', type: 'special', side: 'right' },
  { id: 37, name: 'Park Place', type: 'property', color: '#000080', side: 'right' },
  { id: 38, name: 'Luxury Tax', type: 'special', side: 'right' },
  { id: 39, name: 'Boardwalk', type: 'property', color: '#000080', side: 'right' },
];
