'use client';

import { useGame } from '@/context/GameContext';

interface GameBoardProps {
  onPropertyClick?: (id: number) => void;
}

// RichUp style property group colors
const GROUP_COLORS: Record<string, string> = {
  brown: '#8B6914',
  lightBlue: '#5BC0DE', 
  pink: '#E91E8C',
  orange: '#FF8C00',
  red: '#DC143C',
  yellow: '#D4AF37',
  green: '#228B22',
  blue: '#0066CC',
};

// Board data matching the RichUp.io image exactly
const BOARD_DATA: Record<number, { flag?: string; name: string; price?: number; type: string; group?: string }> = {
  // Top row (left to right): START -> In Prison
  0: { name: 'START', type: 'corner' },
  1: { flag: '🇧🇷', name: 'Salvador', price: 60, type: 'property', group: 'brown' },
  2: { name: 'Treasure', type: 'chest' },
  3: { flag: '🇧🇷', name: 'Rio', price: 60, type: 'property', group: 'brown' },
  4: { name: 'Income Tax', type: 'tax' },
  5: { name: 'TLV Airport', price: 200, type: 'railroad' },
  6: { flag: '🇮🇱', name: 'Tel Aviv', price: 100, type: 'property', group: 'lightBlue' },
  7: { name: 'Surprise', type: 'chance' },
  8: { flag: '🇮🇱', name: 'Haifa', price: 100, type: 'property', group: 'lightBlue' },
  9: { flag: '🇮🇱', name: 'Jerusalem', price: 120, type: 'property', group: 'lightBlue' },
  10: { name: 'In Prison', type: 'corner' },
  
  // Right column (top to bottom): Venice -> Vacation
  11: { flag: '🇮🇹', name: 'Venice', price: 140, type: 'property', group: 'pink' },
  12: { name: 'Electric Company', price: 150, type: 'utility' },
  13: { flag: '🇮🇹', name: 'Milan', price: 140, type: 'property', group: 'pink' },
  14: { flag: '🇮🇹', name: 'Rome', price: 160, type: 'property', group: 'pink' },
  15: { name: 'MUC Airport', price: 200, type: 'railroad' },
  16: { flag: '🇩🇪', name: 'Frankfurt', price: 180, type: 'property', group: 'orange' },
  17: { name: 'Treasure', type: 'chest' },
  18: { flag: '🇩🇪', name: 'Munich', price: 180, type: 'property', group: 'orange' },
  19: { flag: '🇩🇪', name: 'Berlin', price: 200, type: 'property', group: 'orange' },
  20: { name: 'Vacation', type: 'corner' },
  
  // Bottom row (right to left): Shenzhen -> Go to Prison
  21: { flag: '🇨🇳', name: 'Shenzhen', price: 220, type: 'property', group: 'red' },
  22: { name: 'Surprise', type: 'chance' },
  23: { flag: '🇨🇳', name: 'Beijing', price: 220, type: 'property', group: 'red' },
  24: { flag: '🇨🇳', name: 'Shanghai', price: 240, type: 'property', group: 'red' },
  25: { name: 'CDG Airport', price: 200, type: 'railroad' },
  26: { flag: '🇫🇷', name: 'Lyon', price: 260, type: 'property', group: 'yellow' },
  27: { flag: '🇫🇷', name: 'Toulouse', price: 260, type: 'property', group: 'yellow' },
  28: { name: 'Water Company', price: 150, type: 'utility' },
  29: { flag: '🇫🇷', name: 'Paris', price: 280, type: 'property', group: 'yellow' },
  30: { name: 'Go to prison', type: 'corner' },
  
  // Left column (bottom to top): Liverpool -> New York
  31: { flag: '🇬🇧', name: 'Liverpool', price: 300, type: 'property', group: 'green' },
  32: { flag: '🇬🇧', name: 'Manchester', price: 300, type: 'property', group: 'green' },
  33: { name: 'Treasure', type: 'chest' },
  34: { flag: '🇬🇧', name: 'London', price: 320, type: 'property', group: 'green' },
  35: { name: 'JFK Airport', price: 200, type: 'railroad' },
  36: { name: 'Surprise', type: 'chance' },
  37: { flag: '🇺🇸', name: 'San Francisco', price: 350, type: 'property', group: 'blue' },
  38: { name: 'Luxury Tax', type: 'tax' },
  39: { flag: '🇺🇸', name: 'New York', price: 400, type: 'property', group: 'blue' },
};

