import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Bike, Salad, Activity, Droplets, Zap,
  Trophy, ShieldCheck, Sparkles, Compass,
  Sliders, ArrowUpRight, BarChart3,
  Flame, BatteryCharging, CheckCircle2, ChevronRight, Play,
  ArrowRightLeft, LogOut, Camera, Share2, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import GreenTechCanvas from '../components/greentech/GreenTechCanvas';
import TiltCard from '../components/greentech/TiltCard';
import LiveTelemetryBadge from '../components/greentech/LiveTelemetryBadge';
import EnergyWaveVisualizer from '../components/greentech/EnergyWaveVisualizer';
import AccountSwitcherModal from '../components/auth/AccountSwitcherModal';
import { CarbonFootprintIcon, NeonAvatar } from '../components/ui/CarbonElements';

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
    const interval = setInterval(() => {
      setLiveOffset((prev) => +(prev + 0.03).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
        colors: ['#00F0FF', '#0084FF', '#39FF14', '#FFE600'],
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
      colors: ['#00F0FF', '#39FF14', '#FF1493'],
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
    <div className="min-h-screen bg-[#040816] text-white selection:bg-[#00F0FF] selection:text-black font-sans relative overflow-x-hidden">
      {/* Dynamic Background Canvas */}
      <GreenTechCanvas />

      {/* Cybernetic Ambient Midnight & Electric Blue Glow Meshes */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-cyan-500/10 blur-[150px] rounded-full -z-10" />
      <div className="pointer-events-none fixed top-1/3 -left-40 w-[600px] h-[500px] bg-blue-600/10 blur-[170px] rounded-full -z-10" />
      <div className="pointer-events-none fixed bottom-10 right-0 w-[500px] h-[400px] bg-[#BD00FF]/10 blur-[140px] rounded-full -z-10" />

      {/* Floating Decorative Carbon Footprints in Background */}
      <div className="pointer-events-none fixed top-24 left-8 opacity-20 -z-10 animate-pulse">
        <CarbonFootprintIcon size={48} color="#00F0FF" rotate={-15} glow />
      </div>
      <div className="pointer-events-none fixed top-1/2 right-12 opacity-25 -z-10">
        <CarbonFootprintIcon size={64} color="#39FF14" rotate={25} glow />
      </div>
      <div className="pointer-events-none fixed bottom-24 left-16 opacity-20 -z-10">
        <CarbonFootprintIcon size={52} color="#FF1493" rotate={-35} glow />
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07112B]/85 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] via-[#0084FF] to-[#BD00FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-5 h-5 text-[#040816]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xl tracking-tight text-white">EcoPulse</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40">AI 2.0</span>
                </div>
                <span className="text-[10px] text-cyan-300/80 font-mono tracking-widest uppercase">MIDNIGHT GRID • ZERO FOOTPRINT</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#grid-hud" className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors">Clean Grid</a>
              <Link to="/app/feed" className="text-sm font-medium text-sky-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>Pulse Feed</span>
              </Link>
              <Link to="/app/pensieve" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <span>🏺 Pensieve</span>
              </Link>
              <Link to="/app/sorting-hat" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <span>🧙‍♂️ Sorting Hat</span>
              </Link>
              <a href="#simulator" className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors">Simulator</a>
              <Link to="/app/league" className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors">House Cup</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Sign In always visible & working */}
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all font-mono"
              >
                Sign In
              </Link>

              {/* Switch Accounts button if accounts saved or user logged in */}
              {(savedAccounts.length > 0 || user) && (
                <button
                  onClick={() => setSwitcherOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 hover:text-white px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Switch Accounts</span>
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/app/dashboard"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
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
        {/* Live Status Pill with Carbon Footprint */}
        <div className="mb-6 animate-fade-in flex items-center gap-3">
          <LiveTelemetryBadge
            label="MIDNIGHT GRID LIVE"
            statusText="CAMPUS EMISSION SHIELD"
            metric="99.4% VERIFIED"
          />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <CarbonFootprintIcon size={14} color="#00F0FF" />
            <span>Traceable Footprints</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.08] max-w-5xl mb-6">
          BETTER HABITS. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#38BDF8] to-[#39FF14] drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]">
            LIGHTER FOOTPRINT.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 font-normal leading-relaxed">
          The high-performance wellness and sustainability intelligence system for modern students. 
          Complete micro-habits, claim verified carbon credits, share achievements on Pulse Feed, and dominate the campus league.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-extrabold text-base flex items-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:brightness-110 transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/app/feed"
            className="py-3.5 px-7 rounded-xl bg-[#0A183D]/80 hover:bg-[#112255] border border-cyan-500/30 text-sm font-semibold text-cyan-300 flex items-center gap-2 transition-all hover:border-[#00F0FF]"
          >
            <Camera className="w-4 h-4 text-[#00F0FF]" />
            <span>Explore Pulse Feed</span>
          </Link>
          <a
            href="#simulator"
            className="py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white/80 flex items-center gap-2 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Impact Simulator</span>
          </a>
        </div>

        {/* Live Telemetry Ticker Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mb-16">
          <div className="bg-[#0A183D]/70 p-4 rounded-xl text-left border-l-2 border-l-[#00F0FF] border border-cyan-500/20 backdrop-blur-md">
            <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider block mb-1">Offset Generated</span>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
              <span>{liveOffset}</span>
              <span className="text-xs text-[#00F0FF] font-sans">kg CO₂</span>
            </div>
            <span className="text-[10px] text-white/50">↑ 12% today vs baseline</span>
          </div>

          <div className="bg-[#0A183D]/70 p-4 rounded-xl text-left border-l-2 border-l-[#FF1493] border border-pink-500/20 backdrop-blur-md">
            <span className="text-[11px] font-mono text-pink-300 uppercase tracking-wider block mb-1">Active Students</span>
            <div className="text-2xl font-black text-white font-mono">1,480+</div>
            <span className="text-[10px] text-white/50">Across 12 hostels</span>
          </div>

          <div className="bg-[#0A183D]/70 p-4 rounded-xl text-left border-l-2 border-l-[#39FF14] border border-lime-500/20 backdrop-blur-md">
            <span className="text-[11px] font-mono text-lime-300 uppercase tracking-wider block mb-1">Clean Commutes</span>
            <div className="text-2xl font-black text-white font-mono">3,920 km</div>
            <span className="text-[10px] text-white/50">Pedal & electric transit</span>
          </div>

          <div className="bg-[#0A183D]/70 p-4 rounded-xl text-left border-l-2 border-l-[#FFE600] border border-yellow-500/20 backdrop-blur-md">
            <span className="text-[11px] font-mono text-yellow-300 uppercase tracking-wider block mb-1">Bottles Eliminated</span>
            <div className="text-2xl font-black text-white font-mono">8,420</div>
            <span className="text-[10px] text-white/50">Zero single-use waste</span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* NEW FEATURE HIGHLIGHT: PULSE FEED SOCIAL & CLOUDINARY PROOF */}
        {/* ============================================================= */}
        <div id="feed-highlight" className="w-full max-w-5xl mb-20 text-left">
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#07112B] via-[#0A183D] to-[#040816] border border-cyan-500/30 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-[#00F0FF]">
                  <Camera className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>NEW: PULSE SOCIAL FEED & CLOUDINARY PROOF</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                  Post Your Eco Wins. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FF1493] to-[#FFE600]">
                    Earn Points & Peer Cheers.
                  </span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Upload photographic proof of your plant-based cafeteria bowls, bicycle commutes, solar battery charges, and thrift trades via integrated Cloudinary media hosting.
                  Cheer peer accomplishments (+5 pts) and compete for the prestigious <strong>Golden Leaf Laureate</strong> reward for lowest net carbon footprint!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/app/feed"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:brightness-110 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Open Pulse Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                    <Award className="w-4 h-4 text-[#FFE600]" />
                    <span>Lowest Footprint Grand Prize Included</span>
                  </div>
                </div>
              </div>

              {/* Mini Social Feed Preview Card */}
              <div className="w-full lg:w-80 p-4 rounded-2xl bg-[#040816]/80 border border-cyan-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <NeonAvatar name="Priya Sharma" neonColor="pink" size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white">Priya Sharma</div>
                      <div className="text-[10px] text-cyan-300 font-mono">Bhabha Hostel · 14m ago</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-500/20 text-[#39FF14] font-bold">
                    -3.2 kg CO₂
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden h-32 bg-slate-900 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80"
                    alt="Bicycle Commute"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#00F0FF]">
                    📸 Cloudinary Verified
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  "Pedaled 8.5 km to the campus innovation lab instead of hailing a cab! Fresh morning air and zero emissions."
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 font-mono">
                  <span>💚 38 Cheers (+5 pts)</span>
                  <span className="text-cyan-300 font-bold">+40 Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D HERO INTERACTIVE HUD TERMINAL */}
        <div id="grid-hud" className="w-full max-w-5xl">
          <TiltCard className="p-6 sm:p-8 border-cyan-500/30 bg-[#07112B]/90">
            {/* Terminal Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-pink-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                </div>
                <div className="font-mono text-xs text-cyan-300 flex items-center gap-2">
                  <span>TERMINAL://ECOPULSE_SYS_V2.6</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
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
                        ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-cyan-500/20'
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/15 text-[#00F0FF] text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SMART MISSION OF THE HOUR</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  {categoryData[activeTab].title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {categoryData[activeTab].description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-cyan-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">IMPACT CREDIT</span>
                    <span className="text-lg font-black text-[#00F0FF] font-mono">{categoryData[activeTab].points}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-cyan-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">CO₂ AVOIDED</span>
                    <span className="text-lg font-black text-[#39FF14] font-mono">{categoryData[activeTab].co2}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-cyan-500/20">
                    <span className="text-[10px] text-white/50 block font-mono">{categoryData[activeTab].statLabel}</span>
                    <span className="text-lg font-black text-[#FFE600] font-mono">{categoryData[activeTab].statValue}</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-5 bg-black/50 p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-5 h-5 text-[#00F0FF]" />
                    <span className="text-xs font-mono text-cyan-300">ENERGY STATUS</span>
                  </div>
                  <span className="text-xs font-mono text-[#00F0FF] font-bold">OPTIMIZED</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Hostel Quota Completion</span>
                    <span className="text-white font-mono font-bold">84%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#00F0FF] rounded-full w-[84%] shadow-[0_0_8px_#00F0FF]" />
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute This Mission</span>
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* INTERACTIVE IMPACT SIMULATOR */}
      <section id="simulator" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] text-xs font-mono mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE EMISSION SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
            CALCULATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#39FF14]">SEMESTER GAIN</span>
          </h2>
          <p className="text-slate-400 text-base">
            Tune your weekly habits to forecast carbon mitigation and campus leaderboard trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Console */}
          <div className="lg:col-span-7 bg-[#07112B]/90 p-6 sm:p-8 rounded-2xl border border-cyan-500/20 space-y-8 backdrop-blur-md">
            {/* Slider 1: Commute */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Bike className="w-4 h-4 text-[#00F0FF]" />
                  Weekly Active Travel (Walking / Cycling)
                </span>
                <span className="font-mono text-[#00F0FF] font-bold text-base">{commuteKm} km / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={commuteKm}
                onChange={(e) => setCommuteKm(+e.target.value)}
                className="w-full h-2 bg-blue-950/60 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
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
                  <Salad className="w-4 h-4 text-[#39FF14]" />
                  Weekly Plant-Based Dining Swaps
                </span>
                <span className="font-mono text-[#39FF14] font-bold text-base">{mealSwaps} meals / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={mealSwaps}
                onChange={(e) => setMealSwaps(+e.target.value)}
                className="w-full h-2 bg-blue-950/60 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
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
                className="w-full h-2 bg-blue-950/60 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
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
            <TiltCard className="p-8 border-cyan-500/30 bg-[#07112B]/90 text-center relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-[#00F0FF] text-xs font-mono font-bold mb-4">
                <Flame className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>FORECASTED RETURN</span>
              </div>

              <div className="my-6">
                <div className="text-5xl sm:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-cyan-300">
                  {simulatedCO2}
                </div>
                <div className="text-sm font-mono text-cyan-300 uppercase tracking-widest mt-1">
                  kg CO₂ Avoided per Week
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 text-left space-y-2.5 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Semester CO₂ Total (16 wks):</span>
                  <span className="font-mono font-bold text-white">{(simulatedCO2 * 16).toFixed(1)} kg CO₂</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Estimated Campus Rank:</span>
                  <span className="font-mono font-bold text-[#00F0FF]">Top 8% Tier</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Equivalent Trees Planted:</span>
                  <span className="font-mono font-bold text-[#39FF14]">{Math.max(1, Math.round((simulatedCO2 * 16) / 21))} trees</span>
                </div>
              </div>

              <button
                onClick={() => {
                  fireSimulationPulse();
                  handleDemoLogin();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] text-xs font-mono mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>FULL ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
            ENGINEERED FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#39FF14]">STUDENT LIFE</span>
          </h2>
          <p className="text-slate-400 text-base">
            No endless theory or burdensome checklists. Just immediate, rewarding micro-actions with peer validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 text-[#00F0FF]">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Smart Campus Map</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Discover free filtered hydration stations, quiet study green pods, and rental e-cycles across all university blocks.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#00F0FF] font-mono">
              <span>10+ VERIFIED HUBS</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-5 text-[#FF1493]">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Pulse Feed & Media Proof</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Upload real photos of your eco-friendly choices with Cloudinary hosting. Get cheered by hostel peers and boost rank.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#FF1493] font-mono">
              <span>CLOUDINARY POWERED</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mb-5 text-[#39FF14]">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Hostel & House League</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Rally your hall-mates. Pool daily sustainability scores to win quarterly green dormitory grants and bragging rights.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#39FF14] font-mono">
              <span>SEASON 2026 LIVE</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-5 text-[#FFE600]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Eco Passport Badges</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Collect verifiable digital badges for milestone accomplishments: 7-Day Streaks, Century Point Clubs, and Hydration Champion.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#FFE600] font-mono">
              <span>11 UNIQUE BADGES</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 5 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-5 text-[#BD00FF]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Personal Impact Analytics</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Interactive Recharts graphs tracking your daily avoided CO₂, cumulative steps, hydration logs, and dietary progress.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#BD00FF] font-mono">
              <span>REAL-TIME CHARTS</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </TiltCard>

          {/* Card 6 */}
          <TiltCard className="p-6 border-cyan-500/20 bg-[#07112B]/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-5 text-[#00F0FF]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Instant 1-Click Demo</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Pre-seeded with real hostel leagues, active missions, and demo stats. Jump straight into the experience without signing up.
              </p>
            </div>
            <button
              onClick={handleDemoLogin}
              className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs text-[#00F0FF] font-mono hover:text-white transition-colors"
            >
              <span>ACCESS DEMO PROFILE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </TiltCard>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="relative rounded-3xl p-10 sm:p-14 border border-cyan-500/30 bg-gradient-to-b from-[#0A183D] to-[#040816] overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#00F0FF]/15 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4 relative z-10">
            START YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#39FF14]">GREEN PULSE</span> TODAY
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base sm:text-lg mb-8 relative z-10">
            Join thousands of students proving that small daily wellness habits accumulate into massive climate action.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="py-4 px-9 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-extrabold text-base flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>Enter Demo Platform</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="py-4 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-sm font-semibold text-cyan-300 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cyan-500/20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <span className="font-bold text-white">EcoPulse</span>
          <span>© 2026 • Renewable GreenTech Initiative</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-cyan-400">FASTAPI + SQLITE</span>
          <span className="text-white/20">•</span>
          <span className="text-cyan-400">REACT 19 + VITE</span>
          <span className="text-white/20">•</span>
          <span className="text-cyan-400">CLOUDINARY PHOTO PROOF</span>
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
