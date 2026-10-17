import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { DonorPortal } from './components/DonorPortal';
import { AuditVault } from './components/AuditVault';
import { ImpactDashboard } from './components/ImpactDashboard';
import { TechTab } from './components/TechTab';
import type { Donation, NGO, MatchResult } from './types';
import { api } from './services/api';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isReseeding, setIsReseeding] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load all telemetry & operational data
  const refreshData = useCallback(async () => {
    try {
      const [donRes, ngoRes, matchRes] = await Promise.all([
        api.getDonations(),
        api.getNGOs(),
        api.getMatches().catch(() => [])
      ]);
      setDonations(donRes || []);
      setNgos(ngoRes || []);
      setMatches(matchRes || []);
    } catch (e) {
      console.error('Failed to load application state:', e);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Initial load + live polling
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Demo Reseed handler
  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      await api.resetSeed();
      await refreshData();
    } catch (e) {
      console.error('Failed to reset seed data:', e);
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Sticky Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReseed={handleReseed}
        isReseeding={isReseeding}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {initialLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-500">Connecting to NourishNet AI Core...</p>
          </div>
        ) : (
          <>
            {activeTab === 'landing' && (
              <LandingPage
                onLaunchApp={() => setActiveTab('dispatch')}
                onPostSurplus={() => setActiveTab('donor')}
                onViewAudit={() => setActiveTab('audit')}
              />
            )}

            {activeTab === 'dispatch' && (
              <CommandCenter
                donations={donations}
                ngos={ngos}
                matches={matches}
                onRefresh={refreshData}
                onNavigateToAudit={() => setActiveTab('audit')}
              />
            )}

            {activeTab === 'donor' && (
              <DonorPortal
                onDonationCreated={() => {
                  refreshData();
                  setActiveTab('dispatch');
                }}
                recentDonations={donations}
              />
            )}

            {activeTab === 'audit' && <AuditVault />}

            {activeTab === 'impact' && <ImpactDashboard />}

            {activeTab === 'about' && <TechTab />}
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 px-4 text-center text-xs text-[#475569] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F172A]">NourishNet AI</span>
            <span className="text-slate-300">•</span>
            <span>IBM Z Datathon 2026</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">Track 1: Real-Time AI for Critical Decisions</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Deployed on IBM LinuxONE (s390x)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
