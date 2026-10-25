import React, { createContext, useContext, useEffect, useState } from 'react';

export type HouseTheme = 'ravenclaw' | 'slytherin' | 'gryffindor' | 'hufflepuff' | 'patronus';

export interface HouseDetails {
  id: HouseTheme;
  name: string;
  subtitle: string;
  mascot: string;
  crest: string;
  bgHex: string;
  surfaceHex: string;
  cardHex: string;
  borderHex: string;
  accentHex: string;
  silverHex: string;
  glowClass: string;
  description: string;
}

export const HOGWARTS_HOUSES: Record<HouseTheme, HouseDetails> = {
  ravenclaw: {
    id: 'ravenclaw',
    name: 'Ravenclaw Starlight',
    subtitle: 'Primary Dark Blue & Starlight Silver',
    mascot: 'Eagle of Wit',
    crest: '🦅',
    bgHex: '#030712',
    surfaceHex: '#0B132B',
    cardHex: '#0E1A38',
    borderHex: '#3A506B',
    accentHex: '#38BDF8',
    silverHex: '#E2E8F0',
    glowClass: 'shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    description: 'Midnight astronomy tower, deep cosmos, and silver Patronus wisps. For analytical minds cutting carbon with scientific precision.',
  },
  slytherin: {
    id: 'slytherin',
    name: 'Slytherin Emerald',
    subtitle: 'Second Primary Deep Emerald & Silver',
    mascot: 'Serpent of Ambition',
    crest: '🐍',
    bgHex: '#06140D',
    surfaceHex: '#0D2418',
    cardHex: '#122E20',
    borderHex: '#2D4A3A',
    accentHex: '#10B981',
    silverHex: '#CBD5E1',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    description: 'Ancient dungeon hearth, polished silver chalices, and cunning sustainability leadership. Resourceful ambition commanding the Green Cup.',
  },
  gryffindor: {
    id: 'gryffindor',
    name: 'Gryffindor Fire',
    subtitle: 'Warm Charcoal, Bronze & Crimson Braziers',
    mascot: 'Lion of Courage',
    crest: '🦁',
    bgHex: '#0F0C08',
    surfaceHex: '#1A1410',
    cardHex: '#241B15',
    borderHex: '#4A3525',
    accentHex: '#991B1B',
    silverHex: '#D97706',
    glowClass: 'shadow-[0_0_20px_rgba(217,119,6,0.35)]',
    description: 'Crackling fires, aged leather armchairs, and golden braziers. Courageous climate pioneers leading bold physical campus initiatives.',
  },
  hufflepuff: {
    id: 'hufflepuff',
    name: 'Hufflepuff Earth',
    subtitle: 'Rich Espresso Earth & Honey Gold',
    mascot: 'Badger of Dedication',
    crest: '🦡',
    bgHex: '#12100E',
    surfaceHex: '#1C1814',
    cardHex: '#27221C',
    borderHex: '#574220',
    accentHex: '#F59E0B',
    silverHex: '#10B981',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    description: 'Sunlit greenhouse herbs, warm wooden barrels, and circular zero-waste living. Dedicated, loyal guardians of soil and harvest.',
  },
  patronus: {
    id: 'patronus',
    name: 'Forbidden Forest & Patronus',
    subtitle: 'Gloomy Forest Teal & Ethereal Frost Silver',
    mascot: 'Silver Stag Patronus',
    crest: '🦌',
    bgHex: '#051014',
    surfaceHex: '#0A1B22',
    cardHex: '#0E2732',
    borderHex: '#164E63',
    accentHex: '#22D3EE',
    silverHex: '#94A3B8',
    glowClass: 'shadow-[0_0_25px_rgba(34,211,238,0.35)]',
    description: 'Mystical moonlit forest lit by a radiant Patronus spell. Warding off campus waste with luminous ethereal magic.',
  },
};

interface ThemeContextType {
  house: HouseTheme;
  houseDetails: HouseDetails;
  setHouse: (house: HouseTheme) => void;
  allHouses: HouseDetails[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [house, setHouseState] = useState<HouseTheme>(() => {
    const saved = localStorage.getItem('ecopulse_house_theme') as HouseTheme;
    if (saved && HOGWARTS_HOUSES[saved]) return saved;
    return 'ravenclaw'; // Default: Primary Dark Blue & Silver
  });

  const setHouse = (newHouse: HouseTheme) => {
    setHouseState(newHouse);
    localStorage.setItem('ecopulse_house_theme', newHouse);
  };

  useEffect(() => {
    const root = document.documentElement;
    const details = HOGWARTS_HOUSES[house];

    root.setAttribute('data-theme', house);
    root.style.setProperty('--magic-bg', details.bgHex);
    root.style.setProperty('--magic-surface', details.surfaceHex);
    root.style.setProperty('--magic-card', details.cardHex);
    root.style.setProperty('--magic-border', details.borderHex);
    root.style.setProperty('--magic-accent', details.accentHex);
    root.style.setProperty('--magic-silver', details.silverHex);
  }, [house]);

  const value = {
    house,
    houseDetails: HOGWARTS_HOUSES[house],
    setHouse,
    allHouses: Object.values(HOGWARTS_HOUSES),
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
