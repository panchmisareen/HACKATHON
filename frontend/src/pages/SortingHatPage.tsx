import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Award, ArrowRight, CheckCircle2, RotateCcw,
  Shield, Compass, Flame, Leaf, Feather, Zap, Bike, ShoppingBag, Trash2
} from 'lucide-react';
import { useTheme, type HouseTheme, ELEMENTAL_HOUSES } from '../context/ThemeContext';
import { magicAudio } from '../utils/magicAudio';
import { triggerConfetti } from '../utils/confetti';

interface QuizQuestion {
  id: number;
  question: string;
  context: string;
  options: {
    text: string;
    house: HouseTheme;
    icon: string;
    categoryTag: string;
    caption: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'When noon hunger strikes between your lectures, what does your lunch routine typically look like?',
    context: 'DIETARY & LUNCH HABITS',
    options: [
      {
        text: 'Ordering a sizzling meat or paneer delivery meal via food apps straight to the campus gate.',
        house: 'fire',
        icon: '🍗',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Frequent food delivery apps & high-protein meat meals.'
      },
      {
        text: 'Taking a quick scooter or auto-rickshaw ride to an off-campus restaurant even if it is just 600m away.',
        house: 'space',
        icon: '🛵',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Motor transport even for small transit distances.'
      },
      {
        text: 'Eating at a commercial retail mall food court while browsing newly dropped clothes or sneakers.',
        house: 'air',
        icon: '🛍️',
        categoryTag: 'Shopping & Buying New',
        caption: 'Frequent shopping velocity & retail browsing.'
      },
      {
        text: 'Eating at my hostel desk with the AC chilled on high and dual computer monitors running.',
        house: 'water',
        icon: '❄️',
        categoryTag: 'High Electricity & Bills',
        caption: 'High power consumption, AC usage & electric bills.'
      },
      {
        text: 'Grabbing quick canteen takeout with disposable plastic cutlery, single-use cups, and styrofoam trays.',
        house: 'earth',
        icon: '🥤',
        categoryTag: 'Single-Use Plastics',
        caption: 'Non-reusable containers & single-use plastic waste.'
      },
    ],
  },
  {
    id: 2,
    question: 'You have a lecture 800 meters away at the Science Block. How do you traverse the distance?',
    context: 'CAMPUS TRANSIT & COMMUTE',
    options: [
      {
        text: 'Hailing a campus rapido, cab, or motorized scooter right from hostel gate to the lecture hall door.',
        house: 'space',
        icon: '🚕',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Zero walking willingness; motor transit for all distances.'
      },
      {
        text: 'Grabbing a meat roll or hot snack from a street vendor to munch on as I travel.',
        house: 'fire',
        icon: '🌯',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Frequent street takeout & packaged hot snack fuel.'
      },
      {
        text: 'Cutting through the campus market to check if the stationery store received new branded merchandise.',
        house: 'air',
        icon: '🏷️',
        categoryTag: 'Shopping & Buying New',
        caption: 'Always eyeing new acquisitions & items.'
      },
      {
        text: 'Making sure my phone, smartwatch, and laptop are charged to 100% on high-speed adapters before walking.',
        house: 'water',
        icon: '⚡',
        categoryTag: 'High Electricity & Bills',
        caption: 'Heavy reliance on battery charging & electric wattage.'
      },
      {
        text: 'Stopping by the kiosk to buy a disposable cold plastic mineral water bottle on the way.',
        house: 'earth',
        icon: '🧴',
        categoryTag: 'Single-Use Plastics',
        caption: 'Buying single-use plastic bottles instead of refills.'
      },
    ],
  },
  {
    id: 3,
    question: 'A new semester commences and you need textbooks, study supplies, and room essentials. What is your go-to move?',
    context: 'ACQUISITION & MATERIAL CONSUMPTION',
    options: [
      {
        text: 'Ordering brand-new hardcover textbooks, new aesthetic desk accessories, and trending tech gadgets online.',
        house: 'air',
        icon: '📦',
        categoryTag: 'Shopping & Buying New',
        caption: 'Buying brand-new stuff frequently instead of reusing.'
      },
      {
        text: 'Subscribing to a high-end food delivery meal pass and stocking up on imported canned meats & ramen.',
        house: 'fire',
        icon: '🍜',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Food delivery subscriptions & processed meals.'
      },
      {
        text: 'Booking a car ride into the downtown city commercial district rather than borrowing from dorm peers.',
        house: 'space',
        icon: '🚗',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Driving/riding off-campus for minor shopping needs.'
      },
      {
        text: 'Setting up high-wattage extension boards, dual task lamps, and external charging docks on my study table.',
        house: 'water',
        icon: '🔌',
        categoryTag: 'High Electricity & Bills',
        caption: 'Multiplying socket load & electric draw.'
      },
      {
        text: 'Buying disposable ballpoint pens in bulk, plastic folders, and single-use packaging organizers.',
        house: 'earth',
        icon: '🗑️',
        categoryTag: 'Single-Use Plastics',
        caption: 'Choosing disposable, non-reusable plastic supplies.'
      },
    ],
  },
  {
    id: 4,
    question: 'When the clock strikes 1:00 AM in your hostel room, what is the power & energy reality of your space?',
    context: 'NIGHTTIME POWER & DORM HABITS',
    options: [
      {
        text: 'Air conditioner running at 18°C, heavy laptop/console in standby sleep, chargers plugged into hot sockets.',
        house: 'water',
        icon: '💡',
        categoryTag: 'High Electricity & Bills',
        caption: 'Substantial monthly electricity bill & continuous vampire draw.'
      },
      {
        text: 'Spreading out late-night food delivery parcels with greasy takeout boxes and midnight meat snacks.',
        house: 'fire',
        icon: '🍕',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Late-night restaurant takeout & delivery boxes.'
      },
      {
        text: 'Scheduling an early morning cab pickup so I do not have to walk in the morning heat.',
        house: 'space',
        icon: '🚙',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Pre-booking rides to skip even morning strolls.'
      },
      {
        text: 'Browsing late-night e-commerce flash sales, buying trending clothes, sneakers, or gadgets.',
        house: 'air',
        icon: '💳',
        categoryTag: 'Shopping & Buying New',
        caption: 'Impulse retail shopping & frequent new orders.'
      },
      {
        text: 'Tossing disposable paper coffee cups, plastic snack packaging, and used plastic straws into the bin.',
        house: 'earth',
        icon: '📦',
        categoryTag: 'Single-Use Plastics',
        caption: 'Accumulating single-use non-reusable trash.'
      },
    ],
  },
  {
    id: 5,
    question: 'How do you stay hydrated and energized throughout a grueling day of classes?',
    context: 'HYDRATION & PACKAGING',
    options: [
      {
        text: 'Purchasing 2 to 3 single-use plastic water bottles and disposable iced coffee cups from the kiosk.',
        house: 'earth',
        icon: '🥤',
        categoryTag: 'Single-Use Plastics',
        caption: 'Heavy consumption of non-reusable plastic bottles.'
      },
      {
        text: 'Ordering artisanal boba teas or milkshakes delivered from cafes across the city.',
        house: 'fire',
        icon: '🧋',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Food delivery apps for beverages with heavy packaging.'
      },
      {
        text: 'Riding a scooter to the far side of campus just to buy a cold soda rather than drinking nearby.',
        house: 'space',
        icon: '🛵',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Using vehicle transport for minor errands.'
      },
      {
        text: 'Buying a trendy new branded tumbler or hydro flask every month because a new color dropped.',
        house: 'air',
        icon: '✨',
        categoryTag: 'Shopping & Buying New',
        caption: 'Over-purchasing new consumer goods.'
      },
      {
        text: 'Running the electric water cooler or boiling water multiple times in a high-wattage electric kettle.',
        house: 'water',
        icon: '⚡',
        categoryTag: 'High Electricity & Bills',
        caption: 'High appliance electricity draw.'
      },
    ],
  },
  {
    id: 6,
    question: 'It is Saturday afternoon with no academic deadlines. How do you spend your weekend leisure?',
    context: 'WEEKEND RECREATION & LIFESTYLE',
    options: [
      {
        text: 'Hosting a meat barbecue or gathering peers for an enormous weekend biryani and pizza delivery feast.',
        house: 'fire',
        icon: '🥩',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Heavy meat consumption & multi-course delivery feasts.'
      },
      {
        text: 'Taking cabs back and forth between campus, city malls, and cafes without ever using public transit.',
        house: 'space',
        icon: '🚖',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Constant cab rides and combustion transit.'
      },
      {
        text: 'Going on a weekend shopping spree to refresh my wardrobe with the latest fast-fashion drops.',
        house: 'air',
        icon: '👗',
        categoryTag: 'Shopping & Buying New',
        caption: 'Frequent new clothes purchases & fashion turnover.'
      },
      {
        text: 'Binge-gaming on high-end gaming rigs or streaming 4K video all day with full air conditioning.',
        house: 'water',
        icon: '🖥️',
        categoryTag: 'High Electricity & Bills',
        caption: 'Continuous high kilowatt-hour electricity consumption.'
      },
      {
        text: 'Ordering party snacks served entirely on disposable plastic plates, plastic cups, and plastic cutlery.',
        house: 'earth',
        icon: '🍽️',
        categoryTag: 'Single-Use Plastics',
        caption: 'Single-use party plastics and non-reusable waste.'
      },
    ],
  },
  {
    id: 7,
    question: 'When your room gets cluttered or old gear needs replacing, what is your typical behavior?',
    context: 'DISPOSAL & CLUTTER MANAGEMENT',
    options: [
      {
        text: 'I buy the newest gadget or jacket immediately, letting slightly older items pile up unused.',
        house: 'air',
        icon: '📱',
        categoryTag: 'Shopping & Buying New',
        caption: 'High consumption rate of brand-new products.'
      },
      {
        text: 'I toss all cardboard, plastic bubble wrap, and disposable drink containers into a single trash bag.',
        house: 'earth',
        icon: '🚮',
        categoryTag: 'Single-Use Plastics',
        caption: 'Non-reusable landfill waste without recycling.'
      },
      {
        text: 'My floor accumulates piles of takeout delivery containers, plastic sauce packets, and grease paper.',
        house: 'fire',
        icon: '🥡',
        categoryTag: 'Takeout & Meat Heavy',
        caption: 'Accumulation of food delivery and takeout waste.'
      },
      {
        text: 'I leave extra chargers, monitors, and power bricks permanently plugged into live electrical wall boards.',
        house: 'water',
        icon: '🔌',
        categoryTag: 'High Electricity & Bills',
        caption: 'Unmonitored electricity drain across multiple outlets.'
      },
      {
        text: 'I book delivery courier motorbikes or drive a personal car to transport small personal parcels across town.',
        house: 'space',
        icon: '🏍️',
        categoryTag: 'Short-Distance Motor Transit',
        caption: 'Vehicle transit for minor errand movement.'
      },
    ],
  },
];

