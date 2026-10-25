import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Flame, Target,
  ShoppingBag, Shield, CheckCircle2, Tv, Sparkles,
  Award, ArrowRight, BookOpen, Smartphone, ExternalLink,
  ChevronRight, Tag, RefreshCw, Zap, PlusCircle, Crown, Lock, Gift
} from 'lucide-react';
import api from '../services/api';
import type {
  LeaderboardEntry,
  TeamLeaderboardEntry,
  MarketplaceItem,
  ThriftListing,
  HostelTournamentStanding,
  LowestFootprintChampion
} from '../types';
import { Spinner, AvatarCircle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';
import { CarbonFootprintIcon, NeonAvatar } from '../components/ui/CarbonElements';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="font-bold text-slate-500 font-mono text-sm">#{rank}</span>;
}

export default function LeaguePage() {
  const { user, updatePoints } = useAuth();
  const [individuals, setIndividuals] = useState<LeaderboardEntry[]>([]);
  const [teams, setTeams] = useState<TeamLeaderboardEntry[]>([]);
  const [hostelStandings, setHostelStandings] = useState<HostelTournamentStanding[]>([]);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [thriftListings, setThriftListings] = useState<ThriftListing[]>([]);
  const [signageData, setSignageData] = useState<any>(null);
  const [champion, setChampion] = useState<LowestFootprintChampion | null>(null);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'hostels' | 'marketplace' | 'thrift' | 'individual' | 'signage'>('hostels');

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [indRes, tmRes, hostRes, mktRes, thRes, signRes, champRes] = await Promise.all([
          api.get<LeaderboardEntry[]>('/leaderboard').catch(() => ({ data: [] })),
          api.get<TeamLeaderboardEntry[]>('/leaderboard/teams').catch(() => ({ data: [] })),
          api.get('/tournaments/hostels').catch(() => ({ data: { standings: [] } })),
          api.get<MarketplaceItem[]>('/marketplace/items').catch(() => ({ data: [] })),
          api.get('/marketplace/thrift').catch(() => ({ data: { listings: [] } })),
          api.get('/tournaments/digital-signage').catch(() => ({ data: null })),
          api.get<LowestFootprintChampion>('/social/champion').catch(() => ({ data: null })),
        ]);

        setIndividuals(indRes.data || []);
        setTeams(tmRes.data || []);
        setHostelStandings(hostRes.data?.standings || []);
        setMarketItems(mktRes.data || []);
        setThriftListings(thRes.data?.listings || []);
        setSignageData(signRes.data);
        setChampion(champRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRedeem = async (item: MarketplaceItem) => {
    // Streak check
    if (item.required_streak && (user?.streak_days || 0) < item.required_streak) {
      alert(`This reward unlocks once you hit a ${item.required_streak}-day logging streak! Current streak: ${user?.streak_days || 0} days.`);
      return;
    }
    if (item.requires_lowest_footprint) {
      alert(`The Golden Leaf Laureate is automatically conferred to the active student with the lowest verified weekly net footprint! Current champion: ${champion?.name || 'Arjun Patel'}.`);
      return;
    }

    setRedeemingId(item.id);
    setRedeemSuccess(null);
    try {
      const res = await api.post('/marketplace/redeem', { item_id: item.id });
      updatePoints(res.data.remaining_points);
      setRedeemSuccess(res.data.message);
      triggerConfetti();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Insufficient points or unable to redeem.');
    } finally {
      setRedeemingId(null);
    }
  };

  const currentUser = individuals.find((e) => e.is_current_user);
  const streakItems = marketItems.filter((i) => i.category === 'streak_tier');
  const regularItems = marketItems.filter((i) => i.category !== 'streak_tier' && i.category !== 'champion_grand_prize');

  return (
    <div className="space-y-6 animate-fade-in text-[#1C2615] max-w-5xl mx-auto pb-16">
      {/* Header with Olive & Emerald accents */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-olive-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#1C2615] text-[#39FF14]">
              <Trophy size={13} className="text-[#39FF14]" />
              Inter-Hostel & Campus League
            </span>
            <span className="text-xs font-mono font-bold text-olive-700 flex items-center gap-1">
              <CarbonFootprintIcon size={12} color="#15803D" />
              <span>12 Hostels Actively Logging</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#1C2615] tracking-tight font-display">
            Campus <span className="font-serif italic font-normal text-emerald-800">Tournament & Green Rewards</span>
          </h1>
          <p className="text-olive-700 text-xs sm:text-sm mt-1">
            Compete in inter-hostel leagues, unlock streak tiers (3d, 7d, 14d, 30d), and contest the prestigious Lowest Footprint Grand Prize!
          </p>
        </div>

        {/* User Balance & Streak Chip */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-[#1C2615] text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#39FF14] flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/60 uppercase">Your Balance</div>
              <div className="text-sm font-black text-[#39FF14] font-mono">
                {(user?.total_points || 0).toLocaleString()} pts
              </div>
            </div>
          </div>

          <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-2xl flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <div>
              <div className="text-[10px] font-mono text-emerald-800 uppercase font-semibold">Streak</div>
              <div className="text-sm font-black font-mono">{user?.streak_days || 5} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex bg-olive-100/80 p-1 rounded-2xl overflow-x-auto gap-1 border border-olive-200 scrollbar-none">
        {[
          { id: 'hostels', label: '🏆 Inter-Hostel Tournament', count: 12 },
          { id: 'marketplace', label: '🎁 Streak Perks & Marketplace', count: marketItems.length },
          { id: 'thrift', label: '♻️ Circular Thrift Hub', count: thriftListings.length },
          { id: 'individual', label: '👤 Individual Rankings' },
          { id: 'signage', label: '📺 Dining Hall Screen Feed' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-[#1C2615] text-white shadow-sm' : 'text-olive-800 hover:text-[#1C2615]'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${tab === t.id ? 'bg-white/20 text-[#39FF14]' : 'bg-olive-200 text-olive-800'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="w-8 h-8 text-emerald-700 mb-3 animate-spin" />
          <p className="font-mono text-xs uppercase text-olive-600">Syncing Campus Standings…</p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: INTER-HOSTEL & INTER-DEPARTMENT TOURNAMENT GRID */}
          {/* ======================================================== */}
          {tab === 'hostels' && (
            <div className="space-y-6">
              {/* Prize Pool Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1C2615] via-[#2B3821] to-[#152310] text-white border border-emerald-900 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase bg-[#FFE600] text-slate-950 px-2.5 py-0.5 rounded-full">
                      GRAND PRIZE ACTIVE
                    </span>
                    <span className="text-xs font-mono text-[#39FF14]">✦ 4 DAYS REMAINING</span>
                  </div>
                  <h3 className="text-2xl font-bold font-display tracking-tight text-white">
                    ₹50,000 Dormitory Green Sustainability Grant
                  </h3>
                  <p className="text-xs text-olive-200 leading-relaxed">
                    Hostel hall members pool daily avoided emissions. 1st place hostel earns funded solar rooftop study charging benches and full-semester cafe beverage tokens!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 self-start md:self-auto">
                  <div className="text-center">
                    <div className="text-2xl font-black font-mono text-[#39FF14]">1,842</div>
                    <div className="text-[10px] text-white/60 font-mono uppercase">Logged Today</div>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl font-black font-mono text-cyan-300">420 kg</div>
                    <div className="text-[10px] text-white/60 font-mono uppercase">Avoided CO₂</div>
                  </div>
                </div>
              </div>

              {/* Hostels List */}
              <div className="space-y-3">
                {hostelStandings.map((h) => (
                  <div
                    key={h.name}
                    className="p-5 rounded-3xl bg-white border border-olive-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-center font-black text-lg">
                        {h.rank <= 3 ? <RankIcon rank={h.rank} /> : <span className="font-mono text-slate-400">#{h.rank}</span>}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900">{h.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-olive-100 text-olive-800 font-bold">
                            {h.members_active || h.active_students_logging || 12} Students
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-olive-700 font-mono mt-1">
                          <span>{h.co2_mitigated_kg.toLocaleString()} kg CO₂ avoided</span>
                          <span>•</span>
                          <span>{h.perk_reward}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-[#1C2615]">{h.weekly_points.toLocaleString()}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Weekly Points</div>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-olive-100 border border-olive-300 text-olive-900 font-bold text-xs font-mono whitespace-nowrap">
                        {h.trophy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: IN-APP GREEN REWARDS & STREAK PERKS MARKETPLACE */}
          {/* ======================================================== */}
          {tab === 'marketplace' && (
            <div className="space-y-8">
              {/* Balance bar */}
              <div className="p-4 rounded-2xl bg-olive-100/90 border border-olive-200 text-xs text-olive-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  ✦ <strong>Micro-Economy:</strong> Spend your hard-earned green points on real campus perks, redeem unlocked streak milestones, or contest the Lowest Footprint Fellowship!
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  Balance: {(user?.total_points || 0).toLocaleString()} pts · Streak: {user?.streak_days || 5}d
                </span>
              </div>

              {redeemSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs font-mono text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>{redeemSuccess}</span>
                </div>
              )}

              {/* ======================================================= */}
              {/* 1. SPECIAL REWARD FOR PERSON WITH LEAST CARBON FOOTPRINT */}
              {/* ======================================================= */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1C2615] via-[#24351B] to-[#0E160A] text-white border-2 border-[#FFE600]/40 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#39FF14]/10 blur-[90px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFE600]/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-[#FFE600] text-black shadow-sm">
                        <Crown className="w-3.5 h-3.5" />
                        SPECIAL REWARD: LEAST CARBON FOOTPRINT CHAMPION
                      </span>
                      <span className="text-xs font-mono text-[#39FF14]">ROTATING SEMESTER FELLOWSHIP</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                      The Golden Leaf Laureate
                    </h3>

                    <p className="text-xs sm:text-sm text-olive-200 leading-relaxed">
                      Conferred to the student with the absolute lowest verified net carbon footprint across campus.
                      Enjoy exclusive VIP sustainability privileges for the entire month!
                    </p>

                    {/* Laureate Rewards List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left">
                        <div className="text-lg mb-1">🥗</div>
                        <div className="text-xs font-bold text-white">1-Month Free Dining</div>
                        <div className="text-[10px] text-olive-300 font-mono">Organic salad & grain bowls</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left">
                        <div className="text-lg mb-1">🚲</div>
                        <div className="text-xs font-bold text-white">Reserved EV Bike #01</div>
                        <div className="text-[10px] text-olive-300 font-mono">Dedicated campus smart ride</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left">
                        <div className="text-lg mb-1">🏅</div>
                        <div className="text-xs font-bold text-white">President's Medal</div>
                        <div className="text-[10px] text-olive-300 font-mono">Official chancellor honors</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Laureate Showcase Box */}
                  <div className="p-5 rounded-2xl bg-black/60 border border-[#FFE600]/30 text-left space-y-3 lg:w-72 flex-shrink-0">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#FFE600]">
                      <span>CURRENT TITLE HOLDER</span>
                      <span>#1 LIGHTEST</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <NeonAvatar
                        name={champion?.name || 'Arjun Patel'}
                        neonColor="yellow"
                        size="md"
                        showGlow
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{champion?.name || 'Arjun Patel'}</div>
                        <div className="text-[10px] text-olive-300 font-mono">{champion?.department || 'Aerospace & Energy'}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Weekly Net Footprint:</span>
                      <span className="font-mono font-black text-[#39FF14]">
                        {champion?.weekly_net_footprint_kg ?? 2.15} kg CO₂
                      </span>
                    </div>

                    <div className="text-[10px] text-olive-300 font-mono italic">
                      "Campus avg: {champion?.campus_average_footprint_kg ?? 18.4} kg CO₂ (-88% lighter)"
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* 2. STREAK-BASED PROGRESSION TIERS (3d, 7d, 14d, 30d)     */}
              {/* ======================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#1C2615] flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span>Streak Milestone Perks</span>
                    </h3>
                    <p className="text-xs text-olive-700">
                      Rewards unlocked exclusively by maintaining unbroken daily logging streaks!
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-olive-800 bg-olive-100 px-3 py-1.5 rounded-xl border border-olive-200">
                    Your Streak: {user?.streak_days || 5} Days
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {streakItems.map((item) => {
                    const reqStreak = item.required_streak || 1;
                    const isUnlocked = (user?.streak_days || 5) >= reqStreak;
                    const canAfford = (user?.total_points || 0) >= item.cost_points;

                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-3xl border flex flex-col justify-between transition-all relative ${
                          isUnlocked
                            ? 'bg-white border-emerald-300 shadow-sm hover:border-emerald-500'
                            : 'bg-olive-50/70 border-olive-200 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">{item.icon}</span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isUnlocked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600 flex items-center gap-1'
                              }`}
                            >
                              {!isUnlocked && <Lock size={10} />}
                              {item.badge}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#1C2615]">{item.title}</h4>
                          <p className="text-xs text-olive-700 mt-1 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-olive-100">
                          <div className="flex items-center justify-between mb-2 text-[11px] font-mono">
                            <span className="text-olive-600">Requirement:</span>
                            <span className={isUnlocked ? 'text-emerald-700 font-bold' : 'text-orange-600 font-bold'}>
                              {reqStreak}d streak ({user?.streak_days || 5}/{reqStreak})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-sm text-emerald-800">
                              {item.cost_points} pts
                            </span>
                            <button
                              disabled={!isUnlocked || !canAfford || redeemingId === item.id}
                              onClick={() => handleRedeem(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isUnlocked && canAfford
                                  ? 'bg-[#1C2615] hover:bg-emerald-600 text-white shadow-xs'
                                  : 'bg-olive-200 text-olive-500 cursor-not-allowed'
                              }`}
                            >
                              {redeemingId === item.id
                                ? 'Claiming…'
                                : !isUnlocked
                                ? 'Streak Locked'
                                : 'Redeem Perk'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ======================================================= */}
              {/* 3. CAMPUS PARTNER PERKS, COUPONS & STREAK SHIELDS        */}
              {/* ======================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#1C2615] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-700" />
                      <span>Campus Partner Perks & Streak Shields</span>
                    </h3>
                    <p className="text-xs text-olive-700">
                      Redeem eco-points for campus bookstore discounts, zero-waste beverages, or streak protection shields.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {regularItems.map((item) => {
                    const canAfford = (user?.total_points || 0) >= item.cost_points;

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-white border border-olive-200 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-olive-100 text-olive-800">
                              {item.badge}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-[#1C2615]">{item.title}</h4>
                          <p className="text-xs text-olive-700 mt-1 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-olive-100 flex items-center justify-between">
                          <span className="font-mono font-extrabold text-base text-emerald-800">
                            {item.cost_points} pts
                          </span>
                          <button
                            disabled={redeemingId === item.id || !canAfford}
                            onClick={() => handleRedeem(item)}
                            className="px-4 py-2 rounded-xl bg-[#1C2615] hover:bg-emerald-600 disabled:bg-olive-200 disabled:text-olive-500 text-white text-xs font-bold transition-all"
                          >
                            {redeemingId === item.id ? 'Claiming…' : 'Redeem Perk'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SECOND-HAND CIRCULAR ECONOMY & THRIFT HUB */}
          {/* ======================================================== */}
          {tab === 'thrift' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-olive-100 via-emerald-100/70 to-olive-200/50 border border-olive-300 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-mono font-bold mb-2">
                    <CarbonFootprintIcon size={12} color="#15803D" />
                    <span>PW IOI CIRCULAR ECONOMY</span>
                  </div>
                  <h3 className="font-bold text-lg text-emerald-950 font-display">Campus Circular Thrift Exchange</h3>
                  <p className="text-xs text-emerald-800 mt-1 max-w-xl leading-relaxed">
                    Cut upstream raw material extraction & manufacturing emissions by trading pre-loved course textbooks, tech accessories, and dorm gear with hostel peers.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Link
                      to="/app/thrift"
                      className="px-4 py-2 rounded-xl bg-[#1C2615] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Write / List Your Item (+35 pts)</span>
                    </Link>
                    <Link
                      to="/app/thrift"
                      className="px-4 py-2 rounded-xl bg-white hover:bg-olive-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Thrift Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </Link>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-3 flex-shrink-0">
                  <div className="p-3.5 rounded-2xl bg-white border border-olive-200 text-center min-w-[140px] shadow-xs">
                    <div className="text-lg font-black text-emerald-800 font-mono">
                      {thriftListings.reduce((sum, i) => sum + (i.avoided_manufacturing_co2_kg || 0), 0).toFixed(1)} kg
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 uppercase font-semibold">Avoided CO₂e</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-olive-200 text-center min-w-[140px] shadow-xs">
                    <div className="text-lg font-black text-slate-800 font-mono">
                      {thriftListings.length} Items
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Active Catalog</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thriftListings.map((item) => (
                  <div key={item.id} className="p-5 rounded-3xl bg-white border border-olive-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-olive-100 text-olive-800 font-medium">
                          {item.category}
                        </span>
                      </div>

                      <div className="text-xs text-olive-700 font-mono mt-1">
                        Seller: <strong className="text-slate-800">{item.seller}</strong> · Condition: {item.condition}
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] font-mono text-emerald-900 flex items-center justify-between mt-2.5">
                        <span>Avoided Footprint:</span>
                        <strong className="text-emerald-700 font-bold">+{item.avoided_manufacturing_co2_kg} kg CO₂e saved</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-olive-100">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {item.price_inr === 0 ? 'FREE' : `₹${item.price_inr}`}
                      </span>
                      <Link
                        to="/app/thrift"
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C2615] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <span>View / Reserve</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: INDIVIDUAL RANKINGS */}
          {/* ======================================================== */}
          {tab === 'individual' && (
            <div className="space-y-4">
              {currentUser && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-olive-100 to-white border border-emerald-300 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-emerald-700">
                      {currentUser.rank <= 3 ? <RankIcon rank={currentUser.rank} /> : `#${currentUser.rank}`}
                    </div>
                    <AvatarCircle name={currentUser.full_name} color={currentUser.avatar_color} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{currentUser.full_name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">You</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-olive-700 font-mono">
                        <span className="font-bold text-emerald-700">{currentUser.total_points.toLocaleString()} pts</span>
                        <span>{currentUser.missions_completed} missions</span>
                        <span>{currentUser.current_streak}🔥 streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {individuals.map((ind) => (
                  <div
                    key={ind.user_id}
                    className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                      ind.is_current_user ? 'bg-[#1C2615] text-white shadow-md' : 'bg-white border border-olive-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-mono font-bold text-sm">{ind.rank}</span>
                      <AvatarCircle name={ind.full_name} color={ind.avatar_color} size="md" />
                      <div>
                        <div className="font-bold text-sm">{ind.full_name} {ind.is_current_user && '(You)'}</div>
                        <div className="text-[11px] opacity-70 font-mono">{ind.missions_completed} missions · {ind.current_streak}d streak</div>
                      </div>
                    </div>
                    <div className="font-mono font-black text-sm">
                      {ind.total_points.toLocaleString()} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PUBLIC CAMPUS DINING HALL DIGITAL SIGNAGE SIMULATOR */}
          {/* ======================================================== */}
          {tab === 'signage' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-black text-white border-4 border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono text-xs font-bold text-[#39FF14] uppercase tracking-widest">
                      LIVE DINING HALL SCREEN BROADCAST
                    </span>
                  </div>
                  <span className="text-xs font-mono text-white/50">TV ID: PW-IOI-SCREEN-01</span>
                </div>

                <div className="text-center py-6">
                  <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
                    CAMPUS ECO LEAGUE STANDINGS
                  </div>
                  <div className="text-[#39FF14] font-mono text-sm mt-2">
                    {signageData?.ticker || '✦ LEADER: SILVER SPRINGS ALPHA ✦ 184.2 KG CO2 MITIGATED THIS WEEK'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {hostelStandings.slice(0, 3).map((h, i) => (
                    <div key={h.name} className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center">
                      <div className="text-3xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="font-bold text-sm text-white">{h.name}</div>
                      <div className="text-lg font-mono font-black text-[#39FF14] mt-1">{h.weekly_points} PTS</div>
                      <div className="text-xs text-white/60 font-mono mt-0.5">{h.co2_mitigated_kg} kg CO₂ avoided</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
