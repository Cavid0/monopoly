'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  text: string;
  timestamp: Date;
}

export default function Chat() {
  const { state, currentPlayer } = useGame();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      playerId: 'system',
      playerName: 'System',
      playerColor: '#8b5cf6',
      text: 'Game started with a randomized players order. Good luck!',
      timestamp: new Date(),
    }
  ]);

  const handleSend = () => {
    if (!message.trim() || !currentPlayer) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      text: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b border-[#3d3654] flex items-center gap-3">
        <button className="text-gray-400 hover:text-white transition-colors">
          🔊
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          ⚙️
        </button>
        <h3 className="text-[#8b5cf6] font-semibold">Chat</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            <div 
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: msg.playerColor }}
            >
              {msg.playerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="chat-bubble">
                <span className="text-gray-400 text-xs font-medium">{msg.playerName}</span>
                <p className="text-white text-sm break-words">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
            🎲
          </div>
          <span className="flex items-center gap-1">
            <span className="animate-pulse">...</span>
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#3d3654]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Say something..."
            className="flex-1 bg-[#1a1625] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-[#3d3654] hover:bg-[#8b5cf6] disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
