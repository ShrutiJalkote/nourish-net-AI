import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  BarChart3, 
  MapPin, 
  PlusCircle, 
  Globe, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import type { SystemHealth } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReseed: () => void;
  isReseeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onReseed, isReseeding }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    const interval = setInterval(() => {
      api.getHealth().then(setHealth).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Globe, color: 'text-indigo-600' },
    { id: 'dispatch', label: 'AI Command Center', icon: MapPin, color: 'text-cyan-600' },
    { id: 'donor', label: 'Post Surplus', icon: PlusCircle, color: 'text-amber-600' },
    { id: 'audit', label: 'Audit Vault', icon: ShieldCheck, color: 'text-purple-600' },
    { id: 'impact', label: 'ESG Impact', icon: BarChart3, color: 'text-emerald-600' },
    { id: 'about', label: 'IBM Z Tech', icon: Cpu, color: 'text-sky-600' },
  ];

  return (
    <header className="sticky top-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Pill */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25 text-white font-bold text-xl group-hover:scale-105 transition-transform">
            🍽️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#0F172A] tracking-tight group-hover:text-indigo-600 transition-colors">
                NourishNet
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full badge-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>IBM LinuxONE s390x</span>
              </span>
            </div>
            <p className="text-[11px] text-[#475569] hidden sm:block">
              Real-Time Food Rescue & Intelligent Redistribution
            </p>
          </div>
        </div>

        {/* Clean Segmented Navigation Links */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-3">
          {/* Mainframe Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[11px] text-slate-500">Host:</span>
            <span className="font-mono text-indigo-600 font-bold text-[11px]">
              {health?.platform || 's390x'}
            </span>
          </div>

          {/* Quick Reseed */}
          <button
            onClick={onReseed}
            disabled={isReseeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Reset to fresh seed donations"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          {/* Action CTA Button */}
          {activeTab !== 'dispatch' && (
            <button
              onClick={() => setActiveTab('dispatch')}
              className="indigo-gradient-btn px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Open Console</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
