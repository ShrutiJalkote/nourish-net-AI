import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Thermometer, 
  Droplets, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Donation } from '../types';
import { api } from '../services/api';

interface DonorPortalProps {
  onDonationCreated: () => void;
  recentDonations: Donation[];
}

const CITIES: { [name: string]: { lat: number; lng: number } } = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
};

const FOOD_PRESETS: { [category: string]: { t0: number; k: number; t_base: number; label: string; icon: string } } = {
  cooked_hot_meals: { t0: 4.0, k: 0.18, t_base: 60, label: 'Cooked Hot Meals', icon: '🍲' },
  fresh_dairy: { t0: 6.0, k: 0.22, t_base: 4, label: 'Fresh Dairy', icon: '🥛' },
  leafy_greens: { t0: 3.0, k: 0.25, t_base: 4, label: 'Leafy Greens / Salads', icon: '🥗' },
  bakery_bread: { t0: 24.0, k: 0.08, t_base: 22, label: 'Bakery / Bread', icon: '🍞' },
  canned_packaged: { t0: 720.0, k: 0.01, t_base: 22, label: 'Canned / Packaged', icon: '🥫' },
  fruits: { t0: 12.0, k: 0.12, t_base: 8, label: 'Fresh Fruits', icon: '🍎' },
  frozen_items: { t0: 168.0, k: 0.03, t_base: -18, label: 'Frozen Items', icon: '🧊' }
};

const PACKAGING_FACTORS: { [key: string]: number } = {
  open: 0.7,
  sealed: 1.0,
  vacuum: 1.5,
  frozen: 3.0
};