const HABIT_DIAGNOSES: Record<HouseTheme, { title: string; trigger: string; advice: string }> = {
  fire: {
    title: 'Food Delivery, Takeout & Meat-Heavy Footprint',
    trigger: 'Frequent food delivery app orders, takeout packaging, and meat-heavy dining hall choices.',
    advice: 'Fire House channels your passionate culinary energy to lead campus plant-based dining swaps and conquer delivery-miles carbon!',
  },
  space: {
    title: 'Short-Distance Motor Transport & Cab Reliance',
    trigger: 'Frequent hailing of cabs, rapido, auto-rickshaws, and motorized transport even for 500m–1km short trips.',
    advice: 'Space House inspires you to unlock kinetic power—converting motorized hops into zero-emission pedal and walking streaks!',
  },
  air: {
    title: 'Shopping Velocity & Buying New Items (Wind)',
    trigger: 'High frequency of buying brand-new textbooks, trendy clothes, footwear, and new tech gadgets.',
    advice: 'Air House breathes the rejuvenating winds of circularity into your lifestyle, empowering you to master the Circular Thrift Club!',
  },
  water: {
    title: 'High Kilowatt-Hour Electricity & AC Power Bills',
    trigger: 'Long AC runtimes at low temps, heavy multi-monitor rigs, and continuous wall-socket vampire power.',
    advice: 'Water House equips you with analytical telemetry to extinguish idle standby drain and master energy efficiency!',
  },
  earth: {
    title: 'Single-Use Plastics & Non-Reusable Items',
    trigger: 'Regular reliance on disposable plastic water bottles, single-use cutlery, styrofoam, and non-reusable packaging.',
    advice: 'Earth House grounds your commitment to banish disposables and champion zero-waste circular stewardship!',
  },
};

