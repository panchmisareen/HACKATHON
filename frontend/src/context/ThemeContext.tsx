import React, { createContext, useContext, useEffect, useState } from 'react';

export type HouseTheme = 'water' | 'earth' | 'fire' | 'air' | 'space';

export interface HouseDetails {
  id: HouseTheme;
  name: string;
  subtitle: string;
  element: string;
  colorsName: string;
  mascot: string;
  crest: string;
  bgHex: string;
  surfaceHex: string;
  cardHex: string;
  borderHex: string;
  accentHex: string;
  secondaryHex: string;
  silverHex: string;
  glowHex: string;
  glowClass: string;
  textHex: string;
  bannerGradient: string;
  flameGradient: string;
  description: string;
}

export const ELEMENTAL_HOUSES: Record<HouseTheme, HouseDetails> = {
  water: {
    id: 'water',
    name: 'Water House',
    subtitle: 'Blue & Silver · Analytical Precision & Ocean Currents',
    element: 'Ocean & Torrent',
    colorsName: 'Blue and Silver',
    mascot: 'Leviathan of Wisdom',
    crest: '🌊',
    bgHex: '#040B1A',
    surfaceHex: '#091530',
    cardHex: '#0D1D40',
    borderHex: '#385078',
    accentHex: '#38BDF8',
    secondaryHex: '#1D4ED8',
    silverHex: '#E2E8F0',
    glowHex: 'rgba(56, 189, 248, 0.4)',
    glowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.35)]',
    textHex: '#FFFFFF',
    bannerGradient: 'from-[#040B1A] via-[#091530] to-[#0D1D40]',
    flameGradient: 'from-cyan-400 via-sky-500 to-blue-700',
    description: 'Deep oceanic currents, starlight reflection, and fluid kinetic motion. For analytical students cutting carbon with scientific precision.',
  },
  earth: {
    id: 'earth',
    name: 'Earth House',
    subtitle: 'Yellow & Black · Circular Thrift & Fertile Harvest',
    element: 'Soil & Harvest',
    colorsName: 'Yellow and Black',
    mascot: 'Badger of the Soil',
    crest: '🌿',
    bgHex: '#080808',
    surfaceHex: '#141414',
    cardHex: '#1C1C18',
    borderHex: '#EAB308',
    accentHex: '#FFE600',
    secondaryHex: '#000000',
    silverHex: '#FEF08A',
    glowHex: 'rgba(255, 230, 0, 0.4)',
    glowClass: 'shadow-[0_0_25px_rgba(255,230,0,0.35)]',
    textHex: '#FFFBEB',
    bannerGradient: 'from-[#080808] via-[#141414] to-[#1C1C18]',
    flameGradient: 'from-yellow-300 via-amber-400 to-amber-700',
    description: 'Fertile soil, greenhouse herbs, and circular thrift regeneration. Dedicated, loyal guardians of harvest and zero-waste living.',
  },
  fire: {
    id: 'fire',
    name: 'Fire House',
    subtitle: 'Red & Golden · Bold Bravery & Hearth Champions',
    element: 'Flame & Hearth',
    colorsName: 'Red and Golden',
    mascot: 'Lion of the Hearth',
    crest: '🔥',
    bgHex: '#100505',
    surfaceHex: '#1C0A0A',
    cardHex: '#260E0E',
    borderHex: '#B45309',
    accentHex: '#EF4444',
    secondaryHex: '#F59E0B',
    silverHex: '#FDE68A',
    glowHex: 'rgba(239, 68, 68, 0.4)',
    glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
    textHex: '#FFF1F2',
    bannerGradient: 'from-[#100505] via-[#1C0A0A] to-[#260E0E]',
    flameGradient: 'from-amber-400 via-orange-500 to-red-700',
    description: 'Crackling braziers, fierce courage, and unyielding energy. Courageous climate pioneers leading bold physical campus initiatives.',
  },
  air: {
    id: 'air',
    name: 'Air House',
    subtitle: 'Emerald & Silver · High Winds & Cunning Leadership',
    element: 'Wind & Canopy',
    colorsName: 'Emerald and Silver',
    mascot: 'Serpent of the Winds',
    crest: '🌪️',
    bgHex: '#04120A',
    surfaceHex: '#0A2014',
    cardHex: '#0E2A1B',
    borderHex: '#10B981',
    accentHex: '#10B981',
    secondaryHex: '#059669',
    silverHex: '#CBD5E1',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    textHex: '#ECFDF5',
    bannerGradient: 'from-[#04120A] via-[#0A2014] to-[#0E2A1B]',
    flameGradient: 'from-emerald-400 via-green-500 to-teal-800',
    description: 'High gusting winds, polished silver chalices, and cunning sustainability leadership. Resourceful ambition commanding the Green Cup.',
  },
  space: {
    id: 'space',
    name: 'Space House',
    subtitle: 'Black & Silver · Infinite Cosmos & Celestial Magic',
    element: 'Cosmos & Void',
    colorsName: 'Black and Silver',
    mascot: 'Stag of the Cosmos',
    crest: '🌌',
    bgHex: '#000000',
    surfaceHex: '#0A0A0F',
    cardHex: '#12121A',
    borderHex: '#64748B',
    accentHex: '#E2E8F0',
    secondaryHex: '#38BDF8',
    silverHex: '#FFFFFF',
    glowHex: 'rgba(226, 232, 240, 0.4)',
    glowClass: 'shadow-[0_0_25px_rgba(226,232,240,0.35)]',
    textHex: '#F8FAFC',
    bannerGradient: 'from-[#000000] via-[#0A0A0F] to-[#12121A]',
    flameGradient: 'from-slate-200 via-sky-300 to-indigo-600',
    description: 'The infinite cosmos, starlight reflections, and boundless perspective. Warding off campus waste with luminous ethereal magic.',
  },
};

