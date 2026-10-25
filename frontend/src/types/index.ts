// Core types for EcoPulse

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_color: string;
  timezone: string;
  total_points: number;
  points?: number;
  current_streak: number;
  longest_streak: number;
  is_demo: boolean;
  daily_hydration_goal_ml: number;
  weekly_active_travel_goal_km: number;
  weekly_movement_goal_minutes: number;
  weekly_meal_swap_goal: number;
  weekly_focus?: string;
  created_at: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  category: MissionCategory;
  duration_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  points: number;
  metrics?: Record<string, unknown>;
  completion_criteria?: string;
  icon: string;
  color: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
}

export type MissionCategory = 'travel' | 'meals' | 'movement' | 'hydration';

export interface MissionCompletion {
  id: number;
  mission_id: number;
  mission_title: string;
  points_awarded: number;
  completed_at: string;
  notes?: string;
}

export interface CoachRequest {
  available_time: number;
  energy: 'energetic' | 'okay' | 'tired';
  preferred_category?: MissionCategory;
  has_reusable_bottle: boolean;
  weekly_focus?: string;
}

export interface CoachResponse {
  mission: Mission;
  reason: string;
  engine: string;
  recommendation_score: number;
  inputs: CoachRequest;
}

export interface ActivityLog {
  id: number;
  activity_type: string;
  sub_type?: string;
  duration_minutes?: number;
  distance_km?: number;
  water_ml?: number;
  reusable_bottle: boolean;
  notes?: string;
  logged_at: string;
}

export interface Goal {
  id: number;
  category: string;
  target_value: number;
  unit: string;
  period: string;
  is_active: boolean;
  created_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  criteria_type: string;
  criteria_value: number;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  earned_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_color: string;
  total_points: number;
  missions_completed: number;
  current_streak: number;
  badges_count: number;
  is_demo: boolean;
  is_current_user: boolean;
}

export interface TeamLeaderboardEntry {
  rank: number;
  team_id: number;
  team_name: string;
  team_type: string;
  avatar_color: string;
  total_points: number;
  missions_completed: number;
  member_count: number;
  is_demo: boolean;
}

export interface ImpactSummary {
  total_travel_km: number;
  total_travel_minutes: number;
  estimated_co2_avoided_kg: number | null;
  co2_estimate_available: boolean;
  total_meal_swaps: number;
  estimated_meal_co2_avoided_kg: number;
  total_movement_minutes: number;
  total_movement_sessions: number;
  total_water_ml: number;
  total_reusable_bottle_uses: number;
  estimated_bottles_avoided: number;
  estimated_bottle_co2_avoided_kg: number;
  total_missions_completed: number;
  total_points: number;
  estimate_disclaimer: string;
  assumptions: Record<string, unknown>;
}

export interface DashboardData {
  user: Partial<User>;
  today_recommended_mission: {
    mission: Partial<Mission>;
    reason: string;
  } | null;
  weekly_stats: {
    missions_completed: number;
    points_earned: number;
    week_start: string;
    target?: number;
    completion_percentage?: number;
  };
  recent_completions: Array<{
    id: number;
    mission_title: string;
    category: MissionCategory;
    points: number;
    completed_at: string;
  }>;
  impact_summary: {
    travel_km: number;
    meal_swaps: number;
    bottles_avoided: number;
    total_co2_mitigated_kg?: number;
  };
  milestone_analogies?: {
    balloons_filled: number;
    oak_tree_absorption_days: number;
    smartphone_charges: number;
    car_km_avoided: number;
  };
  streak_assets?: {
    shield_active: boolean;
    shields_available: number;
    freeze_days_available: number;
    multiplier: string;
  };
  virtual_ecosystem?: {
    name: string;
    health_percent: number;
    status: string;
    streak_days: number;
    loss_aversion_notice: string;
  };
  streak: number;
  total_points: number;
  next_milestone: { points: number } | null;
  leaderboard_preview: Array<{
    rank: number;
    username: string;
    total_points: number;
    avatar_color: string;
    is_current_user: boolean;
    is_demo: boolean;
  }>;
}

export interface MarketplaceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  cost_points: number;
  icon: string;
  badge: string;
  in_stock: boolean;
}

export interface ThriftListing {
  id: string;
  title: string;
  category: string;
  seller: string;
  seller_contact?: string;
  hostel?: string;
  price_inr: number;
  avoided_manufacturing_co2_kg: number;
  condition: string;
  status: string;
  description?: string;
  created_at?: string;
}

export interface HostelTournamentStanding {
  rank: number;
  name: string;
  type: string;
  members_active: number;
  weekly_points: number;
  co2_mitigated_kg: number;
  streak_shield_rate: string;
  trophy: string;
  perk_reward: string;
}

export interface UtilityProvider {
  id: string;
  name: string;
  region: string;
  protocol: string;
  connected: boolean;
  last_meter_kwh: number;
  status: string;
  peak_kwh?: number;
  off_peak_kwh?: number;
}

export interface PassportData {
  user: Partial<User>;
  total_missions: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  badges: UserBadge[];
  recent_activity: Array<{
    type: string;
    title: string;
    points: number;
    category: MissionCategory;
    completed_at: string;
  }>;
  weekly_progress: {
    missions_this_week: number;
    points_this_week: number;
  };
  cumulative_metrics: {
    travel_km: number;
    movement_minutes: number;
    meal_swaps: number;
    water_ml: number;
    reusable_bottle_uses: number;
  };
  milestones: Array<{
    name: string;
    value: number;
    type: string;
    achieved: boolean;
  }>;
}

export interface CampusLocation {
  id: number;
  name: string;
  description?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  map_x?: number;
  map_y?: number;
  address?: string;
  is_verified?: boolean;
  is_demo: boolean;
}

export interface ApiError {
  detail: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
