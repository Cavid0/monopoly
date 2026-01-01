'use client';

import { useState } from 'react';

export interface RoomSettings {
  roomName: string;
  maxPlayers: number;
  gameDuration: number; // in minutes, 0 = unlimited
  startingMoney: number;
  turnTimer: number; // in seconds
  isPrivate: boolean;
  // Gameplay rules
  x2RentFullSet: boolean;
  vacationCash: boolean;
  auction: boolean;
  noRentInPrison: boolean;
  mortgage: boolean;
  evenBuild: boolean;
  randomizeOrder: boolean;
}

interface RoomSettingsPanelProps {
  settings: RoomSettings;
  onSettingsChange: (settings: RoomSettings) => void;
  isHost: boolean;
}

// Toggle Switch Component
function Toggle({ 
  value, 
  onChange, 
  disabled = false 
}: { 
  value: boolean; 
  onChange: (val: boolean) => void; 
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${value ? 'bg-[#8b5cf6]' : 'bg-[#3d3654]'}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-md ${
          value ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// Setting Item Component
function SettingItem({ 
  icon, 
  title, 
  description, 
  children 
}: { 
  icon: string;
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#3d3654]/50 last:border-b-0">
      <span className="text-xl mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 ml-2">
        {children}
      </div>
    </div>
  );
}

export default function RoomSettingsPanel({ 
  settings, 
  onSettingsChange, 
  isHost 
}: RoomSettingsPanelProps) {
  const updateSetting = <K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) => {
    if (!isHost) return;
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="h-full flex flex-col bg-[#252035]">
      {/* Header */}
      <div className="p-4 border-b border-[#3d3654]">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          ⚙️ Room Settings
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          {isHost ? 'Configure game rules before starting' : 'Only the host can modify settings'}
        </p>
      </div>

      {/* Settings Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        
        {/* ROOM CONFIGURATION SECTION */}
        <div className="mb-4">
          <h3 className="text-[#8b5cf6] font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-[#8b5cf6]/30"></span>
            Room Configuration
            <span className="flex-1 h-px bg-[#8b5cf6]/30"></span>
          </h3>

          {/* Room Name */}
          <SettingItem
            icon="🏠"
            title="Room Name"
            description="A custom name to identify your game room."
          >
            <input
              type="text"
              value={settings.roomName}
              onChange={(e) => updateSetting('roomName', e.target.value)}
              disabled={!isHost}
              placeholder="My Room"
              className="bg-[#1a1625] border border-[#3d3654] rounded-lg px-3 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
            />
          </SettingItem>

          {/* Max Players */}
          <SettingItem
            icon="👥"
            title="Maximum Players"
            description="The maximum number of players allowed in this room."
          >
            <select
              value={settings.maxPlayers}
              onChange={(e) => updateSetting('maxPlayers', Number(e.target.value))}
              disabled={!isHost}
              className="bg-[#1a1625] border border-[#3d3654] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n} players</option>
              ))}
            </select>
          </SettingItem>

          {/* Game Duration */}
          <SettingItem
            icon="⏱️"
            title="Game Duration"
            description="Maximum game length. The richest player wins when time runs out."
          >
            <select
              value={settings.gameDuration}
              onChange={(e) => updateSetting('gameDuration', Number(e.target.value))}
              disabled={!isHost}
              className="bg-[#1a1625] border border-[#3d3654] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
            >
              <option value={0}>Unlimited</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </SettingItem>

          {/* Starting Money */}
          <SettingItem
            icon="💵"
            title="Starting Money"
            description="How much money each player starts with at the beginning."
          >
            <select
              value={settings.startingMoney}
              onChange={(e) => updateSetting('startingMoney', Number(e.target.value))}
              disabled={!isHost}
              className="bg-[#1a1625] border border-[#3d3654] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={1500}>$1,500</option>
              <option value={2000}>$2,000</option>
              <option value={2500}>$2,500</option>
              <option value={3000}>$3,000</option>
              <option value={5000}>$5,000</option>
            </select>
          </SettingItem>

          {/* Turn Timer */}
          <SettingItem
            icon="⏳"
            title="Turn Timer"
            description="Time limit for each player's turn. Auto-skip if exceeded."
          >
            <select
              value={settings.turnTimer}
              onChange={(e) => updateSetting('turnTimer', Number(e.target.value))}
              disabled={!isHost}
              className="bg-[#1a1625] border border-[#3d3654] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50"
            >
              <option value={0}>No limit</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={90}>1.5 minutes</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
            </select>
          </SettingItem>

          {/* Private Room Toggle */}
          <SettingItem
            icon="🔒"
            title="Private Room"
            description="Private rooms can only be joined with the room URL or code."
          >
            <Toggle
              value={settings.isPrivate}
              onChange={(val) => updateSetting('isPrivate', val)}
              disabled={!isHost}
            />
          </SettingItem>
        </div>

        {/* GAMEPLAY RULES SECTION */}
        <div>
          <h3 className="text-[#8b5cf6] font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-[#8b5cf6]/30"></span>
            Gameplay Rules
            <span className="flex-1 h-px bg-[#8b5cf6]/30"></span>
          </h3>

          {/* x2 Rent on Full Set */}
          <SettingItem
            icon="🏘️"
            title="x2 Rent on Full Set"
            description="Owning all properties in a color group doubles the base rent."
          >
            <Toggle
              value={settings.x2RentFullSet}
              onChange={(val) => updateSetting('x2RentFullSet', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* Vacation Cash */}
          <SettingItem
            icon="🏖️"
            title="Vacation Cash"
            description="Landing on Free Parking collects all taxes and fees paid."
          >
            <Toggle
              value={settings.vacationCash}
              onChange={(val) => updateSetting('vacationCash', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* Auction */}
          <SettingItem
            icon="🔨"
            title="Auction"
            description="Unpurchased properties go to auction for all players to bid."
          >
            <Toggle
              value={settings.auction}
              onChange={(val) => updateSetting('auction', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* No Rent in Prison */}
          <SettingItem
            icon="⛓️"
            title="No Rent While in Jail"
            description="Players in jail cannot collect rent from their properties."
          >
            <Toggle
              value={settings.noRentInPrison}
              onChange={(val) => updateSetting('noRentInPrison', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* Mortgage */}
          <SettingItem
            icon="🏦"
            title="Mortgage"
            description="Allow mortgaging properties for 50% of their purchase price."
          >
            <Toggle
              value={settings.mortgage}
              onChange={(val) => updateSetting('mortgage', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* Even Build */}
          <SettingItem
            icon="🏗️"
            title="Even Build"
            description="Houses must be built evenly across properties in a color set."
          >
            <Toggle
              value={settings.evenBuild}
              onChange={(val) => updateSetting('evenBuild', val)}
              disabled={!isHost}
            />
          </SettingItem>

          {/* Randomize Order */}
          <SettingItem
            icon="🎲"
            title="Randomize Player Order"
            description="Shuffle turn order randomly when the game starts."
          >
            <Toggle
              value={settings.randomizeOrder}
              onChange={(val) => updateSetting('randomizeOrder', val)}
              disabled={!isHost}
            />
          </SettingItem>
        </div>
      </div>

      {/* Footer - Host indicator */}
      <div className="p-4 border-t border-[#3d3654]">
        <div className={`text-center text-xs py-2 px-4 rounded-lg ${
          isHost 
            ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' 
            : 'bg-[#3d3654]/50 text-gray-400'
        }`}>
          {isHost ? '👑 You are the host' : '⏳ Waiting for host to configure'}
        </div>
      </div>
    </div>
  );
}
