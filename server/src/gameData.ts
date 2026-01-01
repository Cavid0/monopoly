// =============================================================================
// MONOPOLY GAME DATA - PROPERTIES, CARDS, BOARD POSITIONS
// =============================================================================

import { Property, Card } from './types';

// =============================================================================
// PROPERTY DEFINITIONS
// All 40 board positions with complete data
// =============================================================================

export const PROPERTIES: Property[] = [
  // Position 0: GO (Special)
  { id: 0, name: 'GO', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Brown properties (Mediterranean & Baltic)
  { id: 1, name: 'Mediterranean Avenue', price: 60, rent: [2, 10, 30, 90, 160, 250], mortgageValue: 30, color: '#8B4513', colorGroup: 'brown', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 2, name: 'Community Chest', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 3, name: 'Baltic Avenue', price: 60, rent: [4, 20, 60, 180, 320, 450], mortgageValue: 30, color: '#8B4513', colorGroup: 'brown', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 4, name: 'Income Tax', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Railroad 1
  { id: 5, name: 'Reading Railroad', price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, color: '#000000', colorGroup: 'railroad', type: 'railroad', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Light Blue properties
  { id: 6, name: 'Oriental Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], mortgageValue: 50, color: '#87CEEB', colorGroup: 'lightblue', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 7, name: 'Chance', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 8, name: 'Vermont Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], mortgageValue: 50, color: '#87CEEB', colorGroup: 'lightblue', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 9, name: 'Connecticut Avenue', price: 120, rent: [8, 40, 100, 300, 450, 600], mortgageValue: 60, color: '#87CEEB', colorGroup: 'lightblue', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  
  // Position 10: Jail
  { id: 10, name: 'Jail / Just Visiting', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Pink properties
  { id: 11, name: 'St. Charles Place', price: 140, rent: [10, 50, 150, 450, 625, 750], mortgageValue: 70, color: '#FF69B4', colorGroup: 'pink', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  
  // Utility 1
  { id: 12, name: 'Electric Company', price: 150, rent: [4, 10], mortgageValue: 75, color: '#FFD700', colorGroup: 'utility', type: 'utility', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  { id: 13, name: 'States Avenue', price: 140, rent: [10, 50, 150, 450, 625, 750], mortgageValue: 70, color: '#FF69B4', colorGroup: 'pink', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 14, name: 'Virginia Avenue', price: 160, rent: [12, 60, 180, 500, 700, 900], mortgageValue: 80, color: '#FF69B4', colorGroup: 'pink', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  
  // Railroad 2
  { id: 15, name: 'Pennsylvania Railroad', price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, color: '#000000', colorGroup: 'railroad', type: 'railroad', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Orange properties
  { id: 16, name: 'St. James Place', price: 180, rent: [14, 70, 200, 550, 750, 950], mortgageValue: 90, color: '#FFA500', colorGroup: 'orange', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 17, name: 'Community Chest', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 18, name: 'Tennessee Avenue', price: 180, rent: [14, 70, 200, 550, 750, 950], mortgageValue: 90, color: '#FFA500', colorGroup: 'orange', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 19, name: 'New York Avenue', price: 200, rent: [16, 80, 220, 600, 800, 1000], mortgageValue: 100, color: '#FFA500', colorGroup: 'orange', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  
  // Position 20: Free Parking
  { id: 20, name: 'Free Parking', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Red properties
  { id: 21, name: 'Kentucky Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], mortgageValue: 110, color: '#FF0000', colorGroup: 'red', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 22, name: 'Chance', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 23, name: 'Indiana Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], mortgageValue: 110, color: '#FF0000', colorGroup: 'red', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 24, name: 'Illinois Avenue', price: 240, rent: [20, 100, 300, 750, 925, 1100], mortgageValue: 120, color: '#FF0000', colorGroup: 'red', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  
  // Railroad 3
  { id: 25, name: 'B. & O. Railroad', price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, color: '#000000', colorGroup: 'railroad', type: 'railroad', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Yellow properties
  { id: 26, name: 'Atlantic Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], mortgageValue: 130, color: '#FFFF00', colorGroup: 'yellow', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 27, name: 'Ventnor Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], mortgageValue: 130, color: '#FFFF00', colorGroup: 'yellow', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  
  // Utility 2
  { id: 28, name: 'Water Works', price: 150, rent: [4, 10], mortgageValue: 75, color: '#FFD700', colorGroup: 'utility', type: 'utility', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  { id: 29, name: 'Marvin Gardens', price: 280, rent: [24, 120, 360, 850, 1025, 1200], mortgageValue: 140, color: '#FFFF00', colorGroup: 'yellow', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  
  // Position 30: Go To Jail
  { id: 30, name: 'Go To Jail', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Green properties
  { id: 31, name: 'Pacific Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], mortgageValue: 150, color: '#008000', colorGroup: 'green', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 32, name: 'North Carolina Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], mortgageValue: 150, color: '#008000', colorGroup: 'green', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 33, name: 'Community Chest', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 34, name: 'Pennsylvania Avenue', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], mortgageValue: 160, color: '#008000', colorGroup: 'green', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  
  // Railroad 4
  { id: 35, name: 'Short Line', price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, color: '#000000', colorGroup: 'railroad', type: 'railroad', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  { id: 36, name: 'Chance', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  
  // Dark Blue properties (Boardwalk & Park Place)
  { id: 37, name: 'Park Place', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], mortgageValue: 175, color: '#00008B', colorGroup: 'darkblue', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 38, name: 'Luxury Tax', price: 0, rent: [], mortgageValue: 0, color: '#ffffff', colorGroup: 'special', type: 'special', houseCost: 0, houses: 0, ownerId: null, isMortgaged: false },
  { id: 39, name: 'Boardwalk', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], mortgageValue: 200, color: '#00008B', colorGroup: 'darkblue', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
];

// Color group sizes for monopoly checking
export const COLOR_GROUP_SIZES: Record<string, number> = {
  brown: 2,
  lightblue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  darkblue: 2,
  railroad: 4,
  utility: 2,
};

// =============================================================================
// CHANCE CARDS
// =============================================================================

export const CHANCE_CARDS: Card[] = [
  { id: 1, type: 'chance', text: 'Advance to Boardwalk', action: 'move', position: 39 },
  { id: 2, type: 'chance', text: 'Advance to Go (Collect $200)', action: 'move', position: 0 },
  { id: 3, type: 'chance', text: 'Advance to Illinois Avenue. If you pass Go, collect $200', action: 'move', position: 24 },
  { id: 4, type: 'chance', text: 'Advance to St. Charles Place. If you pass Go, collect $200', action: 'move', position: 11 },
  { id: 5, type: 'chance', text: 'Advance to the nearest Railroad. Pay owner twice the rental.', action: 'moveNearest', value: 2 },
  { id: 6, type: 'chance', text: 'Advance to the nearest Railroad. Pay owner twice the rental.', action: 'moveNearest', value: 2 },
  { id: 7, type: 'chance', text: 'Advance to the nearest Utility. If unowned, buy it. If owned, pay 10x dice roll.', action: 'moveNearest', value: 10 },
  { id: 8, type: 'chance', text: 'Bank pays you dividend of $50', action: 'collect', value: 50 },
  { id: 9, type: 'chance', text: 'Get Out of Jail Free', action: 'jailFree' },
  { id: 10, type: 'chance', text: 'Go Back 3 Spaces', action: 'moveBack', value: 3 },
  { id: 11, type: 'chance', text: 'Go to Jail. Go directly to Jail, do not pass Go, do not collect $200', action: 'jail' },
  { id: 12, type: 'chance', text: 'Make general repairs on all your property. $25 per house, $100 per hotel', action: 'repairs', perHouse: 25, perHotel: 100 },
  { id: 13, type: 'chance', text: 'Speeding fine $15', action: 'pay', value: 15 },
  { id: 14, type: 'chance', text: 'Take a trip to Reading Railroad. If you pass Go, collect $200', action: 'move', position: 5 },
  { id: 15, type: 'chance', text: 'You have been elected Chairman of the Board. Pay each player $50', action: 'payAll', value: 50 },
  { id: 16, type: 'chance', text: 'Your building loan matures. Collect $150', action: 'collect', value: 150 },
];

// =============================================================================
// COMMUNITY CHEST CARDS
// =============================================================================

export const COMMUNITY_CARDS: Card[] = [
  { id: 17, type: 'community', text: 'Advance to Go (Collect $200)', action: 'move', position: 0 },
  { id: 18, type: 'community', text: 'Bank error in your favor. Collect $200', action: 'collect', value: 200 },
  { id: 19, type: 'community', text: 'Doctor\'s fee. Pay $50', action: 'pay', value: 50 },
  { id: 20, type: 'community', text: 'From sale of stock you get $50', action: 'collect', value: 50 },
  { id: 21, type: 'community', text: 'Get Out of Jail Free', action: 'jailFree' },
  { id: 22, type: 'community', text: 'Go to Jail. Go directly to jail, do not pass Go, do not collect $200', action: 'jail' },
  { id: 23, type: 'community', text: 'Holiday fund matures. Receive $100', action: 'collect', value: 100 },
  { id: 24, type: 'community', text: 'Income tax refund. Collect $20', action: 'collect', value: 20 },
  { id: 25, type: 'community', text: 'It is your birthday. Collect $10 from every player', action: 'birthday', value: 10 },
  { id: 26, type: 'community', text: 'Life insurance matures. Collect $100', action: 'collect', value: 100 },
  { id: 27, type: 'community', text: 'Pay hospital fees of $100', action: 'pay', value: 100 },
  { id: 28, type: 'community', text: 'Pay school fees of $50', action: 'pay', value: 50 },
  { id: 29, type: 'community', text: 'Receive $25 consultancy fee', action: 'collect', value: 25 },
  { id: 30, type: 'community', text: 'You are assessed for street repair. $40 per house, $115 per hotel', action: 'repairs', perHouse: 40, perHotel: 115 },
  { id: 31, type: 'community', text: 'You have won second prize in a beauty contest. Collect $10', action: 'collect', value: 10 },
  { id: 32, type: 'community', text: 'You inherit $100', action: 'collect', value: 100 },
];

// Get all cards
export const ALL_CARDS = [...CHANCE_CARDS, ...COMMUNITY_CARDS];

// Get card by ID
export function getCardById(id: number): Card | undefined {
  return ALL_CARDS.find(c => c.id === id);
}

// Get property by ID
export function getPropertyById(id: number): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

// Get properties by color group
export function getPropertiesByColorGroup(colorGroup: string): Property[] {
  return PROPERTIES.filter(p => p.colorGroup === colorGroup);
}

// Check if a position is a property that can be bought
export function isBuyableProperty(position: number): boolean {
  const property = PROPERTIES[position];
  return property && property.type !== 'special' && property.price > 0;
}

// Get special positions
export const SPECIAL_POSITIONS = {
  GO: 0,
  JAIL: 10,
  FREE_PARKING: 20,
  GO_TO_JAIL: 30,
  INCOME_TAX: 4,
  LUXURY_TAX: 38,
  CHANCE: [7, 22, 36],
  COMMUNITY_CHEST: [2, 17, 33],
};

// Railroad positions
export const RAILROAD_POSITIONS = [5, 15, 25, 35];

// Utility positions
export const UTILITY_POSITIONS = [12, 28];
