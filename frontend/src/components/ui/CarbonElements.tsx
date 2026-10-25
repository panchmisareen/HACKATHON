import React from 'react';
import { Footprints, Sparkles } from 'lucide-react';
import { getInitials } from '../../utils';

export const NEON_COLORS = [
  { name: 'Neon Pink', key: 'pink', hex: '#FF1493', glowClass: 'shadow-[0_0_14px_rgba(255,20,147,0.6)]' },
  { name: 'Neon Cyan', key: 'cyan', hex: '#00F0FF', glowClass: 'shadow-[0_0_14px_rgba(0,240,255,0.6)]' },
  { name: 'Neon Yellow', key: 'yellow', hex: '#FFE600', glowClass: 'shadow-[0_0_14px_rgba(255,230,0,0.6)]' },
  { name: 'Neon Lime', key: 'lime', hex: '#39FF14', glowClass: 'shadow-[0_0_14px_rgba(57,255,20,0.6)]' },
  { name: 'Neon Red', key: 'red', hex: '#FF3366', glowClass: 'shadow-[0_0_14px_rgba(255,51,102,0.6)]' },
  { name: 'Neon Purple', key: 'purple', hex: '#BD00FF', glowClass: 'shadow-[0_0_14px_rgba(189,0,255,0.6)]' },
];

export function getNeonStyle(colorOrKey?: string) {
  if (!colorOrKey) return NEON_COLORS[1]; // default Neon Cyan
  const lower = colorOrKey.toLowerCase();
  const match = NEON_COLORS.find(
    (c) => c.key === lower || c.hex.toLowerCase() === lower || c.name.toLowerCase().includes(lower)
  );
  return match || { key: 'custom', name: 'Custom', hex: colorOrKey, glowClass: 'shadow-[0_0_14px_rgba(0,240,255,0.6)]' };
}

// Neon Profile Avatar Icon with vibrant glowing ring
export function NeonAvatar({
  name,
  color,
  neonColor,
  size = 'md',
  showGlow = true,
  className = '',
}: {
  name: string;
  color?: string;
  neonColor?: 'pink' | 'cyan' | 'yellow' | 'lime' | 'red' | 'purple' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}) {
  const chosenColor = neonColor || color;
  const neon = getNeonStyle(chosenColor);
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] ring-1',
    sm: 'w-8 h-8 text-xs ring-2',
    md: 'w-10 h-10 text-sm ring-2',
    lg: 'w-12 h-12 text-base ring-2',
    xl: 'w-16 h-16 text-xl ring-3',
  }[size];

  return (
    <div
      className={`rounded-2xl flex items-center justify-center font-black text-black select-none transition-all flex-shrink-0 ${sizeClasses} ${showGlow ? neon.glowClass : ''} ${className}`}
      style={{
        backgroundColor: neon.hex,
        boxShadow: showGlow ? `0 0 15px ${neon.hex}80` : undefined,
      }}
    >
      <span className="drop-shadow-xs font-mono font-extrabold text-slate-950">
        {getInitials(name)}
      </span>
    </div>
  );
}

// Decorative Carbon Footprint Icon SVG
export function CarbonFootprintIcon({
  size = 20,
  color = '#15803D',
  rotate = 0,
  glow = false,
  className = '',
  animated = false,
}: {
  size?: number;
  color?: string;
  rotate?: number;
  glow?: boolean;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${animated ? 'animate-bounce-gentle' : ''} ${className}`}
      style={{
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: glow ? `drop-shadow(0 0 8px ${color})` : undefined,
      }}
    >
      <Footprints
        style={{
          width: size,
          height: size,
          color: color,
        }}
      />
      <span
        className="absolute -top-1 -right-1 pointer-events-none select-none"
        style={{ fontSize: Math.max(9, Math.round(size * 0.45)) }}
      >
        🍃
      </span>
    </div>
  );
}

// Attractive Avoided Carbon Footprint Badge
export function AvoidedCarbonBadge({
  kg,
  size = 'md',
}: {
  kg: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-mono font-bold shadow-xs ${sizeClass}`}
    >
      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
      <span>+{kg.toFixed(1)} kg CO₂e avoided</span>
      <Sparkles className="w-3 h-3 text-emerald-500" />
    </span>
  );
}
