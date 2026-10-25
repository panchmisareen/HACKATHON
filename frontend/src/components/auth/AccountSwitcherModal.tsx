import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Check, ArrowRightLeft, PlusCircle, LogOut,
  Trash2, ShieldCheck, X, Sparkles, User, AlertCircle, Palette
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService, type SavedAccount } from '../../services/auth.service';
import { getInitials } from '../../utils';
import { triggerConfetti } from '../../utils/confetti';
import { NeonAvatar, NEON_COLORS } from '../ui/CarbonElements';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSwitcherModal({ isOpen, onClose }: AccountSwitcherModalProps) {
  const { user, savedAccounts, switchAccount, removeAccount, updateUser, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      authService.getDemoAccounts().then(setDemoAccounts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSwitch = async (userId: number) => {
    if (user?.id === userId) {
      onClose();
      return;
    }
    setLoadingId(userId);
    setErrorMsg(null);
    try {
      const success = await switchAccount(userId);
      if (success) {
        triggerConfetti();
        onClose();
      } else {
        setErrorMsg('Unable to switch account. Please sign in again.');
      }
    } catch {
      setErrorMsg('Failed to switch account.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleColorChange = (hex: string) => {
    if (user) {
      updateUser({ ...user, avatar_color: hex });
      triggerConfetti();
    }
  };

  const handleLogoutCurrent = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleLogoutAll = () => {
    if (window.confirm('Are you sure you want to sign out and clear all accounts from this device?')) {
      logoutAll();
      onClose();
      navigate('/');
    }
  };

  const handleAddNewAccount = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Switch Campus Account</h3>
            <p className="text-xs text-slate-500">
              Manage and toggle between accounts saved on this device.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Active Account Section */}
          {user && (
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Active Session</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Neon Glow
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <NeonAvatar
                      name={user.full_name}
                      color={user.avatar_color || '#00F0FF'}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <span>{user.full_name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          ✓ ACTIVE
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-800 font-mono">
                      {user.total_points} pts
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {user.current_streak}d streak 🔥
                    </div>
                  </div>
                </div>

                {/* Neon Profile Icon Color Picker */}
                <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600">Choose Neon Avatar Glow:</span>
                  <div className="flex items-center gap-1.5">
                    {NEON_COLORS.map((nc) => (
                      <button
                        key={nc.hex}
                        type="button"
                        onClick={() => handleColorChange(nc.hex)}
                        title={nc.name}
                        className={`w-5 h-5 rounded-full transition-all ${
                          user.avatar_color === nc.hex
                            ? 'ring-2 ring-black scale-110 shadow-md'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: nc.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Accounts on Device */}
          {savedAccounts.filter((a) => a.user_id !== user?.id).length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Other Accounts on this Device
              </div>
              <div className="space-y-2">
                {savedAccounts
                  .filter((a) => a.user_id !== user?.id)
                  .map((acc) => (
                    <div
                      key={acc.user_id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <NeonAvatar
                          name={acc.full_name}
                          color={acc.avatar_color || '#FFE600'}
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{acc.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{acc.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={loadingId === acc.user_id}
                          onClick={() => handleSwitch(acc.user_id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1C2615] hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {loadingId === acc.user_id ? 'Switching…' : 'Switch'}
                        </button>
                        <button
                          onClick={() => removeAccount(acc.user_id)}
                          title="Remove from device"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Campus Demo Peer Profiles */}
          {demoAccounts.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Campus Peer Personas (Fast Switch)</span>
                <span className="text-[10px] text-emerald-600 font-mono font-semibold">Ready to test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((d) => {
                  const isCurrent = user?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      disabled={isCurrent || loadingId === d.id}
                      onClick={() => handleSwitch(d.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-50/50 cursor-default'
                          : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <NeonAvatar
                        name={d.full_name}
                        color={d.avatar_color || '#39FF14'}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                          <span className="truncate">{d.full_name}</span>
                          {isCurrent && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{d.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleAddNewAccount}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>➕ Sign In Another Account</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogoutCurrent}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
            <button
              onClick={handleLogoutAll}
              title="Purge all credentials and accounts from this browser"
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-medium transition-all"
            >
              Clear Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
