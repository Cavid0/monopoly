'use client';

import { useGame } from '@/context/GameContext';

interface PropertyCardProps {
  propertyId: number;
  onClose: () => void;
}

export default function PropertyCard({ propertyId, onClose }: PropertyCardProps) {
  const { state, currentPlayer, buyProperty, dispatch } = useGame();
  
  const property = state.properties.find(p => p.id === propertyId);
  if (!property) return null;

  const owner = property.ownerId 
    ? state.players.find(p => p.id === property.ownerId)
    : null;

  const canBuy = !owner && 
                 currentPlayer && 
                 currentPlayer.money >= property.price &&
                 currentPlayer.position === propertyId;

  const canBuildHouse = owner?.id === currentPlayer?.id && 
                        property.type === 'property' && 
                        property.houses < 5 &&
                        currentPlayer &&
                        currentPlayer.money >= (property.houseCost || 0);

  const canMortgage = owner?.id === currentPlayer?.id && 
                      !property.isMortgaged &&
                      property.houses === 0;

  const canUnmortgage = owner?.id === currentPlayer?.id && 
                        property.isMortgaged &&
                        currentPlayer &&
                        currentPlayer.money >= Math.floor(property.price * 0.55);

  const handleBuild = () => {
    if (!canBuildHouse || !currentPlayer || !property.houseCost) return;
    dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: -property.houseCost } });
    dispatch({ type: 'BUILD_HOUSE', payload: { propertyId } });
  };

  const handleMortgage = () => {
    if (!canMortgage || !currentPlayer) return;
    const mortgageValue = Math.floor(property.price / 2);
    dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: mortgageValue } });
    dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyId } });
  };

  const handleUnmortgage = () => {
    if (!canUnmortgage || !currentPlayer) return;
    const unmortgageCost = Math.floor(property.price * 0.55);
    dispatch({ type: 'UPDATE_MONEY', payload: { playerId: currentPlayer.id, amount: -unmortgageCost } });
    dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyId } });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#252035] rounded-2xl w-80 overflow-hidden shadow-2xl border border-[#3d3654] transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Color Header */}
        {property.type === 'property' && (
          <div 
            className="h-24 flex items-center justify-center"
            style={{ backgroundColor: property.color }}
          >
            <h2 className="text-xl font-bold text-white drop-shadow-lg text-center px-4">
              {property.name}
            </h2>
          </div>
        )}

        {property.type !== 'property' && (
          <div className="h-24 bg-[#3d3654] flex items-center justify-center">
            <span className="text-5xl">
              {property.type === 'railroad' ? '✈️' : '⚡'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {property.type !== 'property' && (
            <h2 className="text-xl font-bold text-white text-center mb-4">{property.name}</h2>
          )}

          {/* Price */}
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-green-400">${property.price}</span>
          </div>

          {/* Rent Table */}
          <div className="bg-[#1a1625] rounded-lg p-4 mb-4">
            <h4 className="text-sm text-gray-400 mb-2 text-center">RENT</h4>
            <div className="space-y-1 text-sm">
              {property.type === 'property' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base rent:</span>
                    <span className="text-white">${property.rent[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With 1 house:</span>
                    <span className="text-white">${property.rent[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With 2 houses:</span>
                    <span className="text-white">${property.rent[2]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With 3 houses:</span>
                    <span className="text-white">${property.rent[3]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With 4 houses:</span>
                    <span className="text-white">${property.rent[4]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With hotel:</span>
                    <span className="text-[#8b5cf6] font-bold">${property.rent[5]}</span>
                  </div>
                  <hr className="border-[#3d3654] my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-400">House cost:</span>
                    <span className="text-white">${property.houseCost}</span>
                  </div>
                </>
              ) : property.type === 'railroad' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">1 Railroad:</span>
                    <span className="text-white">$25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">2 Railroads:</span>
                    <span className="text-white">$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">3 Railroads:</span>
                    <span className="text-white">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">4 Railroads:</span>
                    <span className="text-[#8b5cf6] font-bold">$200</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">1 Utility:</span>
                    <span className="text-white">4× dice roll</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">2 Utilities:</span>
                    <span className="text-[#8b5cf6] font-bold">10× dice roll</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Owner */}
          {owner && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: owner.color }}
              />
              <span className="text-gray-400">Owned by</span>
              <span className="text-white font-bold">{owner.name}</span>
            </div>
          )}

          {/* Houses */}
          {property.houses > 0 && (
            <div className="flex justify-center gap-1 mb-4">
              {property.houses < 5 ? (
                Array(property.houses).fill(0).map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-green-500 rounded-sm" title="House" />
                ))
              ) : (
                <div className="w-8 h-8 bg-red-500 rounded-sm" title="Hotel" />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {canBuy && (
              <button
                onClick={() => {
                  buyProperty(propertyId);
                  onClose();
                }}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-lg font-bold transition-colors"
              >
                Buy for ${property.price}
              </button>
            )}

            {canBuildHouse && (
              <button
                onClick={handleBuild}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>🏠</span>
                Build {property.houses < 4 ? 'House' : 'Hotel'} (${property.houseCost})
              </button>
            )}

            {canMortgage && (
              <button
                onClick={handleMortgage}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>🏦</span>
                Mortgage (+${Math.floor(property.price / 2)})
              </button>
            )}

            {canUnmortgage && (
              <button
                onClick={handleUnmortgage}
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>💰</span>
                Unmortgage (-${Math.floor(property.price * 0.55)})
              </button>
            )}

            {property.isMortgaged && (
              <div className="text-center text-amber-400 text-sm py-2 bg-amber-400/10 rounded-lg">
                ⚠️ This property is mortgaged
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-[#3d3654] hover:bg-[#4d4670] text-white py-3 rounded-lg font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
