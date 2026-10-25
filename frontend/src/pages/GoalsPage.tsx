import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Target, Save, CheckCircle, User, Edit3, ArrowRightLeft, LogOut } from 'lucide-react';
import api from '../services/api';
import type { Goal, User as UserType } from '../types';
import { Spinner, ProgressBar } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import AccountSwitcherModal from '../components/auth/AccountSwitcherModal';

const GOAL_PRESETS = [
  { category: 'travel', label: '🚴 Active Travel', unit: 'km', period: 'weekly', default: 20, description: 'km walked, cycled, or on transit' },
  { category: 'movement', label: '⚡ Movement', unit: 'minutes', period: 'weekly', default: 150, description: 'active minutes this week' },
  { category: 'meals', label: '🥗 Meal Swaps', unit: 'swaps', period: 'weekly', default: 5, description: 'plant-based meal swaps' },
  { category: 'hydration', label: '💧 Hydration', unit: 'ml', period: 'daily', default: 2000, description: 'ml of water daily' },
];

export default function GoalsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedCat, setSavedCat] = useState<string | null>(null);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    weekly_focus: user?.weekly_focus || '',
    avatar_color: user?.avatar_color || '#26734D',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [goalValues, setGoalValues] = useState<Record<string, number>>({
    travel: 20,
    movement: 150,
    meals: 5,
    hydration: 2000,
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Goal[]>('/goals');
        setGoals(data);
        const vals: Record<string, number> = { ...goalValues };
        for (const g of data) {
          vals[g.category] = g.target_value;
        }
        setGoalValues(vals);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaveGoal = async (category: string) => {
    setSaving(category);
    try {
      const preset = GOAL_PRESETS.find(p => p.category === category)!;
      await api.post('/goals', {
        category,
        target_value: goalValues[category],
        unit: preset.unit,
        period: preset.period,
      });
      setSavedCat(category);
      setTimeout(() => setSavedCat(null), 2000);

      // Refresh goals
      const { data } = await api.get<Goal[]>('/goals');
      setGoals(data);
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const { data } = await api.patch('/profile', profileForm);
      updateUser(data);
      setProfileEdit(false);
    } catch {
      // ignore
    } finally {
      setProfileSaving(false);
    }
  };

  const AVATAR_COLORS = ['#26734D', '#7C3AED', '#2563EB', '#DC2626', '#D97706', '#0891B2', '#9D174D', '#065F46'];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-eco-green-dark">Goals & Profile</h1>
        <p className="text-eco-muted mt-1">Set your weekly targets and update your profile.</p>
      </div>

      {/* Profile section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-eco-text flex items-center gap-2">
            <User size={16} className="text-eco-green" />
            Profile
          </h2>
          <button
            onClick={() => setProfileEdit(!profileEdit)}
            className="btn-ghost btn-sm"
          >
            <Edit3 size={14} />
            {profileEdit ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {profileEdit ? (
          <div className="space-y-4">
            <div>
              <label className="label">Display Name</label>
              <input
                type="text"
                className="input"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Bio</label>
              <input
                type="text"
                className="input"
                value={profileForm.bio}
                onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label">Weekly Focus</label>
              <input
                type="text"
                className="input"
                value={profileForm.weekly_focus}
                onChange={(e) => setProfileForm(f => ({ ...f, weekly_focus: e.target.value }))}
                placeholder="e.g. cut single-use plastic this week"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label">Avatar Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setProfileForm(f => ({ ...f, avatar_color: color }))}
                    className={`w-9 h-9 rounded-full transition-all ${
                      profileForm.avatar_color === color ? 'ring-2 ring-offset-2 ring-eco-green scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="btn-primary"
            >
              {profileSaving ? <Spinner className="w-4 h-4 text-white" /> : <><Save size={14} /> Save Profile</>}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: user?.avatar_color || '#26734D' }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-bold text-eco-text">{user?.full_name}</div>
                <div className="text-sm text-eco-muted">@{user?.username}</div>
              </div>
            </div>
            {user?.bio && <p className="text-sm text-eco-muted">{user.bio}</p>}
            {user?.weekly_focus && (
              <div className="bg-forest-50 rounded-lg px-3 py-2 text-sm text-eco-green">
                🎯 Focus: {user.weekly_focus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goals section */}
      <div className="card p-5">
        <h2 className="font-bold text-eco-text mb-5 flex items-center gap-2">
          <Target size={16} className="text-eco-green" />
          Weekly Goals
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-6 h-6 text-eco-green" />
          </div>
        ) : (
          <div className="space-y-6">
            {GOAL_PRESETS.map((preset) => {
              const existing = goals.find(g => g.category === preset.category);
              return (
                <div key={preset.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-eco-text">{preset.label}</div>
                      <div className="text-xs text-eco-muted">{preset.description} per {preset.period}</div>
                    </div>
                    {existing && (
                      <span className="badge-green text-[10px]">Active goal: {existing.target_value} {existing.unit}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={preset.category === 'hydration' ? 500 : 1}
                      max={preset.category === 'hydration' ? 5000 : preset.category === 'movement' ? 300 : preset.category === 'travel' ? 100 : 21}
                      step={preset.category === 'hydration' ? 100 : 1}
                      value={goalValues[preset.category]}
                      onChange={(e) => setGoalValues(v => ({ ...v, [preset.category]: Number(e.target.value) }))}
                      className="flex-1 accent-eco-green"
                    />
                    <div className="w-20 text-right">
                      <span className="font-bold text-eco-text">{goalValues[preset.category]}</span>
                      <span className="text-xs text-eco-muted ml-1">{preset.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveGoal(preset.category)}
                    disabled={saving === preset.category}
                    className="btn-outline btn-sm"
                  >
                    {saving === preset.category ? (
                      <Spinner className="w-3.5 h-3.5 text-eco-green" />
                    ) : savedCat === preset.category ? (
                      <><CheckCircle size={13} className="text-eco-green" /> Saved!</>
                    ) : (
                      <><Save size={13} /> Set Goal</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="card p-5">
        <h2 className="font-bold text-eco-text mb-4 flex items-center gap-2">
          <Settings size={16} className="text-eco-muted" />
          Account
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-eco-border">
            <span className="text-eco-muted">Email</span>
            <span className="font-medium text-eco-text">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-eco-border">
            <span className="text-eco-muted">Member since</span>
            <span className="font-medium text-eco-text">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-eco-muted">Account type</span>
            <span className={`badge ${user?.is_demo ? 'bg-amber-100 text-amber-700' : 'badge-green'}`}>
              {user?.is_demo ? 'Demo' : 'Registered'}
            </span>
          </div>

          <div className="pt-4 mt-2 border-t border-eco-border flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSwitcherOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all"
            >
              <ArrowRightLeft size={14} className="text-emerald-600" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-2 border border-red-200 transition-all"
            >
              <LogOut size={14} />
              <span>Log Out & Return to Home</span>
            </button>
          </div>
        </div>
      </div>

      <AccountSwitcherModal
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
      />
    </div>
  );
}
