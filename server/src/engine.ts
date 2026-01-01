// =============================================================================
// MONOPOLY GAME ENGINE - COMPLETE RULE IMPLEMENTATION
// =============================================================================

import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  GameSettings,
  Player,
  Property,
  Card,
  Auction,
  TradeOffer,
  ColorId,
  PLAYER_COLORS,
  TurnPhase,
} from './types';
import {
  PROPERTIES,
  CHANCE_CARDS,
  COMMUNITY_CARDS,
  COLOR_GROUP_SIZES,
  SPECIAL_POSITIONS,
  RAILROAD_POSITIONS,
  UTILITY_POSITIONS,
  getPropertiesByColorGroup,
} from './gameData';

// =============================================================================
// GAME ENGINE CLASS
// =============================================================================

export class MonopolyEngine {
  private state: GameState;

  constructor(roomId: string, roomCode: string, settings?: Partial<GameSettings>) {
    this.state = this.createInitialState(roomId, roomCode, settings);
  }

  // ===========================================================================
  // STATE INITIALIZATION
  // ===========================================================================

  private createInitialState(
    roomId: string,
    roomCode: string,
    settings?: Partial<GameSettings>
  ): GameState {
    const defaultSettings: GameSettings = {
      maxPlayers: 8,
      startingMoney: 1500,
      turnTimeLimit: 60,
      freeParking: false,
      doubleOnGo: false,
      auctionEnabled: true,
      evenBuildRule: true,
      mortgageInterest: 10,
    };

    return {
      roomId,
      roomCode,
      players: [],
      properties: JSON.parse(JSON.stringify(PROPERTIES)), // Deep copy
      currentPlayerId: '',
      gamePhase: 'lobby',
      turnPhase: 'waiting',
      settings: { ...defaultSettings, ...settings },
      dice: [1, 1],
      lastRoll: 0,
      doublesCount: 0,
      chanceCards: this.shuffleArray([...Array(16)].map((_, i) => i + 1)),
      communityCards: this.shuffleArray([...Array(16)].map((_, i) => i + 17)),
      chanceIndex: 0,
      communityIndex: 0,
      auction: null,
      trades: [],
      freeParkingPot: 0,
      winner: null,
      turnStartTime: 0,
      gameStartTime: 0,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ===========================================================================
  // STATE GETTERS
  // ===========================================================================

  getState(): GameState {
    return this.state;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.state.players.find(p => p.id === playerId);
  }

  getCurrentPlayer(): Player | undefined {
    return this.state.players.find(p => p.id === this.state.currentPlayerId);
  }

  getProperty(propertyId: number): Property | undefined {
    return this.state.properties.find(p => p.id === propertyId);
  }

  getActivePlayers(): Player[] {
    return this.state.players.filter(p => !p.isBankrupt);
  }

  // ===========================================================================
  // PLAYER MANAGEMENT
  // ===========================================================================

  addPlayer(id: string, name: string, isHost: boolean = false): Player | null {
    if (this.state.players.length >= this.state.settings.maxPlayers) {
      return null;
    }
    if (this.state.gamePhase !== 'lobby' && this.state.gamePhase !== 'color-select') {
      return null;
    }

    const player: Player = {
      id,
      name,
      colorId: null,
      color: '#666666',
      money: this.state.settings.startingMoney,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      isBankrupt: false,
      isConnected: true,
      isReady: false,
      isHost,
    };

    this.state.players.push(player);
    return player;
  }

  removePlayer(playerId: string): boolean {
    const index = this.state.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    // If game hasn't started, just remove
    if (this.state.gamePhase === 'lobby' || this.state.gamePhase === 'color-select') {
      this.state.players.splice(index, 1);
      return true;
    }

    // If game in progress, mark as bankrupt
    const player = this.state.players[index];
    this.bankruptPlayer(playerId);
    player.isConnected = false;
    return true;
  }

  setPlayerConnected(playerId: string, connected: boolean): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isConnected = connected;
    }
  }

  selectColor(playerId: string, colorId: ColorId): boolean {
    // Check if color is already taken
    const colorTaken = this.state.players.some(
      p => p.id !== playerId && p.colorId === colorId
    );
    if (colorTaken) return false;

    const player = this.getPlayer(playerId);
    if (!player) return false;

    const colorData = PLAYER_COLORS.find(c => c.id === colorId);
    if (!colorData) return false;

    player.colorId = colorId;
    player.color = colorData.hex;
    return true;
  }

