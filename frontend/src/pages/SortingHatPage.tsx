import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Award, ArrowRight, CheckCircle2, RotateCcw,
  Shield, Compass, Flame, Leaf, Feather
} from 'lucide-react';
import { useTheme, type HouseTheme, ELEMENTAL_HOUSES } from '../context/ThemeContext';
import { magicAudio } from '../utils/magicAudio';
import { triggerConfetti } from '../utils/confetti';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    house: HouseTheme;
    icon: string;
    caption: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'How do you traverse the campus grounds between dawn lectures?',
    options: [
      {
        text: 'Pedaling my geared iron steed along the water channels with scientific cadence and telemetry tracking.',
        house: 'water',
        icon: '🌊',
        caption: 'Fluid kinetic velocity & precise telemetry (Blue and Silver).'
      },
      {
        text: 'Strolling peacefully on unpaved earthen trails, grounding with soil and fresh campus air.',
        house: 'earth',
        icon: '🌿',
        caption: 'Grounded, patient zero-waste stewardship (Yellow and Black).'
      },
      {
        text: 'Power-sprinting through all morning tempests, driven by raw physical endurance.',
        house: 'fire',
        icon: '🔥',
        caption: 'Bold endurance, hearty courage & grit (Red and Golden).'
      },
      {
        text: 'Gliding across high breezy walkways, optimizing every shortcut with strategic speed.',
        house: 'air',
        icon: '🌪️',
        caption: 'Swift, resourceful ambition navigating currents (Emerald and Silver).'
      },
      {
        text: 'Dawn cosmic stroll under fading constellations, mindfully traversing the silent quad.',
        house: 'space',
        icon: '🌌',
        caption: 'Boundless cosmic poise & ethereal clarity (Black and Silver).'
      },
    ],
  },
  {
    id: 2,
    question: 'What fills your plate when dining at the Great Campus Hall?',
    options: [
      {
        text: 'High-protein legume bowls & cold-pressed hydration mathematically mapped for clean fuel.',
        house: 'water',
        icon: '🥣',
        caption: 'Scientific nutritional optimization with zero emissions.'
      },
      {
        text: 'Sun-ripened greenhouse vegetables and roasted root crops freshly harvested from local soil.',
        house: 'earth',
        icon: '🥕',
        caption: 'Earth-honoring harvest from soil to bowl.'
      },
      {
        text: 'Hearty spiced lentil curry and roasted grains that provide searing physical power.',
        house: 'fire',
        icon: '🍲',
        caption: 'Robust fuel fueling fiery campus endeavors.'
      },
      {
        text: 'Crisp seasonal farm salads and micro-greens proving plant dining commands superior taste.',
        house: 'air',
        icon: '🥗',
        caption: 'Refined standard of low-carbon excellence.'
      },
      {
        text: 'Minimalist whole superfoods and infused botanical elixirs for crystal-clear focus.',
        house: 'space',
        icon: '✨',
        caption: 'Celestial nourishment with near-zero waste.'
      },
    ],
  },
  {
    id: 3,
    question: 'When midnight falls upon your dorm room, what is your power ethic?',
    options: [
      {
        text: 'All chargers unplugged from sockets to eliminate 0.8 kWh of vampire draw.',
        house: 'water',
        icon: '🌊',
        caption: 'Vigilant elimination of hidden electric leakage.'
      },
      {
        text: 'Warm wool blankets, thick organic cotton layers, and zero electric heaters.',
        house: 'earth',
        icon: '🕯️',
        caption: 'Cozy, organic thermal comfort in harmony with nature.'
      },
      {
        text: 'Cold showers and naturally breezy study pods over energy-heavy air conditioning.',
        house: 'fire',
        icon: '🔥',
        caption: 'Embracing the raw elements with physical pride.'
      },
      {
        text: 'Smart plug automated schedules shut down heavy monitors before I even sleep.',
        house: 'air',
        icon: '⏱️',
        caption: 'Cunning automated dominion over electric circuits.'
      },
      {
        text: 'Complete blackout with only soft starlight; sleeping in total cosmic tranquility.',
        house: 'space',
        icon: '🌌',
        caption: 'Pure darkness, restorative rest, zero lumen waste.'
      },
    ],
  },
  {
    id: 4,
    question: 'When an academic tome or tech asset concludes its semester purpose, what fate awaits it?',
    options: [
      {
        text: 'Meticulously cataloged and traded via Circular Thrift Club to preserve embodied carbon.',
        house: 'water',
        icon: '📚',
        caption: 'Knowledge preserved and embodied carbon saved.'
      },
      {
        text: 'Lovingly repaired, rebound, and kept in circulation season after season.',
        house: 'earth',
        icon: '🧵',
        caption: 'Dedication to craftsmanship and zero waste.'
      },
      {
        text: 'Gifted immediately to an incoming freshman teammate who needs it most.',
        house: 'fire',
        icon: '🎁',
        caption: 'Noble generosity empowering the next vanguard.'
      },
      {
        text: 'Negotiated for prime eco-points, securing top leaderboard dominance and prestige.',
        house: 'air',
        icon: '🏆',
        caption: 'Uncompromising resourcefulness yielding real rewards.'
      },
      {
        text: 'Digitized into the collective Pensieve cloud library so it endures eternally.',
        house: 'space',
        icon: '🔮',
        caption: 'Infinite digital longevity with zero physical footprint.'
      },
    ],
  },
];

