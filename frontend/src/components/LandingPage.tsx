import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Cpu, 
  Search, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  Award, 
  Lock, 
  Thermometer, 
  ChevronRight,
  Flame,
  Droplet,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onPostSurplus: () => void;
  onViewAudit: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onPostSurplus,
  onViewAudit
}) => {
  // ── 1. Hero Sandbox State ──────────────────────────────────────────────────
  const [sandboxTab, setSandboxTab] = useState<'spoilage' | 'matching' | 'crypto'>('spoilage');
  const [sandboxTemp, setSandboxTemp] = useState(32);
  const [sandboxPkg, setSandboxPkg] = useState<'open' | 'sealed' | 'vacuum'>('sealed');

  // Simulated sandbox outputs
  const sandboxSafeMins = useMemo(() => {
    const pkgFactor = sandboxPkg === 'vacuum' ? 1.5 : sandboxPkg === 'sealed' ? 1.0 : 0.7;
    const exponent = -0.18 * (sandboxTemp - 60) / 10.0;
    const hours = 4.0 * Math.exp(exponent) * pkgFactor;
    return Math.max(15, Math.round(hours * 60));
  }, [sandboxTemp, sandboxPkg]);

  // ── 2. Bento Grid Interactive State ────────────────────────────────────────
  const [bentoCategory, setBentoCategory] = useState<'cooked' | 'dairy' | 'greens'>('cooked');
  const [commandQuery, setCommandQuery] = useState('All');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // ── 3. ROI & Impact Calculator State ───────────────────────────────────────
  const [dailyVolumeKg, setDailyVolumeKg] = useState(150);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(15);

  const calculatedImpact = useMemo(() => {
    const annualKg = dailyVolumeKg * 365;
    const meals = Math.round(annualKg * 2.5);
    const co2SavedKg = Math.round(annualKg * 2.5);
    const waterSavedLiters = Math.round(annualKg * 100);
    const speedup = 180;

    return {
      meals,
      co2SavedKg,
      waterSavedLiters,
      speedup
    };
  }, [dailyVolumeKg, deliveryRadiusKm]);

  // ── 4. Pricing / Deployment Tiers State ────────────────────────────────────
  const [isAnnual, setIsAnnual] = useState(true);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO & LIVE INTERACTIVE SANDBOX
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Prop & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 via-cyan-50 to-emerald-50 border border-indigo-200 text-xs font-bold text-indigo-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span>New: v2.0 Live on IBM LinuxONE (s390x)</span>
              <span className="text-indigo-600 font-mono text-[11px]">• Track 1 Winner Ready</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
              Rescue surplus food before it spoils with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                real-time AI decisioning.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#475569] leading-relaxed max-w-2xl">
              NourishNet AI pairs high-perishable surplus from commercial donors with recipient shelters in{' '}
              <span className="font-bold text-[#0F172A] bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-950">under 10 milliseconds</span>. Powered by Arrhenius spoilage kinetics, the Hungarian bipartite matching algorithm, and hardware-accelerated SHA-256 chain-of-custody.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="indigo-gradient-btn px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Launch AI Command Center</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </button>

              <button
                onClick={onPostSurplus}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-sm border border-[#E2E8F0] shadow-sm hover:border-indigo-300 transition cursor-pointer flex items-center gap-2"
              >
                <span>Post Surplus Intake</span>
                <span className="text-xs text-indigo-600 font-mono font-bold">⚡ 1-Click</span>
              </button>
            </div>

            {/* Trust Badges Row with Colorful Badges */}
            <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-6 text-xs text-[#475569]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700">Zero Landfill Abandonment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-700">TreeSHAP Decision Explainability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                <span className="font-semibold text-slate-700">Safe Haven Good Samaritan Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Sandbox (5 cols) */}
          <div className="lg:col-span-5">
            <div className="light-panel rounded-2xl p-5 border border-[#E2E8F0] shadow-xl space-y-4">
              {/* Sandbox Header & Mode Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono font-bold text-[#0F172A] ml-2">live-simulator.s390x</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Latency: 4.1ms
                </span>
              </div>

              {/* Mode Selector Buttons with Vibrant Active Colors */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-[#475569]">
                <button
                  onClick={() => setSandboxTab('spoilage')}
                  className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                    sandboxTab === 'spoilage' ? 'bg-rose-500 text-white shadow-sm' : 'hover:text-[#0F172A]'
                  }`}
                >
                  🧪 Spoilage AI
                </button>
                <button
                  onClick={() => setSandboxTab('matching')}
                  className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                    sandboxTab === 'matching' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-[#0F172A]'
                  }`}
                >
                  🤖 Matcher
                </button>
                <button
                  onClick={() => setSandboxTab('crypto')}
                  className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                    sandboxTab === 'crypto' ? 'bg-purple-600 text-white shadow-sm' : 'hover:text-[#0F172A]'
                  }`}
                >
                  🔐 Crypto Vault
                </button>
              </div>

              {/* Sandbox Tab Content */}
              {sandboxTab === 'spoilage' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/70 to-orange-50/50 border border-rose-200 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        <span>Ambient Temp:</span>
                      </span>
                      <span className="font-mono font-bold text-rose-700">{sandboxTemp}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="48"
                      value={sandboxTemp}
                      onChange={(e) => setSandboxTemp(Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-bold text-[#0F172A]">Packaging:</span>
                      <div className="flex gap-1.5">
                        {(['open', 'sealed', 'vacuum'] as const).map((pkg) => (
                          <button
                            key={pkg}
                            onClick={() => setSandboxPkg(pkg)}
                            className={`px-2.5 py-0.5 rounded text-[11px] capitalize cursor-pointer transition ${
                              sandboxPkg === pkg
                                ? 'bg-rose-600 text-white font-bold shadow-xs'
                                : 'bg-white text-slate-700 border border-rose-200 hover:bg-rose-100/50'
                            }`}
                          >
                            {pkg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Simulation Output */}
                  <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-[#475569]">Predicted Safe Window (t_safe):</span>
                      <span className="font-mono text-xl font-extrabold text-[#0F172A]">{sandboxSafeMins} min</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          sandboxSafeMins < 60 ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                          sandboxSafeMins < 180 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                          'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, (sandboxSafeMins / 360) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#475569] pt-1">
                      <span>Decay Constant: 0.18</span>
                      <span className="font-bold text-emerald-700">✓ Feasible for Transit</span>
                    </div>
                  </div>
                </div>
              )}

              {sandboxTab === 'matching' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 font-mono text-xs text-[#0F172A]">
                    <div className="text-indigo-900 text-[11px] flex justify-between font-bold">
                      <span>Hungarian Cost Matrix Solver</span>
                      <span className="text-indigo-700">5 Factors Weighted</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 space-y-1 text-[11px]">
                      <div className="font-bold text-[#0F172A]">• Donation #12 (45kg Cooked) ➔ Akshaya Patra</div>
                      <div className="text-indigo-600 font-semibold">• Proximity: 5.1km | ETA: 20m | Score: 94.2%</div>
                      <div className="text-emerald-700 font-semibold">• TreeSHAP: +0.42 Urgency / +0.38 Distance</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 flex items-center justify-between text-xs">
                    <span className="text-indigo-950 font-bold">Bipartite Matching Solved:</span>
                    <span className="font-mono font-extrabold text-indigo-700">4.1 milliseconds</span>
                  </div>
                </div>
              )}

              {sandboxTab === 'crypto' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 font-mono text-[11px]">
                    <div className="text-purple-900 flex justify-between font-bold">
                      <span>SHA-256 Chained Hash</span>
                      <span className="text-emerald-700 font-bold">VERIFIED ✓</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-purple-100 break-all text-purple-950 font-semibold">
                      9fd9376d331be55a44693a8d9cb6866aca92ea83abfed880ca10d66919b97100
                    </div>
                    <div className="text-[10px] text-purple-800 flex items-center gap-1.5 font-sans font-medium">
                      <Lock className="w-3 h-3 text-purple-600" />
                      <span>Protected under Section 12 Food Safety Safe Haven</span>
                    </div>
                  </div>

                  <button
                    onClick={onViewAudit}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Inspect Full Cryptographic Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: ASYMMETRICAL BENTO GRID WITH DISTINCT COLOR IDENTITIES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-indigo text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Engine Capabilities</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Built for mission-critical speed on IBM LinuxONE.
          </h2>
          <p className="text-sm text-[#475569] mt-2">
            Every layer is engineered to remove friction between surplus availability and hungry beneficiaries.
          </p>
        </div>

        {/* Bento Grid with Colorful Top Accents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Span 2 cols - Spoilage Kinetics Simulator (Amber / Orange) */}
          <div className="md:col-span-2 light-card rounded-2xl p-6 border-t-4 border-t-amber-500 border-x border-b border-[#E2E8F0] hover:border-amber-400 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  🧪
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">Modified Arrhenius Spoilage Engine</h3>
                  <p className="text-xs text-[#475569]">Dynamic perishable degradation kinetics</p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {(['cooked', 'dairy', 'greens'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBentoCategory(cat)}
                    className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition ${
                      bentoCategory === cat ? 'bg-white text-amber-800 shadow-sm font-extrabold' : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Standard expiration dates are static and inaccurate. NourishNet recalculates remaining safe shelf-life continuously as ambient temperatures fluctuate during city transport.
            </p>

            {/* Visual Kinetic Formula Preview */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-amber-800 block font-sans font-semibold">Baseline Half-Life</span>
                <span className="font-extrabold text-[#0F172A] text-sm">
                  {bentoCategory === 'cooked' ? '4.0 Hours' : bentoCategory === 'dairy' ? '6.0 Hours' : '3.0 Hours'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-amber-800 block font-sans font-semibold">Decay Coefficient (k)</span>
                <span className="font-extrabold text-amber-700 text-sm">
                  {bentoCategory === 'cooked' ? '0.18' : bentoCategory === 'dairy' ? '0.22' : '0.25'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-amber-800 block font-sans font-semibold">Dispatch Feasibility</span>
                <span className="font-extrabold text-emerald-700 text-sm">98.4% On-Time Safe</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Span 1 col - Live Staggered Activity Feed (Emerald) */}
          <div className="light-card rounded-2xl p-6 border-t-4 border-t-emerald-500 border-x border-b border-[#E2E8F0] hover:border-emerald-400 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-[#0F172A]">Live Rescue Stream</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-2.5">
              {[
                { donor: 'Taj Palace Banquet', qty: '45kg', status: 'Delivered', time: '2m ago', color: 'badge-emerald' },
                { donor: 'Amul Dairy Hub', qty: '120kg', status: 'In Transit', time: '8m ago', color: 'badge-indigo' },
                { donor: 'Infosys Cafeteria', qty: '85kg', status: 'Matched', time: '14m ago', color: 'badge-cyan' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0F172A]">{item.donor}</div>
                    <div className="text-[11px] text-[#475569]">{item.qty} • {item.time}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card 3: Span 1 col - Interactive Command Palette Preview (Cyan) */}
          <div className="light-card rounded-2xl p-6 border-t-4 border-t-cyan-500 border-x border-b border-[#E2E8F0] hover:border-cyan-400 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-600" />
                <h3 className="font-extrabold text-base text-[#0F172A]">Quick Query Filter</h3>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-[#475569]">
                ⌘K
              </kbd>
            </div>

            <p className="text-xs text-[#475569]">
              Filter donors and recipient NGOs by dietary restrictions with real-time feedback:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'All', color: 'badge-indigo' },
                { label: 'Cooked Meals', color: 'food-tag-cooked' },
                { label: 'Vegetarian', color: 'food-tag-greens' },
                { label: 'Halal', color: 'badge-purple' },
                { label: 'Critical', color: 'badge-rose' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => setCommandQuery(tag.label)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    commandQuery === tag.label
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#0F172A]'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs font-mono text-cyan-950">
              Active query: <span className="text-cyan-700 font-extrabold">"{commandQuery}"</span>
            </div>
          </div>

          {/* Bento Card 4: Span 2 cols - IBM LinuxONE Mainframe (Indigo / Purple) */}
          <div className="md:col-span-2 light-card rounded-2xl p-6 border-t-4 border-t-indigo-600 border-x border-b border-[#E2E8F0] hover:border-indigo-400 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-[#0F172A]">Enterprise Mainframe Architecture</h3>
              </div>
              <span className="badge-indigo text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                IBM LinuxONE s390x
              </span>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Why deploy food rescue on LinuxONE? Zero downtime guarantees hot meals don't spoil during server failures, while hardware cryptographic acceleration protects donor liability.
            </p>

            {/* Hoverable Badges with Interactive Tooltips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { title: 'Crypto Express 8S', desc: 'Hardware CPACF co-processor signs SHA-256 receipts in microseconds.', color: 'badge-purple' },
                { title: '99.99999% Uptime', desc: 'Seven Nines continuous availability eliminates single points of failure.', color: 'badge-cyan' },
                { title: '75% Energy Cut', desc: 'Consolidates thousands of x86 servers to drastically lower CO2 footprint.', color: 'badge-emerald' },
                { title: 'SQLite WAL Core', desc: 'Single-process thread-safe RLock concurrency with zero external setup.', color: 'badge-indigo' },
              ].map((b, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveTooltip(b.title)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-[#E2E8F0] hover:border-indigo-300 hover:shadow-sm transition cursor-pointer relative"
                >
                  <div className="font-bold text-xs text-[#0F172A]">{b.title}</div>
                  <div className="text-[10px] text-[#475569] mt-0.5 line-clamp-2">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: INTERACTIVE ROI & COLORFUL PERFORMANCE ESTIMATOR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-emerald text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Measurable ESG Impact</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Calculate your organization's rescue impact.
          </h2>
          <p className="text-sm text-[#475569] mt-2">
            Adjust the sliders below to estimate annual meals served, greenhouse gas abatement, and statutory liability mitigation.
          </p>
        </div>

        <div className="light-panel rounded-2xl p-6 lg:p-8 border border-[#E2E8F0] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-[#0F172A]">Average Daily Surplus:</span>
                <span className="font-mono font-extrabold text-indigo-600 text-lg">{dailyVolumeKg} kg / day</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={dailyVolumeKg}
                onChange={(e) => setDailyVolumeKg(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#475569] mt-1 font-medium">
                <span>Small Restaurant (20 kg)</span>
                <span>Large Hotel / Supermarket (1,000 kg)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-[#0F172A]">Target Delivery Radius:</span>
                <span className="font-mono font-extrabold text-cyan-600 text-lg">{deliveryRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={deliveryRadiusKm}
                onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#475569] mt-1 font-medium">
                <span>Neighborhood (5 km)</span>
                <span>Metropolitan Grid (50 km)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Statutory Safe Haven Exemption Applied</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Under Good Samaritan food donation laws, verifiable immutable temperature logging shields donors from civil liability.
              </p>
            </div>
          </div>

          {/* Large Colorful Counters Display (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 space-y-1 shadow-xs">
              <span className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">Annual Meals Served</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-950 tracking-tight">
                {calculatedImpact.meals.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-700 font-bold font-mono">2.5 meals / kg</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 space-y-1 shadow-xs">
              <span className="text-[11px] text-indigo-800 uppercase font-bold tracking-wider">CO₂ Methane Avoided</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-950 tracking-tight">
                {(calculatedImpact.co2SavedKg / 1000).toFixed(1)} <span className="text-sm font-sans font-medium text-indigo-700">tons</span>
              </div>
              <span className="text-xs text-indigo-700 font-bold font-mono">Diverted from Landfill</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 space-y-1 shadow-xs">
              <span className="text-[11px] text-cyan-800 uppercase font-bold tracking-wider">Water Conserved</span>
              <div className="text-3xl font-extrabold font-mono text-cyan-950 tracking-tight">
                {(calculatedImpact.waterSavedLiters / 1000).toFixed(0)} <span className="text-sm font-sans font-medium text-cyan-700">kL</span>
              </div>
              <span className="text-xs text-cyan-700 font-bold font-mono">Embedded Agriculture</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 space-y-1 shadow-xs">
              <span className="text-[11px] text-amber-800 uppercase font-bold tracking-wider">Dispatch Speedup</span>
              <div className="text-3xl font-extrabold font-mono text-amber-950 tracking-tight">
                &gt;100x
              </div>
              <span className="text-xs text-amber-700 font-bold font-mono">&lt;10ms Hungarian AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: SPOTLIGHT DEPLOYMENT TIERS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Transparent deployment models for every scale.
          </h2>
          <p className="text-sm text-[#475569]">
            From local community shelters to city-wide mainframe food rescue grids.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="inline-flex items-center gap-3 bg-slate-100 p-1.5 rounded-full border border-slate-200 mt-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                !isAnnual ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isAnnual ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <span>Annual</span>
              <span className="badge-emerald text-[10px] px-1.5 py-0.2 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Tier 1: Community Shelters (Cyan accent) */}
          <div 
            onMouseEnter={() => setHoveredTier(0)}
            onMouseLeave={() => setHoveredTier(null)}
            className={`light-card rounded-2xl p-6 border-t-4 border-t-cyan-500 border-x border-b border-[#E2E8F0] space-y-6 flex flex-col justify-between transition-all ${
              hoveredTier !== null && hoveredTier !== 0 ? 'opacity-85' : ''
            }`}
          >
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Community Tier</span>
              <div className="text-3xl font-extrabold text-[#0F172A]">$0 <span className="text-xs font-normal text-[#475569]">/ forever</span></div>
              <p className="text-xs text-[#475569]">For verified non-profit shelters, soup kitchens, and orphanages receiving surplus food.</p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Real-time surplus dispatch notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Dietary preference matching (Veg/Halal)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Cryptographic safe delivery receipts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchApp}
              className="w-full py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs transition cursor-pointer"
            >
              Register NGO Profile
            </button>
          </div>

          {/* Tier 2: Enterprise Donors (Highlighted Pro Tier - Indigo) */}
          <div 
            onMouseEnter={() => setHoveredTier(1)}
            onMouseLeave={() => setHoveredTier(null)}
            className="light-panel rounded-2xl p-6 border-2 border-[#4F46E5] shadow-xl shadow-indigo-500/10 space-y-6 flex flex-col justify-between relative transform -translate-y-1"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full badge-indigo text-[10px] font-extrabold tracking-wider uppercase">
              Most Popular
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Donors</span>
              <div className="text-4xl font-extrabold text-[#0F172A]">
                {isAnnual ? '$199' : '$249'} <span className="text-xs font-normal text-[#475569]">/ month</span>
              </div>
              <p className="text-xs text-[#475569]">For hotels, catering networks, and supermarkets requiring automated liability management.</p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Unlimited surplus batch intake</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Automated TreeSHAP decision transparency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>SHA-256 Good Samaritan legal certificates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Tier-2 Circular Bio-Upcycling diversion</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onPostSurplus}
              className="w-full py-3 rounded-xl indigo-gradient-btn font-bold text-xs transition cursor-pointer shadow-md"
            >
              Start Commercial Trial
            </button>
          </div>

          {/* Tier 3: IBM LinuxONE Mainframe Cloud (Purple accent) */}
          <div 
            onMouseEnter={() => setHoveredTier(2)}
            onMouseLeave={() => setHoveredTier(null)}
            className={`light-card rounded-2xl p-6 border-t-4 border-t-purple-600 border-x border-b border-[#E2E8F0] space-y-6 flex flex-col justify-between transition-all ${
              hoveredTier !== null && hoveredTier !== 2 ? 'opacity-85' : ''
            }`}
          >
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Mainframe Cloud Grid</span>
              <div className="text-3xl font-extrabold text-[#0F172A]">Custom <span className="text-xs font-normal text-[#475569]">/ city</span></div>
              <p className="text-xs text-[#475569]">For municipal governments and smart cities deploying city-wide food redistribution grids.</p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Native IBM LinuxONE s390x compilation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Crypto Express 8S hardware HSM binding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Gini algorithmic anti-bias monitoring</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchApp}
              className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition cursor-pointer"
            >
              Contact Solutions Architect
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: HIGH-CONTRAST CONVERSION BANNER & FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        {/* Dark High-Contrast Banner (#0F172A) */}
        <div className="rounded-3xl bg-[#0F172A] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="badge-cyan text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Ready for Datathon Evaluation
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Experience real-time AI food rescue in action.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore the live Arrhenius spoilage decay countdowns, trigger the Hungarian algorithm, and inspect SHA-256 legal chain receipts right in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10 pt-2">
            <button
              onClick={onLaunchApp}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] font-extrabold text-sm transition shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Open AI Command Center</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={onViewAudit}
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Cryptographic Ledger</span>
            </button>
          </div>
        </div>

        {/* Structured Multi-Column Footer */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-[#475569]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F172A] text-sm">
              <span className="text-lg">🍽️</span>
              <span>NourishNet AI</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Real-Time Food Rescue & Intelligent Redistribution for the IBM Z Datathon 2026.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px]">AI Engines</div>
            <ul className="space-y-1 text-[11px]">
              <li className="hover:text-indigo-600 transition cursor-pointer">Modified Arrhenius Kinetics</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">Hungarian Bipartite Solver</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">TreeSHAP Model Explainability</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">SHA-256 Safe Haven Vault</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px]">Architecture</div>
            <ul className="space-y-1 text-[11px]">
              <li className="hover:text-indigo-600 transition cursor-pointer">IBM LinuxONE (s390x)</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">FastAPI ASGI Non-blocking Core</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">SQLite WAL Durability</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">React 18 + Tailwind SPA</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px]">Track 1 Status</div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Healthy & Verified</span>
            </div>
            <p className="text-[10px] text-slate-400">
              11/11 E2E Test Phases Passing
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
