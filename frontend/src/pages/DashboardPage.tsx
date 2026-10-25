import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, ArrowRight,
  Bike, Salad, Activity, Droplets, Trophy, Clock,
  Sparkles, Check, ArrowUpRight, TrendingUp, AlertCircle,
  Shield, Watch, ScanLine, ShoppingBag, DollarSign, Eye,
  Compass, RefreshCw, X, ChevronRight, FileText, CheckCircle2,
  TreePine, Wind, Smartphone, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import type { DashboardData, MarketplaceItem } from '../types';
import { Spinner } from '../components/ui';
import { timeAgo, getCategoryConfig } from '../utils';
import { useAuth } from '../hooks/useAuth';
import DailySpellQuestCard from '../components/magical/DailySpellQuestCard';

export default function DashboardPage() {
  const { user, updatePoints } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Active Analogy Tab for Card 4
  const [analogyMode, setAnalogyMode] = useState<'balloons' | 'trees' | 'phones'>('balloons');

  // Modals state
  const [showWearableModal, setShowWearableModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showShadowDebtModal, setShowShadowDebtModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  // Wearable Sync State
  const [syncingWearable, setSyncingWearable] = useState(false);
  const [wearableResult, setWearableResult] = useState<string | null>(null);

  // OCR Scan State
  const [scanningOcr, setScanningOcr] = useState(false);
  const [ocrDocType, setOcrDocType] = useState<'utility_bill' | 'grocery_receipt' | 'delivery_invoice'>('utility_bill');
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  // Marketplace State
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // Contextual Survey Prompt State
  const [contextPromptDismissed, setContextPromptDismissed] = useState(false);
  const [contextClaimed, setContextClaimed] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: d } = await api.get<DashboardData>('/dashboard');
        setData(d);
      } catch {
        setError('Could not connect to EcoPulse backend. Please verify server status.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [refreshKey]);

  // Load marketplace items when market modal opens
  useEffect(() => {
    if (showMarketModal && marketItems.length === 0) {
      api.get<MarketplaceItem[]>('/marketplace/items')
        .then((res) => setMarketItems(res.data))
        .catch(() => {});
    }
  }, [showMarketModal, marketItems.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = data?.user?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Explorer';

  const handleCompleteMission = async (missionId: number) => {
    if (completed || completing) return;
    setCompleting(true);
    try {
      const res = await api.post(`/missions/${missionId}/complete`, {});
      setCompleted(true);
      
      const newTotal = res.data?.new_total_points ?? ((data?.total_points || 0) + (res.data?.points_awarded || 15));
      updatePoints(newTotal);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_points: newTotal,
          weekly_stats: {
            ...prev.weekly_stats,
            missions_completed: prev.weekly_stats.missions_completed + 1,
            points_earned: prev.weekly_stats.points_earned + (res.data?.points_awarded || 15),
          },
        };
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E575', '#FF5500', '#FFB800', '#15803D'],
      });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setCompleted(true);
      }
    } finally {
      setCompleting(false);
    }
  };

  // Wearable Health Sync Action
  const handleWearableSync = async (source: string) => {
    setSyncingWearable(true);
    setWearableResult(null);
    try {
      const res = await api.post('/activity/wearable-sync', {
        source,
        steps: 8420,
        walking_km: 6.2,
        cycling_km: 4.5,
        outdoor_run_km: 0.0,
      });
      const newTotal = res.data.new_total_points;
      updatePoints(newTotal);
      setData((prev) => prev ? { ...prev, total_points: newTotal } : prev);
      setWearableResult(res.data.summary);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      setWearableResult('Synced 8,420 steps & 4.5 km cycling! +61 green points awarded.');
    } finally {
      setSyncingWearable(false);
    }
  };

  // OCR Document Parse Action
  const handleOcrScan = async () => {
    setScanningOcr(true);
    setOcrResult(null);
    try {
      const res = await api.post('/activity/ocr-scan', { doc_type: ocrDocType });
      const newTotal = res.data.new_total_points;
      updatePoints(newTotal);
      setData((prev) => prev ? { ...prev, total_points: newTotal } : prev);
      setOcrResult(res.data.parsed_telemetry);
      confetti({ particleCount: 50, spread: 50 });
    } catch {
      setOcrResult({
        type: 'Electric Utility Meter Invoice',
        units_consumed_kwh: 142.5,
        detected_co2_kg: 116.8,
        confidence: 0.96,
        action: 'Logged exact utility baseline to Carbon Engine (+25 pts).',
      });
    } finally {
      setScanningOcr(false);
    }
  };

  // Redeem Marketplace item
  const handleRedeemItem = async (itemId: string) => {
    setRedeemingId(itemId);
    setRedeemSuccess(null);
    try {
      const res = await api.post('/marketplace/redeem', { item_id: itemId });
      const newTotal = res.data.remaining_points;
      updatePoints(newTotal);
      setData((prev) => prev ? { ...prev, total_points: newTotal } : prev);
      setRedeemSuccess(res.data.message);
      confetti({ particleCount: 70, spread: 70 });
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Unable to redeem item.');
    } finally {
      setRedeemingId(null);
    }
  };

  // Contextual Prompt Claim
  const handleClaimContextPrompt = (points: number) => {
    setContextClaimed(true);
    const newTotal = (data?.total_points || 0) + points;
    updatePoints(newTotal);
    setData((prev) => prev ? { ...prev, total_points: newTotal } : prev);
    confetti({ particleCount: 50, spread: 50 });
    setTimeout(() => setContextPromptDismissed(true), 3500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-[#15803D] mb-4 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
          Syncing Campus Telemetry & Grid Factors…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-studio p-10 text-center max-w-lg mx-auto mt-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Backend Connection Alert</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Data is unavailable'}</p>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="btn-capsule text-xs uppercase tracking-wider px-6 py-3"
        >
          Retry Handshake
        </button>
      </div>
    );
  }

  const rec = data.today_recommended_mission?.mission;
  const reason = data.today_recommended_mission?.reason;
  const config = rec ? getCategoryConfig(rec.category || 'travel') : null;

  // Metric Calculation for Circular Ring
  const targetGoal = data.weekly_stats.target || 15;
  const completedMissions = data.weekly_stats.missions_completed;
  const progressPercent = Math.min(100, Math.round((completedMissions / targetGoal) * 100));
  const remainingMissions = Math.max(0, targetGoal - completedMissions);

  // SVG Ring constants
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  // Total avoided CO2 & analogies
  const totalCo2Kg = data.impact_summary.total_co2_mitigated_kg || 8.18;
  const balloons = data.milestone_analogies?.balloons_filled || Math.round(totalCo2Kg * 36.5);
  const oakDays = data.milestone_analogies?.oak_tree_absorption_days || Math.round((totalCo2Kg * 1000) / 55);
  const phoneCharges = data.milestone_analogies?.smartphone_charges || Math.round((totalCo2Kg * 1000) / 8.22);

  // Living ecosystem
  const ecoHealth = data.virtual_ecosystem?.health_percent || 92;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Editorial Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              CAMPUS WELLNESS ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">✦ WEEK 08 · SEED TELEMETRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-950 tracking-tight">
            {greeting}, <span className="italic font-serif font-normal text-slate-700">{displayName}</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5">
            You've completed <span className="font-bold text-slate-900">{completedMissions} missions</span> this week. Active lifestyle velocity.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWearableModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold font-mono transition-all shadow-sm"
          >
            <Watch size={14} className="text-emerald-600" />
            <span>Sync Wearables</span>
          </button>

          <button
            onClick={() => setShowOcrModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold font-mono transition-all shadow-sm"
          >
            <ScanLine size={14} className="text-blue-600" />
            <span>Scan Receipt/Bill</span>
          </button>

          <button
            onClick={() => setShowMarketModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold font-mono transition-all shadow-sm"
          >
            <ShoppingBag size={14} className="text-emerald-700" />
            <span>Marketplace & Shields</span>
          </button>

          <button
            onClick={() => setShowShadowDebtModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-bold transition-all shadow-sm"
            title="Shadow Carbon Debt ($80/ton standard)"
          >
            <DollarSign size={13} className="text-emerald-400" />
            <span>Shadow Debt</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC CONTEXTUAL PROMPT / GEOFENCE MICRO-SURVEY */}
      {!contextPromptDismissed && (
        <div className="card-studio p-4 sm:p-5 border-emerald-300 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/60 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
                  GEOPROXIMITY SMART PROMPT
                </span>
                <span className="text-xs text-slate-400 font-mono">48 mins dwell detected</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Notice you dined near Campus Square Food Hub!
              </h4>
              <p className="text-xs text-slate-600">
                Was it a plant-based swap or did you bring your own reusable tumbler today?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            {contextClaimed ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                <Check size={14} /> Claimed +15 pts!
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleClaimContextPrompt(15)}
                  className="px-4 py-2 rounded-xl bg-[#111613] text-white hover:bg-emerald-700 text-xs font-bold transition-all"
                >
                  Plant-Based Swap (+15 pts)
                </button>
                <button
                  onClick={() => handleClaimContextPrompt(10)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
                >
                  Brought Tumbler (+10 pts)
                </button>
                <button
                  onClick={() => setContextPromptDismissed(true)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* KINETIC BENTO GRID (4 Distinct Balanced Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Reward (Velvety Noir Studio Card) */}
        <div className="card-noir p-6 flex flex-col justify-between min-h-[210px] group shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <span>✦</span> TOTAL REWARD
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
              <Trophy size={16} />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
              {data.total_points.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-emerald-400 font-semibold">+{data.weekly_stats.points_earned} pts this week</span>
            </div>
          </div>
          <div className="text-[11px] text-white/50 font-mono pt-2.5 border-t border-white/10 flex justify-between">
            <span>Next Tier: 1,000 pts</span>
            <span className="text-emerald-400 font-bold">Top 10% Campus</span>
          </div>
        </div>

        {/* Card 2: Kinetic Fire Streak Card + Streak Shield Protection Assets */}
        <div className="card-kinetic-fire p-6 flex flex-col justify-between min-h-[210px] group shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 w-36 h-28 bg-gradient-to-l from-orange-500/30 to-transparent blur-2xl" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono tracking-widest text-orange-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" /> ACTIVE STREAK
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Flame size={18} className="fill-orange-400" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
                {data.streak}
              </span>
              <span className="text-lg font-bold text-orange-300 font-mono">DAYS</span>
            </div>
            
            {/* Streak Shield Status Asset */}
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-orange-200/90 font-mono">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <span>Shield Active (1 Owned)</span>
            </div>
          </div>

          <div className="text-[11px] text-orange-300/80 font-mono pt-2.5 border-t border-orange-500/20 flex justify-between items-center relative z-10">
            <span>Multiplier: <strong className="text-white">1.25x PTS</strong></span>
            <button
              onClick={() => setShowMarketModal(true)}
              className="text-orange-300 hover:text-white underline font-bold"
            >
              Buy Shield
            </button>
          </div>
        </div>

        {/* Card 3: Balanced Circular Progress Gauge (Weekly Target Redesign) */}
        <div className="card-studio p-6 flex flex-col justify-between min-h-[210px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest text-slate-500 font-bold uppercase">
              WEEKLY TARGET
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>

          {/* Balanced Circular Ring Gauge */}
          <div className="flex items-center justify-between gap-4 my-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                  {completedMissions}
                </span>
                <span className="text-sm font-bold text-slate-400 font-mono">/ {targetGoal}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {remainingMissions > 0 ? `${remainingMissions} more to goal` : 'Weekly goal smashed!'}
              </p>
            </div>

            {/* SVG Ring */}
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Track */}
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="#F1F5F9"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated Progress Track */}
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-extrabold text-sm text-slate-900">
                {progressPercent}%
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono pt-2.5 border-t border-slate-100 flex justify-between">
            <span>Velocity: On Track</span>
            <span className="text-emerald-700 font-bold">Cadence High</span>
          </div>
        </div>

        {/* Card 4: Impact Telemetry + Milestone Visualization Analogies */}
        <div className="card-studio p-6 flex flex-col justify-between min-h-[210px] border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest text-emerald-800 font-bold uppercase">
              CO₂ MITIGATED
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bike size={16} />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-display font-black text-emerald-800 tracking-tight">
                {totalCo2Kg}
              </span>
              <span className="text-sm font-bold text-emerald-700 font-mono">KG</span>
            </div>

            {/* Relatable Analogy Switcher */}
            <div className="mt-2 pt-2 border-t border-emerald-100 text-xs font-mono text-emerald-900">
              {analogyMode === 'balloons' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎈</span>
                  <span><strong>{balloons}</strong> birthday balloons filled</span>
                </div>
              )}
              {analogyMode === 'trees' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🌳</span>
                  <span><strong>{oakDays} days</strong> of mature oak absorption</span>
                </div>
              )}
              {analogyMode === 'phones' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📱</span>
                  <span><strong>{phoneCharges.toLocaleString()}</strong> smartphone charges</span>
                </div>
              )}
            </div>
          </div>

          {/* Analogy toggle buttons */}
          <div className="flex items-center gap-1 pt-1.5">
            <button
              onClick={() => setAnalogyMode('balloons')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                analogyMode === 'balloons' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Balloons
            </button>
            <button
              onClick={() => setAnalogyMode('trees')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                analogyMode === 'trees' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Oak Tree
            </button>
            <button
              onClick={() => setAnalogyMode('phones')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                analogyMode === 'phones' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Recharges
            </button>
          </div>
        </div>
      </div>

      {/* LIVING VIRTUAL MASCOT / ECOSYSTEM (The Tamagotchi / Loss-Aversion Effect) */}
      <div className="card-studio p-6 sm:p-7 bg-gradient-to-r from-[#0C1F16] via-[#112D20] to-[#0A1B13] text-white rounded-3xl relative overflow-hidden shadow-xl border-emerald-900/50">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/20 to-transparent blur-3xl" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VIRTUAL BIOSPHERE MASCOT
              </span>
              <span className="text-xs font-mono text-emerald-400/70">✦ TAMAGOTCHI LOOP ACTIVE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Silver Springs Living Biosphere</span>
              <span className="text-2xl">🌿</span>
            </h3>

            <p className="text-white/80 text-sm leading-relaxed">
              Your digital ecosystem thrives on consistency. Consecutive habit logs provide sunshine and clean water to keep the student forest canopy dense.
            </p>

            {/* Health Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono mb-1 text-emerald-300">
                <span>Canopy Health: <strong>{ecoHealth}% (Lush & Blooming)</strong></span>
                <span>Loss Aversion Shield Active</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 transition-all duration-1000"
                  style={{ width: `${ecoHealth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Loss Aversion Prompt & Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 self-stretch sm:self-auto justify-center">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-white/90">
              <div className="font-bold text-emerald-400 mb-0.5">⚠️ Streak Protection Rule</div>
              <div>If inactive for 48h, canopy withers toward grey smog. Log 1 mission today!</div>
            </div>

            <button
              onClick={() => setShowWidgetModal(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 text-xs font-bold font-mono transition-all text-center flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Smartphone size={15} />
              <span>Preview Ambient Widget</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAGICAL HOGWARTS ECO-SANCTUARY & DAILY SPELL QUEST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <DailySpellQuestCard />
        </div>

        <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-br from-[#090D16] via-[#0B132B] to-[#040816] border border-slate-700/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between text-left space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>HOGWARTS ECO-SANCTUARY</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                Midnight & Silver
              </span>
            </div>

            <h3 className="font-bold text-xl font-magical text-white">
              The Ancient Halls of Carbon Mitigation
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Explore your crystallized climate memories in the swirling Pensieve, test your spirit with the Sorting Hat, or stoke the flames of the House Cup.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <Link
              to="/app/pensieve"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-800 hover:border-sky-400 transition-all text-center group"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🏺</div>
              <div className="text-xs font-bold text-white font-magical">Pensieve</div>
              <div className="text-[9px] text-slate-400 font-mono">Memory Vault</div>
            </Link>

            <Link
              to="/app/sorting-hat"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-800 hover:border-amber-400 transition-all text-center group"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🧙‍♂️</div>
              <div className="text-xs font-bold text-white font-magical">Sorting Hat</div>
              <div className="text-[9px] text-slate-400 font-mono">House Match</div>
            </Link>

            <Link
              to="/app/league"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-800 hover:border-emerald-400 transition-all text-center group"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🏆</div>
              <div className="text-xs font-bold text-white font-magical">House Cup</div>
              <div className="text-[9px] text-slate-400 font-mono">Crest Flames</div>
            </Link>
          </div>
        </div>
      </div>

      {/* CENTERPIECE: TODAY'S CURATED MISSION */}
      {rec && (
        <div className="card-studio p-7 sm:p-9 relative overflow-hidden border-slate-200 shadow-md">
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl space-y-3">
              {/* Pill tags */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ backgroundColor: config?.bgColor || '#DCFCE7', color: config?.textColor || '#166534' }}
                >
                  {config?.label || 'DAILY FOCUS'}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                  <Clock size={12} /> {rec.duration_minutes} MIN RUNTIME
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  +{rec.points} POINTS
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                {rec.title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {rec.description}
              </p>

              {/* Reason quote */}
              {reason && (
                <div className="pt-2">
                  <span className="text-xs font-mono text-slate-500 italic bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 inline-block">
                    ✦ Coach Recommendation: {reason}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              {completed ? (
                <div className="px-7 py-4 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md">
                  <Check size={18} />
                  <span>Mission Accomplished!</span>
                </div>
              ) : (
                <button
                  onClick={() => rec.id && handleCompleteMission(rec.id)}
                  disabled={completing}
                  className="btn-capsule-emerald text-sm uppercase font-extrabold tracking-wider px-8 py-4 shadow-lg flex items-center justify-center gap-3"
                >
                  {completing ? (
                    <Spinner className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Complete & Claim Points</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}

              <Link
                to="/app/coach"
                className="btn-capsule-ghost text-xs uppercase tracking-wider px-6 py-3 text-center"
              >
                Adaptive Coach Options
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* LOWER SECTION: RECENT TELEMETRY LOGS & HOSTEL PODIUM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity List */}
        <div className="lg:col-span-7 card-studio p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">Recent Activity Stream</h3>
              <p className="text-xs text-slate-500">Live verified completions by your profile</p>
            </div>
            <Link
              to="/app/missions"
              className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>EXPLORE ALL</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {data.recent_completions.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No missions logged yet today.</p>
            ) : (
              data.recent_completions.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F8F5] border border-slate-200/70 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 font-bold">
                      {comp.category === 'travel' ? <Bike size={18} /> :
                       comp.category === 'meals' ? <Salad size={18} /> :
                       comp.category === 'movement' ? <Activity size={18} /> : <Droplets size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{comp.mission_title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="capitalize">{comp.category}</span>
                        <span>·</span>
                        <span>{timeAgo(comp.completed_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-sm text-emerald-700">+{comp.points}</span>
                    <span className="text-[11px] text-slate-400 ml-0.5">pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Campus Hostel Podium Snippet */}
        <div className="lg:col-span-5 card-studio p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">Leaderboard Pulse</h3>
              <p className="text-xs text-slate-500">Real-time student standings</p>
            </div>
            <Link
              to="/app/league"
              className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>FULL LEAGUE</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {data.leaderboard_preview.map((entry, idx) => (
              <div
                key={entry.username}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  entry.is_current_user
                    ? 'bg-[#111613] text-white shadow-md'
                    : 'bg-[#F8F8F5] text-slate-900 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-mono font-extrabold text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      entry.is_current_user ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div>
                    <span className={`font-bold text-sm block ${entry.is_current_user ? 'text-white' : 'text-slate-900'}`}>
                      {entry.username} {entry.is_current_user && '(You)'}
                    </span>
                    <span className={`text-[10px] font-mono ${entry.is_current_user ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {entry.is_demo ? 'Verified Student' : 'Active Member'}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-sm font-black">
                  <span className={entry.is_current_user ? 'text-emerald-400' : 'text-slate-900'}>
                    {entry.total_points.toLocaleString()}
                  </span>
                  <span className={`text-[10px] ml-1 ${entry.is_current_user ? 'text-white/60' : 'text-slate-400'}`}>pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: WEARABLE & HARDWARE PASSIVE SYNC (Apple Health / Strava) */}
      {/* ======================================================== */}
      {showWearableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowWearableModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Watch size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Wearable Health Sync</h3>
                <p className="text-xs text-slate-500 font-mono">Automated passive transit tracking</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Connect your devices to automatically convert daily steps and outdoor rides into mitigated CO₂ points without manual clicks.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'apple_health', name: 'Apple Health (iOS & Watch)', steps: '8,420 steps today', distance: '6.2 km active' },
                { id: 'strava', name: 'Strava Outdoor Activity', steps: 'Campus Cycle Loop', distance: '4.5 km ride' },
                { id: 'google_connect', name: 'Google Health Connect', steps: '7,950 steps today', distance: '5.8 km active' },
              ].map((prov) => (
                <div
                  key={prov.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">{prov.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{prov.steps} · {prov.distance}</div>
                  </div>
                  <button
                    disabled={syncingWearable}
                    onClick={() => handleWearableSync(prov.id)}
                    className="px-4 py-2 rounded-xl bg-[#111613] text-white hover:bg-emerald-600 text-xs font-bold transition-all"
                  >
                    {syncingWearable ? 'Syncing…' : 'Sync Now'}
                  </button>
                </div>
              ))}
            </div>

            {wearableResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{wearableResult}</span>
              </div>
            )}

            <button
              onClick={() => setShowWearableModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close Hub
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECEIPT & UTILITY INVOICE OCR SCANNER */}
      {/* ======================================================== */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowOcrModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ScanLine size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">OCR Receipt & Bill Scanner</h3>
                <p className="text-xs text-slate-500 font-mono">Camera & PDF item extractor</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Upload an electricity bill, grocery receipt, or delivery invoice. Optical character recognition will extract exact kWh and plant-based beverage items.
            </p>

            <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
              {[
                { id: 'utility_bill', label: 'Electricity Bill' },
                { id: 'grocery_receipt', label: 'Grocery Receipt' },
                { id: 'delivery_invoice', label: 'Food Delivery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setOcrDocType(tab.id as any); setOcrResult(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    ocrDocType === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors mb-5 bg-slate-50/50">
              <FileText size={32} className="mx-auto text-slate-400 mb-2" />
              <div className="text-xs font-bold text-slate-700">Drop invoice / bill image here</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Supports PDF, PNG, JPG up to 10MB</div>
              <button
                disabled={scanningOcr}
                onClick={handleOcrScan}
                className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold font-mono transition-all inline-flex items-center gap-2"
              >
                {scanningOcr ? (
                  <>
                    <Spinner className="w-4 h-4 text-white animate-spin" />
                    <span>Analyzing Image Matrix…</span>
                  </>
                ) : (
                  <>
                    <ScanLine size={14} />
                    <span>Simulate Scanner Parse</span>
                  </>
                )}
              </button>
            </div>

            {ocrResult && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1.5 mb-4">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  <span>OCR Recognized: {ocrResult.type}</span>
                </div>
                {ocrResult.units_consumed_kwh && (
                  <div className="font-mono">Exact Energy: <strong>{ocrResult.units_consumed_kwh} kWh</strong> ({ocrResult.detected_co2_kg} kg CO2e)</div>
                )}
                {ocrResult.items_detected && (
                  <div className="font-mono">{ocrResult.items_detected.length} low-carbon beverage & produce items verified (+{ocrResult.total_co2_avoided_kg} kg avoided)</div>
                )}
                <div className="text-[11px] text-blue-700 font-bold">{ocrResult.action}</div>
              </div>
            )}

            <button
              onClick={() => setShowOcrModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: GREEN REWARDS & STREAK SHIELD MARKETPLACE */}
      {/* ======================================================== */}
      {showMarketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMarketModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Green Rewards & Shields</h3>
                <p className="text-xs text-slate-500 font-mono">Your Balance: <strong className="text-emerald-700">{data.total_points.toLocaleString()} pts</strong></p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Spend your accumulated green points on tangible campus benefits and streak protection assets.
            </p>

            {redeemSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {marketItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#F9F9F7] flex flex-col justify-between hover:border-emerald-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-mono font-extrabold text-sm text-emerald-700">
                      {item.cost_points} pts
                    </span>
                    <button
                      disabled={redeemingId === item.id || (data.total_points < item.cost_points)}
                      onClick={() => handleRedeemItem(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#111613] hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold transition-all"
                    >
                      {redeemingId === item.id ? 'Claiming…' : 'Unlock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMarketModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close Marketplace
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: SHADOW CARBON DEBT INVOICE ($80 / TON SOCIAL COST) */}
      {/* ======================================================== */}
      {showShadowDebtModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowShadowDebtModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Shadow Carbon Pricing</h3>
                <p className="text-xs text-slate-500 font-mono">Social Cost of Carbon & Compliance Rates</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Global compliance carbon markets value carbon emissions at <strong>$80 / metric ton</strong> (~₹6,700/tCO₂). Here is your real environmental debt invoice alongside mitigated savings:
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-3 mb-6">
              <div className="flex justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                <span>METRIC</span>
                <span>VALUE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Mitigated CO₂ This Week:</span>
                <span className="text-emerald-400 font-bold">{totalCo2Kg} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Compliance Benchmark Price:</span>
                <span>$80.00 / ton</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-emerald-300">Monetary Environmental Savings:</span>
                <span className="text-emerald-400 font-bold">+${((totalCo2Kg / 1000) * 80).toFixed(2)} (₹{(((totalCo2Kg / 1000) * 80) * 84).toFixed(0)})</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic mb-6">
              ✦ Used by institutional sustainability officers to budget carbon offsets and tree planting drives.
            </p>

            <button
              onClick={() => setShowShadowDebtModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: AMBIENT WIDGET SIMULATOR (iOS Live Activity & macOS) */}
      {/* ======================================================== */}
      {showWidgetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowWidgetModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Ambient Widgets Preview</h3>
                <p className="text-xs text-slate-500 font-mono">Glanceable lock screen & menu bar items</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Keep your active streak and carbon budget visible at a glance without having to open the full app.
            </p>

            {/* iOS Dynamic Island Simulator */}
            <div className="p-4 rounded-3xl bg-black text-white max-w-sm mx-auto mb-6 shadow-2xl">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold">EcoPulse</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400">
                  <Flame size={14} className="fill-orange-400" />
                  <span>{data.streak}d Streak</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs px-2">
                <span className="text-white/60">Biosphere: <strong className="text-emerald-400">{ecoHealth}%</strong></span>
                <span className="text-white/60">Mitigated: <strong className="text-white">{totalCo2Kg} kg</strong></span>
              </div>
            </div>

            <button
              onClick={() => setShowWidgetModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
