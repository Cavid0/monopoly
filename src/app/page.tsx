'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-6 animate-bounce">🎲</div>
        <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-wide">
          <span className="text-white">RICH</span>
          <span className="text-[#8b5cf6]">UP</span>
          <span className="text-gray-400">.IO</span>
        </h1>
        <p className="text-gray-400 text-xl">Real-time Online Monopoly</p>
      </div>

      {/* Multiplayer Button */}
      <Link
        href="/multiplayer"
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-12 py-5 rounded-xl font-bold text-2xl shadow-lg shadow-[#8b5cf6]/30 transition-all hover:scale-105 flex items-center gap-4 mb-8"
      >
        <span className="text-3xl">▶</span>
        Multiplayer Oyna
      </Link>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-8">
        <div className="bg-[#252035] rounded-xl p-6 text-center border border-[#3d3654]">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-white font-bold mb-2">2-8 Oyunçu</h3>
          <p className="text-gray-400 text-sm">Dostlarınızla və ya yad insanlarla oynayın</p>
        </div>
        <div className="bg-[#252035] rounded-xl p-6 text-center border border-[#3d3654]">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-white font-bold mb-2">Real-time</h3>
          <p className="text-gray-400 text-sm">Canlı sinxronizasiya ilə oyun</p>
        </div>
        <div className="bg-[#252035] rounded-xl p-6 text-center border border-[#3d3654]">
          <div className="text-4xl mb-3">🔗</div>
          <h3 className="text-white font-bold mb-3">Asan Qoşulma</h3>
          <p className="text-gray-400 text-sm">Link paylaşın, dəqiqələr içində başlayın</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 text-gray-500 text-sm">
        © 2025 RichUp.io - Pulsuz Onlayn Monopoly
      </footer>
    </div>
  );
}