  setPlayerReady(playerId: string, ready: boolean): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.colorId) return false;

    player.isReady = ready;
    return true;
  }

  // ===========================================================================
  // GAME START
  // ===========================================================================

  canStartGame(): boolean {
    const activePlayers = this.state.players.filter(p => p.colorId !== null);
    if (activePlayers.length < 2) return false;
    return activePlayers.every(p => p.isReady);
  }

  startGame(): boolean {
    if (!this.canStartGame()) return false;

    // Randomize player order
    this.state.players = this.shuffleArray(
      this.state.players.filter(p => p.colorId !== null)
    );

    // Set first player
    this.state.currentPlayerId = this.state.players[0].id;
    this.state.gamePhase = 'playing';
    this.state.turnPhase = 'roll';
    this.state.gameStartTime = Date.now();
    this.state.turnStartTime = Date.now();

    return true;
  }

  // Start game immediately when player selects color (for solo/quick start)
  startGameImmediately(playerId: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.colorId) return false;

    this.state.currentPlayerId = playerId;
    this.state.gamePhase = 'playing';
    this.state.turnPhase = 'roll';
    this.state.gameStartTime = Date.now();
    this.state.turnStartTime = Date.now();

    return true;
  }

  // ===========================================================================
  // DICE ROLLING
  // ===========================================================================

  rollDice(playerId: string): { dice: [number, number]; isDoubles: boolean } | null {
    if (this.state.currentPlayerId !== playerId) return null;
    if (this.state.turnPhase !== 'roll' && this.state.turnPhase !== 'jail-decision') return null;

    const player = this.getPlayer(playerId);
    if (!player) return null;

    // If in jail and trying to roll for doubles
    if (player.inJail && this.state.turnPhase === 'jail-decision') {
      return this.rollForJailRelease(player);
    }

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const isDoubles = die1 === die2;

    this.state.dice = [die1, die2];
    this.state.lastRoll = die1 + die2;

    if (isDoubles) {
      this.state.doublesCount++;
      
      // Three doubles = Go to Jail
      if (this.state.doublesCount >= 3) {
        this.sendToJail(player);
        this.state.turnPhase = 'end';
        return { dice: [die1, die2], isDoubles };
      }
    } else {
      this.state.doublesCount = 0;
    }

    this.state.turnPhase = 'moving';
    return { dice: [die1, die2], isDoubles };
  }

  private rollForJailRelease(player: Player): { dice: [number, number]; isDoubles: boolean } | null {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const isDoubles = die1 === die2;

    this.state.dice = [die1, die2];
    this.state.lastRoll = die1 + die2;

    if (isDoubles) {
      // Released from jail with doubles
      player.inJail = false;
      player.jailTurns = 0;
      this.state.doublesCount = 0; // Doubles from jail don't count for extra turn
      this.state.turnPhase = 'moving';
    } else {
      player.jailTurns++;
      
      // After 3 failed attempts, must pay
      if (player.jailTurns >= 3) {
        if (player.money >= 50) {
          this.updatePlayerMoney(player.id, -50);
          player.inJail = false;
          player.jailTurns = 0;
          this.state.turnPhase = 'moving';
        } else {
          // Can't afford, stays in jail (edge case)
          this.state.turnPhase = 'end';
        }
      } else {
        this.state.turnPhase = 'end';
      }
    }

    return { dice: [die1, die2], isDoubles };
  }

  // ===========================================================================
  // PLAYER MOVEMENT
  // ===========================================================================

  movePlayer(playerId: string): { from: number; to: number; passedGo: boolean } | null {
    if (this.state.turnPhase !== 'moving') return null;

    const player = this.getPlayer(playerId);
    if (!player) return null;

    const from = player.position;
    let to = (from + this.state.lastRoll) % 40;
    const passedGo = to < from;

    // Collect $200 for passing GO (or $400 if doubleOnGo and landing on GO)
    if (passedGo) {
      const goBonus = this.state.settings.doubleOnGo && to === 0 ? 400 : 200;
      this.updatePlayerMoney(playerId, goBonus);
    }

    player.position = to;

    // Handle landing position
    this.handleLanding(player);

    return { from, to, passedGo };
  }

  private handleLanding(player: Player): void {
    const position = player.position;
    const property = this.getProperty(position);

    // Go To Jail
    if (position === SPECIAL_POSITIONS.GO_TO_JAIL) {
      this.sendToJail(player);
      this.state.turnPhase = 'end';
      return;
    }

    // Income Tax
    if (position === SPECIAL_POSITIONS.INCOME_TAX) {
      this.updatePlayerMoney(player.id, -200);
      if (this.state.settings.freeParking) {
        this.state.freeParkingPot += 200;
      }
      this.state.turnPhase = 'end';
      return;
    }

    // Luxury Tax
    if (position === SPECIAL_POSITIONS.LUXURY_TAX) {
      this.updatePlayerMoney(player.id, -100);
      if (this.state.settings.freeParking) {
        this.state.freeParkingPot += 100;
      }
      this.state.turnPhase = 'end';
      return;
    }

    // Free Parking
    if (position === SPECIAL_POSITIONS.FREE_PARKING) {
      if (this.state.settings.freeParking && this.state.freeParkingPot > 0) {
        this.updatePlayerMoney(player.id, this.state.freeParkingPot);
        this.state.freeParkingPot = 0;
      }
      this.state.turnPhase = 'end';
      return;
    }

    // Chance
    if (SPECIAL_POSITIONS.CHANCE.includes(position)) {
      this.state.turnPhase = 'card';
      return;
    }

    // Community Chest
    if (SPECIAL_POSITIONS.COMMUNITY_CHEST.includes(position)) {
      this.state.turnPhase = 'card';
      return;
    }

    // Property handling
    if (property && property.type !== 'special') {
      if (property.ownerId === null) {
        // Unowned property - can buy or auction
        this.state.turnPhase = 'action';
      } else if (property.ownerId !== player.id && !property.isMortgaged) {
        // Pay rent
        const rent = this.calculateRent(property);
        this.payRent(player.id, property.ownerId, rent);
        this.state.turnPhase = 'end';
      } else {
        this.state.turnPhase = 'end';
      }
      return;
    }

    // Default: end turn phase (GO, Jail Visiting, etc.)
    this.state.turnPhase = 'end';
  }

  // ===========================================================================
  // JAIL MANAGEMENT
  // ===========================================================================

  sendToJail(player: Player): void {
    player.position = SPECIAL_POSITIONS.JAIL;
    player.inJail = true;
    player.jailTurns = 0;
    this.state.doublesCount = 0;
  }

  payJailFine(playerId: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.inJail) return false;
    if (player.money < 50) return false;

    this.updatePlayerMoney(playerId, -50);
    player.inJail = false;
    player.jailTurns = 0;
    this.state.turnPhase = 'roll';
    return true;
  }

  useJailCard(playerId: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player || !player.inJail) return false;
    if (player.jailFreeCards < 1) return false;

    player.jailFreeCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.state.turnPhase = 'roll';
    return true;
  }

  // ===========================================================================
  // PROPERTY BUYING
  // ===========================================================================

  buyProperty(playerId: string): boolean {
    if (this.state.turnPhase !== 'action') return false;

    const player = this.getPlayer(playerId);
    if (!player) return false;

    const property = this.getProperty(player.position);
    if (!property || property.ownerId !== null) return false;
    if (player.money < property.price) return false;

    this.updatePlayerMoney(playerId, -property.price);
    property.ownerId = playerId;
    player.properties.push(property.id);

    this.state.turnPhase = 'end';
    return true;
  }

  declineProperty(playerId: string): boolean {
    if (this.state.turnPhase !== 'action') return false;

    const player = this.getPlayer(playerId);
    if (!player) return false;

    const property = this.getProperty(player.position);
    if (!property || property.ownerId !== null) return false;

    if (this.state.settings.auctionEnabled) {
      this.startAuction(property.id);
    } else {
      this.state.turnPhase = 'end';
    }

    return true;
  }

  // ===========================================================================
  // RENT CALCULATION
  // ===========================================================================

  calculateRent(property: Property): number {
    if (!property.ownerId || property.isMortgaged) return 0;

    const owner = this.getPlayer(property.ownerId);
    if (!owner) return 0;

    // Railroad rent
    if (property.type === 'railroad') {
      const railroadsOwned = this.state.properties.filter(
        p => p.type === 'railroad' && p.ownerId === property.ownerId && !p.isMortgaged
      ).length;
      return property.rent[railroadsOwned - 1] || 25;
    }

    // Utility rent
    if (property.type === 'utility') {
      const utilitiesOwned = this.state.properties.filter(
        p => p.type === 'utility' && p.ownerId === property.ownerId && !p.isMortgaged
      ).length;
      const multiplier = property.rent[utilitiesOwned - 1] || 4;
      return this.state.lastRoll * multiplier;
    }

    // Regular property
    if (property.houses > 0) {
      return property.rent[property.houses] || property.rent[0];
    }

    // Check for monopoly (double rent)
    if (this.hasMonopoly(property.ownerId, property.colorGroup)) {
      return property.rent[0] * 2;
    }

    return property.rent[0];
  }

  hasMonopoly(playerId: string, colorGroup: string): boolean {
    const groupProperties = this.state.properties.filter(
      p => p.colorGroup === colorGroup && p.type === 'property'
    );
    const ownedInGroup = groupProperties.filter(
      p => p.ownerId === playerId && !p.isMortgaged
    );
    return groupProperties.length === ownedInGroup.length;
  }

  payRent(fromId: string, toId: string, amount: number): boolean {
    const from = this.getPlayer(fromId);
    const to = this.getPlayer(toId);
    if (!from || !to) return false;

    if (from.money < amount) {
      // Handle bankruptcy to another player
      this.bankruptToPlayer(fromId, toId);
      return true;
    }

    this.updatePlayerMoney(fromId, -amount);
    this.updatePlayerMoney(toId, amount);
    return true;
  }

  // ===========================================================================
  // CARD HANDLING
  // ===========================================================================

  drawCard(playerId: string): Card | null {
    if (this.state.turnPhase !== 'card') return null;

    const player = this.getPlayer(playerId);
    if (!player) return null;

    const position = player.position;
    let card: Card;

    if (SPECIAL_POSITIONS.CHANCE.includes(position)) {
      const cardId = this.state.chanceCards[this.state.chanceIndex];
      card = CHANCE_CARDS.find(c => c.id === cardId)!;
      this.state.chanceIndex = (this.state.chanceIndex + 1) % this.state.chanceCards.length;
    } else {
      const cardId = this.state.communityCards[this.state.communityIndex];
      card = COMMUNITY_CARDS.find(c => c.id === cardId)!;
      this.state.communityIndex = (this.state.communityIndex + 1) % this.state.communityCards.length;
    }

    this.executeCard(player, card);
    return card;
  }

  private executeCard(player: Player, card: Card): void {
    switch (card.action) {
      case 'collect':
        this.updatePlayerMoney(player.id, card.value!);
        break;

      case 'pay':
        this.updatePlayerMoney(player.id, -card.value!);
        if (this.state.settings.freeParking) {
          this.state.freeParkingPot += card.value!;
        }
        break;

      case 'payAll':
        const otherPlayers = this.getActivePlayers().filter(p => p.id !== player.id);
        const totalPay = card.value! * otherPlayers.length;
        this.updatePlayerMoney(player.id, -totalPay);
        otherPlayers.forEach(p => this.updatePlayerMoney(p.id, card.value!));
        break;

      case 'collectAll':
      case 'birthday':
        const payers = this.getActivePlayers().filter(p => p.id !== player.id);
        payers.forEach(p => this.updatePlayerMoney(p.id, -card.value!));
        this.updatePlayerMoney(player.id, card.value! * payers.length);
        break;

      case 'move':
        const passedGo = card.position! < player.position && card.position !== SPECIAL_POSITIONS.JAIL;
        if (passedGo) {
          this.updatePlayerMoney(player.id, 200);
        }
        player.position = card.position!;
        this.handleLanding(player);
        return; // Don't set turnPhase to 'end' yet

      case 'moveBack':
        player.position = (player.position - card.value! + 40) % 40;
        this.handleLanding(player);
        return;

      case 'moveNearest':
        // Find nearest railroad or utility
        const currentPos = player.position;
        let nearestPos: number;
        
        if (card.value === 2) {
          // Nearest railroad
          nearestPos = RAILROAD_POSITIONS.find(r => r > currentPos) || RAILROAD_POSITIONS[0];
        } else {
          // Nearest utility
          nearestPos = UTILITY_POSITIONS.find(u => u > currentPos) || UTILITY_POSITIONS[0];
        }
        
        if (nearestPos < currentPos) {
          this.updatePlayerMoney(player.id, 200); // Passed GO
        }
        player.position = nearestPos;
        this.handleLanding(player);
        return;

      case 'jail':
        this.sendToJail(player);
        break;

      case 'jailFree':
        player.jailFreeCards++;
        break;

      case 'repairs':
        let repairCost = 0;
        this.state.properties.forEach(p => {
          if (p.ownerId === player.id) {
            if (p.houses === 5) {
              repairCost += card.perHotel!;
            } else {
              repairCost += p.houses * card.perHouse!;
            }
          }
        });
        this.updatePlayerMoney(player.id, -repairCost);
        if (this.state.settings.freeParking) {
          this.state.freeParkingPot += repairCost;
        }
        break;
    }

    this.state.turnPhase = 'end';
  }

  // ===========================================================================
  // HOUSE BUILDING
  // ===========================================================================

  canBuildHouse(playerId: string, propertyId: number): boolean {
    const player = this.getPlayer(playerId);
    const property = this.getProperty(propertyId);
    
    if (!player || !property) return false;
    if (property.ownerId !== playerId) return false;
    if (property.type !== 'property') return false;
    if (property.isMortgaged) return false;
    if (property.houses >= 5) return false; // Max is hotel (5)
    if (player.money < property.houseCost) return false;
    if (!this.hasMonopoly(playerId, property.colorGroup)) return false;

    // Even build rule
    if (this.state.settings.evenBuildRule) {
      const groupProperties = this.state.properties.filter(
        p => p.colorGroup === property.colorGroup && p.ownerId === playerId
      );
      const minHouses = Math.min(...groupProperties.map(p => p.houses));
      if (property.houses > minHouses) return false;
    }

    // Check no mortgaged properties in group
    const groupHasMortgage = this.state.properties.some(
      p => p.colorGroup === property.colorGroup && p.ownerId === playerId && p.isMortgaged
    );
    if (groupHasMortgage) return false;

    return true;
  }

  buildHouse(playerId: string, propertyId: number): boolean {
    if (!this.canBuildHouse(playerId, propertyId)) return false;

    const player = this.getPlayer(playerId)!;
    const property = this.getProperty(propertyId)!;

    this.updatePlayerMoney(playerId, -property.houseCost);
    property.houses++;

    return true;
  }

  canSellHouse(playerId: string, propertyId: number): boolean {
    const property = this.getProperty(propertyId);
    
    if (!property) return false;
    if (property.ownerId !== playerId) return false;
    if (property.houses === 0) return false;

    // Even build rule for selling
    if (this.state.settings.evenBuildRule) {
      const groupProperties = this.state.properties.filter(
        p => p.colorGroup === property.colorGroup && p.ownerId === playerId
      );
      const maxHouses = Math.max(...groupProperties.map(p => p.houses));
      if (property.houses < maxHouses) return false;
    }

    return true;
  }

  sellHouse(playerId: string, propertyId: number): boolean {
    if (!this.canSellHouse(playerId, propertyId)) return false;

    const property = this.getProperty(propertyId)!;

    property.houses--;
    this.updatePlayerMoney(playerId, property.houseCost / 2);

    return true;
  }

  // ===========================================================================
  // MORTGAGE
  // ===========================================================================

  canMortgage(playerId: string, propertyId: number): boolean {
    const property = this.getProperty(propertyId);
    
    if (!property) return false;
    if (property.ownerId !== playerId) return false;
    if (property.isMortgaged) return false;
    if (property.houses > 0) return false;

    // Check no houses on any property in the color group
    const groupHasHouses = this.state.properties.some(
      p => p.colorGroup === property.colorGroup && p.ownerId === playerId && p.houses > 0
    );
    if (groupHasHouses) return false;

    return true;
  }

  mortgage(playerId: string, propertyId: number): boolean {
    if (!this.canMortgage(playerId, propertyId)) return false;

    const property = this.getProperty(propertyId)!;
    property.isMortgaged = true;
    this.updatePlayerMoney(playerId, property.mortgageValue);

    return true;
  }

  canUnmortgage(playerId: string, propertyId: number): boolean {
    const player = this.getPlayer(playerId);
    const property = this.getProperty(propertyId);
    
    if (!player || !property) return false;
    if (property.ownerId !== playerId) return false;
    if (!property.isMortgaged) return false;

    const unmortgageCost = Math.ceil(property.mortgageValue * (1 + this.state.settings.mortgageInterest / 100));
    if (player.money < unmortgageCost) return false;

    return true;
  }

  unmortgage(playerId: string, propertyId: number): boolean {
    if (!this.canUnmortgage(playerId, propertyId)) return false;

    const property = this.getProperty(propertyId)!;
    const unmortgageCost = Math.ceil(property.mortgageValue * (1 + this.state.settings.mortgageInterest / 100));
    
    property.isMortgaged = false;
    this.updatePlayerMoney(playerId, -unmortgageCost);

    return true;
  }

  // ===========================================================================
  // AUCTION SYSTEM
  // ===========================================================================

  startAuction(propertyId: number): void {
    const property = this.getProperty(propertyId);
    if (!property) return;

    const activePlayers = this.getActivePlayers();
    
    this.state.auction = {
      propertyId,
      currentBid: 0,
      currentBidderId: null,
      participants: activePlayers.map(p => p.id),
      timeRemaining: 30,
      isActive: true,
    };
    this.state.gamePhase = 'auction';
  }

  placeBid(playerId: string, amount: number): boolean {
    const auction = this.state.auction;
    if (!auction || !auction.isActive) return false;
    if (!auction.participants.includes(playerId)) return false;

    const player = this.getPlayer(playerId);
    if (!player || player.money < amount) return false;
    if (amount <= auction.currentBid) return false;

    auction.currentBid = amount;
    auction.currentBidderId = playerId;
    auction.timeRemaining = 15; // Reset timer on bid

    return true;
  }

  passAuction(playerId: string): boolean {
    const auction = this.state.auction;
    if (!auction || !auction.isActive) return false;
    
    const index = auction.participants.indexOf(playerId);
    if (index === -1) return false;

    auction.participants.splice(index, 1);

    // Check if auction should end
    if (auction.participants.length <= 1 || 
        (auction.participants.length === 1 && auction.currentBidderId)) {
      this.endAuction();
    }

    return true;
  }

  endAuction(): void {
    const auction = this.state.auction;
    if (!auction) return;

    if (auction.currentBidderId && auction.currentBid > 0) {
      const winner = this.getPlayer(auction.currentBidderId);
      const property = this.getProperty(auction.propertyId);
      
      if (winner && property) {
        this.updatePlayerMoney(winner.id, -auction.currentBid);
        property.ownerId = winner.id;
        winner.properties.push(property.id);
      }
    }

    this.state.auction = null;
    this.state.gamePhase = 'playing';
    this.state.turnPhase = 'end';
  }

  // ===========================================================================
  // TRADING SYSTEM
  // ===========================================================================

  proposeTrade(trade: Omit<TradeOffer, 'id' | 'status' | 'createdAt'>): TradeOffer | null {
    const from = this.getPlayer(trade.fromPlayerId);
    const to = this.getPlayer(trade.toPlayerId);
    
    if (!from || !to) return null;
    if (from.isBankrupt || to.isBankrupt) return null;

    // Validate offered properties belong to sender
    for (const propId of trade.offerProperties) {
      const prop = this.getProperty(propId);
      if (!prop || prop.ownerId !== from.id || prop.houses > 0) return null;
    }

    // Validate requested properties belong to receiver
    for (const propId of trade.requestProperties) {
      const prop = this.getProperty(propId);
      if (!prop || prop.ownerId !== to.id || prop.houses > 0) return null;
    }

    // Validate money and jail cards
    if (trade.offerMoney > from.money) return null;
    if (trade.requestMoney > to.money) return null;
    if (trade.offerJailCards > from.jailFreeCards) return null;
    if (trade.requestJailCards > to.jailFreeCards) return null;

    const newTrade: TradeOffer = {
      ...trade,
      id: uuidv4(),
      status: 'pending',
      createdAt: Date.now(),
    };

    this.state.trades.push(newTrade);
    return newTrade;
  }

  acceptTrade(tradeId: string, playerId: string): boolean {
    const trade = this.state.trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return false;
    if (trade.toPlayerId !== playerId) return false;

    const from = this.getPlayer(trade.fromPlayerId);
    const to = this.getPlayer(trade.toPlayerId);
    if (!from || !to) return false;

    // Re-validate the trade
    if (trade.offerMoney > from.money || trade.requestMoney > to.money) {
      trade.status = 'cancelled';
      return false;
    }

    // Execute trade
    // Transfer money
    this.updatePlayerMoney(from.id, -trade.offerMoney + trade.requestMoney);
    this.updatePlayerMoney(to.id, -trade.requestMoney + trade.offerMoney);

    // Transfer properties from -> to
    for (const propId of trade.offerProperties) {
      const prop = this.getProperty(propId)!;
      prop.ownerId = to.id;
      from.properties = from.properties.filter(p => p !== propId);
      to.properties.push(propId);
    }

    // Transfer properties to -> from
    for (const propId of trade.requestProperties) {
      const prop = this.getProperty(propId)!;
      prop.ownerId = from.id;
      to.properties = to.properties.filter(p => p !== propId);
      from.properties.push(propId);
    }

    // Transfer jail cards
    from.jailFreeCards -= trade.offerJailCards;
    to.jailFreeCards += trade.offerJailCards;
    to.jailFreeCards -= trade.requestJailCards;
    from.jailFreeCards += trade.requestJailCards;

    trade.status = 'accepted';
    return true;
  }

  rejectTrade(tradeId: string, playerId: string): boolean {
    const trade = this.state.trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return false;
    if (trade.toPlayerId !== playerId) return false;

    trade.status = 'rejected';
    return true;
  }

  cancelTrade(tradeId: string, playerId: string): boolean {
    const trade = this.state.trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return false;
    if (trade.fromPlayerId !== playerId) return false;

    trade.status = 'cancelled';
    return true;
  }

  // ===========================================================================
  // TURN MANAGEMENT
  // ===========================================================================

  endTurn(playerId: string): boolean {
    if (this.state.currentPlayerId !== playerId) return false;
    if (this.state.turnPhase !== 'end') return false;

    const player = this.getPlayer(playerId);
    if (!player) return false;

    // If doubles were rolled and not sent to jail, player gets another turn
    if (this.state.doublesCount > 0 && !player.inJail) {
      this.state.turnPhase = 'roll';
      this.state.turnStartTime = Date.now();
      return true;
    }

    // Move to next player
    const activePlayers = this.getActivePlayers();
    const currentIndex = activePlayers.findIndex(p => p.id === playerId);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    this.state.currentPlayerId = nextPlayer.id;
    this.state.doublesCount = 0;
    this.state.turnStartTime = Date.now();

    // Set appropriate turn phase based on jail status
    if (nextPlayer.inJail) {
      this.state.turnPhase = 'jail-decision';
    } else {
      this.state.turnPhase = 'roll';
    }

    // Check for winner
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0];
      this.state.gamePhase = 'ended';
    }

    return true;
  }

  // ===========================================================================
  // BANKRUPTCY
  // ===========================================================================

  private updatePlayerMoney(playerId: string, amount: number): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.money += amount;

    if (player.money < 0) {
      // Player is in debt - needs to mortgage or go bankrupt
      // For simplicity, we'll auto-bankrupt if they can't cover it
      // A more complete implementation would allow selling/mortgaging first
      if (!this.canCoverDebt(playerId, -player.money)) {
        this.bankruptPlayer(playerId);
      }
    }
  }

  private canCoverDebt(playerId: string, debt: number): boolean {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    let totalValue = player.money;

    // Add mortgage values and house sell values
    this.state.properties.forEach(p => {
      if (p.ownerId === playerId) {
        if (!p.isMortgaged) {
          totalValue += p.mortgageValue;
        }
        totalValue += (p.houses * p.houseCost) / 2;
      }
    });

    return totalValue >= debt;
  }

  bankruptPlayer(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.isBankrupt = true;
    player.money = 0;

    // Return all properties to bank
    this.state.properties.forEach(p => {
      if (p.ownerId === playerId) {
        p.ownerId = null;
        p.houses = 0;
        p.isMortgaged = false;
      }
    });

    player.properties = [];
    player.jailFreeCards = 0;

    // Check for game end
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0];
      this.state.gamePhase = 'ended';
    }

    // If current player is bankrupt, end their turn
    if (this.state.currentPlayerId === playerId) {
      this.endTurn(playerId);
    }
  }

  private bankruptToPlayer(fromId: string, toId: string): void {
    const from = this.getPlayer(fromId);
    const to = this.getPlayer(toId);
    if (!from || !to) return;

    // Transfer all assets to creditor
    to.money += from.money;
    to.jailFreeCards += from.jailFreeCards;

    this.state.properties.forEach(p => {
      if (p.ownerId === fromId) {
        p.ownerId = toId;
        to.properties.push(p.id);
      }
    });

    from.money = 0;
    from.properties = [];
    from.jailFreeCards = 0;
    from.isBankrupt = true;

    // Check for game end
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0];
      this.state.gamePhase = 'ended';
    }
  }
}
