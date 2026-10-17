export interface Donation {
  id: number;
  donor_name: string;
  food_category: string;
  quantity_kg: number;
  prep_time: string;
  ambient_temp_celsius: number;
  humidity_percent: number;
  packaging_type: string;
  latitude: number;
  longitude: number;
  notes?: string;
  created_at: string;
  spoilage_deadline: string;
  urgency_level: 'CRITICAL' | 'URGENT' | 'NORMAL' | 'STABLE';
  freshness_pct: number;
  remaining_minutes: number;
  status: 'active' | 'matched' | 'delivered' | 'expired';
}

export interface NGO {
  id: number;
  name: string;
  org_type: string;
  capacity_kg: number;
  current_load_kg: number;
  available_capacity_kg: number;
  latitude: number;
  longitude: number;
  dietary_prefs: string[];
  beneficiary_count: number;
  has_refrigeration: boolean;
  contact_phone?: string;
  contact_email?: string;
}

export interface ShapExplanation {
  feature_names: string[];
  shap_values: number[];
  feature_values: number[];
  base_value: number;
  prediction: number;
  waterfall_plot_base64?: string;
}

export interface MatchResult {
  id: number;
  donation_id: number;
  ngo_id: number;
  donor_name: string;
  ngo_name: string;
  food_category: string;
  quantity_kg: number;
  composite_score: number;
  urgency_score: number;
  capacity_fit_score: number;
  need_score: number;
  proximity_score: number;
  dietary_match_score: number;
  distance_km: number;
  eta_minutes: number;
  matched_at: string;
  status: string;
  tier?: number;
  tier_name?: string;
  shap_explanation?: ShapExplanation;
}

export interface AuditRecord {
  id: number;
  match_id: number;
  donation_summary: string;
  ngo_summary: string;
  pickup_temp: number;
  delivery_temp: number;
  chain_hash: string;
  previous_hash: string;
  timestamp: string;
  transaction_data: any;
  is_valid: boolean;
}

export interface ImpactMetrics {
  total_kg_rescued: number;
  total_meals_served: number;
  total_co2_avoided_kg: number;
  total_water_saved_liters: number;
  total_donations: number;
  total_matches: number;
  total_ngos: number;
  active_donations: number;
  completed_rescues: number;
  tier1_human_rescues?: number;
  tier2_bio_upcycled?: number;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  platform: string;
  python_version: string;
  uptime_seconds: number;
  timestamp: string;
}
