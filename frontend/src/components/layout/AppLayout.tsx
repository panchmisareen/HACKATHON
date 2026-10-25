import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, Zap, Trophy, BookOpen, MapPin,
  Settings, LogOut, Leaf, Menu, X, ChevronRight, Flame, Sparkles, Calculator, Recycle, ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils';
import AccountSwitcherModal from '../auth/AccountSwitcherModal';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/missions', icon: Target, label: 'Missions' },
  { to: '/app/coach', icon: Zap, label: 'Smart Coach' },
  { to: '/app/impact', icon: Leaf, label: 'Impact Analytics' },
  { to: '/app/calculator', icon: Calculator, label: 'Carbon Engine' },
  { to: '/app/thrift', icon: Recycle, label: 'Thrift Club' },
  { to: '/app/league', icon: Trophy, label: 'Campus League' },
  { to: '/app/passport', icon: BookOpen, label: 'Eco Passport' },
  { to: '/app/map', icon: MapPin, label: 'Campus Map' },
  { to: '/app/goals', icon: Settings, label: 'Goals & Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#FCFCF9] text-[#0F172A] border-r border-[#E8E8E4]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E8E8E4]">
        <NavLink to="/app/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#111613] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
            <span className="text-emerald-400 font-bold text-lg">✦</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-[#0F172A] tracking-tight">EcoPulse</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">STUDIO</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Better habits. Lighter footprint.</div>
          </div>
        </NavLink>
      </div>

      {/* User Card */}
      {user && (
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#F4F4F0] border border-[#E5E5E0]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0"
              style={{ backgroundColor: user.avatar_color || '#15803D' }}
            >
              {getInitials(user.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-[#0F172A] truncate flex items-center gap-1.5">
                <span>{user.full_name}</span>
                {user.is_demo && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">DEMO</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-emerald-700 font-bold text-xs">{user.total_points.toLocaleString()} pts</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-600 font-semibold text-xs flex items-center gap-0.5">
                  <Flame size={12} className="fill-amber-500 text-amber-500" />
                  {user.current_streak}d streak
                </span>
              </div>
            </div>
            <button
              onClick={() => setSwitcherOpen(true)}
              title="Switch account on this device"
              className="p-1.5 rounded-xl hover:bg-white text-slate-400 hover:text-emerald-700 transition-all flex items-center"
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-[#111613] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-[#F2F2EE] hover:text-[#0F172A]'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'}
              />
              <span className="flex-1 tracking-tight">{label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Campus Active Pill */}
      <NavLink
        to="/app/league"
        onClick={() => setMobileOpen(false)}
        className="p-4 m-4 rounded-2xl bg-[#111613] text-white relative overflow-hidden block hover:ring-2 hover:ring-emerald-400/50 transition-all group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">CAMPUS GRID LIVE</span>
          </div>
          <ChevronRight size={13} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-xs text-white/80 leading-relaxed font-medium">
          12 Hostels actively competing in Green Cup. View live standings & rewards.
        </p>
      </NavLink>

      {/* Account Switcher and Logout Buttons */}
      <div className="p-4 border-t border-[#E8E8E4] space-y-1.5">
        <button
          onClick={() => setSwitcherOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150 w-full"
        >
          <ArrowRightLeft size={15} className="text-emerald-600" />
          <span>Switch Accounts</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full"
        >
          <LogOut size={15} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F4F0] text-[#0F172A] overflow-hidden antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col flex transition-transform duration-300 lg:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F4F0]">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#FCFCF9] border-b border-[#E8E8E4] z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#111613] text-white flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">✦</span>
            </div>
            <span className="font-display font-extrabold text-[#0F172A]">EcoPulse</span>
          </div>
          {user && (
            <button
              onClick={() => setSwitcherOpen(true)}
              title="Switch Account"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-500/30"
              style={{ backgroundColor: user.avatar_color || '#15803D' }}
            >
              {getInitials(user.full_name)}
            </button>
          )}
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
      />
    </div>
  );
}
