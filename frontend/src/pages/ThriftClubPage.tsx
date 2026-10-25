import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Recycle, Tag, PlusCircle, Share2, Copy, Check,
  ExternalLink, FileText, Sparkles, Leaf, MapPin, User, Search,
  Award, Download, CheckCircle2, X, ArrowRight, MessageSquare, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import type { ThriftListing } from '../types';
import { Spinner, EmptyState } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';

const CATEGORY_ICONS: Record<string, string> = {
  Textbook: '📚',
  Electronics: '🎧',
  'Dorm Gear': '💡',
  Apparel: '👕',
  'Lab Equipment': '🔬',
  'Sports & Mobility': '🚲',
  Other: '📦',
};

const CATEGORY_CO2_DEFAULTS: Record<string, number> = {
  Textbook: 5.4,
  Electronics: 14.8,
  'Dorm Gear': 6.2,
  Apparel: 8.1,
  'Lab Equipment': 4.5,
  'Sports & Mobility': 11.2,
  Other: 4.0,
};

export default function ThriftClubPage() {
  const { user, updatePoints } = useAuth();
  const [listings, setListings] = useState<ThriftListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'co2_high'>('newest');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [activeItemForModal, setActiveItemForModal] = useState<ThriftListing | null>(null);

  // Form State for "Write Yours"
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Textbook');
  const [priceInr, setPriceInr] = useState<number | string>(350);
  const [isFreeDonation, setIsFreeDonation] = useState(false);
  const [condition, setCondition] = useState('Like New');
  const [hostel, setHostel] = useState('Silver Springs Alpha, Room 204');
  const [sellerContact, setSellerContact] = useState(user?.email || '+91 98765 43210 (WhatsApp)');
  const [description, setDescription] = useState('');
  const [customCo2, setCustomCo2] = useState<number>(5.4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch listings
  const fetchThriftListings = async () => {
    try {
      const res = await api.get('/marketplace/thrift');
      if (res.data?.listings) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.error('Failed to load thrift listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThriftListings();
  }, []);

  // Update default CO2 when category changes in form
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setCustomCo2(CATEGORY_CO2_DEFAULTS[newCat] || 5.0);
  };

  // Submit new listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        price_inr: isFreeDonation ? 0 : Number(priceInr),
        condition,
        hostel: hostel.trim(),
        seller_contact: sellerContact.trim(),
        description: description.trim(),
        avoided_manufacturing_co2_kg: Number(customCo2),
      };

      const res = await api.post('/marketplace/thrift', payload);
      if (res.data?.listing) {
        setListings((prev) => [res.data.listing, ...prev]);
        if (res.data.new_total_points !== undefined) {
          updatePoints(res.data.new_total_points);
        }
        triggerConfetti();
        setIsCreateOpen(false);

        // Reset form
        setTitle('');
        setDescription('');
        setIsFreeDonation(false);
        setPriceInr(350);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to publish thrift listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Claim item
  const handleClaimItem = async () => {
    if (!activeItemForModal) return;
    setIsClaiming(true);
    try {
      const res = await api.post('/marketplace/thrift/claim', {
        listing_id: activeItemForModal.id,
        buyer_note: 'Reserved via EcoPulse Circular Thrift Club',
      });
      if (res.data?.success) {
        setListings((prev) =>
          prev.map((item) =>
            item.id === activeItemForModal.id ? { ...item, status: 'Reserved' } : item
          )
        );
        if (res.data.new_total_points !== undefined) {
          updatePoints(res.data.new_total_points);
        }
        setClaimSuccessMsg(res.data.message);
        triggerConfetti();
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to reserve item.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Generate shareable flyer text
  const generateShareText = (item: ThriftListing) => {
    return (
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🌿 ECOPULSE CIRCULAR CAMPUS THRIFT ✦ PW IOI NOIDA\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 ITEM: ${item.title}\n` +
      `🏷️ CATEGORY: ${item.category} (${item.condition})\n` +
      `💰 PRICE: ${item.price_inr === 0 ? 'FREE DONATION' : `₹${item.price_inr}`}\n` +
      `🌱 AVOIDED MANUFACTURING FOOTPRINT: +${item.avoided_manufacturing_co2_kg} kg CO2e saved!\n` +
      `📍 PICKUP: ${item.hostel || 'PW IOI Noida Campus'}\n` +
      `👤 SELLER CONTACT: ${item.seller_contact || item.seller}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Listed on EcoPulse Circular Club (http://localhost:5173/app/thrift)\n` +
      `Better habits. Lighter footprint.`
    );
  };

  const handleCopyShare = (item: ThriftListing) => {
    const text = generateShareText(item);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleDownloadFlyer = (item: ThriftListing) => {
    const text = generateShareText(item);
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `thrift_${item.title.toLowerCase().replace(/\s+/g, '_')}_flyer.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter and sort listings
  const filteredListings = listings
    .filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hostel && item.hostel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price_inr - b.price_inr;
      if (sortBy === 'co2_high') return b.avoided_manufacturing_co2_kg - a.avoided_manufacturing_co2_kg;
      return 0; // default newest as array order
    });

  // Aggregated Stats
  const totalCo2Saved = listings.reduce((acc, curr) => acc + (curr.avoided_manufacturing_co2_kg || 0), 0);
  const totalItems = listings.length;
  const availableItems = listings.filter((i) => i.status !== 'Reserved').length;

  return (
    <div className="space-y-8 animate-fade-in text-[#0F172A] max-w-6xl mx-auto pb-20">
      {/* ======================================================== */}
      {/* HERO SECTION & CIRCULAR IMPACT BANNER */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1e13] via-[#112a1b] to-[#143d24] text-white p-7 sm:p-9 shadow-xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wide">
              <Recycle className="w-3.5 h-3.5 animate-spin-slow" />
              PW IOI CIRCULAR ECONOMY HUB
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-tight">
              Circular Thrift Club <span className="text-emerald-400">& Second-Hand Exchange</span>
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              Cut upstream manufacturing footprints by buying and listing pre-loved course textbooks, tech accessories, dorm gear, and apparel within your hostel community.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                ➕ Write / List Your Item (+35 pts)
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                📋 View Shareable Campus Guide
              </button>
            </div>
          </div>

          {/* Impact Stats Card */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-black/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 min-w-[280px]">
            <div className="space-y-1">
              <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Avoided Footprint
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {totalCo2Saved.toFixed(1)} <span className="text-xs font-normal text-emerald-300">kg CO₂e</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">ISO 14044 LCA Baseline</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Active Listings
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {availableItems} <span className="text-xs font-normal text-slate-400">/ {totalItems}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Ready for campus handoff</div>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Listing Reward
              </div>
              <div className="text-lg font-black font-mono text-amber-200">+35 pts</div>
              <div className="text-[10px] text-slate-400">Awarded to student seller</div>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Claim Reward
              </div>
              <div className="text-lg font-black font-mono text-emerald-200">+25 pts</div>
              <div className="text-[10px] text-slate-400">Awarded to peer buyer</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTROLS: CATEGORIES, SEARCH, SORT */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Textbook', 'Electronics', 'Dorm Gear', 'Apparel', 'Lab Equipment', 'Sports & Mobility'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#111613] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'All' ? '🌟 All Items' : `${CATEGORY_ICONS[cat] || '📦'} ${cat}`}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, hostel, seller..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">✨ Newest First</option>
            <option value="price_low">💰 Price: Low to High</option>
            <option value="co2_high">🌱 Highest CO₂ Avoided</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LISTINGS GRID */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner className="w-8 h-8 text-emerald-600" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="font-bold text-lg text-slate-900">No thrift listings found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Be the first student to list an item in this category! Earn +35 green points and prevent manufacturing emissions.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2 rounded-xl bg-[#111613] text-white text-xs font-bold hover:bg-emerald-600 transition-all"
          >
            ➕ List Your Item Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => {
            const isReserved = item.status === 'Reserved';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between hover:shadow-md ${
                  isReserved
                    ? 'border-amber-200 bg-amber-50/20 opacity-90'
                    : 'border-slate-200/90 hover:border-emerald-500'
                }`}
              >
                <div>
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      <span>{CATEGORY_ICONS[item.category] || '📦'}</span>
                      <span>{item.category}</span>
                    </span>

                    {isReserved ? (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ⏳ Reserved
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Available
                      </span>
                    )}
                  </div>

                  {/* Title & Condition */}
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-700">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {item.condition}
                    </span>
                    {item.hostel && (
                      <span className="flex items-center gap-1 truncate text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.hostel}</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      {item.description}
                    </p>
                  )}

                  {/* Avoided Footprint Badge */}
                  <div className="mt-3.5 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-800 flex items-center gap-1.5 font-medium">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      Avoided Footprint:
                    </span>
                    <strong className="text-emerald-700 font-bold">
                      +{item.avoided_manufacturing_co2_kg} kg CO₂e
                    </strong>
                  </div>
                </div>

                {/* Footer: Price, Contact, Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Student Price</div>
                      <div className="text-xl font-black font-mono text-slate-900">
                        {item.price_inr === 0 ? (
                          <span className="text-emerald-600 font-extrabold">FREE / DONATION</span>
                        ) : (
                          `₹${item.price_inr}`
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>Seller: <strong className="text-slate-800">{item.seller}</strong></div>
                      {item.seller_contact && (
                        <div className="text-[10px] text-emerald-700 truncate max-w-[150px]">
                          {item.seller_contact}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveItemForModal(item);
                        setIsShareOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      Share Flyer
                    </button>

                    <button
                      disabled={isReserved}
                      onClick={() => {
                        setActiveItemForModal(item);
                        setClaimSuccessMsg(null);
                        setIsClaimOpen(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isReserved
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#111613] hover:bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      {isReserved ? 'Reserved' : 'Reserve & Handoff'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: WRITE / LIST YOUR PRE-LOVED ITEM */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                ♻️
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">List Your Pre-Loved Item</h3>
                <p className="text-xs text-slate-500">
                  Earn <strong className="text-emerald-700 font-bold">+35 Green Points</strong> and prevent manufacturing carbon!
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              {/* Item Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Title & Details *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Algorithms (CLRS 4th Ed)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Textbook">📚 Course Textbook / Notes</option>
                    <option value="Electronics">🎧 Electronics & Tech Gear</option>
                    <option value="Dorm Gear">💡 Dorm Gear & Lamps</option>
                    <option value="Apparel">👕 Campus Apparel / Hoodies</option>
                    <option value="Lab Equipment">🔬 Lab Equipment & Calcs</option>
                    <option value="Sports & Mobility">🚲 Sports & Micro-Mobility</option>
                    <option value="Other">📦 Other Pre-Loved Good</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Brand New">Brand New (Unopened)</option>
                    <option value="Like New">Like New (Mint)</option>
                    <option value="Good Condition">Good Condition</option>
                    <option value="Well-Loved">Well-Loved (Usable)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Carbon Savings Preview Badge */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Avoided Manufacturing Footprint:
                  </span>
                  <span className="font-black text-emerald-700 text-sm">
                    +{customCo2} kg CO₂e
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Calibrated to ISO 14044 Life Cycle Assessment for {category.toLowerCase()} manufacturing, packaging & logistics.
                </p>
              </div>

              {/* Price & Free Donation Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Pricing Option</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={isFreeDonation}
                      onChange={(e) => setIsFreeDonation(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-700">🌱 Free Campus Donation</span>
                  </label>
                </div>

                {!isFreeDonation ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Selling Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={priceInr}
                      onChange={(e) => setPriceInr(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-mono bg-emerald-100/60 p-2 rounded-xl text-center">
                    Awesome! This item will be marked as a Free Campus Gift.
                  </div>
                )}
              </div>

              {/* Hostel / Pickup & Seller Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hostel / Pickup Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    placeholder="e.g. Silver Springs Alpha, Room 204"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact (WhatsApp/Telegram) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerContact}
                    onChange={(e) => setSellerContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Description Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Used for 1 term in CS201. All pages clean with pencil marks only."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing…' : 'Publish Listing (+35 pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SHAREABLE LISTING FLYER */}
      {/* ======================================================== */}
      {isShareOpen && activeItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsShareOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                📤
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Shareable Campus Flyer</h3>
                <p className="text-xs text-slate-500">
                  Ready to copy & paste to your hostel WhatsApp, Discord, or Instagram stories!
                </p>
              </div>
            </div>

            {/* Flyer Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all border border-slate-800 shadow-inner max-h-64 overflow-y-auto">
              {generateShareText(activeItemForModal)}
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDownloadFlyer(activeItemForModal)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Download .txt Flyer
              </button>

              <button
                onClick={() => handleCopyShare(activeItemForModal)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    Copy WhatsApp Flyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CAMPUS CIRCULAR GUIDE (CAMPUS_THRIFT_CLUB.md PREVIEW) */}
      {/* ======================================================== */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl">
                📄
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Campus Circular Thrift Guide</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Saved at: <code className="bg-slate-100 px-1.5 py-0.5 rounded">CAMPUS_THRIFT_CLUB.md</code>
                </p>
              </div>
            </div>

            {/* Markdown Text Container */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono">
                <strong>♻️ PW IOI Campus Circular Thrift Club & Second-Hand Exchange</strong>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  Better habits. Lighter footprint. — Student Wellness & Sustainability Platform
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">1. Life Cycle Assessment (LCA) Carbon Baselines</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Every pre-loved transaction eliminates virgin pulp harvesting, rare earth lithium mining, chemical polyester synthesis, and air freight:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    📚 Textbooks: <strong>5.4 kg CO₂e</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    🎧 Electronics: <strong>14.8 kg CO₂e</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    💡 Dorm Gear: <strong>6.2 kg CO₂e</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    👕 Campus Apparel: <strong>8.1 kg CO₂e</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">2. How to List & Redeem</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Click the "+ Write / List Your Item" button to post in seconds. Sellers receive +35 Green Points upon submission. Buyers receive +25 Points upon picking up the item at the designated hostel room or campus foyer.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/CAMPUS_THRIFT_CLUB.md"
                download="CAMPUS_THRIFT_CLUB.md"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Download CAMPUS_THRIFT_CLUB.md
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `# ♻️ PW IOI Campus Circular Thrift Club & Second-Hand Exchange\nRead full guide at: http://localhost:5173/app/thrift`
                  );
                  setCopiedGuide(true);
                  setTimeout(() => setCopiedGuide(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-[#111613] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                {copiedGuide ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedGuide ? 'Link Copied!' : 'Copy Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CLAIM / RESERVE CONFIRMATION */}
      {/* ======================================================== */}
      {isClaimOpen && activeItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsClaimOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                🤝
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Reserve Pre-Loved Item</h3>
                <p className="text-xs text-slate-500">
                  Earn <strong className="text-emerald-700 font-bold">+25 Buyer Points</strong> on pickup!
                </p>
              </div>
            </div>

            {!claimSuccessMsg ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-sm text-slate-900">{activeItemForModal.title}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    Category: {activeItemForModal.category} · Condition: {activeItemForModal.condition}
                  </div>
                  <div className="text-sm font-black text-emerald-700 font-mono pt-1">
                    {activeItemForModal.price_inr === 0 ? 'FREE DONATION' : `₹${activeItemForModal.price_inr}`}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <strong>📍 Pickup Location:</strong>
                  <div>{activeItemForModal.hostel || 'PW IOI Campus'}</div>
                  <strong>👤 Seller Contact:</strong>
                  <div>{activeItemForModal.seller_contact || activeItemForModal.seller}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsClaimOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isClaiming}
                    onClick={handleClaimItem}
                    className="px-5 py-2.5 rounded-xl bg-[#111613] hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {isClaiming ? 'Reserving…' : 'Confirm Reservation (+25 pts)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <div className="font-bold text-slate-900 text-sm">{claimSuccessMsg}</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Connect with <strong className="text-slate-800">{activeItemForModal.seller_contact}</strong> to arrange the physical exchange at {activeItemForModal.hostel}.
                </p>
                <button
                  onClick={() => setIsClaimOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#111613] text-white text-xs font-bold hover:bg-emerald-600 transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