export default function SortingHatPage() {
  const navigate = useNavigate();
  const { house, setHouse } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<HouseTheme[]>([]);
  const [counts, setCounts] = useState<Record<HouseTheme, number>>({
    water: 0,
    earth: 0,
    fire: 0,
    air: 0,
    space: 0,
  });
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

    const tally: Record<HouseTheme, number> = {
      water: 0,
      earth: 0,
      fire: 0,
      air: 0,
      space: 0,
    };
    finalAnswers.forEach((h) => {
      if (tally[h] !== undefined) tally[h]++;
    });

    setCounts(tally);

    // Find highest count house
    let winner: HouseTheme = 'water';
    let maxCount = -1;
    (Object.keys(tally) as HouseTheme[]).forEach((h) => {
      if (tally[h] > maxCount) {
        maxCount = tally[h];
        winner = h;
      }
    });

    setSortedHouse(winner);

    const dialogLines = [
      "Ah... gazing deep into your daily campus footprint...",
      "I see your transit choices... your dining habits... and your power ethic...",
      "The pattern is unmistakable! Your primary carbon driver reveals your elemental nature...",
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
    setCounts({ water: 0, earth: 0, fire: 0, air: 0, space: 0 });
  };

  const houseData = ELEMENTAL_HOUSES[sortedHouse];
  const sortedTextColor = sortedHouse === 'fire' ? '#FFFFFF' : '#000000';
  const diagnosis = HABIT_DIAGNOSES[sortedHouse];

  const habitBreakdown = [
    { house: 'fire' as HouseTheme, label: 'Takeout & Meat', count: counts.fire, icon: '🔥', color: '#EF4444' },
    { house: 'space' as HouseTheme, label: 'Short-Distance Transport', count: counts.space, icon: '🌌', color: '#E2E8F0' },
    { house: 'air' as HouseTheme, label: 'Buying New Items (Wind)', count: counts.air, icon: '🌪️', color: '#10B981' },
    { house: 'water' as HouseTheme, label: 'Electricity & AC Bills', count: counts.water, icon: '🌊', color: '#38BDF8' },
    { house: 'earth' as HouseTheme, label: 'Single-Use Plastics', count: counts.earth, icon: '🌿', color: '#FFE600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0B132B] text-sky-400 border border-sky-500/30">
          <Sparkles size={12} className="text-sky-400" />
          <span>CARBON HABIT ALLOCATION CEREMONY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-magical tracking-tight text-white">
          The Sorting Hat <span className="text-silver-shimmer italic">Carbon Matchmaker</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Answer 7 genuine lifestyle questions. The Hat diagnoses your primary campus carbon drivers—whether it's takeout food, short-distance transport, shopping for new goods, high power bills, or single-use plastics—and places you in your rightful elemental house.
        </p>
      </div>

      {/* QUIZ STEP */}
      {sortingState === 'quiz' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#090D16] via-[#0B132B] to-[#040816] border-2 border-slate-700 shadow-2xl space-y-8">
          {/* Progress Bar & Header */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="font-bold text-sky-400">QUESTION {currentStep + 1} OF {QUIZ_QUESTIONS.length}</span>
                <span>•</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{QUIZ_QUESTIONS[currentStep].context}</span>
              </span>
              <span className="text-sky-400 font-bold">{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold font-magical text-white leading-relaxed">
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 group-hover:border-sky-400/40">
                      {opt.categoryTag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-white leading-relaxed mt-2">
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
            The Sorting Hat is Analyzing Your Habits...
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

          {/* Diagnostic Reason Box */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 max-w-2xl mx-auto text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              <Sparkles size={14} />
              <span>Why the Hat Placed You Here: {diagnosis.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Your Identified Pattern:</strong> {diagnosis.trigger}
            </p>
            <p className="text-xs text-emerald-300 font-serif italic pt-1">
              "{diagnosis.advice}"
            </p>
          </div>

          {/* Your Habit Archetype Scorecard */}
          <div className="max-w-2xl mx-auto text-left space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
              Your Campus Carbon Archetype Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              {habitBreakdown.map((item) => {
                const isWinner = item.house === sortedHouse;
                return (
                  <div
                    key={item.house}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isWinner
                        ? 'bg-white/15 border-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-slate-200">{item.label}</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-md font-bold"
                      style={{ color: item.color }}
                    >
                      {item.count} / {QUIZ_QUESTIONS.length}
                    </span>
                  </div>
                );
              })}
            </div>
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
