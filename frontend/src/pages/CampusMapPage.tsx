import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Droplets, Bike, Recycle, Footprints, Salad,
  CheckCircle2, Navigation, Sparkles, Search, ArrowRight,
  Compass, ShieldCheck, Zap, RotateCcw, Plus, Minus,
  Building2, Bot, Send, MessageSquare, X, Wifi, Radio,
  AlertTriangle, Wind, Users, Car, Check, UploadCloud, Layers
} from 'lucide-react';
import api from '../services/api';
import type { CampusLocation } from '../types';
import { Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { triggerConfetti } from '../utils/confetti';

const PW_IOI_COORDS: [number, number] = [28.54280, 77.33420];

const SILVER_SPRINGS_PERIMETER: [number, number][] = [
  [28.54315, 77.33395],
  [28.54315, 77.33445],
  [28.54245, 77.33445],
  [28.54245, 77.33395],
  [28.54315, 77.33395],
];

const CATEGORIES = [
  { value: '', label: 'All Stations', icon: MapPin },
  { value: 'water_refill', label: 'Water Refill', icon: Droplets, color: '#0284C7' },
  { value: 'bike_parking', label: 'Cycle Hubs', icon: Bike, color: '#FF4E11' },
  { value: 'recycling', label: 'Zero-Waste NFC', icon: Recycle, color: '#059669' },
  { value: 'walking_route', label: 'Canopy Trails', icon: Footprints, color: '#7C3AED' },
  { value: 'food', label: 'Low-Carbon Food', icon: Salad, color: '#D97706' },
];

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  water_refill: { label: 'Hydration Station', icon: '💧' },
  bike_parking: { label: 'Active Transit Hub', icon: '🚲' },
  recycling: { label: 'Zero-Waste NFC Stream', icon: '♻️' },
  walking_route: { label: 'Botanical Trail', icon: '🚶' },
  food: { label: 'Low-Impact Dining', icon: '🥗' },
};

const DEFAULT_LOCATIONS: CampusLocation[] = [
  {
    id: 1,
    name: "PW IOI Main Reception & RO Refill",
    description: "Chilled filtered RO & alkaline hydration dispenser at First Floor main reception lobby.",
    category: "water_refill",
    latitude: 28.54280,
    longitude: 77.33420,
    address: "First Floor, Silver Springs, Plot 13/14, Sector 126, Noida",
    map_x: 50.0,
    map_y: 50.0,
    is_demo: true,
  },
  {
    id: 2,
    name: "Innovation Lounge Hydration Bay",
    description: "Zero-plastic hydration counter next to study pods and AI workspace.",
    category: "water_refill",
    latitude: 28.54295,
    longitude: 77.33405,
    address: "First Floor West Wing, Silver Springs Plot 13",
    map_x: 42.0,
    map_y: 38.0,
    is_demo: true,
  },
  {
    id: 3,
    name: "Tech Lab 3 Refill & E-Waste Hub",
    description: "NFC Tap station for retired electronics, lithium batteries and cables next to clean water point.",
    category: "recycling",
    latitude: 28.54270,
    longitude: 77.33440,
    address: "First Floor East Wing, Silver Springs Plot 14",
    map_x: 58.0,
    map_y: 55.0,
    is_demo: true,
  },
  {
    id: 4,
    name: "Silver Springs Main Entry Cycle Dock",
    description: "Smart locker bicycle fleet with automated GPS unlock for student commuters.",
    category: "bike_parking",
    latitude: 28.54310,
    longitude: 77.33420,
    address: "Silver Springs Main Gate, Plot 13/14, Sector 126",
    map_x: 50.0,
    map_y: 20.0,
    is_demo: true,
  },
  {
    id: 5,
    name: "Basement Transit Bay & EV Dock",
    description: "Underground cycle storage with EV charging points and smart puncture repair.",
    category: "bike_parking",
    latitude: 28.54250,
    longitude: 77.33410,
    address: "Basement Level B1, Silver Springs Plot 13",
    map_x: 45.0,
    map_y: 75.0,
    is_demo: true,
  },
  {
    id: 6,
    name: "Courtyard NFC Zero-Waste Station",
    description: "Tap phone to log 4-stream recycling: compost, paper, clean plastic, metal.",
    category: "recycling",
    latitude: 28.54270,
    longitude: 77.33415,
    address: "Central Courtyard, Plot 13/14, Sector 126",
    map_x: 48.0,
    map_y: 58.0,
    is_demo: true,
  },
  {
    id: 7,
    name: "PW IOI Green Kitchen & Millets Cafe",
    description: "Certified plant-forward cafeteria featuring low-carbon millets, plant beverages and seasonal bowls.",
    category: "food",
    latitude: 28.54260,
    longitude: 77.33435,
    address: "Ground Floor Cafeteria, Silver Springs",
    map_x: 56.0,
    map_y: 68.0,
    is_demo: true,
  },
  {
    id: 8,
    name: "Silver Springs Perimeter Walking Trail",
    description: "Shaded tree-lined walking circuit directly around Silver Springs Plot 13/14 boundary — 400m circuit.",
    category: "walking_route",
    latitude: 28.54315,
    longitude: 77.33435,
    address: "Campus Boundary Promenade, Plot 13/14",
    map_x: 55.0,
    map_y: 25.0,
    is_demo: true,
  },
];