// Compatibility alias for legacy components
export const HOGWARTS_HOUSES = ELEMENTAL_HOUSES;

interface ThemeContextType {
  house: HouseTheme;
  houseDetails: HouseDetails;
  setHouse: (house: HouseTheme) => void;
  allHouses: HouseDetails[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [house, setHouseState] = useState<HouseTheme>(() => {
    const raw = localStorage.getItem('ecopulse_house_theme');
    // Map legacy names if present
    if (raw === 'ravenclaw') return 'water';
    if (raw === 'gryffindor') return 'fire';
    if (raw === 'slytherin') return 'air';
    if (raw === 'hufflepuff') return 'earth';
    if (raw === 'patronus') return 'space';
    if (raw && ELEMENTAL_HOUSES[raw as HouseTheme]) return raw as HouseTheme;
    return 'water'; // Default: Water House (Blue and Silver)
  });

  const setHouse = (newHouse: HouseTheme) => {
    setHouseState(newHouse);
    localStorage.setItem('ecopulse_house_theme', newHouse);
  };

  useEffect(() => {
    const root = document.documentElement;
    const details = ELEMENTAL_HOUSES[house];

    root.setAttribute('data-theme', house);
    root.style.setProperty('--magic-bg', details.bgHex);
    root.style.setProperty('--magic-surface', details.surfaceHex);
    root.style.setProperty('--magic-card', details.cardHex);
    root.style.setProperty('--magic-border', details.borderHex);
    root.style.setProperty('--magic-accent', details.accentHex);
    root.style.setProperty('--magic-secondary', details.secondaryHex);
    root.style.setProperty('--magic-silver', details.silverHex);
    root.style.setProperty('--magic-text', details.textHex);
    root.style.setProperty('--magic-glow', details.glowHex);

    // Apply background color directly to body so whole view shifts seamlessly
    document.body.style.backgroundColor = details.bgHex;
    document.body.style.color = details.textHex;
  }, [house]);

  const value = {
    house,
    houseDetails: ELEMENTAL_HOUSES[house],
    setHouse,
    allHouses: Object.values(ELEMENTAL_HOUSES),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
