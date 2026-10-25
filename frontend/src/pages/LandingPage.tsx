import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Bike, Salad, Activity, Droplets, Zap,
  Trophy, ShieldCheck, Sparkles, Compass,
  Sliders, ArrowUpRight, BarChart3,
  Flame, BatteryCharging, CheckCircle2, ChevronRight, Play,
  ArrowRightLeft, LogOut, Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import GreenTechCanvas from '../components/greentech/GreenTechCanvas';
import TiltCard from '../components/greentech/TiltCard';
import LiveTelemetryBadge from '../components/greentech/LiveTelemetryBadge';
import EnergyWaveVisualizer from '../components/greentech/EnergyWaveVisualizer';
import AccountSwitcherModal from '../components/auth/AccountSwitcherModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login, logout, savedAccounts } = useAuth();
  const [loading, setLoading] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'travel' | 'meals' | 'movement' | 'hydration'>('travel');
  
  // Interactive Simulator State
  const [commuteKm, setCommuteKm] = useState(6);
  const [mealSwaps, setMealSwaps] = useState(4);
  const [waterBottles, setWaterBottles] = useState(5);
  const [simulatedCO2, setSimulatedCO2] = useState(0);

  // Live Carbon Ticker
  const [liveOffset, setLiveOffset] = useState(47.82);

  useEffect(() => {
    // Dynamic ticker simulation
    const interval = setInterval(() => {
      setLiveOffset((prev) => +(prev + 0.03).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 0.21 kg per km + 1.5 kg per meal + 0.08 kg per bottle
    const total = (commuteKm * 0.21) + (mealSwaps * 1.5) + (waterBottles * 0.08);
    setSimulatedCO2(+total.toFixed(2));
  }, [commuteKm, mealSwaps, waterBottles]);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.demoLogin();
      login(result.access_token, result.user);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00FF87', '#60EFFF', '#10B981', '#A3E635'],
      });
      setTimeout(() => navigate('/app/dashboard'), 400);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fireSimulationPulse = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF87', '#34D399', '#6EE7B7'],
    });
  };

  const categoryData = {
    travel: {
      title: 'Zero-Emission Campus Commute',
      icon: Bike,
      points: '+40 pts',
      co2: '1.2 kg CO₂',
      tag: 'ACTIVE TRAVEL',
      description: 'Pedal, brisk-walk, or take the electric campus shuttle. Convert physical mileage into university rank and verifiable carbon offset.',
      statLabel: 'Avg. Commute Reduction',
      statValue: '210 g/km',
    },
    meals: {
      title: 'Low-Carbon Plant Fuel',
      icon: Salad,
      points: '+35 pts',
      co2: '1.5 kg CO₂',
      tag: 'CLEAN DINING',
      description: 'Swap one red-meat dining hall meal for a hearty legume or grain bowl. Clean digestion with 75% fewer greenhouse emissions.',
      statLabel: 'Water Saved per Swap',
      statValue: '1,400 Liters',
    },
    movement: {
      title: 'Kinetic Energy Boost',
      icon: Activity,
      points: '+25 pts',
      co2: '0.4 kg CO₂',
      tag: 'ADAPTIVE MOVEMENT',
      description: '10-minute stair intervals or bodyweight mobility drills tailored to your energy levels. Beat afternoon study slumps naturally.',
      statLabel: 'Cardio Vitality Index',
      statValue: '+28%',
    },
    hydration: {
      title: 'Zero-Plastic Refill Station',
      icon: Droplets,
      points: '+15 pts',
      co2: '0.1 kg CO₂',
      tag: 'HYDRATION MATRIX',
      description: 'Track hydration at certified campus filtration hubs. Log 2,000ml while eliminating single-use PET bottles from our oceans.',
      statLabel: 'Landfill Plastic Saved',
      statValue: '5.2k bottles',
    },
  };

  return (
    <div className="min-h-screen bg-[#050806] text-white selection:bg-[#00FF87] selection:text-black font-sans relative overflow-x-hidden">
      {/* Bioluminescent Canvas Background */}
      <GreenTechCanvas />

      {/* Cybernetic Ambient Glow Meshes */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-emerald-500/10 blur-[140px] rounded-full -z-10" />
      <div className="pointer-events-none fixed top-1/3 -left-40 w-[600px] h-[500px] bg-[#00FF87]/5 blur-[160px] rounded-full -z-10" />
      <div className="pointer-events-none fixed bottom-10 right-0 w-[500px] h-[400px] bg-teal-500/10 blur-[130px] rounded-full -z-10" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070D09]/85 backdrop-blur-xl border-b border-emerald-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00FF87] to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-5 h-5 text-[#050806]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xl tracking-tight text-white">EcoPulse</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00FF87] border border-emerald-500/30">AI</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase">BETTER HABITS • LIGHTER FOOTPRINT</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#grid-hud" className="text-sm font-medium text-white/70 hover:text-[#00FF87] transition-colors">Clean Grid</a>
              <a href="#missions" className="text-sm font-medium text-white/70 hover:text-[#00FF87] transition-colors">Micro-Missions</a>
              <a href="#simulator" className="text-sm font-medium text-white/70 hover:text-[#00FF87] transition-colors">Impact Simulator</a>
              <a href="#league" className="text-sm font-medium text-white/70 hover:text-[#00FF87] transition-colors">Hostel League</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Sign In always visible & working */}
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>

              {/* Switch Accounts button if accounts saved or user logged in */}
              {(savedAccounts.length > 0 || user) && (
                <button
                  onClick={() => setSwitcherOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Switch Accounts</span>
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/app/dashboard"
                    className="btn-neon text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    title="Log Out"
                    className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="btn-neon text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Instant Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Live Status Pill */}
        <div className="mb-6 animate-fade-in">
          <LiveTelemetryBadge
            label="RENEWABLE GREENTECH"
            statusText="CAMPUS EMISSION SHIELD"
            metric="LIVE 99.4%"
          />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.08] max-w-5xl mb-6">
          BETTER HABITS. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] via-[#60EFFF] to-[#A3E635] text-neon-glow">
            LIGHTER FOOTPRINT.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-emerald-100/70 max-w-2xl mb-10 font-normal leading-relaxed">
          The high-performance wellness and sustainability intelligence system for modern students. 
          Complete micro-habits, claim verified carbon credits, and dominate the campus league.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-neon text-base font-bold py-3.5 px-8 shadow-neon-lg flex items-center gap-2.5"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#simulator"
            className="btn-outline-neon py-3.5 px-7 text-sm font-semibold flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>Run Impact Matrix</span>
          </a>
        </div>

        {/* Live Telemetry Ticker Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mb-16">
          <div className="glass-greentech p-4 rounded-xl text-left border-l-2 border-l-[#00FF87]">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">Offset Generated</span>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
              <span>{liveOffset}</span>
              <span className="text-xs text-[#00FF87] font-sans">kg CO₂</span>
            </div>
            <span className="text-[10px] text-white/50">↑ 12% today vs baseline</span>
          </div>

          <div className="glass-greentech p-4 rounded-xl text-left border-l-2 border-l-[#60EFFF]">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Active Students</span>
            <div className="text-2xl font-black text-white font-mono">1,480+</div>
            <span className="text-[10px] text-white/50">Across 12 hostels</span>
          </div>

          <div className="glass-greentech p-4 rounded-xl text-left border-l-2 border-l-[#A3E635]">
            <span className="text-[11px] font-mono text-lime-400 uppercase tracking-wider block mb-1">Clean Commutes</span>
            <div className="text-2xl font-black text-white font-mono">3,920 km</div>
            <span className="text-[10px] text-white/50">Pedal & electric transit</span>
          </div>

          <div className="glass-greentech p-4 rounded-xl text-left border-l-2 border-l-emerald-500">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">Bottles Eliminated</span>
            <div className="text-2xl font-black text-white font-mono">8,420</div>
            <span className="text-[10px] text-white/50">Zero single-use waste</span>
          </div>
        </div>

        {/* 3D HERO INTERACTIVE HUD TERMINAL */}
        <div id="grid-hud" className="w-full max-w-5xl">
          <TiltCard className="p-6 sm:p-8 border-emerald-500/25">
            {/* Terminal Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-emerald-500/15">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-[#00FF87]" />
                </div>
                <div className="font-mono text-xs text-emerald-400 flex items-center gap-2">
                  <span>TERMINAL://ECOPULSE_SYS_V2.6</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-ping" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/60">CAMPUS FREQUENCY:</span>
                <EnergyWaveVisualizer />
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(['travel', 'meals', 'movement', 'hydration'] as const).map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#00FF87] text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-emerald-500/15'
                    }`}
                  >
                    <span>{categoryData[cat].tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Mission Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 text-[#00FF87] text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SMART MISSION OF THE HOUR</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  {categoryData[activeTab].title}
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  {categoryData[activeTab].description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-emerald-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">IMPACT CREDIT</span>
                    <span className="text-lg font-black text-[#00FF87] font-mono">{categoryData[activeTab].points}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-emerald-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">CO₂ AVOIDED</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">{categoryData[activeTab].co2}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-emerald-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">{categoryData[activeTab].statLabel}</span>
                    <span className="text-lg font-black text-lime-400 font-mono">{categoryData[activeTab].statValue}</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-5 bg-black/50 p-6 rounded-2xl border border-emerald-500/20 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-5 h-5 text-[#00FF87]" />
                    <span className="text-xs font-mono text-emerald-300">ENERGY STATUS</span>
                  </div>
                  <span className="text-xs font-mono text-[#00FF87] font-bold">OPTIMIZED</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Hostel Quota Completion</span>
                    <span className="text-white font-mono font-bold">84%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00FF87] rounded-full w-[84%] shadow-[0_0_8px_#00FF87]" />
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full btn-neon py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute This Mission</span>
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* INTERACTIVE IMPACT SIMULATOR (GreenTech Interactive Feature) */}
      <section id="simulator" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00FF87] text-xs font-mono mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE EMISSION SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
            CALCULATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-cyan-400">SEMESTER GAIN</span>
          </h2>
          <p className="text-white/60 text-base">
            Tune your weekly habits to forecast carbon mitigation and campus leaderboard trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Console */}
          <div className="lg:col-span-7 glass-greentech p-6 sm:p-8 rounded-2xl border-emerald-500/20 space-y-8">
            {/* Slider 1: Commute */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Bike className="w-4 h-4 text-[#00FF87]" />
                  Weekly Active Travel (Walking / Cycling)
                </span>
                <span className="font-mono text-[#00FF87] font-bold text-base">{commuteKm} km / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={commuteKm}
                onChange={(e) => setCommuteKm(+e.target.value)}
                className="w-full h-2 bg-emerald-950/60 rounded-lg appearance-none cursor-pointer accent-[#00FF87]"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>0 km (Dorm bound)</span>
                <span>15 km (Moderate)</span>
                <span>30 km (Iron commuter)</span>
              </div>
            </div>

            {/* Slider 2: Meal Swaps */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Salad className="w-4 h-4 text-lime-400" />
                  Weekly Plant-Based Dining Swaps
                </span>
                <span className="font-mono text-lime-400 font-bold text-base">{mealSwaps} meals / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={mealSwaps}
                onChange={(e) => setMealSwaps(+e.target.value)}
                className="w-full h-2 bg-emerald-950/60 rounded-lg appearance-none cursor-pointer accent-[#A3E635]"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>0 meals</span>
                <span>7 meals (1/day)</span>
                <span>14 meals (100% clean)</span>
              </div>
            </div>

            {/* Slider 3: Hydration Bottling */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Reusable Bottle Refills vs PET Plastic
                </span>
                <span className="font-mono text-cyan-400 font-bold text-base">{waterBottles} days / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={waterBottles}
                onChange={(e) => setWaterBottles(+e.target.value)}
                className="w-full h-2 bg-emerald-950/60 rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>0 days</span>
                <span>4 days (Campus focus)</span>
                <span>7 days (Zero waste)</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-5">
            <TiltCard className="p-8 border-emerald-500/30 text-center relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#00FF87] text-xs font-mono font-bold mb-4">
                <Flame className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>FORECASTED RETURN</span>
              </div>

              <div className="my-6">
                <div className="text-5xl sm:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-cyan-300">
                  {simulatedCO2}
                </div>
                <div className="text-sm font-mono text-emerald-400 uppercase tracking-widest mt-1">
                  kg CO₂ Avoided per Week
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-left space-y-2.5 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Semester CO₂ Total (16 wks):</span>
                  <span className="font-mono font-bold text-white">{(simulatedCO2 * 16).toFixed(1)} kg CO₂</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Estimated Campus Rank:</span>
                  <span className="font-mono font-bold text-[#00FF87]">Top 8% Tier</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Equivalent Trees Planted:</span>
                  <span className="font-mono font-bold text-lime-400">{Math.max(1, Math.round((simulatedCO2 * 16) / 21))} trees</span>
                </div>
              </div>

              <button
                onClick={() => {
                  fireSimulationPulse();
                  handleDemoLogin();
                }}
                className="w-full btn-neon py-3.5 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-neon"
              >
                <span>Commit to This Target</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* FEATURE TILES (MotionSites Inspired Bento Grid) */}
      <section id="missions" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00FF87] text-xs font-mono mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>FULL ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
            ENGINEERED FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-lime-300">STUDENT LIFE</span>
          </h2>
          <p className="text-white/60 text-base">
            No endless theory or burdensome checklists. Just immediate, rewarding micro-actions with peer validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 text-[#00FF87]">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Smart Campus Map</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Discover free filtered hydration stations, quiet study green pods, and rental e-cycles across all university blocks.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-[#00FF87] font-mono">
              <span>10+ VERIFIED HUBS</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Rule-Based Adaptive Coach</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Transparent recommendation engine. Enter 15 mins and low energy, and receive an instant low-stress stretch or herbal hydration habit.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-cyan-400 font-mono">
              <span>ZERO BLACK BOX AI</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mb-5 text-lime-400">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Hostel & House League</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Rally your hall-mates. Pool daily sustainability scores to win quarterly green dormitory grants and bragging rights.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-lime-400 font-mono">
              <span>SEASON 2026 LIVE</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-5 text-yellow-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Eco Passport Badges</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Collect verifiable digital badges for milestone accomplishments: 7-Day Streaks, Century Point Clubs, and Hydration Champion.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-yellow-400 font-mono">
              <span>11 UNIQUE BADGES</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 5 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-5 text-purple-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Personal Impact Analytics</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Interactive Recharts graphs tracking your daily avoided CO₂, cumulative steps, hydration logs, and dietary progress.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-purple-400 font-mono">
              <span>REAL-TIME CHARTS</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 6 */}
          <TiltCard className="p-6 border-emerald-500/20 glass-greentech-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center mb-5 text-[#00FF87]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Instant 1-Click Demo</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Pre-seeded with real hostel leagues, active missions, and demo stats. Jump straight into the experience without signing up.
              </p>
            </div>
            <button
              onClick={handleDemoLogin}
              className="flex items-center justify-between pt-4 border-t border-emerald-500/15 text-xs text-[#00FF87] font-mono hover:text-white transition-colors"
            >
              <span>ACCESS DEMO PROFILE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </TiltCard>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="relative rounded-3xl p-10 sm:p-14 border border-emerald-500/30 bg-gradient-to-b from-[#0B1710] to-[#050A07] overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#00FF87]/15 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4 relative z-10">
            START YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-cyan-300">GREEN PULSE</span> TODAY
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-base sm:text-lg mb-8 relative z-10">
            Join thousands of students proving that small daily wellness habits accumulate into massive climate action.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn-neon text-base font-bold py-4 px-9 shadow-neon flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>Enter Demo Platform</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="btn-outline-neon py-4 px-8 text-sm font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-500/15 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-white/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00FF87]/20 border border-[#00FF87]/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#00FF87]" />
          </div>
          <span className="font-bold text-white">EcoPulse</span>
          <span>© 2026 • Renewable GreenTech Initiative</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-emerald-400">FASTAPI + SQLITE</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400">REACT 19 + VITE</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400">MOTIONSITES STYLE</span>
        </div>
      </footer>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
      />
    </div>
  );
}
