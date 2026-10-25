import React, { useState, useEffect } from 'react';
import {
  Share2, Heart, MessageCircle, Sparkles, Image as ImageIcon,
  Send, Camera, Award, Crown, Leaf, Footprints, CheckCircle2,
  TrendingUp, Users, PlusCircle, X, ExternalLink, Flame, Wand2, ShieldCheck, Filter
} from 'lucide-react';
import api from '../services/api';
import type { FeedPost, LowestFootprintChampion } from '../types';
import { Spinner } from '../components/ui';
import { NeonAvatar, CarbonFootprintIcon, AvoidedCarbonBadge } from '../components/ui/CarbonElements';
import { cloudinaryService, ECO_PROOF_TEMPLATES, type CloudinaryAIVerification } from '../services/cloudinary.service';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';
import { magicAudio } from '../utils/magicAudio';

export default function FeedPage() {
  const { user, updatePoints } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [champion, setChampion] = useState<LowestFootprintChampion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  // New Post Form State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(0);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [avoidedCo2, setAvoidedCo2] = useState<number>(2.5);
  const [actionTag, setActionTag] = useState<string>('#ZeroEmissionCommute');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cloudinary AI Verification State
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<CloudinaryAIVerification | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<'none' | 'wax_seal' | 'laurel_frame' | 'lumos_glow' | 'bg_removal'>('wax_seal');

  // Active Comment Box States
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Fetch Feed & Champion
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [feedRes, champRes] = await Promise.all([
          api.get('/social/feed'),
          api.get('/social/champion'),
        ]);
        if (feedRes.data?.posts) {
          setPosts(feedRes.data.posts);
        }
        if (champRes.data) {
          setChampion(champRes.data);
        }
      } catch (err) {
        console.error('Failed to load social feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Trigger AI analysis on current photo
  const runAIVerification = async (imageUrl: string, actionType: string) => {
    setAiScanning(true);
    try {
      const res = await cloudinaryService.verifyProofWithAI(imageUrl, actionType, actionTag);
      setAiResult(res);
      if (res.co2_mitigated_kg) {
        setAvoidedCo2(res.co2_mitigated_kg);
      }
    } catch {
      // fallback
    } finally {
      setAiScanning(false);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIdx(idx);
    const tmpl = ECO_PROOF_TEMPLATES[idx];
    setCustomImageUrl(tmpl.url);
    setActionTag(tmpl.tag);
    setAvoidedCo2(tmpl.co2);
    if (!postTitle) setPostTitle(tmpl.label);
    if (!postContent) setPostContent(tmpl.caption);

    runAIVerification(tmpl.url, tmpl.actionType);
  };

  // Handle Cloudinary Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await cloudinaryService.uploadImage(file, postTitle || 'eco_achievement');
      setCustomImageUrl(url);
      runAIVerification(url, 'commute');
      magicAudio.playSilverChime();
    } catch (err) {
      alert('Could not upload image. Selected default proof photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
    try {
      const finalImage = customImageUrl || ECO_PROOF_TEMPLATES[selectedTemplateIdx].url;
      const res = await api.post('/social/feed/post', {
        title: postTitle.trim(),
        content: postContent.trim(),
        image_url: finalImage,
        action_tag: actionTag,
        avoided_co2_kg: Number(avoidedCo2),
      });

      if (res.data?.post) {
        setPosts((prev) => [res.data.post, ...prev]);
        if (res.data.new_total_points !== undefined) {
          updatePoints(res.data.new_total_points);
        }
        magicAudio.playWandWhoosh();
        setTimeout(() => magicAudio.playStardustSparkle(), 200);
        triggerConfetti();
        setIsPostModalOpen(false);

        // Reset
        setPostTitle('');
        setPostContent('');
        setCustomImageUrl('');
        setAiResult(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  // Like / Cheer Post with Silver Chime Sound
  const handleLikePost = async (postId: string) => {
    magicAudio.playSilverChime();
    try {
      const res = await api.post('/social/feed/like', { post_id: postId });
      if (res.data?.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes_count: res.data.likes,
                  liked_by_me: !p.liked_by_me,
                }
              : p
          )
        );
        if (res.data.points_awarded > 0) {
          triggerConfetti();
        }
      }
    } catch (err) {
      console.error('Like error', err);
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    magicAudio.playSilverChime();
    try {
      const res = await api.post('/social/feed/comment', {
        post_id: postId,
        text: commentText.trim(),
      });
      if (res.data?.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, res.data.comment],
                }
              : p
          )
        );
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment error', err);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(
    (p) => selectedTag === 'All' || p.action_tag === selectedTag
  );

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto pb-24 font-sans">
      {/* ======================================================== */}
      {/* 1. SPECIAL REWARD: LEAST CARBON FOOTPRINT HERO SPOTLIGHT */}
      {/* ======================================================== */}
      {champion && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090D16] via-[#0B132B] to-[#040816] text-white p-7 sm:p-9 shadow-[0_0_50px_rgba(56,189,248,0.2)] border-2 border-sky-400/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wide">
                <Crown className="w-4 h-4 text-amber-400" />
                CAMPUS ZERO-FOOTPRINT HERO OF THE MONTH
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-magical tracking-tight text-white flex items-center gap-2">
                <span>{champion.special_laureate_title}</span>
                <span className="text-amber-400 text-2xl">🏆</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Awarded to the student with the lowest verified carbon footprint across campus.
                Enjoying 1-month free organic dining, reserved campus EV bicycle #01, and official honors!
              </p>

              {/* Three Exclusive Laureate Privileges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {champion.exclusive_rewards?.map((rew, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-sky-400/30 text-[11px] font-mono text-sky-200"
                  >
                    <span>✦</span>
                    <span>{rew}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Champion Profile Card */}
            <div className="p-5 rounded-2xl bg-[#070D1E]/90 border border-slate-700/80 flex flex-col items-center text-center space-y-3 flex-shrink-0 min-w-[240px] shadow-lg">
              <NeonAvatar
                name={champion.name}
                neonColor="cyan"
                size="lg"
                showGlow
              />

              <div>
                <div className="font-bold text-base font-magical text-white">{champion.name}</div>
                <div className="text-[11px] text-sky-400 font-mono">@{champion.username}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {champion.department} · {champion.hostel}
                </div>
              </div>

              <div className="w-full pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Net Footprint</div>
                  <div className="text-sm font-black text-amber-300">
                    {champion.weekly_net_footprint_kg} kg/wk
                  </div>
                  <div className="text-[9px] text-emerald-400">88% below avg</div>
                </div>
                <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Avoided CO₂e</div>
                  <div className="text-sm font-black text-sky-300">
                    +{champion.total_avoided_co2_kg} kg
                  </div>
                  <div className="text-[9px] text-slate-400">{champion.active_streak_days}d streak 🔥</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FEED HEADER & POST CREATOR BAR */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B132B]/90 border border-slate-700/80 shadow-xl text-left">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-magical text-white flex items-center gap-2">
              <span>Campus Pulse Feed</span>
              <Sparkles className="w-5 h-5 text-sky-400" />
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Share Cloudinary-verified photos of your daily green actions. Inspire peers, cast spells & earn <strong className="text-sky-300 font-bold">+40 Eco Points</strong>!
          </p>
        </div>

        <button
          onClick={() => {
            magicAudio.playSilverChime();
            setIsPostModalOpen(true);
            if (!customImageUrl) {
              handleSelectTemplate(0);
            }
          }}
          className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Camera className="w-4 h-4" />
          <span>Post Green Proof (+40 pts)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TRENDING TAGS FILTER PILLS */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', '#ZeroEmissionCommute', '#PlantFuelChampion', '#CircularThriftDrop', '#PlasticFreeCampus', '#SolarEnergyStudy'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              magicAudio.playSilverChime();
              setSelectedTag(tag);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
              selectedTag === tag
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-[#0B132B] hover:bg-[#131F42] text-slate-300 border border-slate-700'
            }`}
          >
            {tag === 'All' ? '🌟 All Action Stories' : tag}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 4. POSTS STREAM */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner className="w-8 h-8 text-sky-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-[#0B132B]/80 rounded-3xl border border-slate-700/80 space-y-3">
          <CarbonFootprintIcon className="w-12 h-12 text-sky-400 mx-auto" animated />
          <h3 className="font-bold text-base text-white font-magical">No posts in this category yet</h3>
          <p className="text-xs text-slate-400">Be the first student to post and inspire your campus!</p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold font-mono"
          >
            Share an Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 rounded-3xl bg-[#0B132B]/90 border border-slate-700/80 shadow-lg hover:border-sky-400/80 transition-all space-y-4 text-left"
            >
              {/* Post Header: Author info & Avoided CO2 badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NeonAvatar
                    name={post.author_name}
                    neonColor="cyan"
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white font-magical">
                      <span>{post.author_name}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        @{post.author_username}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>{post.author_hostel || 'PW IOI Campus'}</span>
                      <span>·</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>-{post.avoided_co2_kg} kg CO₂</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-sky-300 border border-white/10">
                    {post.action_tag}
                  </span>
                </div>
              </div>

              {/* Title & Story */}
              <div>
                <h3 className="font-bold text-base text-white font-magical mb-1">{post.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{post.content}</p>
              </div>

              {/* Cloudinary Hosted Photographic Proof with Holographic Watermark */}
              {post.image_url && (
                <div className="relative rounded-2xl overflow-hidden max-h-96 bg-black border border-slate-800">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-sky-400" />
                      <span>Cloudinary AI Verified</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-400/30">
                      📜 Wax Sealed Proof
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Strip: Cheers, Comments, Points Info */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      post.liked_by_me
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart
                      size={14}
                      className={post.liked_by_me ? 'fill-pink-400 text-pink-400' : ''}
                    />
                    <span>{post.likes_count} Cheers</span>
                    <span className="text-[10px] opacity-70">(+5 pts)</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveCommentPostId(
                        activeCommentPostId === post.id ? null : post.id
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>{post.comments?.length || 0} Peer Tips</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Verified Campus Climate Action
                </span>
              </div>

              {/* Comment Thread Box */}
              {activeCommentPostId === post.id && (
                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    {post.comments?.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <NeonAvatar name={c.user} neonColor="yellow" size="xs" />
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex-1">
                          <span className="font-bold text-white font-mono mr-2">{c.user}</span>
                          <span className="text-slate-300">{c.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Cheer this peer or leave a green recommendation..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. NEW ACHIEVEMENT POST CREATOR MODAL (CLOUDINARY POWERED) */}
      {/* ======================================================== */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0E1A38] via-[#0B132B] to-[#040816] border-2 border-sky-400/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(56,189,248,0.25)] space-y-5 animate-scale-in text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <Camera size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-lg font-magical text-white">Share Carbon Reduction Proof</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Cloudinary AI Verified Content Submission</p>
                </div>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-sky-300 mb-1">
                  ACHIEVEMENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Swapped diesel bus for campus bicycle 12km!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium"
                />
              </div>

              {/* Tag & Footprint */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-sky-300 mb-1">
                    ACTION CATEGORY *
                  </label>
                  <select
                    value={actionTag}
                    onChange={(e) => {
                      setActionTag(e.target.value);
                      if (customImageUrl) runAIVerification(customImageUrl, e.target.value);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                  >
                    <option value="#ZeroEmissionCommute">🚴 Zero-Emission Commute</option>
                    <option value="#PlantFuelChampion">🥗 Plant-Based Meal Swap</option>
                    <option value="#CircularThriftDrop">♻️ Circular Thrift Drop</option>
                    <option value="#PlasticFreeCampus">💧 Reusable Bottle Refill</option>
                    <option value="#SolarEnergyStudy">⚡ Solar / Power Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-sky-300 mb-1">
                    AVOIDED CO₂E (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={avoidedCo2}
                    onChange={(e) => setAvoidedCo2(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Story */}
              <div>
                <label className="block text-xs font-mono text-sky-300 mb-1">
                  STORY & PEER RECOMMENDATIONS *
                </label>
                <textarea
                  rows={2}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details of what you did, how it felt, or tips for peers..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Cloudinary Image Picker & Upload */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-black/40 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span>Upload Proof or Pick Verified Template</span>
                  </span>
                  <label className="cursor-pointer text-[11px] font-mono font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 px-3 py-1.5 rounded-xl border border-sky-400/40 transition-colors">
                    {uploadingImage ? 'Uploading…' : '📁 Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Templates Quick Carousel */}
                <div className="grid grid-cols-3 gap-2">
                  {ECO_PROOF_TEMPLATES.map((tmpl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleSelectTemplate(i)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all text-left group ${
                        customImageUrl === tmpl.url || (!customImageUrl && selectedTemplateIdx === i)
                          ? 'border-sky-400 ring-2 ring-sky-500/60'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={tmpl.url}
                        alt={tmpl.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 p-1 flex items-end">
                        <span className="text-[9px] text-white font-mono truncate leading-none">
                          {tmpl.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* AI Content Analysis Results Badge */}
                {aiScanning ? (
                  <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs font-mono text-sky-300 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Cloudinary AI Scanning Image Labels...</span>
                  </div>
                ) : aiResult ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>AI Verified ({aiResult.confidence_percent} match)</span>
                      </span>
                      <span className="text-amber-300">{aiResult.seal_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Detected Objects: {aiResult.detected_objects.join(' · ')}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-xs font-mono font-bold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Publishing…' : 'Publish & Earn +40 pts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
