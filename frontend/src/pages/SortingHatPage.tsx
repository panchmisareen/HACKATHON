import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Award, ArrowRight, CheckCircle2, RotateCcw,
  Shield, Compass, Flame, Leaf, Feather
} from 'lucide-react';
import { useTheme, type HouseTheme, HOGWARTS_HOUSES } from '../context/ThemeContext';
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
        text: 'Pedaling my geared iron steed with scientific cadence and telemetry tracking.',
        house: 'ravenclaw',
        icon: '🦅',
        caption: 'Analytical, calculated zero-emission velocity.'
      },
      {
        text: 'Commanding campus paths with unmatched focus, optimizing every transit shortcut.',
        house: 'slytherin',
        icon: '🐍',
        caption: 'Ambitious, strategic, and remarkably efficient.'
      },
      {
        text: 'Power-walking or running through all rain and tempest without hesitation.',
        house: 'gryffindor',
        icon: '🦁',
        caption: 'Bold endurance and hearty courage.'
      },
      {
        text: 'Strolling peacefully alongside hostel peers, enjoying trees and fresh air.',
        house: 'hufflepuff',
        icon: '🦡',
        caption: 'Grounded, patient, and deeply community-spirited.'
      },
    ],
  },
  {
    id: 2,
    question: 'What fills your plate when dining at the Great Campus Hall?',
    options: [
      {
        text: 'High-protein legume salads & cold-pressed greens mathematically mapped for clean fuel.',
        house: 'ravenclaw',
        icon: '🥗',
        caption: 'Scientific nutritional optimization with minimum emissions.'
      },
      {
        text: 'The finest seasonal ingredients, proving that plant-based dining can dominate in taste.',
        house: 'slytherin',
        icon: '🌿',
        caption: 'Refined standard of low-carbon excellence.'
      },
      {
        text: 'Hearty whole-grain lentil stews that provide raw physical power for long days.',
        house: 'gryffindor',
        icon: '🍲',
        caption: 'Robust fuel for brave campus endeavors.'
      },
      {
        text: 'Sun-ripened greenhouse vegetables and roasted root crops grown locally.',
        house: 'hufflepuff',
        icon: '🥕',
        caption: 'Earth-honoring harvest from soil to bowl.'
      },
    ],
  },
  {
    id: 3,
    question: 'When midnight falls upon your dorm room, what is your power ethic?',
    options: [
      {
        text: 'All chargers disconnected from the socket to eliminate 0.8 kWh of vampire draw.',
        house: 'ravenclaw',
        icon: '⚡',
        caption: 'Vigilant elimination of hidden standby drains.'
      },
      {
        text: 'Smart plug automated schedules shut down heavy monitors before I even sleep.',
        house: 'slytherin',
        icon: '⏱️',
        caption: 'Cunning automated dominion over the electric grid.'
      },
      {
        text: 'Cold showers and naturally breezy study pods over energy-heavy air conditioning.',
        house: 'gryffindor',
        icon: '💨',
        caption: 'Embracing the rugged elements with pride.'
      },
      {
        text: 'Soft warm study lamps and layered wool blankets instead of electric heaters.',
        house: 'hufflepuff',
        icon: '🕯️',
        caption: 'Cozy, organic comfort in harmony with nature.'
      },
    ],
  },
  {
    id: 4,
    question: 'When an academic tome or tech asset concludes its semester purpose, what fate awaits it?',
    options: [
      {
        text: 'Meticulously cataloged and traded via the Circular Thrift Club for maximum reuse.',
        house: 'ravenclaw',
        icon: '📚',
        caption: 'Knowledge preserved and embodied carbon conserved.'
      },
      {
        text: 'Negotiated for prime eco-points, securing top hostel rank and prestige.',
        house: 'slytherin',
        icon: '🏆',
        caption: 'Uncompromising resourcefulness yielding tangible rewards.'
      },
      {
        text: 'Gifted immediately to an incoming freshman who needs it most.',
        house: 'gryffindor',
        icon: '🎁',
        caption: 'Noble generosity that empowers the next generation.'
      },
      {
        text: 'Lovingly repaired, rebound, and kept in circulation indefinitely.',
        house: 'hufflepuff',
        icon: '🧵',
        caption: 'Dedication to craftsmanship and zero waste.'
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
  const [sortedHouse, setSortedHouse] = useState<HouseTheme>('ravenclaw');

  const handleSelectOption = (chosenHouse: HouseTheme) => {
    magicAudio.playSilverChime();
    const updated = [...answers, chosenHouse];
    setAnswers(updated);

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate resulting house
      concludeSorting(updated);
    }
  };

  const concludeSorting = (finalAnswers: HouseTheme[]) => {
    setSortingState('deliberating');
    magicAudio.playWandWhoosh();

    const counts: Record<HouseTheme, number> = {
      ravenclaw: 0,
      slytherin: 0,
      gryffindor: 0,
      hufflepuff: 0,
      patronus: 0,
    };
    finalAnswers.forEach((h) => counts[h]++);

    // Find highest count house
    let winner: HouseTheme = 'ravenclaw';
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
      "I see a curious, resolute mind... plenty of discipline...",
      "A fierce devotion to our campus earth and low carbon footprints...",
      `Yes! There is no doubt where you belong... Better be... ${HOGWARTS_HOUSES[winner].name.toUpperCase()}!`
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

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0B132B] text-sky-400 border border-sky-500/30">
          <Sparkles size={12} className="text-sky-400" />
          <span>CAMPUS ECO MATCHMAKER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-magical tracking-tight text-white">
          The Sorting Hat <span className="text-silver-shimmer italic">Carbon Matchmaker</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Place the ancient enchanted Sorting Hat upon your brow. 
          Discover your true campus Eco-House and dynamically adapt the platform's mystical aesthetic to your spirit.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt.house)}
                className="p-5 rounded-2xl bg-[#070D1E]/80 hover:bg-[#0E1A38] border border-slate-700/80 hover:border-sky-400 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">{opt.icon}</div>
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
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0B132B] via-[#070D1E] to-[#040816] border-2 border-sky-400/80 shadow-[0_0_60px_rgba(56,189,248,0.3)] text-center space-y-8 animate-scale-in">
          <div className="text-6xl mb-2">{HOGWARTS_HOUSES[sortedHouse].crest}</div>

          <div className="space-y-2">
            <div className="text-xs font-mono tracking-widest uppercase text-sky-400">
              OFFICIAL HOGWARTS ECO-HOUSE ALLOCATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-magical text-white">
              {HOGWARTS_HOUSES[sortedHouse].name}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {HOGWARTS_HOUSES[sortedHouse].description}
            </p>
          </div>

          {/* House Traits Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400">MASCOT</div>
              <div className="font-bold text-white mt-0.5">{HOGWARTS_HOUSES[sortedHouse].mascot}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400">PRIMARY AESTHETIC</div>
              <div className="font-bold text-sky-300 mt-0.5">{HOGWARTS_HOUSES[sortedHouse].subtitle.split(' ')[0]}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400">HOUSE BADGE</div>
              <div className="font-bold text-emerald-400 mt-0.5">Founders Crest</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400">THEME APPLIED</div>
              <div className="font-bold text-amber-300 mt-0.5">Active Everywhere</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg hover:shadow-sky-500/30 transition-all"
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