export const DonorPortal: React.FC<DonorPortalProps> = ({ onDonationCreated, recentDonations }) => {
  const [donorName, setDonorName] = useState('Taj Mahal Palace Banquet');
  const [foodCategory, setFoodCategory] = useState('cooked_hot_meals');
  const [quantityKg, setQuantityKg] = useState(45);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [ambientTemp, setAmbientTemp] = useState(32);
  const [humidity, setHumidity] = useState(65);
  const [packagingType, setPackagingType] = useState('sealed');
  const [notes, setNotes] = useState('Fresh biryani & paneer dishes from conference lunch buffet. Kept hot.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Real-time client-side Arrhenius preview
  const preview = useMemo(() => {
    const params = FOOD_PRESETS[foodCategory] || FOOD_PRESETS.cooked_hot_meals;
    const beta = PACKAGING_FACTORS[packagingType] || 1.0;
    const alpha = 1.0 - 0.003 * Math.max(0, humidity - 40);
    const exponent = -params.k * (ambientTemp - params.t_base) / 10.0;
    const tSafeHours = params.t0 * Math.exp(exponent) * Math.max(0.1, alpha) * beta;
    const tSafeMinutes = Math.max(10, tSafeHours * 60);

    let urgency: 'CRITICAL' | 'URGENT' | 'NORMAL' | 'STABLE' = 'STABLE';
    if (tSafeMinutes < 60) urgency = 'CRITICAL';
    else if (tSafeMinutes < 180) urgency = 'URGENT';
    else if (tSafeMinutes < 480) urgency = 'NORMAL';

    return {
      tSafeMinutes,
      tSafeHours,
      urgency
    };
  }, [foodCategory, ambientTemp, humidity, packagingType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const coords = CITIES[selectedCity] || CITIES.Mumbai;

    const payload = {
      donor_name: donorName,
      food_category: foodCategory,
      quantity_kg: Number(quantityKg),
      prep_time: new Date().toISOString(),
      ambient_temp_celsius: Number(ambientTemp),
      humidity_percent: Number(humidity),
      packaging_type: packagingType,
      latitude: coords.lat,
      longitude: coords.lng,
      notes
    };

    try {
      const created = await api.createDonation(payload);
      setFeedback({
        type: 'success',
        message: `Surplus successfully logged! Safe window: ${created.remaining_minutes.toFixed(0)}m (${created.urgency_level}).`
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#06B6D4', '#10B981']
      });
      onDonationCreated();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Failed to post surplus: ${err.message || 'Server error'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-indigo text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Commercial Surplus Registration
          </span>
          <span className="badge-cyan text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Arrhenius Thermal Kinetics
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
          <span>🍽️</span>
          <span>Donor Portal — Post Surplus Food</span>
        </h2>
        <p className="text-sm text-[#475569] mt-1">
          Register fresh surplus food. Our Arrhenius AI computes safe transit windows in real time to prevent bacterial spoilage.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Main Form & Arrhenius Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 light-panel p-6 rounded-2xl border border-[#E2E8F0] space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
              ⚡ Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Taj Hotel Banquet (Mumbai)', cat: 'cooked_hot_meals', qty: 50, city: 'Mumbai', temp: 32 },
                { name: 'Amul Dairy Hub (Ahmedabad)', cat: 'fresh_dairy', qty: 120, city: 'Ahmedabad', temp: 18 },
                { name: 'Infosys Cafeteria (Bangalore)', cat: 'cooked_hot_meals', qty: 85, city: 'Bangalore', temp: 26 },
                { name: 'BigBasket Fresh (Delhi)', cat: 'fruits', qty: 200, city: 'Delhi', temp: 28 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDonorName(p.name);
                    setFoodCategory(p.cat);
                    setQuantityKg(p.qty);
                    setSelectedCity(p.city);
                    setAmbientTemp(p.temp);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  {p.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Donor Name / Facility</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Grand Hyatt Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">City Hub</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition cursor-pointer"
              >
                {Object.keys(CITIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Food Category</label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition cursor-pointer"
              >
                {Object.entries(FOOD_PRESETS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Quantity (Kilograms)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="5000"
                  step="0.5"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#475569] font-mono">kg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div className="flex justify-between text-xs text-[#0F172A] mb-2">
                <span className="flex items-center gap-1 font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ambient Temp</span>
                </span>
                <span className="font-mono text-indigo-600 font-bold">{ambientTemp}°C</span>
              </div>
              <input
                type="range"
                min="-15"
                max="50"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div className="flex justify-between text-xs text-[#0F172A] mb-2">
                <span className="flex items-center gap-1 font-semibold">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Humidity</span>
                </span>
                <span className="font-mono text-cyan-600 font-bold">{humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <label className="block text-xs font-bold text-[#0F172A] mb-2">Packaging Method</label>
              <select
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs focus:outline-none focus:border-indigo-600 transition cursor-pointer"
              >
                <option value="open">Open (0.7x)</option>
                <option value="sealed">Sealed (1.0x)</option>
                <option value="vacuum">Vacuum (1.5x)</option>
                <option value="frozen">Frozen (3.0x)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Special Handling Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian only, kept in thermal chafing dishes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl indigo-gradient-btn font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Logging Spoilage Model...' : 'Register Surplus & Activate Rescue'}</span>
          </button>
        </form>

        {/* Live Arrhenius Dynamic Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="light-panel p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">Arrhenius Decay Predictor</h3>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-center space-y-2">
              <div className="text-[11px] text-[#475569] font-bold uppercase tracking-wider">Predicted Safe Window</div>
              <div className="text-4xl font-extrabold font-mono text-[#0F172A] tracking-tight">
                {preview.tSafeMinutes > 120 
                  ? `${preview.tSafeHours.toFixed(1)} hrs` 
                  : `${preview.tSafeMinutes.toFixed(0)} min`}
              </div>
              <div className="pt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    preview.urgency === 'CRITICAL'
                      ? 'badge-rose'
                      : preview.urgency === 'URGENT'
                      ? 'badge-amber'
                      : 'badge-emerald'
                  }`}
                >
                  {preview.urgency} STATUS
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#0F172A]">
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#475569]">Baseline Half-Life (t₀):</span>
                <span className="font-mono font-bold text-slate-800">{FOOD_PRESETS[foodCategory]?.t0}h</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#475569]">Packaging Multiplier:</span>
                <span className="font-mono font-bold text-slate-800">{PACKAGING_FACTORS[packagingType]}x</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#475569] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Meals Generated:</span>
                </span>
                <span className="font-mono text-emerald-700 font-bold">{(quantityKg * 2.5).toFixed(0)} meals</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#475569] flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-cyan-600" />
                  <span>CO₂ Avoided:</span>
                </span>
                <span className="font-mono text-indigo-600 font-bold">{(quantityKg * 2.5).toFixed(1)} kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-[10px] text-[#475569] font-mono">
              <code>t_safe = t₀ · e^(-k(T-T_base)/10) · α_hum · β_pkg</code>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Surplus Table */}
      <div className="light-panel p-6 rounded-2xl border border-[#E2E8F0]">
        <h3 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Recently Registered Surplus Batches</span>
        </h3>
        
        {recentDonations.length === 0 ? (
          <div className="text-center text-xs text-[#475569] py-6">No donations registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[#475569] uppercase text-[10px] tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3 font-bold">ID / Donor</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Quantity</th>
                  <th className="p-3 font-bold">Temp / Env</th>
                  <th className="p-3 font-bold">Safe Window</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentDonations.slice(0, 6).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-[#0F172A]">
                      <div>#{d.id} {d.donor_name}</div>
                      <div className="text-[10px] text-[#475569] font-normal">{new Date(d.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3 capitalize">{d.food_category.replace('_', ' ')}</td>
                    <td className="p-3 font-mono font-bold text-[#0F172A]">{d.quantity_kg} kg</td>
                    <td className="p-3 font-mono text-[#475569]">{d.ambient_temp_celsius}°C, {d.humidity_percent}%</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        d.urgency_level === 'CRITICAL' ? 'badge-rose' :
                        d.urgency_level === 'URGENT' ? 'badge-amber' :
                        'badge-emerald'
                      }`}>
                        {d.urgency_level} ({Math.max(0, d.remaining_minutes).toFixed(0)}m)
                      </span>
                    </td>
                    <td className="p-3 capitalize">
                      <span className="font-semibold text-indigo-600 font-mono">{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
