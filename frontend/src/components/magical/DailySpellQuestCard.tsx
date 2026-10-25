import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, RotateCw, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { magicAudio } from '../../utils/magicAudio';
import { triggerConfetti } from '../../utils/confetti';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

interface DailyQuest {
  id: string;
  spellName: string;
  incantation: string;
  objective: string;
  avoidedCo2: number;
  points: number;
  icon: string;
  sealColor: string;
}

const DAILY_SPELLS: DailyQuest[] = [
  {
    id: 'spell_1',
    spellName: 'Aguamenti Pure Spring Refill',
    incantation: 'Aguamenti Zero-Plasticum!',
    objective: 'Refill your stainless steel thermal flask at any campus filtered water hub. Eliminate 3x single-use PET bottles.',
    avoidedCo2: 1.2,
    points: 30,
    icon: '💧',
    sealColor: '#38BDF8',
  },
  {
    id: 'spell_2',
    spellName: 'Lumos Dorm Phantom Ward',
    incantation: 'Nox Standby Extinguo!',
    objective: 'Extinguish all monitor hubs and laptop chargers from the wall socket before 1 AM. Eliminate 0.8 kWh vampire power.',
    avoidedCo2: 0.9,
    points: 35,
    icon: '⚡',
    sealColor: '#F59E0B',
  },
  {
    id: 'spell_3',
    spellName: 'Accio Green Iron Steed',
    incantation: 'Accio Velocitas Viridis!',
    objective: 'Pedal or brisk-walk 3 kilometers across the campus ring road rather than hailing motor transport.',
    avoidedCo2: 2.1,
    points: 40,
    icon: '🚲',
    sealColor: '#10B981',
  },
  {
    id: 'spell_4',
    spellName: 'Herbology Clean Harvest Bowl',
    incantation: 'Herbology Nutritio Munda!',
    objective: 'Swap one red-meat dining hall meal for a roasted chickpea, sweet potato, and seasonal grain bowl.',
    avoidedCo2: 1.8,
    points: 35,
    icon: '🥗',
    sealColor: '#34D399',
  },
];

export default function DailySpellQuestCard() {
  const { updatePoints, user } = useAuth();
  const { house, houseDetails } = useTheme();
  const [questIndex, setQuestIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const quest = DAILY_SPELLS[questIndex];
  const btnTextColor = house === 'fire' ? '#FFFFFF' : '#000000';

  const handleNextSpell = () => {
    magicAudio.playWandWhoosh();
    setQuestIndex((prev) => (prev + 1) % DAILY_SPELLS.length);
    setCompleted(false);
  };

  const handleCastSpell = () => {
    if (completed) return;
    magicAudio.playWandWhoosh();
    setTimeout(() => {
      magicAudio.playStardustSparkle();
    }, 200);

    setCompleted(true);
    updatePoints((user?.total_points || 0) + quest.points);
    triggerConfetti();
    setShowBadgeModal(true);
  };

  return (
    <>
      <div
        className="p-6 rounded-3xl border shadow-xl relative overflow-hidden text-left space-y-4 transition-colors duration-500"
        style={{
          backgroundColor: houseDetails.surfaceHex,
          borderColor: houseDetails.borderHex,
          boxShadow: `0 4px 30px ${houseDetails.glowHex}`,
        }}
      >
        {/* Glow corner */}
        <div
          className="absolute top-0 right-0 w-48 h-48 blur-[60px] rounded-full pointer-events-none opacity-40"
          style={{ backgroundColor: houseDetails.accentHex }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border"
              style={{
                backgroundColor: `${houseDetails.accentHex}20`,
                color: houseDetails.accentHex,
                borderColor: `${houseDetails.accentHex}40`,
              }}
            >
              <Wand2 size={15} />
            </span>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ color: houseDetails.accentHex }}
            >
              {houseDetails.name.toUpperCase()} · DAILY SPELL QUEST
            </span>
          </div>

          <button
            onClick={handleNextSpell}
            title="Roll new daily spell"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw size={13} />
          </button>
        </div>

        <div className="relative z-10">
          <div className="text-2xl mb-1">{quest.icon}</div>
          <h3 className="font-bold text-lg font-magical text-white">
            {quest.spellName}
          </h3>
          <p
            className="text-[11px] font-serif italic mt-0.5"
            style={{ color: houseDetails.silverHex }}
          >
            "{quest.incantation}"
          </p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {quest.objective}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">-{quest.avoidedCo2} kg CO₂</span>
            <span className="text-slate-500">•</span>
            <span
              className="font-bold"
              style={{ color: houseDetails.accentHex }}
            >
              +{quest.points} pts
            </span>
          </div>

          <button
            onClick={handleCastSpell}
            disabled={completed}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
              completed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'hover:brightness-110'
            }`}
            style={
              !completed
                ? {
                    backgroundColor: houseDetails.accentHex,
                    color: btnTextColor,
                    boxShadow: `0 0 15px ${houseDetails.glowHex}`,
                  }
                : undefined
            }
          >
            <Sparkles size={13} />
            <span>{completed ? 'Spell Mastered ✓' : `Cast Spell (+${quest.points} pts)`}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Cloudinary Enchanted Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0E1A38] via-[#0B132B] to-[#040816] border-2 border-sky-400/50 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-in">
            <button
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="text-4xl animate-bounce-gentle">📜✨</div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold">
                CLOUDINARY DYNAMIC ENCHANTED SEAL
              </span>
              <h3 className="text-xl font-bold font-magical text-white">
                Spell Successfully Cast!
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your eco-action has been recorded in the campus ledger. Cloudinary has stamped your profile with the authentic <strong>{quest.spellName}</strong> parchment badge.
            </p>

            <div className="p-3 rounded-2xl bg-black/50 border border-slate-700 font-mono text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Carbon Mitigated:</span>
                <span className="text-emerald-400 font-bold">-{quest.avoidedCo2} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">House Merit Awarded:</span>
                <span className="text-sky-300 font-bold">+{quest.points} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dynamic Asset:</span>
                <span className="text-amber-300 font-bold">f_auto,q_auto,l_wax_seal</span>
              </div>
            </div>

            <button
              onClick={() => setShowBadgeModal(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Collect Enchanted Badge
            </button>
          </div>
        </div>
      )}
    </>
  );
}
