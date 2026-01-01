// =============================================================================
// MONOPOLY GAME SERVER - MAIN ENTRY POINT
// =============================================================================

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { roomManager } from './roomManager';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ErrorCodes,
  ColorId,
} from './types';

// =============================================================================
// SERVER SETUP
// =============================================================================

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = roomManager.getStats();
  res.json({ status: 'ok', ...stats });
});

// Get public rooms
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getPublicRooms().map(r => ({
    code: r.code,
    playerCount: r.state.players.length,
    maxPlayers: r.state.settings.maxPlayers,
    hostName: r.state.players.find(p => p.isHost)?.name || 'Unknown',
  }));
  res.json(rooms);
});

// =============================================================================
// SOCKET.IO HANDLERS
// =============================================================================

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Send connection established
  socket.emit('connection:established', { playerId: socket.id });

  // =========================================================================
  // ROOM MANAGEMENT
  // =========================================================================

  socket.on('room:create', ({ playerName, isPrivate }) => {
    try {
      const room = roomManager.createRoom(socket.id, playerName, isPrivate);
      
      socket.join(room.id);
      socket.emit('room:created', { roomCode: room.code, roomId: room.id });
      socket.emit('room:joined', { state: room.state });
      
      console.log(`Room created: ${room.code} by ${playerName}`);
    } catch (error) {
      socket.emit('error', { 
        code: 'CREATE_FAILED', 
        message: 'Failed to create room' 
      });
    }
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    try {
      const result = roomManager.joinRoom(roomCode, socket.id, playerName);
      
      if (!result) {
        socket.emit('error', { 
          code: ErrorCodes.ROOM_NOT_FOUND, 
          message: 'Room not found or full' 
        });
        return;
      }

      const { room, player } = result;
      socket.join(room.id);
      socket.emit('room:joined', { state: room.state });
      
      // Notify other players
      socket.to(room.id).emit('room:playerJoined', { player });
      socket.to(room.id).emit('game:stateUpdate', { state: room.state });
      
      console.log(`${playerName} joined room: ${roomCode}`);
    } catch (error) {
      socket.emit('error', { 
        code: 'JOIN_FAILED', 
        message: 'Failed to join room' 
      });
    }
  });

  socket.on('room:leave', () => {
    handlePlayerLeave(socket);
  });

  // =========================================================================
  // MATCHMAKING
  // =========================================================================

  socket.on('matchmaking:join', ({ playerName }) => {
    const result = roomManager.joinMatchmaking(socket.id, playerName);
    socket.emit('matchmaking:searching', { queuePosition: result.position });
    
    // Try to create a match
    tryMatchmaking();
  });

  socket.on('matchmaking:leave', () => {
    roomManager.leaveMatchmaking(socket.id);
    socket.emit('matchmaking:cancelled');
  });

  // =========================================================================
  // PRE-GAME (COLOR SELECTION & READY)
  // =========================================================================

  socket.on('player:selectColor', ({ colorId }) => {
    const result = roomManager.selectColor(socket.id, colorId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.COLOR_TAKEN, 
        message: 'Color is already taken' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('player:colorSelected', { playerId: socket.id, colorId });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('player:ready', () => {
    const result = roomManager.setPlayerReady(socket.id, true);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_ACTION, 
        message: 'Cannot ready - select a color first' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('player:ready', { playerId: socket.id, isReady: true });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('game:start', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    
    if (!room || room.hostId !== socket.id) {
      socket.emit('error', { 
        code: ErrorCodes.NOT_HOST, 
        message: 'Only the host can start the game' 
      });
      return;
    }

    const result = roomManager.startGame(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_ACTION, 
        message: 'Cannot start - not all players ready or need more players' 
      });
      return;
    }

    const updatedRoom = roomManager.getRoomByPlayer(socket.id);
    if (updatedRoom) {
      io.to(updatedRoom.id).emit('game:started', { state: updatedRoom.state });
      io.to(updatedRoom.id).emit('turn:started', { 
        playerId: updatedRoom.state.currentPlayerId,
        timeLimit: updatedRoom.state.settings.turnTimeLimit,
      });
    }
  });

  // =========================================================================
  // GAME ACTIONS
  // =========================================================================

  socket.on('game:rollDice', () => {
    const result = roomManager.rollDice(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.NOT_YOUR_TURN, 
        message: 'Not your turn or cannot roll now' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('turn:diceRolled', { 
        playerId: socket.id, 
        dice: result.dice, 
        isDoubles: result.isDoubles 
      });

      // Auto-move after dice roll
      const moveResult = roomManager.movePlayer(socket.id);
      if (moveResult) {
        io.to(room.id).emit('turn:playerMoved', {
          playerId: socket.id,
          from: moveResult.from,
          to: moveResult.to,
          passedGo: moveResult.passedGo,
        });
      }

      // Send updated state
      const updatedRoom = roomManager.getRoomByPlayer(socket.id);
      if (updatedRoom) {
        io.to(updatedRoom.id).emit('game:stateUpdate', { state: updatedRoom.state });

        // Handle card drawing if landed on chance/community
        if (updatedRoom.state.turnPhase === 'card') {
          const card = roomManager.drawCard(socket.id);
          if (card) {
            io.to(updatedRoom.id).emit('card:drawn', { playerId: socket.id, card });
            const afterCard = roomManager.getRoomByPlayer(socket.id);
            if (afterCard) {
              io.to(afterCard.id).emit('game:stateUpdate', { state: afterCard.state });
            }
          }
        }
      }
    }
  });

  socket.on('game:buyProperty', () => {
    const result = roomManager.buyProperty(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.CANNOT_BUY, 
        message: 'Cannot buy this property' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      const player = room.state.players.find(p => p.id === socket.id);
      const property = room.state.properties.find(p => p.ownerId === socket.id);
      
      if (player && property) {
        io.to(room.id).emit('property:bought', { 
          playerId: socket.id, 
          propertyId: property.id 
        });
      }
      
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('game:declineProperty', () => {
    const result = roomManager.declineProperty(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_ACTION, 
        message: 'Cannot decline property' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      if (room.state.auction) {
        const property = room.state.properties.find(p => p.id === room.state.auction?.propertyId);
        io.to(room.id).emit('auction:started', { 
          auction: room.state.auction,
          property: property!,
        });
      }
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('game:endTurn', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    const result = roomManager.endTurn(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.NOT_YOUR_TURN, 
        message: 'Cannot end turn now' 
      });
      return;
    }

    const updatedRoom = roomManager.getRoomByPlayer(socket.id);
    if (updatedRoom) {
      io.to(updatedRoom.id).emit('turn:ended', { 
        playerId: socket.id,
        nextPlayerId: updatedRoom.state.currentPlayerId,
      });
      io.to(updatedRoom.id).emit('game:stateUpdate', { state: updatedRoom.state });

      // Check for game end
      if (updatedRoom.state.gamePhase === 'ended' && updatedRoom.state.winner) {
        io.to(updatedRoom.id).emit('game:ended', { winner: updatedRoom.state.winner });
      } else {
        io.to(updatedRoom.id).emit('turn:started', { 
          playerId: updatedRoom.state.currentPlayerId,
          timeLimit: updatedRoom.state.settings.turnTimeLimit,
        });
      }
    }
  });

  // =========================================================================
  // JAIL ACTIONS
  // =========================================================================

  socket.on('jail:payFine', () => {
    const result = roomManager.payJailFine(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INSUFFICIENT_FUNDS, 
        message: 'Cannot pay jail fine' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('jail:playerReleased', { 
        playerId: socket.id, 
        method: 'pay' 
      });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('jail:useCard', () => {
    const result = roomManager.useJailCard(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_ACTION, 
        message: 'No jail free cards' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('jail:playerReleased', { 
        playerId: socket.id, 
        method: 'card' 
      });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('jail:rollDice', () => {
    // Use the rollDice handler logic for jail
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) {
      socket.emit('error', { 
        code: ErrorCodes.ROOM_NOT_FOUND, 
        message: 'Room not found' 
      });
      return;
    }
    
    const result = roomManager.rollDice(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.NOT_YOUR_TURN, 
        message: 'Cannot roll dice now' 
      });
      return;
    }

    io.to(room.id).emit('turn:diceRolled', { playerId: socket.id, ...result });
    io.to(room.id).emit('game:stateUpdate', { state: room.state });
  });

  // =========================================================================
  // AUCTION ACTIONS
  // =========================================================================

  socket.on('auction:bid', ({ amount }) => {
    const result = roomManager.placeBid(socket.id, amount);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_BID, 
        message: 'Invalid bid amount' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('auction:bid', { playerId: socket.id, amount });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('auction:pass', () => {
    const result = roomManager.passAuction(socket.id);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.NOT_IN_AUCTION, 
        message: 'Not in auction' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('auction:playerPassed', { playerId: socket.id });
      
      // Check if auction ended
      if (!room.state.auction) {
        const engine = roomManager.getEngine(room.id);
        const auction = engine?.getState().auction;
        io.to(room.id).emit('auction:ended', { 
          winnerId: auction?.currentBidderId || null,
          propertyId: room.state.properties.find(p => p.ownerId === auction?.currentBidderId)?.id || 0,
          amount: auction?.currentBid || 0,
        });
      }
      
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  // =========================================================================
  // TRADE ACTIONS
  // =========================================================================

  socket.on('trade:propose', (trade) => {
    const result = roomManager.proposeTrade(socket.id, trade);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.INVALID_TRADE, 
        message: 'Invalid trade proposal' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('trade:proposed', { trade: result });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('trade:accept', ({ tradeId }) => {
    const result = roomManager.acceptTrade(socket.id, tradeId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.TRADE_NOT_FOUND, 
        message: 'Trade not found or invalid' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      const trade = room.state.trades.find(t => t.id === tradeId);
      if (trade) {
        io.to(room.id).emit('trade:executed', { trade });
      }
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('trade:reject', ({ tradeId }) => {
    const result = roomManager.rejectTrade(socket.id, tradeId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.TRADE_NOT_FOUND, 
        message: 'Trade not found' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('trade:rejected', { tradeId });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('trade:cancel', ({ tradeId }) => {
    const result = roomManager.cancelTrade(socket.id, tradeId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.TRADE_NOT_FOUND, 
        message: 'Trade not found' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('trade:cancelled', { tradeId });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  // =========================================================================
  // BUILDING ACTIONS
  // =========================================================================

  socket.on('property:buildHouse', ({ propertyId }) => {
    const result = roomManager.buildHouse(socket.id, propertyId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.CANNOT_BUILD, 
        message: 'Cannot build house' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      const property = room.state.properties.find(p => p.id === propertyId);
      io.to(room.id).emit('property:houseBuilt', { 
        propertyId, 
        houses: property?.houses || 0 
      });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('property:sellHouse', ({ propertyId }) => {
    const result = roomManager.sellHouse(socket.id, propertyId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.CANNOT_BUILD, 
        message: 'Cannot sell house' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      const property = room.state.properties.find(p => p.id === propertyId);
      io.to(room.id).emit('property:houseSold', { 
        propertyId, 
        houses: property?.houses || 0 
      });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('property:mortgage', ({ propertyId }) => {
    const result = roomManager.mortgage(socket.id, propertyId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.CANNOT_MORTGAGE, 
        message: 'Cannot mortgage property' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('property:mortgaged', { propertyId });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  socket.on('property:unmortgage', ({ propertyId }) => {
    const result = roomManager.unmortgage(socket.id, propertyId);
    
    if (!result) {
      socket.emit('error', { 
        code: ErrorCodes.CANNOT_MORTGAGE, 
        message: 'Cannot unmortgage property' 
      });
      return;
    }

    const room = roomManager.getRoomByPlayer(socket.id);
    if (room) {
      io.to(room.id).emit('property:unmortgaged', { propertyId });
      io.to(room.id).emit('game:stateUpdate', { state: room.state });
    }
  });

  // =========================================================================
  // CHAT
  // =========================================================================

  socket.on('chat:message', ({ message }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (!player) return;

    io.to(room.id).emit('chat:message', {
      playerId: socket.id,
      playerName: player.name,
      message: message.slice(0, 200), // Limit message length
      timestamp: Date.now(),
    });
  });

  // =========================================================================
  // DISCONNECT
  // =========================================================================

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from matchmaking
    roomManager.leaveMatchmaking(socket.id);
    
    // Handle room leave
    handlePlayerLeave(socket);
  });

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  function handlePlayerLeave(socket: Socket) {
    const result = roomManager.leaveRoom(socket.id);
    
    if (result) {
      socket.leave(result.roomId);
      socket.emit('room:left');

      const room = roomManager.getRoom(result.roomId);
      if (room) {
        io.to(result.roomId).emit('room:playerLeft', { playerId: socket.id });
        io.to(result.roomId).emit('game:stateUpdate', { state: room.state });
      }
    }
  }

  function tryMatchmaking() {
    const match = roomManager.processMatchmaking();
    
    if (match) {
      match.players.forEach(player => {
        const playerSocket = io.sockets.sockets.get(player.playerId);
        if (playerSocket) {
          playerSocket.join(match.room.id);
          playerSocket.emit('matchmaking:found', { roomCode: match.room.code });
          playerSocket.emit('room:joined', { state: match.room.state });
        }
      });
    }
  }
});

// =============================================================================
// PERIODIC TASKS
// =============================================================================

// Matchmaking check every 2 seconds
setInterval(() => {
  const match = roomManager.processMatchmaking();
  if (match) {
    match.players.forEach(player => {
      const playerSocket = io.sockets.sockets.get(player.playerId);
      if (playerSocket) {
        playerSocket.join(match.room.id);
        playerSocket.emit('matchmaking:found', { roomCode: match.room.code });
        playerSocket.emit('room:joined', { state: match.room.state });
      }
    });
  }
}, 2000);

// Cleanup inactive rooms every 10 minutes
setInterval(() => {
  roomManager.cleanupInactiveRooms();
}, 600000);

// =============================================================================
// START SERVER
// =============================================================================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🎲 Monopoly Server running on port ${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
