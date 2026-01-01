'use client';

import { useState } from 'react';

interface Settings {
  maxPlayers: number;
  privateRoom: boolean;
  allowBots: boolean;
  x2RentFullSet: boolean;
  vacationCash: boolean;
  auction: boolean;
  noRentInPrison: boolean;
  mortgage: boolean;
  evenBuild: boolean;
  startingCash: number;
  randomizeOrder: boolean;
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    maxPlayers: 4,
    privateRoom: false,
    allowBots: true,
    x2RentFullSet: false,
    vacationCash: false,
    auction: false,
    noRentInPrison: false,
    mortgage: true,
    evenBuild: true,
    startingCash: 1500,
    randomizeOrder: true,
  });

  const [expanded, setExpanded] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="w-9 h-5 rounded-full transition-colors relative flex-shrink-0"
      style={{ backgroundColor: value ? '#8b5cf6' : '#3d3654' }}
    >
      <div
        className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform"
        style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );

  const SettingRow = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string; 
    description: string; 
    children: React.ReactNode;
  }) => (
    <div className="py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-xs">{label}</span>
        {children}
      </div>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{description}</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-gray-400 text-sm hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">⚙️ Room Settings</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="space-y-1 text-xs">
          {/* Maximum players */}
          <SettingRow 
            label="Maximum players" 
            description="Number of players that can join this room"
          >
            <select
              value={settings.maxPlayers}
              onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })}
              className="bg-[#3d3654] text-white px-2 py-1 rounded text-xs border-none focus:outline-none"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </SettingRow>

          {/* Private room */}
          <SettingRow 
            label="Private room" 
            description="Only players with the link can join"
          >
            <Toggle value={settings.privateRoom} onChange={(val) => setSettings({ ...settings, privateRoom: val })} />
          </SettingRow>

          {/* Allow bots */}
          <SettingRow 
            label="Allow bots" 
            description="AI players will fill empty slots"
          >
            <div className="flex items-center gap-1">
              <span className="bg-[#8b5cf6] text-[9px] px-1 rounded">Beta</span>
              <Toggle value={settings.allowBots} onChange={(val) => setSettings({ ...settings, allowBots: val })} />
            </div>
          </SettingRow>

          {/* Board map */}
          <div className="py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">Board map</span>
              <span className="text-[#8b5cf6] text-xs cursor-pointer hover:underline">Classic ›</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Choose your game board theme</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#3d3654] my-2 pt-2">
            <p className="text-[#8b5cf6] text-center text-xs font-medium mb-2">Gameplay Rules</p>
          </div>

          {/* x2 rent */}
          <SettingRow 
            label="x2 rent on full-set" 
            description="Double rent when owning all properties in a color group"
          >
            <Toggle value={settings.x2RentFullSet} onChange={(val) => setSettings({ ...settings, x2RentFullSet: val })} />
          </SettingRow>

          {/* Vacation cash */}
          <SettingRow 
            label="Vacation cash" 
            description="Collect taxes when landing on Free Parking"
          >
            <Toggle value={settings.vacationCash} onChange={(val) => setSettings({ ...settings, vacationCash: val })} />
          </SettingRow>

          {/* Auction */}
          <SettingRow 
            label="Auction" 
            description="Unpurchased properties go to auction"
          >
            <Toggle value={settings.auction} onChange={(val) => setSettings({ ...settings, auction: val })} />
          </SettingRow>

          {/* No rent in prison */}
          <SettingRow 
            label="No rent in prison" 
            description="Players in jail cannot collect rent"
          >
            <Toggle value={settings.noRentInPrison} onChange={(val) => setSettings({ ...settings, noRentInPrison: val })} />
          </SettingRow>

          {/* Mortgage */}
          <SettingRow 
            label="Mortgage" 
            description="Mortgage properties to bank for 50% value"
          >
            <Toggle value={settings.mortgage} onChange={(val) => setSettings({ ...settings, mortgage: val })} />
          </SettingRow>

          {/* Even build */}
          <SettingRow 
            label="Even build" 
            description="Houses must be built evenly across color group"
          >
            <Toggle value={settings.evenBuild} onChange={(val) => setSettings({ ...settings, evenBuild: val })} />
          </SettingRow>

          {/* Starting cash */}
          <SettingRow 
            label="Starting cash" 
            description="Amount of money each player starts with"
          >
            <select
              value={settings.startingCash}
              onChange={(e) => setSettings({ ...settings, startingCash: Number(e.target.value) })}
              className="bg-[#3d3654] text-white px-2 py-1 rounded text-xs border-none focus:outline-none"
            >
              {[500, 1000, 1500, 2000, 2500, 3000].map(n => (
                <option key={n} value={n}>${n}</option>
              ))}
            </select>
          </SettingRow>

          {/* Randomize order */}
          <SettingRow 
            label="Randomize order" 
            description="Shuffle player turn order at game start"
          >
            <Toggle value={settings.randomizeOrder} onChange={(val) => setSettings({ ...settings, randomizeOrder: val })} />
          </SettingRow>
        </div>
      )}
    </div>
  );
}
