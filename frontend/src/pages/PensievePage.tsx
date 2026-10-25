import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, RotateCcw, Calendar, CheckCircle2,
  Award, Eye, ExternalLink, X, Shield, ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { magicAudio } from '../utils/magicAudio';
import { triggerConfetti } from '../utils/confetti';

interface PensieveMemory {
  id: string;
  title: string;
  date: string;
  semester: string;
  category: 'commute' | 'dining' | 'thrift' | 'energy';
  avoided_co2_kg: number;
  points_earned: number;
  vialColor: string;
  glowHex: string;
  previewQuote: string;
  fullStory: string;
  cloudinaryImage: string;
  waxSeal: string;
  verifiedBy: string;
}

const HISTORICAL_MEMORIES: PensieveMemory[] = [
  {
    id: 'mem_1',
    title: 'Autumn 42-Kilometer Water Channel Odyssey',
    date: 'October 14, 2026',
    semester: 'Autumn 2026',
    category: 'commute',
    avoided_co2_kg: 8.8,
    points_earned: 240,
    vialColor: 'from-sky-400 to-blue-600',
    glowHex: '#38BDF8',
    previewQuote: 'Pedaled through heavy morning mist across campus water paths...',
    fullStory: 'A pristine week where all motor transport was banished. Logged 42 cumulative kilometers on the campus pedal cycle along the water canals between Aryabhata Hostel and the Quantum Computing labs. Zero carbon fumes emitted.',
    cloudinaryImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    waxSeal: '🌊 Water House Seal of Velocity (Blue & Silver)',
    verifiedBy: 'Cloudinary Google Vision AI (Confidence 99.1%)',
  },
  {
    id: 'mem_2',
    title: 'The Great Dining Hall Clean Wind Plant Feast',
    date: 'September 28, 2026',
    semester: 'Autumn 2026',
    category: 'dining',
    avoided_co2_kg: 14.5,
    points_earned: 350,
    vialColor: 'from-emerald-400 to-teal-600',
    glowHex: '#10B981',
    previewQuote: 'Seven unbroken days of crisp salads and spiced chickpea bowls...',
    fullStory: 'Replaced all high-emissions red meat dining hall entrees with nutrient-dense legumes, seasonal roasted root vegetables, and campus greenhouse greens. Slashed personal dietary footprint by 78%.',
    cloudinaryImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    waxSeal: '🌪️ Air House Seal of Clean Dining (Emerald & Silver)',
    verifiedBy: 'Dining Hall NFC Smart Register + Cloudinary Proof',
  },
  {
    id: 'mem_3',
    title: 'Circular Exchange of Advanced Thermodynamics',
    date: 'September 12, 2026',
    semester: 'Autumn 2026',
    category: 'thrift',
    avoided_co2_kg: 22.0,
    points_earned: 420,
    vialColor: 'from-yellow-400 to-amber-600',
    glowHex: '#FFE600',
    previewQuote: 'Handed down 3 pristine engineering tomes to incoming first-years...',
    fullStory: 'Prevented virgin timber pulp felling and toxic solvent book printing. Exchanged Calculus & Thermal Physics reference volumes via the PW IOI Circular Thrift Club with a junior in Bhabha Hall.',
    cloudinaryImage: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=800&q=80',
    waxSeal: '🌿 Earth House Seal of Circular Stewardship (Yellow & Black)',
    verifiedBy: 'Campus Circular Thrift Club Ledger',
  },
  {
    id: 'mem_4',
    title: 'Midnight Standby Flame Ward in Dorm Room',
    date: 'August 30, 2026',
    semester: 'Autumn 2026',
    category: 'energy',
    avoided_co2_kg: 6.4,
    points_earned: 180,
    vialColor: 'from-red-500 to-amber-600',
    glowHex: '#EF4444',
    previewQuote: 'All electronics unplugged at 1 AM. Zero vampire wattage drawn...',
    fullStory: 'Banished standby electricity drains across monitors, gaming hubs, and heating coils for 30 consecutive nights. Smart plug verified zero vampire draw between 1 AM and 7 AM.',
    cloudinaryImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    waxSeal: '🔥 Fire House Seal of Vigilant Power (Red & Golden)',
    verifiedBy: 'Tuya Smart Plug Telemetry Stream',
  },
  {
    id: 'mem_5',
    title: 'Starlight Zero-Lumen Midnight Ward',
    date: 'August 15, 2026',
    semester: 'Autumn 2026',
    category: 'energy',
    avoided_co2_kg: 9.2,
    points_earned: 260,
    vialColor: 'from-slate-300 via-slate-500 to-slate-900',
    glowHex: '#E2E8F0',
    previewQuote: 'Cosmic silence and zero ambient lumen waste during night study...',
    fullStory: 'Pioneered campus starlight pods utilizing passive daylight reflectors and zero artificial lumens during late night revision sessions.',
    cloudinaryImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    waxSeal: '🌌 Space House Seal of Cosmic Purity (Black & Silver)',
    verifiedBy: 'Campus Energy Monitor Telemetry',
  },
];

