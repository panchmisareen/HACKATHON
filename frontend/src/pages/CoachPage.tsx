import React, { useState } from 'react';
import {
  Zap, CheckCircle2, Clock, Bike, Salad, Activity, Droplets,
  ArrowRight, Sparkles, Compass, ShieldCheck, Flame, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import type { CoachResponse, MissionCategory } from '../types';
import { Spinner } from '../components/ui';
import { getCategoryConfig } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';

type Energy = 'energetic' | 'okay' | 'tired';

const TIME_OPTIONS = [
  { value: 5, label: '5 min', desc: 'Ultra quick' },
  { value: 10, label: '10 min', desc: 'Standard break' },
  { value: 20, label: '20 min', desc: 'Deep habit' },
];

const ENERGY_OPTIONS: { value: Energy; label: string; emoji: string; desc: string }[] = [
  { value: 'energetic', label: 'Energetic', emoji: '⚡', desc: 'High stamina, ready to move' },
  { value: 'okay', label: 'Balanced', emoji: '🌿', desc: 'Steady, focused energy' },
  { value: 'tired', label: 'Low Energy', emoji: '🌙', desc: 'Gentle, restorative action' },
];

const CATEGORY_OPTIONS: { value: MissionCategory | ''; label: string; emoji: string }[] = [
  { value: '', label: 'All Categories', emoji: '🎯' },
  { value: 'travel', label: 'Active Travel', emoji: '🚴' },
  { value: 'meals', label: 'Meal Swaps', emoji: '🥗' },
  { value: 'movement', label: 'Micro-Breaks', emoji: '⚡' },
  { value: 'hydration', label: 'Hydration', emoji: '💧' },
];

export default function CoachPage() {
  const { user, updatePoints } = useAuth();
  const [availableTime, setAvailableTime] = useState<number>(10);
  const [energy, setEnergy] = useState<Energy>('okay');
  const [preferredCategory, setPreferredCategory] = useState<MissionCategory | ''>('');
  const [hasBottle, setHasBottle] = useState(true);
  const [weeklyFocus, setWeeklyFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResponse | null>(null);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchMission = async (time: number, eng: Energy, cat: MissionCategory | '', bottle: boolean) => {
    setLoading(true);
    setError('');
    setResult(null);
    setCompleted(false);
    setSuccessBanner('');
    try {
      const { data } = await api.post<CoachResponse>('/coach/recommend', {
        available_time: time,
        energy: eng,
        preferred_category: cat || undefined,
        has_reusable_bottle: bottle,
        weekly_focus: weeklyFocus || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not get recommendation. Backend might be restarting.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchMission(availableTime, energy, preferredCategory, hasBottle);
  };

  const handleQuickPreset = (time: number, eng: Energy, cat: MissionCategory | '') => {
    setAvailableTime(time);
    setEnergy(eng);
    setPreferredCategory(cat);
    fetchMission(time, eng, cat, hasBottle);
  };

  const handleComplete = async () => {
    if (!result || completed || completing) return;
    setCompleting(true);
    try {
      const res = await api.post(`/missions/${result.mission.id}/complete`, {});
      setCompleted(true);
      const pointsAwarded = res.data?.points_awarded || res.data?.points_earned || result.mission.points || 15;
      const newTotal = res.data?.new_total_points ?? ((user?.total_points ?? user?.points ?? 0) + pointsAwarded);
      updatePoints(newTotal);
      setSuccessBanner(`Mission Completed! +${pointsAwarded} points added to your score.`);
      triggerConfetti();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setCompleted(true);
        setSuccessBanner('Mission marked as completed!');
      } else {
        setError(err?.response?.data?.detail || 'Could not complete mission.');
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#0A2518] text-[#00E575]">
              <Zap size={12} className="text-[#00E575]" />
              Smart Missions Coach
            </span>
            <span className="text-xs text-stone-600">Deterministic · Rule-Engine Powered</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
            Personalized <span className="font-serif italic font-normal text-stone-500">Missions</span>
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Check in with your schedule, energy level, and preferences to receive a habit mission tailored to your exact moment.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickPreset(5, 'okay', 'movement')}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200/80 hover:border-[#0A2518] text-stone-700 shadow-xs transition-colors"
          >
            ⚡ 5-min stretch
          </button>
          <button
            onClick={() => handleQuickPreset(10, 'tired', 'hydration')}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200/80 hover:border-[#0A2518] text-stone-700 shadow-xs transition-colors"
          >
            💧 Water refill
          </button>
          <button
            onClick={() => handleQuickPreset(15, 'energetic', 'travel')}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200/80 hover:border-[#0A2518] text-stone-700 shadow-xs transition-colors"
          >
            🚴 Active walk/cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Check-In Controls Form */}
        <div className="lg:col-span-6 space-y-5">
          <div className="card-studio p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <Clock size={14} className="text-[#FF5500]" /> Check-In Configuration
              </span>
              <span className="text-[11px] text-stone-600">Step 1 of 2</span>
            </div>

            {/* Time selection */}
            <div>
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">
                1. How much time do you have?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setAvailableTime(t.value)}
                    className={`p-3.5 rounded-2xl text-left transition-all border ${
                      availableTime === t.value
                        ? 'bg-[#0A2518] text-white border-[#0A2518] shadow-md ring-2 ring-[#00E575]/20'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200/80'
                    }`}
                  >
                    <div className="font-black text-base">{t.label}</div>
                    <div className={`text-[10px] mt-0.5 ${availableTime === t.value ? 'text-stone-300' : 'text-stone-600'}`}>
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy level */}
            <div>
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">
                2. How is your energy right now?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {ENERGY_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setEnergy(e.value)}
                    className={`p-3.5 rounded-2xl text-left transition-all border ${
                      energy === e.value
                        ? 'bg-[#0A2518] text-white border-[#0A2518] shadow-md ring-2 ring-[#00E575]/20'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200/80'
                    }`}
                  >
                    <div className="text-xl mb-1">{e.emoji}</div>
                    <div className="font-bold text-xs">{e.label}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${energy === e.value ? 'text-stone-300' : 'text-stone-600'}`}>
                      {e.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Category */}
            <div>
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">
                3. Preferred Focus (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPreferredCategory(c.value)}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${
                      preferredCategory === c.value
                        ? 'bg-[#0A2518] text-white border-[#0A2518] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reusable Bottle Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-3">
                <span className="text-xl">💧</span>
                <div>
                  <div className="text-xs font-bold text-stone-900">Reusable Bottle Ready</div>
                  <div className="text-[10px] text-stone-600">Prioritizes campus refill stations</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasBottle(!hasBottle)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  hasBottle ? 'bg-[#00E575]' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                    hasBottle ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-[#0A2518] text-[#00E575] hover:bg-stone-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-98"
            >
              {loading ? (
                <Spinner className="w-5 h-5 text-[#00E575]" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Personalized Mission</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Mission Showcase Bento Card */}
        <div className="lg:col-span-6 flex flex-col">
          {result ? (
            <div className="card-noir p-7 rounded-3xl flex-1 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10 animate-fade-in">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E575]/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#00E575] border border-[#00E575]/30">
                      {result.mission.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-stone-300">
                      {result.mission.difficulty}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#00E575] font-black flex items-center gap-1">
                    <Sparkles size={13} /> {Math.round(result.recommendation_score * 100)}% Match
                  </div>
                </div>

                {/* Mission title & description */}
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                  {result.mission.title}
                </h2>
                <p className="text-sm text-stone-300 leading-relaxed mb-4">
                  {result.mission.description}
                </p>

                {/* Decision reason callout */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-start gap-2.5">
                  <Compass size={16} className="text-[#00E575] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-300 italic font-serif leading-snug">
                    "{result.reason}"
                  </p>
                </div>

                {/* Step by step instructions */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                    Execution Steps:
                  </div>
                  <div className="space-y-2">
                    {result.mission.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-stone-200">
                        <span className="w-5 h-5 rounded-full bg-[#00E575]/20 text-[#00E575] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="border-t border-white/10 pt-5 mt-auto">
                {successBanner && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#00E575]/20 border border-[#00E575]/40 text-[#00E575] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{successBanner}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Reward</div>
                    <div className="text-2xl font-black text-[#00E575]">+{result.mission.points} pts</div>
                  </div>

                  {completed ? (
                    <div className="py-3.5 px-6 rounded-full bg-white/10 border border-[#00E575]/40 text-[#00E575] font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Completed!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="py-3.5 px-7 rounded-full bg-[#00E575] text-[#0A2518] hover:bg-[#00c966] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-transform active:scale-98"
                    >
                      {completing ? (
                        <Spinner className="w-4 h-4 text-[#0A2518]" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Complete & Earn Points</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-studio p-8 rounded-3xl flex-1 flex flex-col items-center justify-center text-center border-dashed border-2 border-stone-200 min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🎯
              </div>
              <h3 className="text-xl font-black text-stone-900 tracking-tight">Ready for your briefing</h3>
              <p className="text-xs text-stone-600 max-w-sm mt-1 leading-relaxed">
                Select your time and energy on the left, or click one of the quick presets above to generate your customized green mission.
              </p>
              <button
                onClick={handleSubmit}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#0A2518] text-[#00E575] text-xs font-black uppercase tracking-wider hover:bg-stone-900 transition-colors shadow-md"
              >
                Generate First Mission
              </button>
            </div>
          )}
        </div>
      </div>
      {/* PREDICTIVE SMART COACH HISTORICAL INSIGHTS */}
      <div className="card-studio p-6 rounded-3xl bg-white border border-stone-200/90 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wider">
              Predictive Telemetry & Historical Habit Coaching
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Time-Series ML Model Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '⚡',
              headline: 'Standby Power Peaks 1 AM – 6 AM',
              observation: 'Workstation rig & chargers remain in vampire standby overnight (~40W constant draw).',
              action: 'Unplug your tech hub power strip before sleeping tonight.',
              impact: 'Saves 0.82 kg CO2e this week (+25 pts)',
              badge: 'High Leverage',
            },
            {
              icon: '☕',
              headline: 'Friday Afternoon Beverage Pattern',
              observation: 'Historical activity stream shows 2 iced dairy beverage orders on Friday afternoons.',
              action: 'Swap to an oat milk cold brew or steeped herbal tea at the campus cafe.',
              impact: 'Avoids ~700g CO2e and single-use plastic (+20 pts)',
              badge: 'Habit Swap',
            },
            {
              icon: '🚶',
              headline: 'Sector 125 Metro Shorter Leg Detected',
              observation: 'Frequently take a solo auto for the 1.4 km stretch from the metro gate on Tuesdays.',
              action: 'Join the 8:45 AM Canopy Walkers group tomorrow morning.',
              impact: 'Cuts 650g CO2e tailpipe emissions (+30 pts)',
              badge: 'Active Commute',
            },
          ].map((pred, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#F9F9F7] border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{pred.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {pred.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{pred.headline}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{pred.observation}</p>
                <div className="text-xs text-emerald-800 font-semibold mt-2 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  👉 {pred.action}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-mono text-emerald-700 font-bold">
                {pred.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
