import { Donation, NGO, MatchResult, AuditRecord, ImpactMetrics, SystemHealth } from '../types';

const API_BASE = ''; // Uses Vite proxy in dev, relative path in production

export const api = {
  // Health
  getHealth: async (): Promise<SystemHealth> => {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  },

  // Donations
  getDonations: async (status?: string): Promise<Donation[]> => {
    const url = status ? `${API_BASE}/api/donations?status=${status}` : `${API_BASE}/api/donations`;
    const res = await fetch(url);
    return res.json();
  },

  createDonation: async (data: Partial<Donation>): Promise<Donation> => {
    const res = await fetch(`${API_BASE}/api/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // NGOs
  getNGOs: async (): Promise<NGO[]> => {
    const res = await fetch(`${API_BASE}/api/ngos`);
    return res.json();
  },

  // Matching
  executeMatch: async (donation_id?: number): Promise<{ matches: MatchResult[]; elapsed_ms: number; message: string }> => {
    const res = await fetch(`${API_BASE}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation_id ? { donation_id } : {}),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMatches: async (): Promise<MatchResult[]> => {
    const res = await fetch(`${API_BASE}/api/matches`);
    return res.json();
  },

  getMatchExplanation: async (matchId: number) => {
    const res = await fetch(`${API_BASE}/api/match/${matchId}/explain`);
    return res.json();
  },

  // Audit
  generateAudit: async (matchId: number, pickupTemp = 25.0, deliveryTemp = 23.0): Promise<AuditRecord> => {
    const res = await fetch(`${API_BASE}/api/audit/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        pickup_temp_celsius: pickupTemp,
        delivery_temp_celsius: deliveryTemp,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAuditChain: async (): Promise<{ valid: boolean; total_records: number; message: string; chain: AuditRecord[] }> => {
    const res = await fetch(`${API_BASE}/api/audit/chain`);
    return res.json();
  },

  getCertificateHtml: async (auditId: number): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/audit/${auditId}/certificate`);
    return res.text();
  },

  // Impact & Fairness
  getImpact: async (): Promise<ImpactMetrics> => {
    const res = await fetch(`${API_BASE}/api/impact`);
    return res.json();
  },

  getFairness: async () => {
    const res = await fetch(`${API_BASE}/api/fairness`);
    return res.json();
  },

  // Seed / Reset
  resetSeed: async () => {
    const res = await fetch(`${API_BASE}/api/seed`);
    return res.json();
  },
};