export default function PensievePage() {
  const { houseDetails } = useTheme();
  const [selectedMemory, setSelectedMemory] = useState<PensieveMemory | null>(null);
  const [swirlPhase, setSwirlPhase] = useState(0);

  const handleInspect = (mem: PensieveMemory) => {
    magicAudio.playSilverChime();
    setSelectedMemory(mem);
  };

  const handleSwirl = () => {
    magicAudio.playWandWhoosh();
    setSwirlPhase((p) => p + 1);
    triggerConfetti();
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0B132B] text-sky-400 border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              THE PENSIEVE ARCHIVE
            </span>
            <span className="text-xs font-mono text-slate-400">HISTORICAL MEMORY BASIN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-magical tracking-tight text-white">
            The Carbon <span className="text-silver-shimmer italic">Pensieve Vault</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            A sacred basin where past sustainability deeds swirl as crystalline liquid memories. 
            Extract glowing memory flasks from past months to review verified carbon mitigation deeds.
          </p>
        </div>

        <button
          onClick={handleSwirl}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-[#131F42] border border-slate-600 hover:border-sky-400 text-sky-300 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Swirl the Silver Waters</span>
        </button>
      </div>

      {/* The Pensieve Basin Visualizer */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#090D16] via-[#0B132B] to-[#040816] border-2 border-slate-600/80 shadow-[0_0_50px_rgba(56,189,248,0.15)] overflow-hidden text-center">
        {/* Floating Silver Mist Particles in Basin */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] rounded-full border border-sky-400/20 blur-sm pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] rounded-full border border-slate-400/30 blur-xs pointer-events-none" />

        <div className="relative z-10 space-y-3 mb-8">
          <div className="text-2xl">✨ 🏺 ✨</div>
          <h2 className="text-xl sm:text-2xl font-bold font-magical text-white">
            Swirling Silver Basin of Past Offsets
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Click upon any memory vial floating in the shimmering currents to extract its verified Cloudinary photographic certificate.
          </p>
        </div>

        {/* Interactive Floating Memory Vials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {HISTORICAL_MEMORIES.map((mem, idx) => (
            <div
              key={mem.id}
              onClick={() => handleInspect(mem)}
              className="p-5 rounded-2xl bg-[#070D1E]/90 hover:bg-[#0E1A38] border border-slate-700 hover:border-sky-400 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-left flex flex-col justify-between group"
              style={{
                boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 15px ${mem.glowHex}25`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {/* Glowing Vial Icon */}
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${mem.vialColor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                    {mem.semester}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white font-magical line-clamp-2 mb-1 group-hover:text-sky-300 transition-colors">
                  {mem.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{mem.previewQuote}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">-{mem.avoided_co2_kg} kg CO₂</span>
                <span className="text-sky-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Extract</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ornate Filigree Line */}
      <div className="filigree-divider" />

      {/* Summary Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-700/60 text-left">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Crystallized Memories</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">4 Vials</div>
          <div className="text-[11px] text-sky-400/80 font-mono">Autumn 2026 Archive</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-700/60 text-left">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Lifetime Avoided CO₂</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">51.7 kg</div>
          <div className="text-[11px] text-slate-400 font-mono">All verified actions</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-700/60 text-left">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Historical Eco-Points</div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-1">1,190 pts</div>
          <div className="text-[11px] text-slate-400 font-mono">Awarded to house tally</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-700/60 text-left">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Parchment Certificates</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">4 Wax Seals</div>
          <div className="text-[11px] text-slate-400 font-mono">Permanent proof stored</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXTRACTED MEMORY HOLOGRAPHIC MODAL                      */}
      {/* ======================================================== */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0E1A38] via-[#0B132B] to-[#040816] border-2 border-sky-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(56,189,248,0.3)] space-y-5 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
                <Sparkles size={12} />
                <span>EXTRACTED CRYSTAL MEMORY · {selectedMemory.date}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-magical text-white">
                {selectedMemory.title}
              </h2>
            </div>

            {/* Cloudinary Photographic Proof Display */}
            <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 border border-slate-700/80 bg-slate-900 shadow-inner">
              <img
                src={selectedMemory.cloudinaryImage}
                alt={selectedMemory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>{selectedMemory.waxSeal}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                  Cloudinary Verified Proof
                </span>
              </div>
            </div>

            {/* Story */}
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">MEMOIR RECOLLECTION</div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {selectedMemory.fullStory}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#070D1E] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">AVOIDED CO₂</div>
                <div className="text-lg font-black font-mono text-emerald-400">{selectedMemory.avoided_co2_kg} kg</div>
              </div>
              <div className="p-3 rounded-xl bg-[#070D1E] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">HOUSE MERIT</div>
                <div className="text-lg font-black font-mono text-sky-300">+{selectedMemory.points_earned} pts</div>
              </div>
              <div className="p-3 rounded-xl bg-[#070D1E] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">AUTHENTICATION</div>
                <div className="text-xs font-mono font-bold text-amber-300 mt-1">Wax Sealed 📜</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400 border-t border-slate-800">
              <span>{selectedMemory.verifiedBy}</span>
              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors"
              >
                Return to Silver Waters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
