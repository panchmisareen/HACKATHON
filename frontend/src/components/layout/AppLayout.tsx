import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, Zap, Trophy, BookOpen, MapPin,
  Settings, LogOut, Leaf, Menu, X, ChevronRight, Flame, Sparkles,
  Calculator, Recycle, ArrowRightLeft, Camera, Footprints, Wand2,
  Volume2, VolumeX, Compass
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils';
import AccountSwitcherModal from '../auth/AccountSwitcherModal';
import { NeonAvatar, CarbonFootprintIcon } from '../ui/CarbonElements';
import { useTheme, HOGWARTS_HOUSES, type HouseTheme } from '../../context/ThemeContext';
import { magicAudio } from '../../utils/magicAudio';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/feed', icon: Camera, label: 'Pulse Feed' },
  { to: '/app/pensieve', icon: Sparkles, label: 'Pensieve Vault' },
  { to: '/app/sorting-hat', icon: Compass, label: 'Sorting Hat' },
  { to: '/app/league', icon: Trophy, label: 'Hogwarts League' },
  { to: '/app/missions', icon: Target, label: 'Missions' },
  { to: '/app/coach', icon: Zap, label: 'Smart Coach' },
  { to: '/app/impact', icon: Leaf, label: 'Impact Analytics' },
  { to: '/app/calculator', icon: Calculator, label: 'Carbon Engine' },
  { to: '/app/thrift', icon: Recycle, label: 'Thrift Club' },
  { to: '/app/passport', icon: BookOpen, label: 'Eco Passport' },
  { to: '/app/map', icon: MapPin, label: 'Campus Map' },
  { to: '/app/goals', icon: Settings, label: 'Goals & Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { house, setHouse, houseDetails, allHouses } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(magicAudio.isSoundEnabled());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleSound = () => {
    const nextState = magicAudio.toggleSound();
    setSoundEnabled(nextState);
  };

  const activeTextColor = house === 'fire' ? '#FFFFFF' : '#000000';

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full text-slate-100 border-r font-sans shadow-2xl transition-colors duration-500"
      style={{
        backgroundColor: houseDetails.surfaceHex,
        borderColor: houseDetails.borderHex,
      }}
    >
      {/* Brand Header */}
      <div
        className="p-5 border-b transition-colors duration-500"
        style={{
          backgroundColor: houseDetails.bgHex,
          borderColor: houseDetails.borderHex,
        }}
      >
        <NavLink to="/app/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300"
            style={{
              backgroundColor: houseDetails.cardHex,
              border: `1px solid ${houseDetails.borderHex}`,
              boxShadow: `0 0 15px ${houseDetails.glowHex}`,
            }}
          >
            <span className="text-2xl">{houseDetails.crest}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-magical font-black text-lg text-white tracking-tight">EcoPulse</span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${houseDetails.accentHex}25`,
                  color: houseDetails.accentHex,
                  border: `1px solid ${houseDetails.accentHex}50`,
                }}
              >
                {house.toUpperCase()}
              </span>
            </div>
            <div
              className="text-[11px] font-serif italic flex items-center gap-1"
              style={{ color: houseDetails.silverHex }}
            >
              <span>{houseDetails.colorsName}</span>
            </div>
          </div>
        </NavLink>
      </div>

      {/* User Card with Glowing Avatar */}
      {user && (
        <div
          className="p-3.5 mx-3.5 mt-3.5 rounded-2xl shadow-sm border transition-colors duration-500"
          style={{
            backgroundColor: houseDetails.cardHex,
            borderColor: houseDetails.borderHex,
          }}
        >
          <div className="flex items-center gap-3">
            <NeonAvatar
              name={user.full_name}
              color={user.avatar_color || houseDetails.accentHex}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate flex items-center gap-1.5 font-magical">
                <span>{user.full_name}</span>
                {user.is_demo && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">DEMO</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono">
                <span
                  className="font-bold text-xs"
                  style={{ color: houseDetails.accentHex }}
                >
                  {user.total_points.toLocaleString()} pts
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-400 font-semibold text-xs flex items-center gap-0.5">
                  <Flame size={12} className="fill-amber-400 text-amber-400 candle-flame" />
                  {user.current_streak}d streak
                </span>
              </div>
            </div>
            <button
              onClick={() => setSwitcherOpen(true)}
              title="Switch account on this device"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center shadow-xs"
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 mb-2 flex items-center justify-between"
          style={{ color: houseDetails.silverHex }}
        >
          <span>Elemental Chambers</span>
          <Sparkles className="w-3.5 h-3.5" style={{ color: houseDetails.accentHex }} />
        </div>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-mono font-semibold transition-all duration-200 group ${
                isActive ? 'font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: houseDetails.accentHex,
                      color: activeTextColor,
                      boxShadow: `0 0 16px ${houseDetails.glowHex}`,
                    }
                  : undefined
              }
            >
              <Icon
                size={16}
                style={isActive ? { color: activeTextColor } : undefined}
                className={!isActive ? 'text-slate-400 group-hover:text-white' : undefined}
              />
              <span className="flex-1 tracking-tight">{label}</span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: activeTextColor }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div
        className="p-4 border-t flex items-center justify-between transition-colors duration-500"
        style={{
          backgroundColor: houseDetails.bgHex,
          borderColor: houseDetails.borderHex,
        }}
      >
        <div className="text-[11px] font-mono text-slate-400">
          <span>{houseDetails.name} Grid</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-mono"
          title="Sign out"
        >
          <LogOut size={15} />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden antialiased font-sans transition-colors duration-500"
      style={{
        backgroundColor: houseDetails.bgHex,
        color: houseDetails.textHex,
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
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
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Layout Container */}
      <div
        className="flex-1 flex flex-col overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: houseDetails.bgHex }}
      >
        {/* Desktop & Mobile Header Bar with House Theme Switcher & Audio */}
        <header
          className="flex items-center justify-between px-5 py-3.5 backdrop-blur-md border-b z-20 transition-colors duration-500"
          style={{
            backgroundColor: `${houseDetails.surfaceHex}E6`,
            borderColor: houseDetails.borderHex,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:bg-white/5 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-magical font-bold text-white tracking-wider flex items-center gap-1.5">
                <span>{houseDetails.crest}</span>
                <span>{houseDetails.name}</span>
              </span>
              <span className="text-slate-500 font-mono">•</span>
              <span
                className="text-[11px] font-serif italic hidden md:inline"
                style={{ color: houseDetails.silverHex }}
              >
                {houseDetails.subtitle}
              </span>
            </div>
          </div>

          {/* Quick Magical Controls: Sound FX, House Palette Switcher, Account */}
          <div className="flex items-center gap-2.5">
            {/* Audio Wand Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute Magical Audio' : 'Enable Magical Audio'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              {soundEnabled ? (
                <Volume2 size={15} style={{ color: houseDetails.accentHex }} />
              ) : (
                <VolumeX size={15} />
              )}
              <span className="hidden md:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            {/* House Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                style={{
                  backgroundColor: houseDetails.cardHex,
                  borderColor: houseDetails.borderHex,
                  color: houseDetails.textHex,
                }}
              >
                <span>{houseDetails.crest}</span>
                <span className="hidden sm:inline">{houseDetails.name}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {themeDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl border-2 p-2 shadow-2xl z-50 animate-scale-in text-left space-y-1"
                  style={{
                    backgroundColor: houseDetails.surfaceHex,
                    borderColor: houseDetails.borderHex,
                  }}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Switch House Atmosphere
                  </div>
                  {allHouses.map((h) => {
                    const isSelected = house === h.id;
                    const hActiveTextColor = h.id === 'fire' ? '#FFFFFF' : '#000000';
                    return (
                      <button
                        key={h.id}
                        onClick={() => {
                          setHouse(h.id);
                          setThemeDropdownOpen(false);
                          magicAudio.playSilverChime();
                        }}
                        className={`w-full p-2.5 rounded-xl text-xs font-mono flex items-center gap-2.5 transition-all text-left ${
                          isSelected
                            ? 'font-bold shadow-md'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: h.accentHex,
                                color: hActiveTextColor,
                                boxShadow: `0 0 12px ${h.glowHex}`,
                              }
                            : undefined
                        }
                      >
                        <span className="text-xl">{h.crest}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate flex items-center gap-1.5">
                            <span>{h.name}</span>
                            <span className="text-[10px] opacity-75 font-normal">
                              ({h.colorsName})
                            </span>
                          </div>
                          <div className="text-[9px] opacity-80 truncate">{h.element}</div>
                        </div>
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Streak Candle Flame */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold">
                <Flame size={14} className="text-amber-400 fill-amber-400 candle-flame" />
                <span>{user.current_streak}d</span>
              </div>
            )}

            {user && (
              <button
                onClick={() => setSwitcherOpen(true)}
                title="Switch Account"
                className="ml-1"
              >
                <NeonAvatar
                  name={user.full_name}
                  color={user.avatar_color || houseDetails.accentHex}
                  size="sm"
                />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main
          className="flex-1 overflow-y-auto transition-colors duration-500"
          style={{ backgroundColor: houseDetails.bgHex }}
        >
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