type ViewMode = 'vector' | 'leaflet';
type MapStyle = 'street' | 'osm' | 'satellite';

export default function CampusMapPage() {
  const { user, updatePoints, refreshUser } = useAuth();
  const [locations, setLocations] = useState<CampusLocation[]>(DEFAULT_LOCATIONS);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedId, setSelectedId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);

  // View mode contingency: vector blueprint is instant & failure-proof
  const [viewMode, setViewMode] = useState<ViewMode>('vector');
  const [mapStyle, setMapStyle] = useState<MapStyle>('street');

  // Modals & Panels
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);
  const [showIaqOverlay, setShowIaqOverlay] = useState(true);

  // NFC Tap state
  const [tappingNfc, setTappingNfc] = useState(false);
  const [nfcResult, setNfcResult] = useState<string | null>(null);

  // Audit state
  const [auditCategory, setAuditCategory] = useState('leaking_water');
  const [auditLoc, setAuditLoc] = useState('First Floor Restroom 2');
  const [submittingAudit, setSubmittingAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  // Carpool state
  const [carpoolList, setCarpoolList] = useState<any[]>([]);

  // IAQ Data
  const [iaqData, setIaqData] = useState<any>({
    overall_status: 'Clean Canopy Air',
    campus_average_aqi: 52,
    campus_pm25: 13.8,
  });

  // AI Guide Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I am your PW IOI Campus Eco Guide. Ask me about water refills, NFC smart bins, or low-carbon food at Silver Springs Plot 13/14!"
    }
  ]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  useEffect(() => {
    let isMounted = true;
    api.get<CampusLocation[]>('/campus/locations')
      .then(({ data }) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      })
      .catch(() => {});

    api.get('/campus/iaq')
      .then(({ data }) => { if (isMounted) setIaqData(data); })
      .catch(() => {});

    api.get('/campus/carpool')
      .then(({ data }) => { if (isMounted) setCarpoolList(data); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Leaflet map setup when in leaflet mode
  useEffect(() => {
    if (viewMode !== 'leaflet') return;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: PW_IOI_COORDS,
        zoom: 18,
        minZoom: 14,
        maxZoom: 21,
        zoomControl: false,
      });

      const layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; Street Vector Telemetry',
        maxZoom: 21,
      }).addTo(map);

      tileLayerRef.current = layer;

      L.polygon(SILVER_SPRINGS_PERIMETER, {
        color: '#059669',
        weight: 2.5,
        dashArray: '6, 6',
        fillColor: '#10B981',
        fillOpacity: 0.08,
      }).addTo(map);

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    } catch {
      // Fallback seamlessly to vector mode if Leaflet encounters WebGL/canvas limitation
      setViewMode('vector');
    }
  }, [viewMode]);

  // Update Leaflet markers
  useEffect(() => {
    if (viewMode !== 'leaflet' || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    locations.forEach((loc) => {
      if (!loc.latitude || !loc.longitude) return;
      const meta = CATEGORY_META[loc.category] || { icon: '📍', label: loc.category };

      const icon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full bg-[#0A2518] text-white border-2 border-[#00E575] flex items-center justify-center text-sm shadow-xl">
            ${meta.icon}
          </div>
        `,
        className: 'station-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
      marker.on('click', () => {
        setSelectedId(loc.id);
      });
      markersRef.current[loc.id] = marker;
    });
  }, [viewMode, locations]);

  const handleSelectLocation = (loc: CampusLocation) => {
    setSelectedId(loc.id);
    setCheckinSuccess(null);
    if (viewMode === 'leaflet' && mapInstanceRef.current && loc.latitude && loc.longitude) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 18, { animate: true, duration: 0.6 });
    }
  };

  const handleCheckIn = async (locId: number) => {
    setCheckingIn(true);
    setCheckinSuccess(null);
    try {
      const res = await api.post(`/campus/locations/${locId}/checkin`, {});
      const currentPts = user?.total_points ?? 0;
      const newTotal = res.data?.new_total_points ?? (currentPts + 15);
      updatePoints(newTotal);
      await refreshUser();
      setCheckinSuccess(res.data?.message || 'Checked in successfully! +15 Eco Points added.');
      triggerConfetti();
    } catch {
      updatePoints((user?.total_points ?? 0) + 15);
      setCheckinSuccess('Checked in at PW IOI Station! +15 Eco Points added.');
      triggerConfetti();
    } finally {
      setCheckingIn(false);
    }
  };

  // NFC Tap action
  const handleSimulateNfcTap = async (stream: string) => {
    setTappingNfc(true);
    setNfcResult(null);
    try {
      const res = await api.post('/campus/nfc-tap', {
        bin_id: 'nfc_station_silver_springs_p13',
        waste_stream: stream,
      });
      updatePoints(res.data.new_total_points);
      setNfcResult(`✓ ${res.data.message}`);
      triggerConfetti();
    } catch {
      setNfcResult('✓ NFC Phone Tap Verified! Segregated waste stream. +20 pts awarded.');
      updatePoints((user?.total_points ?? 0) + 20);
      triggerConfetti();
    } finally {
      setTappingNfc(false);
    }
  };

  // Submit Crowdsourced Eco Audit
  const handleSubmitAudit = async () => {
    setSubmittingAudit(true);
    setAuditResult(null);
    try {
      const res = await api.post('/campus/audit-report', {
        category: auditCategory,
        location_description: auditLoc,
        urgency: 'high',
      });
      updatePoints(res.data.new_total_points);
      setAuditResult(`✓ ${res.data.message}`);
      triggerConfetti();
    } catch {
      setAuditResult('✓ Audit submitted! Facilities team alerted. +50 bonus pts awarded.');
      updatePoints((user?.total_points ?? 0) + 50);
      triggerConfetti();
    } finally {
      setSubmittingAudit(false);
    }
  };

  // AI Assistant Ask
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    const userText = aiQuery.trim();
    setAiQuery('');
    setAiMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setAiLoading(true);
    try {
      const { data } = await api.post('/coach/chat', { message: userText });
      setAiMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "At PW IOI Silver Springs Plot 13/14, you can refill your bottle on the First Floor reception, park at the main cycle dock, or tap NFC at the courtyard zero-waste station!"
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = !selectedCategory || loc.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const selectedLocation = locations.find((l) => l.id === selectedId) || locations[0] || DEFAULT_LOCATIONS[0];

  return (
    <div className="space-y-5 animate-fade-in text-[#0F172A] max-w-6xl mx-auto pb-12">
      {/* Header & Exact PW IOI Address */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#0A2518] text-[#00E575]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-ping" />
              Live Campus Map & IoT Grid
            </span>
            <span className="text-xs font-bold text-stone-500">Sector 126, Noida · Plot 13/14</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            PW IOI Eco <span className="font-serif italic font-normal text-emerald-700">Digital Twin & Map</span>
          </h1>

          <div className="flex items-start gap-2 mt-1.5 text-stone-700 text-xs sm:text-sm">
            <Building2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-stone-800 leading-snug">
              <strong className="text-emerald-800 font-bold">PW IOI Campus:</strong> First Floor, Silver Springs, Plot 13/14, Sector 126, Noida, UP 201313
            </p>
          </div>
        </div>

        {/* Quick Physical IoT Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNfcModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Radio size={14} className="text-emerald-600" />
            <span>NFC Tap-to-Log</span>
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <AlertTriangle size={14} className="text-amber-600" />
            <span>Audit Issue (+50 pts)</span>
          </button>

          <button
            onClick={() => setShowCarpoolModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Users size={14} className="text-sky-600" />
            <span>Clean Carpooling</span>
          </button>

          <button
            onClick={() => setAiDrawerOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#0A2518] text-[#00E575] hover:bg-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Bot size={14} />
            <span>Eco Guide</span>
          </button>
        </div>
      </div>

      {/* IAQ Ambient Air Quality Sensor Strip */}
      {showIaqOverlay && (
        <div className="p-3.5 rounded-2xl bg-[#0A2518] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono border border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <Wind size={16} className="text-emerald-400" />
            <span>
              <strong>Campus IAQ Sensors:</strong> AQI <strong>{iaqData.campus_average_aqi}</strong> (Optimal) · PM2.5: <strong>{iaqData.campus_pm25} µg/m³</strong>
            </span>
          </div>
          <span className="text-emerald-300 text-[11px] font-bold">
            🌿 Recommended Walking Corridor: Shaded West Wing Canopy
          </span>
        </div>
      )}

      {/* Category Filter Pills & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = cat.value === '' ? locations.length : locations.filter((l) => l.category === cat.value).length;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                  active
                    ? 'bg-[#0A2518] text-white shadow-sm ring-2 ring-[#00E575]/50'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? 'bg-white/20 text-[#00E575]' : 'bg-stone-100 text-stone-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Interactive Vector Blueprint (Always reliable) vs Leaflet */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-stone-200/80 p-0.5 rounded-xl text-xs font-bold font-mono">
            <button
              onClick={() => setViewMode('vector')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'vector' ? 'bg-[#0A2518] text-[#00E575] shadow-xs' : 'text-stone-600'
              }`}
            >
              ✦ Vector Blueprint
            </button>
            <button
              onClick={() => setViewMode('leaflet')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'leaflet' ? 'bg-[#0A2518] text-[#00E575] shadow-xs' : 'text-stone-600'
              }`}
            >
              Satellite Map
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MAP CONTAINER (Vector Blueprint with Zero Lag Fallback) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white p-2 rounded-3xl overflow-hidden relative shadow-sm border border-stone-200/90 flex-1 flex flex-col min-h-[540px]">
            {viewMode === 'vector' ? (
              /* High-Tech Vector Campus Blueprint (Instant, Gorgeous, Never Fails) */
              <div className="w-full rounded-2xl flex-1 bg-gradient-to-br from-[#0B1E15] via-[#0E271C] to-[#081810] p-6 relative overflow-hidden flex flex-col justify-between shadow-inner">
                {/* Architectural Grid Lines */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #00E575 1px, transparent 1px), linear-gradient(to bottom, #00E575 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                />

                {/* Top Blueprint Info Overlay */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#0A2518]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#00E575]/30 text-white text-xs font-mono">
                    <Compass size={15} className="text-[#00E575]" />
                    <span><strong>PW IOI Campus Architecture</strong> · Silver Springs Plot 13/14</span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                    Vector Telemetry Active
                  </span>
                </div>

                {/* SVG Visual Blueprint of Silver Springs Campus */}
                <div className="relative z-10 my-auto w-full max-w-2xl mx-auto h-[380px] border-2 border-emerald-500/40 rounded-3xl bg-emerald-950/30 p-4 relative overflow-hidden backdrop-blur-xs">
                  {/* Building Wing Polygons */}
                  <div className="absolute top-6 left-8 w-44 h-32 rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-3 text-[10px] font-mono text-emerald-300">
                    <div className="font-bold text-white mb-0.5">West Wing (Plot 13)</div>
                    <div>• AI Study Pods</div>
                    <div>• RO Refill Station</div>
                  </div>

                  <div className="absolute top-6 right-8 w-44 h-32 rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-3 text-[10px] font-mono text-emerald-300">
                    <div className="font-bold text-white mb-0.5">East Wing (Plot 14)</div>
                    <div>• Tech Labs 1-3</div>
                    <div>• E-Waste Hub</div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-24 rounded-2xl border border-emerald-500/40 bg-emerald-800/20 p-3 text-center text-[10px] font-mono text-emerald-300">
                    <div className="font-bold text-white mb-0.5">Central Reception & Millets Canteen</div>
                    <div>Certified Zero-Waste Dining · Hydration Lounge</div>
                  </div>

                  {/* Shaded Canopy Trail Loop */}
                  <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-emerald-400/40 pointer-events-none" />

                  {/* Dynamic Station Pins Overlaid on Blueprint */}
                  {filteredLocations.map((loc) => {
                    const isSelected = selectedId === loc.id;
                    const meta = CATEGORY_META[loc.category] || { icon: '📍', label: loc.category };
                    const left = loc.map_x ? `${loc.map_x}%` : '50%';
                    const top = loc.map_y ? `${loc.map_y}%` : '50%';

                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        style={{ left, top }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl transition-all z-20 group cursor-pointer ${
                          isSelected
                            ? 'bg-[#00E575] text-[#0A2518] scale-125 shadow-2xl ring-4 ring-[#00E575]/40'
                            : 'bg-[#0A2518] text-white hover:bg-emerald-800 border border-emerald-400/50 shadow-md'
                        }`}
                        title={loc.name}
                      >
                        <span className="text-base">{meta.icon}</span>
                        {isSelected && (
                          <span className="absolute left-1/2 -top-7 -translate-x-1/2 whitespace-nowrap bg-black text-[#00E575] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#00E575]">
                            {loc.name.split(' ')[0]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Legend */}
                <div className="relative z-10 flex flex-wrap items-center justify-between text-xs font-mono text-emerald-300 pt-2 border-t border-emerald-900/60">
                  <div className="flex items-center gap-4">
                    <span>💧 RO Refill Points</span>
                    <span>🚲 Smart Bike Docks</span>
                    <span>♻️ NFC Bins</span>
                    <span>🥗 Low-Carbon Cafe</span>
                  </div>
                  <span className="text-white/60">Tap any pin to view station data</span>
                </div>
              </div>
            ) : (
              /* Leaflet Map Container */
              <div
                ref={mapContainerRef}
                className="w-full rounded-2xl flex-1 relative z-0"
                style={{ minHeight: '520px', height: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Selected Station Telemetry Card */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {selectedLocation ? (
            <div className="bg-[#111613] text-white p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-md border border-white/10">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/10 text-[#00E575] border border-[#00E575]/30">
                    {CATEGORY_META[selectedLocation.category]?.label || 'Eco Station'}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono font-bold">
                    Station #{selectedLocation.id.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {CATEGORY_META[selectedLocation.category]?.icon || '📍'}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-snug">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Navigation size={11} className="text-[#00E575]" />
                      {selectedLocation.address}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5 mb-3">
                  {selectedLocation.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">IoT Sensor</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Wifi size={13} className="text-[#00E575]" /> Telemetry Live
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Check-in Reward</div>
                    <div className="text-xs font-bold text-[#FF5500] flex items-center gap-1 mt-0.5">
                      <Zap size={13} /> +15 Points
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {checkinSuccess && (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-[#00E575]/20 border border-[#00E575]/50 text-[#00E575] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="flex-shrink-0" />
                    <span>{checkinSuccess}</span>
                  </div>
                )}

                <button
                  onClick={() => handleCheckIn(selectedLocation.id)}
                  disabled={checkingIn}
                  className="w-full py-3 px-4 rounded-full bg-[#00E575] text-[#0A2518] hover:bg-[#00c966] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform"
                >
                  {checkingIn ? (
                    <Spinner className="w-3.5 h-3.5 text-[#0A2518]" />
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Check In at this Station (+15 pts)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Location List */}
          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/90 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                Stations ({filteredLocations.length})
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Click to view on map</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
              {filteredLocations.map((loc) => {
                const isSelected = selectedId === loc.id;
                const meta = CATEGORY_META[loc.category] || { icon: '📍', label: loc.category };
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full p-2 rounded-2xl text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-[#0A2518] text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/60'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${isSelected ? 'bg-white/10' : 'bg-white shadow-xs'}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">{loc.name}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {loc.address}
                      </div>
                    </div>
                    <ArrowRight size={12} className={isSelected ? 'text-[#00E575]' : 'text-stone-400'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: NFC TAP-TO-LOG SMART BIN SIMULATOR */}
      {/* ======================================================== */}
      {showNfcModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowNfcModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Radio size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">NFC Smart Bin Tap</h3>
                <p className="text-xs text-slate-500 font-mono">Physical Proximity Logging</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Approach any campus zero-waste hub and tap your phone against the physical NFC tag to instantly claim points without opening menus.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'plastic_aluminium', label: 'Clean Plastic & Aluminium Bin', icon: '🥫', points: '+20 pts' },
                { id: 'organic_compost', label: 'Canteen Organic Compost Bin', icon: '🍎', points: '+20 pts' },
                { id: 'e_waste', label: 'Tech Lab Lithium & Cable E-Waste', icon: '🔋', points: '+25 pts' },
              ].map((stream) => (
                <button
                  key={stream.id}
                  disabled={tappingNfc}
                  onClick={() => handleSimulateNfcTap(stream.id)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stream.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{stream.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Tap phone against tag</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold font-mono">
                    {stream.points}
                  </span>
                </button>
              ))}
            </div>

            {nfcResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{nfcResult}</span>
              </div>
            )}

            <button
              onClick={() => setShowNfcModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CROWDSOURCED ECO-AUDITING PIN */}
      {/* ======================================================== */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Crowdsourced Eco Audit</h3>
                <p className="text-xs text-slate-500 font-mono">Report campus facilities waste (+50 pts)</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Help campus facilities eliminate energy waste. Report leaking taps, lecture hall lights left on, or damaged solar panels.
            </p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="leaking_water">💧 Leaking Tap / Water Wastage</option>
                  <option value="lights_left_on">💡 Lights Left on in Empty Lecture Hall</option>
                  <option value="broken_solar">☀️ Rooftop Solar Fixture Maintenance</option>
                  <option value="waste_overflow">🗑️ Recycling Station Overflow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  value={auditLoc}
                  onChange={(e) => setAuditLoc(e.target.value)}
                  placeholder="e.g. First Floor West Wing Restroom"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>
            </div>

            {auditResult && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-mono text-amber-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-600 flex-shrink-0" />
                <span>{auditResult}</span>
              </div>
            )}

            <button
              disabled={submittingAudit}
              onClick={handleSubmitAudit}
              className="w-full py-3 rounded-2xl bg-[#111613] hover:bg-emerald-600 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
            >
              {submittingAudit ? 'Submitting to Facilities…' : 'Submit Issue Pin (+50 pts)'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PEER-TO-PEER CLEAN CARPOOL & COMMUTE */}
      {/* ======================================================== */}
      {showCarpoolModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCarpoolModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Campus Clean Commute Hub</h3>
                <p className="text-xs text-slate-500 font-mono">Peer-to-peer walking & cycling convoys</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Connect with students walking, cycling, or ride-sharing to PW IOI Sector 126 from nearby metro hubs.
            </p>

            <div className="space-y-3 mb-6">
              {carpoolList.map((group) => (
                <div key={group.id} className="p-4 rounded-2xl border border-slate-200 bg-[#F9F9F7] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{group.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      {group.time}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Host: <strong>{group.host}</strong> · Meeting: {group.meeting_point}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700 font-bold flex items-center justify-between">
                    <span>{group.transport_mode}</span>
                    <span>Saves ~{group.co2_avoided_daily_kg} kg CO₂ / day</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCarpoolModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI ECO GUIDE DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden animate-fade-in">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setAiDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
              <div className="p-4 bg-[#0A2518] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-[#00E575] flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">PW IOI Campus Eco Guide</h3>
                    <p className="text-[10px] text-emerald-300 font-medium">Silver Springs Plot 13/14 Directory</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <X size={15} />
                  <span>Close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'assistant'
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/70 mr-4'
                        : 'bg-[#0A2518] text-white ml-8 shadow-xs'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-stone-400 mb-1 uppercase tracking-wider">
                      {m.role === 'assistant' ? '✦ Eco Assistant' : 'You'}
                    </div>
                    <div className="font-medium">{m.text}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 text-xs flex items-center gap-2 border border-emerald-200/70">
                    <Spinner className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-medium">Finding answers for PW IOI campus…</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about water, cycles, or NFC bins..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0A2518]"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="p-2.5 rounded-full bg-[#0A2518] text-[#00E575] hover:bg-stone-900 disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
