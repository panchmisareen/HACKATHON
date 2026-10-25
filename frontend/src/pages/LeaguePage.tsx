import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Users, Medal, Flame, Target, Info,
  ShoppingBag, Shield, CheckCircle2, Tv, Sparkles,
  Award, ArrowRight, BookOpen, Smartphone, ExternalLink,
  ChevronRight, Tag, RefreshCw, Zap, PlusCircle
} from 'lucide-react';
import api from '../services/api';
import type { LeaderboardEntry, TeamLeaderboardEntry, MarketplaceItem, ThriftListing, HostelTournamentStanding } from '../types';
import { Spinner, AvatarCircle, DemoNotice, EmptyState } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';

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

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'hostels' | 'marketplace' | 'thrift' | 'individual' | 'signage'>('hostels');

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [indRes, tmRes, hostRes, mktRes, thRes, signRes] = await Promise.all([
          api.get<LeaderboardEntry[]>('/leaderboard').catch(() => ({ data: [] })),
          api.get<TeamLeaderboardEntry[]>('/leaderboard/teams').catch(() => ({ data: [] })),
          api.get('/tournaments/hostels').catch(() => ({ data: { standings: [] } })),
          api.get<MarketplaceItem[]>('/marketplace/items').catch(() => ({ data: [] })),
          api.get('/marketplace/thrift').catch(() => ({ data: { listings: [] } })),
          api.get('/tournaments/digital-signage').catch(() => ({ data: null })),
        ]);

        setIndividuals(indRes.data || []);
        setTeams(tmRes.data || []);
        setHostelStandings(hostRes.data?.standings || []);
        setMarketItems(mktRes.data || []);
        setThriftListings(thRes.data?.listings || []);
        setSignageData(signRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRedeem = async (itemId: string) => {
    setRedeemingId(itemId);
    setRedeemSuccess(null);
    try {
      const res = await api.post('/marketplace/redeem', { item_id: itemId });
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

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A] max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#0A2518] text-[#00E575]">
              <Trophy size={13} className="text-[#00E575]" />
              Inter-Hostel & Campus League
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">12 Hostels Actively Logging</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Campus <span className="font-serif italic font-normal text-emerald-700">Tournament & Marketplace</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Compete in inter-hostel leagues for real cafeteria discounts, spend green points in the marketplace, and thrift campus gear.
          </p>
        </div>

        {/* User Balance Chip */}
        <div className="bg-[#111613] text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✦
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/60 uppercase">Your Balance</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {(user?.total_points || 0).toLocaleString()} pts
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex bg-stone-200/80 p-1 rounded-2xl overflow-x-auto gap-1 border border-stone-300/60 scrollbar-none">
        {[
          { id: 'hostels', label: '🏆 Inter-Hostel Tournament', count: 12 },
          { id: 'marketplace', label: '🛒 Green Marketplace & Shields' },
          { id: 'thrift', label: '♻️ Circular Thrift Hub', count: thriftListings.length },
          { id: 'individual', label: '👤 Individual Rankings' },
          { id: 'signage', label: '📺 Dining Hall Signage Feed' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-[#111613] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${tab === t.id ? 'bg-white/20 text-emerald-300' : 'bg-slate-300 text-slate-700'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="w-8 h-8 text-emerald-700 mb-3 animate-spin" />
          <p className="font-mono text-xs uppercase text-slate-500">Syncing Campus Standings…</p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: INTER-HOSTEL & INTER-DEPARTMENT TOURNAMENT GRID */}
          {/* ======================================================== */}
          {tab === 'hostels' && (
            <div className="space-y-6">
              {/* Prize Pool Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0C1F16] via-[#122F22] to-[#0A1B13] text-white border border-emerald-900 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                      GRAND PRIZE ACTIVE
                    </span>
                    <span className="text-xs font-mono text-emerald-300">✦ 4 DAYS REMAINING</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Autumn Campus Green Cup 2024</h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    Hostel with highest mitigated CO₂ and habit consistency wins a <strong>50% Cafeteria Discount for all residents this Friday</strong> and the Campus Green Shield Trophy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center flex-shrink-0">
                  <div className="text-3xl font-black text-amber-400">1,284.6 kg</div>
                  <div className="text-[11px] font-mono text-emerald-300 uppercase mt-0.5">Campus CO₂ Mitigated</div>
                </div>
              </div>

              {/* Tournament Standings Grid */}
              <div className="space-y-3">
                {hostelStandings.map((h) => (
                  <div
                    key={h.name}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0A2518] text-[#00E575] flex items-center justify-center font-display font-black text-lg flex-shrink-0">
                        {h.rank <= 3 ? <RankIcon rank={h.rank} /> : `#${h.rank}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                            {h.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                          <span>{h.members_active} students logging</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-bold">{h.co2_mitigated_kg} kg CO₂ avoided</span>
                          <span>·</span>
                          <span>Shield Rate: {h.streak_shield_rate}</span>
                        </div>
                        <div className="text-xs text-amber-800 font-semibold mt-1 flex items-center gap-1">
                          <span>🎁 Reward:</span>
                          <span>{h.perk_reward}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-slate-900">{h.weekly_points.toLocaleString()}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Weekly Points</div>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs font-mono whitespace-nowrap">
                        {h.trophy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: IN-APP GREEN REWARDS & STREAK SHIELDS MARKETPLACE */}
          {/* ======================================================== */}
          {tab === 'marketplace' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span>
                  ✦ <strong>Micro-Economy:</strong> Spend your hard-earned green points on real campus perks, cafe drinks, or streak shields to protect your logging momentum!
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  Balance: {(user?.total_points || 0).toLocaleString()} pts
                </span>
              </div>

              {redeemSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs font-mono text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>{redeemSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {marketItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono font-extrabold text-base text-emerald-700">
                        {item.cost_points} pts
                      </span>
                      <button
                        disabled={redeemingId === item.id || ((user?.total_points || 0) < item.cost_points)}
                        onClick={() => handleRedeem(item.id)}
                        className="px-4 py-2 rounded-xl bg-[#111613] hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all"
                      >
                        {redeemingId === item.id ? 'Claiming…' : 'Redeem Perk'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SECOND-HAND CIRCULAR ECONOMY & THRIFT HUB */}
          {/* ======================================================== */}
          {tab === 'thrift' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-mono font-bold mb-2">
                    <span>♻️ PW IOI CIRCULAR ECONOMY</span>
                  </div>
                  <h3 className="font-bold text-lg text-emerald-950">Campus Circular Thrift Exchange</h3>
                  <p className="text-xs text-emerald-800 mt-1 max-w-xl leading-relaxed">
                    Cut upstream raw material extraction & manufacturing emissions by trading pre-loved course textbooks, tech accessories, and dorm gear with hostel peers.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Link
                      to="/app/thrift"
                      className="px-4 py-2 rounded-xl bg-[#111613] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ➕ Write / List Your Item (+35 pts)
                    </Link>
                    <Link
                      to="/app/thrift"
                      className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Thrift Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </Link>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-3 flex-shrink-0">
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center min-w-[140px] shadow-xs">
                    <div className="text-lg font-black text-emerald-800 font-mono">
                      {thriftListings.reduce((sum, i) => sum + (i.avoided_manufacturing_co2_kg || 0), 0).toFixed(1)} kg
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 uppercase font-semibold">Avoided CO₂e</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center min-w-[140px] shadow-xs">
                    <div className="text-lg font-black text-slate-800 font-mono">
                      {thriftListings.length} Items
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Active Catalog</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thriftListings.map((item) => (
                  <div key={item.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {item.category}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-mono mt-1">
                        Seller: <strong className="text-slate-700">{item.seller}</strong> · Condition: {item.condition}
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] font-mono text-emerald-900 flex items-center justify-between mt-2.5">
                        <span>Avoided Footprint:</span>
                        <strong className="text-emerald-700 font-bold">+{item.avoided_manufacturing_co2_kg} kg CO₂e saved</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {item.price_inr === 0 ? 'FREE' : `₹${item.price_inr}`}
                      </span>
                      <Link
                        to="/app/thrift"
                        className="px-3.5 py-1.5 rounded-xl bg-[#111613] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
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
                <div className="card p-5 bg-gradient-to-r from-emerald-50 to-white border-emerald-200">
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
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
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
                      ind.is_current_user ? 'bg-[#111613] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-900'
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
                    <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      LIVE DINING HALL SCREEN BROADCAST
                    </span>
                  </div>
                  <span className="text-xs font-mono text-white/50">TV ID: PW-IOI-SCREEN-01</span>
                </div>

                <div className="text-center py-6">
                  <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
                    CAMPUS ECO LEAGUE STANDINGS
                  </div>
                  <div className="text-emerald-400 font-mono text-sm mt-2">
                    {signageData?.ticker || '✦ LEADER: SILVER SPRINGS ALPHA ✦ 184.2 KG CO2 MITIGATED THIS WEEK'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {hostelStandings.slice(0, 3).map((h, i) => (
                    <div key={h.name} className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center">
                      <div className="text-3xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="font-bold text-sm text-white">{h.name}</div>
                      <div className="text-lg font-mono font-black text-emerald-400 mt-1">{h.weekly_points} PTS</div>
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