export default function GameBoard({ onPropertyClick }: GameBoardProps) {
  const { state, currentPlayer } = useGame();

  const getPlayersOnPosition = (position: number) => {
    return state.players.filter(p => p.position === position && !p.isBankrupt);
  };

  // Render a corner cell
  const renderCorner = (posId: number, style: React.CSSProperties) => {
    const data = BOARD_DATA[posId];
    const players = getPlayersOnPosition(posId);
    const isCurrentPosition = currentPlayer?.position === posId;

    return (
      <div
        key={posId}
        className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all
          ${isCurrentPosition ? 'ring-2 ring-purple-400 z-20' : ''}`}
        style={{
          ...style,
          background: posId === 0 
            ? 'linear-gradient(135deg, #2d5a3d 0%, #1a3d2a 100%)' 
            : 'linear-gradient(135deg, #2a2545 0%, #1e1a35 100%)',
          borderRadius: 6,
        }}
        onClick={() => onPropertyClick?.(posId)}
      >
        {posId === 0 && (
          <>
            <div className="text-3xl">🐦</div>
            <div className="text-xs font-bold text-green-400 mt-1">START</div>
          </>
        )}
        {posId === 10 && (
          <div className="flex flex-col items-center">
            <div className="text-[9px] text-gray-400 mb-1">Passing by</div>
            <div className="w-12 h-12 bg-[#1a1625] rounded-lg border border-gray-600 flex items-center justify-center">
              <span className="text-2xl">⛓️</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-1">In Prison</div>
          </div>
        )}
        {posId === 20 && (
          <>
            <div className="text-3xl">🏖️</div>
            <div className="text-[10px] font-medium text-gray-300 mt-1">Vacation</div>
          </>
        )}
        {posId === 30 && (
          <>
            <div className="text-3xl">👮</div>
            <div className="text-[9px] font-medium text-gray-300 mt-1">Go to prison</div>
          </>
        )}
        
        {/* Players on corner */}
        {players.length > 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {players.slice(0, 4).map((player) => (
              <div
                key={player.id}
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: player.color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render a regular property cell (horizontal - top/bottom rows)
  const renderHorizontalCell = (posId: number, style: React.CSSProperties, isFlipped: boolean = false) => {
    const data = BOARD_DATA[posId];
    if (!data) return null;
    
    const property = state.properties.find(p => p.id === posId);
    const players = getPlayersOnPosition(posId);
    const isCurrentPosition = currentPlayer?.position === posId;
    const groupColor = data.group ? GROUP_COLORS[data.group] : null;

    return (
      <div
        key={posId}
        className={`absolute cursor-pointer transition-all overflow-hidden
          ${isCurrentPosition ? 'ring-2 ring-purple-400 z-20' : 'hover:brightness-110'}`}
        style={{
          ...style,
          background: 'linear-gradient(180deg, #2a2545 0%, #1e1a35 100%)',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => onPropertyClick?.(posId)}
      >
        {/* Content wrapper - flip for bottom row */}
        <div className={`w-full h-full flex flex-col ${isFlipped ? 'flex-col-reverse' : ''}`}>
          {/* Color bar */}
          {groupColor && (
            <div 
              className="w-full h-3 flex-shrink-0"
              style={{ background: groupColor }}
            />
          )}

          {/* Price at top for flipped cells */}
          {isFlipped && data.price && (
            <div className="text-[9px] font-bold text-gray-400 text-center">{data.price}$</div>
          )}

          {/* Cell content */}
          <div className={`flex-1 flex flex-col items-center justify-center ${!groupColor && !isFlipped ? 'pt-1' : ''}`}>
            {/* Flag or icon */}
            {data.flag && <span className="text-xl leading-none">{data.flag}</span>}
            
            {/* Special icons */}
            {data.type === 'railroad' && <span className="text-lg">✈️</span>}
            {data.type === 'utility' && data.name.includes('Electric') && <span className="text-lg">⚡</span>}
            {data.type === 'utility' && data.name.includes('Water') && <span className="text-lg">💧</span>}
            {data.type === 'chest' && <span className="text-lg">📦</span>}
            {data.type === 'chance' && <span className="text-lg">❓</span>}
            {data.type === 'tax' && data.name.includes('Income') && (
              <div className="flex flex-col items-center">
                <span className="text-base">💵</span>
                <span className="text-[8px] text-gray-400">%10</span>
              </div>
            )}
            {data.type === 'tax' && data.name.includes('Luxury') && (
              <div className="flex flex-col items-center">
                <span className="text-base">💎</span>
                <span className="text-[8px] text-gray-400">$75</span>
              </div>
            )}

            {/* Name */}
            <span className="text-[8px] font-medium text-gray-200 text-center leading-tight mt-0.5 px-0.5">
              {data.name}
            </span>
          </div>

          {/* Price at bottom for normal cells */}
          {!isFlipped && data.price && (
            <div className="text-[9px] font-bold text-gray-400 text-center pb-0.5">{data.price}$</div>
          )}
        </div>

        {/* Owner indicator */}
        {property?.ownerId && (
          <div
            className="absolute top-3 right-0.5 w-2.5 h-2.5 rounded-full border border-white"
            style={{ backgroundColor: state.players.find(p => p.id === property.ownerId)?.color }}
          />
        )}

        {/* Players */}
        {players.length > 0 && (
          <div className={`absolute ${isFlipped ? 'top-1' : 'bottom-1'} left-1/2 -translate-x-1/2 flex gap-0.5`}>
            {players.slice(0, 3).map((player) => (
              <div
                key={player.id}
                className="w-3 h-3 rounded-full border border-white shadow"
                style={{ backgroundColor: player.color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render a vertical cell (left/right columns)
  const renderVerticalCell = (posId: number, style: React.CSSProperties, isRight: boolean = false) => {
    const data = BOARD_DATA[posId];
    if (!data) return null;
    
    const property = state.properties.find(p => p.id === posId);
    const players = getPlayersOnPosition(posId);
    const isCurrentPosition = currentPlayer?.position === posId;
    const groupColor = data.group ? GROUP_COLORS[data.group] : null;

    return (
      <div
        key={posId}
        className={`absolute cursor-pointer transition-all overflow-hidden
          ${isCurrentPosition ? 'ring-2 ring-purple-400 z-20' : 'hover:brightness-110'}`}
        style={{
          ...style,
          background: 'linear-gradient(180deg, #2a2545 0%, #1e1a35 100%)',
          borderRadius: 4,
        }}
        onClick={() => onPropertyClick?.(posId)}
      >
        {/* Content wrapper - rotated for vertical display */}
        <div 
          className="w-full h-full flex flex-col"
          style={{
            transform: isRight ? 'rotate(-90deg)' : 'rotate(90deg)',
            transformOrigin: 'center center',
            width: style.height,
            height: style.width,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: isRight ? -(style.height as number) / 2 : -(style.height as number) / 2,
            marginTop: -(style.width as number) / 2,
          }}
        >
          {/* Color bar at top */}
          {groupColor && (
            <div 
              className="w-full h-3 flex-shrink-0"
              style={{ background: groupColor }}
            />
          )}

          {/* Cell content - stacked vertically */}
          <div className="flex-1 flex flex-col items-center justify-center p-0.5">
            {/* Flag or icon */}
            {data.flag && <span className="text-lg leading-none">{data.flag}</span>}
            
            {/* Special icons */}
            {data.type === 'railroad' && <span className="text-base">✈️</span>}
            {data.type === 'utility' && data.name.includes('Electric') && <span className="text-base">⚡</span>}
            {data.type === 'utility' && data.name.includes('Water') && <span className="text-base">💧</span>}
            {data.type === 'chest' && <span className="text-base">📦</span>}
            {data.type === 'chance' && <span className="text-base">❓</span>}
            {data.type === 'tax' && <span className="text-base">💎</span>}

            {/* Name */}
            <span className="text-[7px] font-medium text-gray-200 text-center leading-tight mt-0.5 px-0.5 truncate w-full">
              {data.name}
            </span>

            {/* Price */}
            {data.price && (
              <span className="text-[8px] font-bold text-gray-400">{data.price}$</span>
            )}
          </div>
        </div>

        {/* Owner indicator */}
        {property?.ownerId && (
          <div
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white"
            style={{ backgroundColor: state.players.find(p => p.id === property.ownerId)?.color }}
          />
        )}

        {/* Players */}
        {players.length > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {players.slice(0, 3).map((player) => (
              <div
                key={player.id}
                className="w-3 h-3 rounded-full border border-white shadow"
                style={{ backgroundColor: player.color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Board dimensions
  const boardSize = 680;
  const cornerSize = 70;
  const cellCount = 9;
  const cellWidth = (boardSize - 2 * cornerSize) / cellCount;
  const cellHeight = cornerSize;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ 
        width: boardSize + 20, 
        height: boardSize + 20,
        background: 'linear-gradient(145deg, #1a1625 0%, #0f0c18 100%)',
        padding: 10,
      }}
    >
      {/* Board container */}
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          background: '#13101c',
          borderRadius: 12,
          border: '2px solid #2d2640',
        }}
      >
        {/* Center area */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            top: cornerSize,
            left: cornerSize,
            right: cornerSize,
            bottom: cornerSize,
            background: 'radial-gradient(ellipse at center, #1a1530 0%, #0f0c18 100%)',
            borderRadius: 8,
          }}
        >
          {/* Center decoration */}
          <div className="text-[100px] font-bold text-purple-500/10 select-none">M</div>
        </div>

        {/* Corners */}
        {renderCorner(0, { top: 0, left: 0, width: cornerSize, height: cornerSize })}
        {renderCorner(10, { top: 0, left: boardSize - cornerSize, width: cornerSize, height: cornerSize })}
        {renderCorner(20, { top: boardSize - cornerSize, left: boardSize - cornerSize, width: cornerSize, height: cornerSize })}
        {renderCorner(30, { top: boardSize - cornerSize, left: 0, width: cornerSize, height: cornerSize })}

        {/* Top row (positions 1-9) */}
        {Array.from({ length: 9 }, (_, i) => {
          const posId = i + 1;
          return renderHorizontalCell(posId, {
            top: 0,
            left: cornerSize + (i * cellWidth),
            width: cellWidth,
            height: cellHeight,
          });
        })}

        {/* Right column (positions 11-19) */}
        {Array.from({ length: 9 }, (_, i) => {
          const posId = i + 11;
          return renderVerticalCell(posId, {
            top: cornerSize + (i * cellWidth),
            left: boardSize - cornerSize,
            width: cornerSize,
            height: cellWidth,
          }, true);
        })}

        {/* Bottom row (positions 21-29) - right to left */}
        {Array.from({ length: 9 }, (_, i) => {
          const posId = 21 + i;
          return renderHorizontalCell(posId, {
            top: boardSize - cellHeight,
            left: boardSize - cornerSize - ((i + 1) * cellWidth),
            width: cellWidth,
            height: cellHeight,
          }, true);
        })}

        {/* Left column (positions 31-39) - bottom to top */}
        {Array.from({ length: 9 }, (_, i) => {
          const posId = 31 + i;
          return renderVerticalCell(posId, {
            top: boardSize - cornerSize - ((i + 1) * cellWidth),
            left: 0,
            width: cornerSize,
            height: cellWidth,
          }, false);
        })}
      </div>
    </div>
  );
}
