import { Property, ChanceCard, CommunityCard } from '@/types/game';

export const PROPERTIES: Property[] = [
  // Brown
  { id: 1, name: 'Mediterranean Avenue', price: 60, rent: [2, 10, 30, 90, 160, 250], color: '#8B4513', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 3, name: 'Baltic Avenue', price: 60, rent: [4, 20, 60, 180, 320, 450], color: '#8B4513', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  
  // Light Blue
  { id: 6, name: 'Oriental Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], color: '#87CEEB', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 8, name: 'Vermont Avenue', price: 100, rent: [6, 30, 90, 270, 400, 550], color: '#87CEEB', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  { id: 9, name: 'Connecticut Avenue', price: 120, rent: [8, 40, 100, 300, 450, 600], color: '#87CEEB', type: 'property', houseCost: 50, houses: 0, ownerId: null, isMortgaged: false },
  
  // Pink
  { id: 11, name: 'St. Charles Place', price: 140, rent: [10, 50, 150, 450, 625, 750], color: '#FF69B4', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 13, name: 'States Avenue', price: 140, rent: [10, 50, 150, 450, 625, 750], color: '#FF69B4', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 14, name: 'Virginia Avenue', price: 160, rent: [12, 60, 180, 500, 700, 900], color: '#FF69B4', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  
  // Orange
  { id: 16, name: 'St. James Place', price: 180, rent: [14, 70, 200, 550, 750, 950], color: '#FFA500', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 18, name: 'Tennessee Avenue', price: 180, rent: [14, 70, 200, 550, 750, 950], color: '#FFA500', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  { id: 19, name: 'New York Avenue', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: '#FFA500', type: 'property', houseCost: 100, houses: 0, ownerId: null, isMortgaged: false },
  
  // Red
  { id: 21, name: 'Kentucky Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: '#DC143C', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 23, name: 'Indiana Avenue', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: '#DC143C', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 24, name: 'Illinois Avenue', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: '#DC143C', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  
  // Yellow
  { id: 26, name: 'Atlantic Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: '#FFD700', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 27, name: 'Ventnor Avenue', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: '#FFD700', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  { id: 29, name: 'Marvin Gardens', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: '#FFD700', type: 'property', houseCost: 150, houses: 0, ownerId: null, isMortgaged: false },
  
  // Green
  { id: 31, name: 'Pacific Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: '#228B22', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 32, name: 'North Carolina Avenue', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: '#228B22', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 34, name: 'Pennsylvania Avenue', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: '#228B22', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  
  // Dark Blue
  { id: 37, name: 'Park Place', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: '#000080', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  { id: 39, name: 'Boardwalk', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: '#000080', type: 'property', houseCost: 200, houses: 0, ownerId: null, isMortgaged: false },
  
  // Railroads
  { id: 5, name: 'Reading Railroad', price: 200, rent: [25, 50, 100, 200], color: '#000', type: 'railroad', houses: 0, ownerId: null, isMortgaged: false },
  { id: 15, name: 'Pennsylvania Railroad', price: 200, rent: [25, 50, 100, 200], color: '#000', type: 'railroad', houses: 0, ownerId: null, isMortgaged: false },
  { id: 25, name: 'B. & O. Railroad', price: 200, rent: [25, 50, 100, 200], color: '#000', type: 'railroad', houses: 0, ownerId: null, isMortgaged: false },
  { id: 35, name: 'Short Line', price: 200, rent: [25, 50, 100, 200], color: '#000', type: 'railroad', houses: 0, ownerId: null, isMortgaged: false },
  
  // Utilities
  { id: 12, name: 'Electric Company', price: 150, rent: [4, 10], color: '#fff', type: 'utility', houses: 0, ownerId: null, isMortgaged: false },
  { id: 28, name: 'Water Works', price: 150, rent: [4, 10], color: '#fff', type: 'utility', houses: 0, ownerId: null, isMortgaged: false },
];

export const CHANCE_CARDS: ChanceCard[] = [
  { id: 1, text: 'Advance to GO. Collect $200.', action: 'move', position: 0 },
  { id: 2, text: 'Advance to Illinois Avenue. If you pass GO, collect $200.', action: 'move', position: 24 },
  { id: 3, text: 'Advance to St. Charles Place. If you pass GO, collect $200.', action: 'move', position: 11 },
  { id: 4, text: 'Bank pays you dividend of $50.', action: 'money', value: 50 },
  { id: 5, text: 'Get Out of Jail Free.', action: 'jailFree' },
  { id: 6, text: 'Go Back 3 Spaces.', action: 'move', value: -3 },
  { id: 7, text: 'Go to Jail. Go directly to Jail.', action: 'jail' },
  { id: 8, text: 'Make general repairs on all your property: $25 per house, $100 per hotel.', action: 'repairs', value: 25 },
  { id: 9, text: 'Pay poor tax of $15.', action: 'money', value: -15 },
  { id: 10, text: 'Take a trip to Reading Railroad. If you pass GO, collect $200.', action: 'move', position: 5 },
  { id: 11, text: 'Take a walk on the Boardwalk. Advance token to Boardwalk.', action: 'move', position: 39 },
  { id: 12, text: 'You have been elected Chairman of the Board. Pay each player $50.', action: 'payAll', value: 50 },
  { id: 13, text: 'Your building loan matures. Collect $150.', action: 'money', value: 150 },
  { id: 14, text: 'You have won a crossword competition. Collect $100.', action: 'money', value: 100 },
];

export const COMMUNITY_CARDS: CommunityCard[] = [
  { id: 1, text: 'Advance to GO. Collect $200.', action: 'move', position: 0 },
  { id: 2, text: 'Bank error in your favor. Collect $200.', action: 'money', value: 200 },
  { id: 3, text: "Doctor's fees. Pay $50.", action: 'money', value: -50 },
  { id: 4, text: 'From sale of stock you get $50.', action: 'money', value: 50 },
  { id: 5, text: 'Get Out of Jail Free.', action: 'jailFree' },
  { id: 6, text: 'Go to Jail. Go directly to Jail.', action: 'jail' },
  { id: 7, text: 'Grand Opera Night. Collect $50 from every player.', action: 'collectAll', value: 50 },
  { id: 8, text: 'Holiday fund matures. Receive $100.', action: 'money', value: 100 },
  { id: 9, text: 'Income tax refund. Collect $20.', action: 'money', value: 20 },
  { id: 10, text: 'It is your birthday. Collect $10 from every player.', action: 'collectAll', value: 10 },
  { id: 11, text: 'Life insurance matures. Collect $100.', action: 'money', value: 100 },
  { id: 12, text: 'Hospital fees. Pay $100.', action: 'money', value: -100 },
  { id: 13, text: 'School fees. Pay $50.', action: 'money', value: -50 },
  { id: 14, text: 'Receive $25 consultancy fee.', action: 'money', value: 25 },
  { id: 15, text: 'You are assessed for street repairs: $40 per house, $115 per hotel.', action: 'repairs', value: 40 },
  { id: 16, text: 'You have won second prize in a beauty contest. Collect $10.', action: 'money', value: 10 },
  { id: 17, text: 'You inherit $100.', action: 'money', value: 100 },
];

export function getPropertyById(id: number): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

export function getPropertiesByColor(color: string): Property[] {
  return PROPERTIES.filter(p => p.color === color && p.type === 'property');
}

export function getRailroads(): Property[] {
  return PROPERTIES.filter(p => p.type === 'railroad');
}

export function getUtilities(): Property[] {
  return PROPERTIES.filter(p => p.type === 'utility');
}
