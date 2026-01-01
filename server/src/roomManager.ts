// =============================================================================
// ROOM & MATCHMAKING MANAGER
// =============================================================================

import { v4 as uuidv4 } from 'uuid';
import { Room, MatchmakingQueue, Player, GameState } from './types';
import { MonopolyEngine } from './engine';

// =============================================================================
// ROOM MANAGER
// =============================================================================

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private roomsByCode: Map<string, string> = new Map(); // code -> roomId
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId
  private engines: Map<string, MonopolyEngine> = new Map();
  
  // Matchmaking
  private matchmakingQueue: MatchmakingQueue[] = [];
  private readonly MATCHMAKING_MIN_PLAYERS = 2;
  private readonly MATCHMAKING_MAX_PLAYERS = 4;
  private readonly MATCHMAKING_TIMEOUT = 30000; // 30 seconds

  // ==========================================================================
  // ROOM CODE GENERATION
  // ==========================================================================

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure code is unique
    if (this.roomsByCode.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  // ==========================================================================
  // ROOM CREATION
  // ==========================================================================

  createRoom(hostId: string, hostName: string, isPrivate: boolean = false): Room {
    const roomId = uuidv4();
    const roomCode = this.generateRoomCode();

    const engine = new MonopolyEngine(roomId, roomCode);
    const player = engine.addPlayer(hostId, hostName, true);

    const room: Room = {
      id: roomId,
      code: roomCode,
      hostId,
      state: engine.getState(),
      createdAt: Date.now(),
      isPrivate,
      isMatchmaking: false,
    };

    this.rooms.set(roomId, room);
    this.roomsByCode.set(roomCode, roomId);
    this.engines.set(roomId, engine);
    this.playerRooms.set(hostId, roomId);

    return room;
  }

  // ==========================================================================
  // ROOM JOINING
  // ==========================================================================

  joinRoom(roomCode: string, playerId: string, playerName: string): { room: Room; player: Player } | null {
    const roomId = this.roomsByCode.get(roomCode.toUpperCase());
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    const engine = this.engines.get(roomId);
    if (!room || !engine) return null;

    // Check if game already started
    if (room.state.gamePhase === 'playing' || room.state.gamePhase === 'ended') {
      // Check if reconnecting
      const existingPlayer = engine.getPlayer(playerId);
      if (existingPlayer) {
        engine.setPlayerConnected(playerId, true);
        room.state = engine.getState();
        return { room, player: existingPlayer };
      }
      return null;
    }

    // Check if room is full
    if (room.state.players.length >= room.state.settings.maxPlayers) {
      return null;
    }

    // Check if player already in another room
    const existingRoomId = this.playerRooms.get(playerId);
    if (existingRoomId && existingRoomId !== roomId) {
      this.leaveRoom(playerId);
    }

    const player = engine.addPlayer(playerId, playerName, false);
    if (!player) return null;

    this.playerRooms.set(playerId, roomId);
    room.state = engine.getState();

    return { room, player };
  }

  // ==========================================================================
  // ROOM LEAVING
  // ==========================================================================

  leaveRoom(playerId: string): { roomId: string; wasHost: boolean; newHostId: string | null } | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    const engine = this.engines.get(roomId);
    if (!room || !engine) return null;

    const wasHost = room.hostId === playerId;
    engine.removePlayer(playerId);
    this.playerRooms.delete(playerId);

    room.state = engine.getState();

    // If no players left, delete room
    if (room.state.players.length === 0) {
      this.deleteRoom(roomId);
      return { roomId, wasHost, newHostId: null };
    }

    // If host left, assign new host
    let newHostId: string | null = null;
    if (wasHost && room.state.players.length > 0) {
      newHostId = room.state.players[0].id;
      room.hostId = newHostId;
      room.state.players[0].isHost = true;
    }

    return { roomId, wasHost, newHostId };
  }

  // ==========================================================================
  // ROOM DELETION
  // ==========================================================================

  private deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.roomsByCode.delete(room.code);
    }
    this.rooms.delete(roomId);
    this.engines.delete(roomId);
  }

  // ==========================================================================
  // ROOM QUERIES
  // ==========================================================================

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(code: string): Room | undefined {
    const roomId = this.roomsByCode.get(code.toUpperCase());
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  getRoomByPlayer(playerId: string): Room | undefined {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  getEngine(roomId: string): MonopolyEngine | undefined {
    return this.engines.get(roomId);
  }

  getEngineByPlayer(playerId: string): MonopolyEngine | undefined {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return undefined;
    return this.engines.get(roomId);
  }

  getPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      r => !r.isPrivate && 
           r.state.gamePhase === 'lobby' &&
           r.state.players.length < r.state.settings.maxPlayers
    );
  }

  // ==========================================================================
  // MATCHMAKING
  // ==========================================================================

  joinMatchmaking(playerId: string, playerName: string): { position: number } {
    // Remove from existing matchmaking
    this.leaveMatchmaking(playerId);

    this.matchmakingQueue.push({
      playerId,
      playerName,
      joinedAt: Date.now(),
    });

    return { position: this.matchmakingQueue.length };
  }

  leaveMatchmaking(playerId: string): boolean {
    const index = this.matchmakingQueue.findIndex(q => q.playerId === playerId);
    if (index === -1) return false;
    this.matchmakingQueue.splice(index, 1);
    return true;
  }

  processMatchmaking(): { room: Room; players: MatchmakingQueue[] } | null {
    // Remove expired entries
    const now = Date.now();
    this.matchmakingQueue = this.matchmakingQueue.filter(
      q => now - q.joinedAt < this.MATCHMAKING_TIMEOUT
    );

    // Check if we have enough players
    if (this.matchmakingQueue.length < this.MATCHMAKING_MIN_PLAYERS) {
      return null;
    }

    // Take players for a match (up to max)
    const matchPlayers = this.matchmakingQueue.splice(
      0,
      this.MATCHMAKING_MAX_PLAYERS
    );

    // Create a matchmaking room
    const hostPlayer = matchPlayers[0];
    const room = this.createRoom(hostPlayer.playerId, hostPlayer.playerName, false);
    room.isMatchmaking = true;

    const engine = this.engines.get(room.id)!;

    // Add other players
    for (let i = 1; i < matchPlayers.length; i++) {
      const player = matchPlayers[i];
      engine.addPlayer(player.playerId, player.playerName, false);
      this.playerRooms.set(player.playerId, room.id);
    }

    room.state = engine.getState();

    return { room, players: matchPlayers };
  }

  getQueuePosition(playerId: string): number {
    const index = this.matchmakingQueue.findIndex(q => q.playerId === playerId);
    return index === -1 ? -1 : index + 1;
  }

  // ==========================================================================
  // GAME ACTIONS - DELEGATED TO ENGINE
  // ==========================================================================

  selectColor(playerId: string, colorId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.selectColor(playerId, colorId as any);
    this.updateRoomState(playerId);
    return result;
  }

  setPlayerReady(playerId: string, ready: boolean = true): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.setPlayerReady(playerId, ready);
    this.updateRoomState(playerId);
    return result;
  }

  startGame(playerId: string): boolean {
    const room = this.getRoomByPlayer(playerId);
    const engine = this.getEngineByPlayer(playerId);
    if (!room || !engine) return false;

    // Only host can start
    if (room.hostId !== playerId) return false;

    const result = engine.startGame();
    this.updateRoomState(playerId);
    return result;
  }

  // Quick start - for single player testing or immediate start
  startGameImmediately(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.startGameImmediately(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  rollDice(playerId: string): { dice: [number, number]; isDoubles: boolean } | null {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return null;

    const result = engine.rollDice(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  movePlayer(playerId: string): { from: number; to: number; passedGo: boolean } | null {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return null;

    const result = engine.movePlayer(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  buyProperty(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.buyProperty(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  declineProperty(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.declineProperty(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  endTurn(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.endTurn(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  payJailFine(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.payJailFine(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  useJailCard(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.useJailCard(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  drawCard(playerId: string) {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return null;

    const result = engine.drawCard(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  buildHouse(playerId: string, propertyId: number): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.buildHouse(playerId, propertyId);
    this.updateRoomState(playerId);
    return result;
  }

  sellHouse(playerId: string, propertyId: number): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.sellHouse(playerId, propertyId);
    this.updateRoomState(playerId);
    return result;
  }

  mortgage(playerId: string, propertyId: number): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.mortgage(playerId, propertyId);
    this.updateRoomState(playerId);
    return result;
  }

  unmortgage(playerId: string, propertyId: number): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.unmortgage(playerId, propertyId);
    this.updateRoomState(playerId);
    return result;
  }

  // Auction actions
  placeBid(playerId: string, amount: number): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.placeBid(playerId, amount);
    this.updateRoomState(playerId);
    return result;
  }

  passAuction(playerId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.passAuction(playerId);
    this.updateRoomState(playerId);
    return result;
  }

  // Trade actions
  proposeTrade(playerId: string, trade: any) {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return null;

    const result = engine.proposeTrade({ ...trade, fromPlayerId: playerId });
    this.updateRoomState(playerId);
    return result;
  }

  acceptTrade(playerId: string, tradeId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.acceptTrade(tradeId, playerId);
    this.updateRoomState(playerId);
    return result;
  }

  rejectTrade(playerId: string, tradeId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.rejectTrade(tradeId, playerId);
    this.updateRoomState(playerId);
    return result;
  }

  cancelTrade(playerId: string, tradeId: string): boolean {
    const engine = this.getEngineByPlayer(playerId);
    if (!engine) return false;

    const result = engine.cancelTrade(tradeId, playerId);
    this.updateRoomState(playerId);
    return result;
  }

  // ==========================================================================
  // HELPER
  // ==========================================================================

  private updateRoomState(playerId: string): void {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    const engine = this.engines.get(roomId);
    if (!room || !engine) return;

    room.state = engine.getState();
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  cleanupInactiveRooms(maxAge: number = 3600000): void {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    this.rooms.forEach((room, roomId) => {
      // Delete rooms older than maxAge with no active game
      if (now - room.createdAt > maxAge && room.state.gamePhase !== 'playing') {
        roomsToDelete.push(roomId);
      }
    });

    roomsToDelete.forEach(roomId => {
      const room = this.rooms.get(roomId);
      if (room) {
        room.state.players.forEach(p => this.playerRooms.delete(p.id));
      }
      this.deleteRoom(roomId);
    });
  }

  // Statistics
  getStats(): { totalRooms: number; activePlayers: number; matchmakingQueue: number } {
    let activePlayers = 0;
    this.rooms.forEach(room => {
      activePlayers += room.state.players.filter(p => p.isConnected).length;
    });

    return {
      totalRooms: this.rooms.size,
      activePlayers,
      matchmakingQueue: this.matchmakingQueue.length,
    };
  }
}

// Singleton instance
export const roomManager = new RoomManager();
