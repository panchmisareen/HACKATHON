import React, { useState, useEffect } from 'react';
import {
  Share2, Heart, MessageCircle, Sparkles, Image as ImageIcon,
  Send, Camera, Award, Crown, Leaf, Footprints, CheckCircle2,
  TrendingUp, Users, PlusCircle, X, ExternalLink, Flame
} from 'lucide-react';
import api from '../services/api';
import type { FeedPost, LowestFootprintChampion } from '../types';
import { Spinner } from '../components/ui';
import { NeonAvatar, CarbonFootprintIcon, AvoidedCarbonBadge } from '../components/ui/CarbonElements';
import { cloudinaryService, ECO_PROOF_TEMPLATES } from '../services/cloudinary.service';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';

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

  // Handle template selection
  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIdx(idx);
    const tmpl = ECO_PROOF_TEMPLATES[idx];
    setCustomImageUrl(tmpl.url);
    setActionTag(tmpl.tag);
    setAvoidedCo2(tmpl.co2);
    if (!postTitle) setPostTitle(tmpl.label);
    if (!postContent) setPostContent(tmpl.caption);
  };

  // Handle Cloudinary Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await cloudinaryService.uploadImage(file, postTitle || 'eco_achievement');
      setCustomImageUrl(url);
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
        triggerConfetti();
        setIsPostModalOpen(false);

        // Reset
        setPostTitle('');
        setPostContent('');
        setCustomImageUrl('');
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  // Like / Cheer Post
  const handleLikePost = async (postId: string) => {
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
    <div className="space-y-8 animate-fade-in text-[#1C2615] max-w-5xl mx-auto pb-24 font-sans">
      {/* ======================================================== */}
      {/* 1. SPECIAL REWARD: LEAST CARBON FOOTPRINT HERO SPOTLIGHT */}
      {/* ======================================================== */}
      {champion && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2B1D] via-[#243625] to-[#162919] text-white p-7 sm:p-9 shadow-xl border border-emerald-500/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wide">
                <Crown className="w-4 h-4 text-amber-400" />
                CAMPUS ZERO-FOOTPRINT HERO OF THE MONTH
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
                <span>{champion.special_laureate_title}</span>
                <span className="text-amber-400 text-2xl">🏆</span>
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed italic">
                "{champion.quote}"
              </p>

              {/* Exclusive Reward Badges */}
              <div className="pt-2">
                <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Exclusive Laureate Rewards Unlocked:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {champion.exclusive_rewards.map((reward, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-emerald-100 flex items-center gap-2"
                    >
                      <span>{reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Champion Profile Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md text-center min-w-[260px] flex flex-col items-center justify-center space-y-2.5">
              <div className="relative">
                <NeonAvatar
                  name={champion.name}
                  color={champion.avatar_color}
                  size="xl"
                />
                <span className="absolute -top-2 -right-2 text-2xl">👑</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{champion.name}</h3>
                <div className="text-xs text-emerald-300 font-mono">@{champion.username}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">{champion.department}</div>
              </div>

              <div className="w-full pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/20">
                  <div className="text-[10px] text-slate-300">Net Footprint</div>
                  <div className="text-sm font-black text-amber-300">
                    {champion.weekly_net_footprint_kg} kg/wk
                  </div>
                  <div className="text-[9px] text-emerald-400">83% below avg</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/20">
                  <div className="text-[10px] text-slate-300">Avoided CO₂e</div>
                  <div className="text-sm font-black text-emerald-300">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#D9E4D0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-display text-[#1C2615] flex items-center gap-2">
              <span>Campus Pulse Feed</span>
              <CarbonFootprintIcon className="w-6 h-6 text-emerald-600" animated />
            </h1>
          </div>
          <p className="text-xs text-[#5C7348] mt-0.5">
            Share photos of your daily sustainable actions. Inspire peers & earn <strong className="text-emerald-700 font-bold">+40 Green Points</strong>!
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#1C2615] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
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
            onClick={() => setSelectedTag(tag)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === tag
                ? 'bg-[#1C2615] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-[#4B5E39] border border-[#D9E4D0]'
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
          <Spinner className="w-8 h-8 text-emerald-700" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#D9E4D0] space-y-3">
          <CarbonFootprintIcon className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No posts in this category yet</h3>
          <p className="text-xs text-slate-500">Be the first student to post and inspire your campus!</p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1C2615] text-white text-xs font-bold"
          >
            Share an Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 rounded-3xl bg-white border border-[#D9E4D0] shadow-xs hover:border-emerald-600 transition-all space-y-4"
            >
              {/* Post Header: Author info & Avoided CO2 badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NeonAvatar
                    name={post.author_name}
                    color={post.author_avatar_color}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#1C2615]">
                      <span>{post.author_name}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        @{post.author_username}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4B5E39] font-mono flex items-center gap-2">
                      <span>{post.author_hostel || 'PW IOI Campus'}</span>
                      <span>·</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <AvoidedCarbonBadge kg={post.avoided_co2_kg} size="md" />
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="font-bold text-base text-[#1C2615] leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-900 text-[11px] font-mono font-bold">
                    {post.action_tag}
                  </span>
                </div>
              </div>

              {/* Uploaded Photo (Cloudinary Image with zoom transition) */}
              {post.image_url && (
                <div className="relative rounded-2xl overflow-hidden max-h-80 bg-slate-900 border border-slate-200 group">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Proof Attached</span>
                  </div>
                </div>
              )}

              {/* Actions Bar: Like / Cheer & Comment */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                      post.liked_by_me
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.liked_by_me ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{post.likes_count} Cheers</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveCommentPostId(
                        activeCommentPostId === post.id ? null : post.id
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-[#5C7348] flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Carbon Verified</span>
                </div>
              </div>

              {/* Comments Section */}
              {activeCommentPostId === post.id && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No comments yet. Leave the first supportive words!
                      </p>
                    ) : (
                      post.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-start gap-2.5"
                        >
                          <NeonAvatar
                            name={comment.user}
                            color={comment.avatar_color}
                            size="xs"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{comment.user}: </span>
                            <span className="text-slate-700">{comment.text}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Cheer on your peer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1C2615] text-white text-xs font-bold hover:bg-emerald-700 transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: POST GREEN ACTION (CLOUDINARY POWERED) */}
      {/* ======================================================== */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                📸
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Post Carbon Reduction Proof</h3>
                <p className="text-xs text-slate-500">
                  Earn <strong className="text-emerald-700 font-bold">+40 Green Points</strong> and inspire your campus!
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Swapped diesel bus for campus bicycle 12km!"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Tag & Estimated Avoided Footprint */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Action Category *
                  </label>
                  <select
                    value={actionTag}
                    onChange={(e) => setActionTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="#ZeroEmissionCommute">🚴 Zero-Emission Commute</option>
                    <option value="#PlantFuelChampion">🥗 Plant-Based Meal Swap</option>
                    <option value="#CircularThriftDrop">♻️ Circular Thrift Drop</option>
                    <option value="#PlasticFreeCampus">💧 Reusable Bottle Refill</option>
                    <option value="#SolarEnergyStudy">⚡ Solar / Power Conservation</option>
                    <option value="#CampusGreening">🌱 Tree / Sapling Planting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avoided CO₂e (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={avoidedCo2}
                    onChange={(e) => setAvoidedCo2(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Story Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Story / Caption *
                </label>
                <textarea
                  rows={2}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details of what you did, how it felt, or tips for peers..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Photo Proof Selection: Upload or Preset Template */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Upload Cloudinary Proof or Pick Preset</span>
                  </span>
                  <label className="cursor-pointer text-[11px] font-mono font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs">
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
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {ECO_PROOF_TEMPLATES.map((tmpl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleSelectTemplate(i)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all text-left group ${
                        customImageUrl === tmpl.url || (!customImageUrl && selectedTemplateIdx === i)
                          ? 'border-emerald-600 ring-2 ring-emerald-500'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={tmpl.url}
                        alt={tmpl.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                        <span className="text-[9px] text-white font-mono truncate leading-none">
                          {tmpl.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
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
