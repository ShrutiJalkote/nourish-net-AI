import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Sparkles,
  BarChart2,
  TrendingUp,
  RotateCcw,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Donation, NGO, MatchResult } from '../types';
import { LiveMap } from './LiveMap';
import { api } from '../services/api';

interface CommandCenterProps {
  donations: Donation[];
  ngos: NGO[];
  matches: MatchResult[];
  onRefresh: () => void;
  onNavigateToAudit?: () => void;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'cooked_hot_meals': return 'food-tag-cooked';
    case 'fresh_dairy': return 'food-tag-dairy';
    case 'leafy_greens': return 'food-tag-greens';
    case 'bakery_bread': return 'food-tag-bakery';
    case 'fruits': return 'food-tag-fruits';
    case 'frozen_items': return 'food-tag-frozen';
    default: return 'badge-indigo';
  }
};

export const CommandCenter: React.FC<CommandCenterProps> = ({
  donations,
  ngos,
  matches,
  onRefresh,
}) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [shapPlots, setShapPlots] = useState<{ [id: number]: string }>({});
  const [loadingShapId, setLoadingShapId] = useState<number | null>(null);
  const [sealingId, setSealingId] = useState<number | null>(null);

  // Filter active / pending donations
  const activeDonations = donations.filter(d => d.status === 'active');
  const criticalCount = activeDonations.filter(d => d.urgency_level === 'CRITICAL').length;
  const urgentCount = activeDonations.filter(d => d.urgency_level === 'URGENT').length;

  // Batch trigger Hungarian algorithm
  const handleBatchMatch = async () => {
    setIsMatching(true);
    setMatchMessage(null);
    try {
      const res = await api.executeMatch();
      setMatchMessage(`✨ Solved in ${res.elapsed_ms.toFixed(1)}ms (${res.matches.length} optimal matches deployed)`);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B']
      });
      onRefresh();
    } catch (err: any) {
      setMatchMessage(`❌ Matching failed: ${err.message || 'Server error'}`);
    } finally {
      setIsMatching(false);
    }
  };

  // Match single donation
  const handleSingleMatch = async (donationId: number) => {
    setIsMatching(true);
    try {
      const res = await api.executeMatch(donationId);
      setMatchMessage(`✨ Matched donation #${donationId} in ${res.elapsed_ms.toFixed(1)}ms`);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
      onRefresh();
    } catch (err: any) {
      setMatchMessage(`❌ Match failed: ${err.message || 'No suitable NGO found'}`);
    } finally {
      setIsMatching(false);
    }
  };

  // Toggle SHAP explainer
  const handleToggleShap = async (matchId: number) => {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
      return;
    }
    setExpandedMatchId(matchId);
    if (!shapPlots[matchId]) {
      setLoadingShapId(matchId);
      try {
        const explanation = await api.getMatchExplanation(matchId);
        if (explanation.waterfall_plot_base64) {
          setShapPlots(prev => ({
            ...prev,
            [matchId]: `data:image/png;base64,${explanation.waterfall_plot_base64}`
          }));
        }
      } catch (e) {
        console.error("Failed to load SHAP plot", e);
      } finally {
        setLoadingShapId(null);
      }
    }
  };

  // Seal delivery & generate SHA-256 certificate
  const handleSealDelivery = async (matchId: number) => {
    setSealingId(matchId);
    try {
      await api.generateAudit(matchId, 24.5, 22.0);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#06B6D4', '#4F46E5', '#8B5CF6']
      });
      onRefresh();
    } catch (err: any) {
      alert(`Sealing failed: ${err.message}`);
    } finally {
      setSealingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header Metrics with Colorful Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Rose / Coral */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/90 to-white border border-rose-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-rose-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Surplus Radar</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-950 tracking-tight">
            {activeDonations.length}
            <span className="text-xs text-rose-700 font-sans font-medium ml-1.5">batches</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
            <span className="font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">{criticalCount} Critical</span>
            <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">{urgentCount} Urgent</span>
          </div>
        </div>

        {/* Metric 2: Emerald / Mint */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-white border border-emerald-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Verified NGOs</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-950 tracking-tight">
            {ngos.length}
            <span className="text-xs text-emerald-700 font-sans font-medium ml-1.5">shelters</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1.5 font-mono">
            {ngos.reduce((acc, n) => acc + (n.available_capacity_kg || 0), 0).toFixed(0)} kg available capacity
          </div>
        </div>

        {/* Metric 3: Sky / Azure */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 to-white border border-sky-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-sky-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Matches</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-sky-950 tracking-tight">
            {matches.length}
            <span className="text-xs text-sky-700 font-sans font-medium ml-1.5">dispatches</span>
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1.5">
            Hungarian Algorithm &lt;10ms
          </div>
        </div>

        {/* Metric 4: Indigo / Purple Action Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-white border border-indigo-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">FastAPI AI Engine</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <button
            onClick={handleBatchMatch}
            disabled={isMatching || activeDonations.length === 0}
            className="w-full mt-2 py-2.5 px-4 rounded-xl indigo-gradient-btn text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isMatching ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Auto-Match ({activeDonations.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Match Notification Banner */}
      {matchMessage && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-bold">{matchMessage}</span>
          </div>
          <button onClick={() => setMatchMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer px-1">✕</button>
        </div>
      )}

      {/* Main Split Section: Live Map + Dispatch Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Surplus Radar & Active Matches (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5 max-h-[750px] overflow-y-auto pr-1">
          
          {/* Active Surplus Radar */}
          <div className="light-panel rounded-2xl p-5 border border-[#E2E8F0] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="font-bold text-sm text-[#0F172A] tracking-wide">Live Surplus Radar</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-slate-200 font-semibold">
                Arrhenius Safe Timer
              </span>
            </div>

            {activeDonations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#475569] border border-dashed border-slate-200 rounded-xl space-y-1">
                <div className="text-lg">🌟</div>
                <div className="font-bold text-[#0F172A]">All surplus currently matched!</div>
                <p className="text-[11px]">Post a new surplus batch or click 'Reset Demo' to test.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeDonations.map((d) => {
                  const isCrit = d.urgency_level === 'CRITICAL';
                  const isUrg = d.urgency_level === 'URGENT';
                  const badgeClass = isCrit ? 'badge-rose' : isUrg ? 'badge-amber' : 'badge-emerald';
                  const catClass = getCategoryBadgeClass(d.food_category);

                  return (
                    <div 
                      key={d.id} 
                      className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-indigo-300 hover:shadow-md transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                            <span className="text-sm">🍲</span>
                            <span className="hover:text-indigo-600 transition">{d.donor_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${catClass}`}>
                              {d.food_category.replace('_', ' ')}
                            </span>
                            <span className="text-[#0F172A] font-bold font-mono text-xs">{d.quantity_kg} kg</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                            {d.urgency_level}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#0F172A] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {Math.max(0, d.remaining_minutes).toFixed(0)}m left
                          </span>
                        </div>
                      </div>

                      {/* Freshness Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-[#475569] mb-1 font-semibold">
                          <span>Freshness Safe Index</span>
                          <span className="font-mono text-[#0F172A]">{d.freshness_pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              d.freshness_pct > 60 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                              d.freshness_pct > 25 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 
                              'bg-gradient-to-r from-rose-500 to-red-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, d.freshness_pct))}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                        <span className="text-[#475569] font-mono text-[10px]">{d.ambient_temp_celsius}°C • {d.packaging_type}</span>
                        <button
                          onClick={() => handleSingleMatch(d.id)}
                          disabled={isMatching}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Dispatch AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active AI Matches Stream */}
          <div className="light-panel rounded-2xl p-5 border border-[#E2E8F0] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#0F172A] tracking-wide">AI Dispatched Matches</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                {matches.length} active routes
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#475569] border border-dashed border-slate-200 rounded-xl space-y-1">
                <div className="text-lg">🤖</div>
                <div className="font-bold text-[#0F172A]">No active dispatches yet.</div>
                <p className="text-[11px]">Click 'Auto-Match' above to trigger the Hungarian bipartite optimizer!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {matches.map((m) => {
                  const isExpanded = expandedMatchId === m.id;
                  const isDelivered = m.status === 'delivered';
                  const isTier2 = m.tier === 2;

                  return (
                    <div 
                      key={m.id}
                      className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-indigo-300 hover:shadow-md transition space-y-3"
                    >
                      {/* Donor -> NGO Route */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                            <span>{m.donor_name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-emerald-700">{m.ngo_name}</span>
                          </div>
                          <div className="text-[11px] text-[#475569] capitalize mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>{m.quantity_kg} kg {m.food_category.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="text-[#0F172A] font-mono font-semibold">{m.distance_km.toFixed(1)} km (ETA: {m.eta_minutes.toFixed(0)}m)</span>
                            {m.routing_mode && m.routing_mode.includes('OpenRouteService') && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🛣️ OpenRouteService Live
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isTier2 ? 'badge-amber' : 'badge-indigo'
                          }`}>
                            {isTier2 ? 'Tier 2: Bio-Upcycle' : 'Tier 1: Human Relief'}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            {(m.composite_score * 100).toFixed(0)}% Score
                          </span>
                        </div>
                      </div>

                      {/* Factor Scores Micro-Grid */}
                      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-[10px]">
                        <div className="text-center">
                          <div className="text-[#475569] text-[9px] uppercase font-bold">Urgency</div>
                          <div className="font-mono font-bold text-amber-600">{(m.urgency_score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#475569] text-[9px] uppercase font-bold">Capacity</div>
                          <div className="font-mono font-bold text-indigo-600">{(m.capacity_fit_score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#475569] text-[9px] uppercase font-bold">Proximity</div>
                          <div className="font-mono font-bold text-emerald-600">{(m.proximity_score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#475569] text-[9px] uppercase font-bold">Dietary</div>
                          <div className="font-mono font-bold text-purple-600">{(m.dietary_match_score * 100).toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* Action & Explain Row */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                        <button
                          onClick={() => handleToggleShap(m.id)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Decision Breakdown' : 'TreeSHAP Attribution'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isDelivered ? (
                          <span className="px-3 py-1 rounded-lg badge-emerald text-[11px] font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Custody Sealed</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSealDelivery(m.id)}
                            disabled={sealingId === m.id}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{sealingId === m.id ? 'Sealing...' : 'Verify & Seal'}</span>
                          </button>
                        )}
                      </div>

                      {/* Expandable TreeSHAP Visualizer */}
                      {isExpanded && (
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>TreeSHAP Decision Explainer</span>
                            </span>
                            <span className="text-[10px] text-[#475569] font-mono">Additive Feature Attribution</span>
                          </div>

                          {loadingShapId === m.id ? (
                            <div className="py-6 text-center text-xs text-[#475569]">
                              Computing Shapley vectors...
                            </div>
                          ) : shapPlots[m.id] ? (
                            <div className="space-y-2">
                              <img 
                                src={shapPlots[m.id]} 
                                alt="SHAP Waterfall" 
                                className="w-full rounded-lg border border-slate-200 shadow-sm" 
                              />
                              <p className="text-[10px] text-[#475569] italic">
                                Red bars increased NGO match priority; blue bars decreased priority relative to baseline expectations.
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-[#475569] py-2">
                              Model explanation ready. Re-click to reload.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Map (7 cols) */}
        <div className="lg:col-span-7 h-[680px]">
          <LiveMap donations={donations} ngos={ngos} matches={matches} />
        </div>
      </div>
    </div>
  );
};