export default function SortingHatPage() {
  const navigate = useNavigate();
  const { house, setHouse } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<HouseTheme[]>([]);
  const [sortingState, setSortingState] = useState<'quiz' | 'deliberating' | 'sorted'>('quiz');
  const [deliberationText, setDeliberationText] = useState('');
  const [sortedHouse, setSortedHouse] = useState<HouseTheme>('water');

  const handleSelectOption = (chosenHouse: HouseTheme) => {
    magicAudio.playSilverChime();
    const updated = [...answers, chosenHouse];
    setAnswers(updated);

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      concludeSorting(updated);
    }
  };

  const concludeSorting = (finalAnswers: HouseTheme[]) => {
    setSortingState('deliberating');
    magicAudio.playWandWhoosh();

    const counts: Record<HouseTheme, number> = {
      water: 0,
      earth: 0,
      fire: 0,
      air: 0,
      space: 0,
    };
    finalAnswers.forEach((h) => {
      if (counts[h] !== undefined) counts[h]++;
    });

    // Find highest count house
    let winner: HouseTheme = 'water';
    let maxCount = -1;
    (Object.keys(counts) as HouseTheme[]).forEach((h) => {
      if (counts[h] > maxCount) {
        maxCount = counts[h];
        winner = h;
      }
    });

    setSortedHouse(winner);

    const dialogLines = [
      "Ah... difficult, very difficult...",
      "I see a curious, resolute mind... immense discipline...",
      "A fierce devotion to our campus and low carbon footprints...",
      `Yes! There is no doubt where you belong... Better be... ${ELEMENTAL_HOUSES[winner].name.toUpperCase()}!`
    ];

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < dialogLines.length) {
        setDeliberationText(dialogLines[lineIndex]);
        magicAudio.playSilverChime();
        lineIndex++;
      } else {
        clearInterval(interval);
        setSortingState('sorted');
        setHouse(winner);
        magicAudio.playStardustSparkle();
        triggerConfetti();
      }
    }, 1100);
  };

  const handleReset = () => {
    setAnswers([]);
    setCurrentStep(0);
    setSortingState('quiz');
  };

  const houseData = ELEMENTAL_HOUSES[sortedHouse];
  const sortedTextColor = sortedHouse === 'fire' ? '#FFFFFF' : '#000000';

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0B132B] text-sky-400 border border-sky-500/30">
          <Sparkles size={12} className="text-sky-400" />
          <span>ELEMENTAL ECO MATCHMAKER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-magical tracking-tight text-white">
          The Sorting Hat <span className="text-silver-shimmer italic">Carbon Matchmaker</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Place the ancient enchanted Sorting Hat upon your brow. 
          Discover your true elemental Eco-House (Water, Earth, Fire, Air, Space) and dynamically adapt the platform's mystical aesthetic to your spirit.
        </p>
      </div>

      {/* QUIZ STEP */}
      {sortingState === 'quiz' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#090D16] via-[#0B132B] to-[#040816] border-2 border-slate-700 shadow-2xl space-y-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>ENCHANTED QUESTION {currentStep + 1} OF {QUIZ_QUESTIONS.length}</span>
              <span className="text-sky-400 font-bold">{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold font-magical text-white">
              {QUIZ_QUESTIONS[currentStep].question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt.house)}
                className="p-5 rounded-2xl bg-[#070D1E]/80 hover:bg-[#0E1A38] border border-slate-700/80 hover:border-sky-400 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">{opt.icon}</div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-white leading-relaxed">
                    {opt.text}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 group-hover:text-sky-300">
                  {opt.caption}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DELIBERATING STEP */}
      {sortingState === 'deliberating' && (
        <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-b from-[#090D16] via-[#0B132B] to-[#040816] border-2 border-sky-400/50 shadow-[0_0_60px_rgba(56,189,248,0.25)] text-center space-y-6">
          <div className="text-6xl animate-bounce-gentle">🧙‍♂️</div>
          <h2 className="text-2xl font-bold font-magical text-white">
            The Sorting Hat is Deliberating...
          </h2>
          <div className="p-5 rounded-2xl bg-black/50 border border-slate-800 max-w-lg mx-auto min-h-[90px] flex items-center justify-center">
            <p className="text-lg font-serif italic text-sky-200 animate-fade-in">
              "{deliberationText}"
            </p>
          </div>
        </div>
      )}

      {/* SORTED STEP */}
      {sortingState === 'sorted' && (
        <div
          className="p-8 sm:p-12 rounded-3xl border-2 text-center space-y-8 animate-scale-in"
          style={{
            backgroundColor: houseData.surfaceHex,
            borderColor: houseData.borderHex,
            boxShadow: `0 0 60px ${houseData.glowHex}`,
          }}
        >
          <div className="text-7xl mb-2">{houseData.crest}</div>

          <div className="space-y-2">
            <div
              className="text-xs font-mono tracking-widest uppercase font-bold"
              style={{ color: houseData.accentHex }}
            >
              OFFICIAL ELEMENTAL ECO-HOUSE ALLOCATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-magical text-white">
              {houseData.name}
            </h2>
            <div
              className="text-sm font-serif italic"
              style={{ color: houseData.silverHex }}
            >
              Colors: <span className="font-bold">{houseData.colorsName}</span> • Element: {houseData.element}
            </div>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed pt-2">
              {houseData.description}
            </p>
          </div>

          {/* House Traits Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] text-slate-400">MASCOT</div>
              <div className="font-bold text-white mt-0.5">{houseData.mascot}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] text-slate-400">PALETTE COLORS</div>
              <div
                className="font-bold mt-0.5"
                style={{ color: houseData.accentHex }}
              >
                {houseData.colorsName}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] text-slate-400">HOUSE CREST</div>
              <div className="font-bold text-white mt-0.5">{houseData.crest} {houseData.name.split(' ')[0]}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[10px] text-slate-400">THEME APPLIED</div>
              <div className="font-bold text-emerald-400 mt-0.5">Active Everywhere</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg transition-all"
              style={{
                backgroundColor: houseData.accentHex,
                color: sortedTextColor,
                boxShadow: `0 0 20px ${houseData.glowHex}`,
              }}
            >
              <span>Enter House Common Room</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={14} />
              <span>Retake The Sorting Ceremony</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
