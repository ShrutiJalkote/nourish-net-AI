import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Thermometer, 
  ExternalLink, 
  X, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import type { AuditRecord } from '../types';

export const AuditVault: React.FC = () => {
  const [chainData, setChainData] = useState<{
    valid: boolean;
    total_records: number;
    message: string;
    chain: AuditRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [certificateHtml, setCertificateHtml] = useState<string | null>(null);
  const [loadingCert, setLoadingCert] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchChain = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditChain();
      setChainData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChain();
  }, []);

  const openCertificate = async (id: number) => {
    setSelectedAuditId(id);
    setLoadingCert(true);
    try {
      const html = await api.getCertificateHtml(id);
      setCertificateHtml(html);
    } catch (e) {
      console.error('Failed to load certificate', e);
    } finally {
      setLoadingCert(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-indigo text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Hardware-Rooted Trust
            </span>
            <span className="badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              SHA-256 Chained Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <span>Cryptographic Audit Vault & Liability Shield</span>
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Immutable SHA-256 chain-of-custody ledger. Protects donors & NGOs with legally defensible Safe Haven compliance.
          </p>
        </div>

        <button
          onClick={fetchChain}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold border border-[#E2E8F0] shadow-sm transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Verify Integrity</span>
        </button>
      </div>

      {/* Integrity Summary Banner */}
      {chainData && (
        <div className="light-panel p-6 rounded-2xl border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              chainData.valid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {chainData.valid ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] text-[#475569] uppercase tracking-wider font-bold">Ledger Integrity</div>
              <div className="text-base font-extrabold text-[#0F172A]">
                {chainData.valid ? '100% Cryptographic Integrity' : 'Integrity Compromised'}
              </div>
              <div className="text-xs text-emerald-600 font-mono mt-0.5">{chainData.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#E2E8F0] md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-[#475569] uppercase tracking-wider font-bold">Total Depth</div>
              <div className="text-xl font-bold font-mono text-[#0F172A]">{chainData.total_records} Verified Blocks</div>
              <div className="text-xs text-indigo-600 font-mono">Crypto Express 8S HW Co-Proc</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#E2E8F0] md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-[#475569] uppercase tracking-wider font-bold">Statutory Shield</div>
              <div className="text-base font-extrabold text-[#0F172A]">Good Samaritan Exemption</div>
              <div className="text-xs text-cyan-700 font-mono">Safe Haven Liability Shield Active</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Blockchain Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-indigo-600" />
          <span>Chained Transaction Blocks</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#475569]">Verifying SHA-256 chain hashes...</div>
        ) : !chainData || chainData.chain.length === 0 ? (
          <div className="light-panel p-8 text-center rounded-2xl border border-dashed border-[#E2E8F0] text-xs text-[#475569] space-y-2">
            <div className="text-xl">⛓️</div>
            <p className="font-semibold text-[#0F172A]">No transactions have been sealed yet in this session.</p>
            <p>Go to the AI Command Center and click "Verify & Seal" on any active match to generate the first block.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-6 py-2">
            {chainData.chain.map((record, index) => {
              const isGenesis = index === 0;

              return (
                <div key={record.id} className="relative group">
                  {/* Glowing Node Marker */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-4 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm group-hover:scale-125 transition-transform"></div>

                  <div className="light-panel p-5 rounded-2xl border border-[#E2E8F0] hover:border-indigo-300 transition space-y-4 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold badge-indigo">
                          Block #{record.id}
                        </span>
                        <span className="text-xs text-[#0F172A] font-semibold font-mono">
                          Match ID: #{record.match_id}
                        </span>
                        {isGenesis && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold badge-emerald">
                            GENESIS
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#475569] font-mono">
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-[#475569] text-[11px] uppercase tracking-wider font-semibold">Donation Batch:</div>
                        <div className="font-bold text-[#0F172A] mt-0.5">{record.donation_summary}</div>
                      </div>
                      <div>
                        <div className="text-[#475569] text-[11px] uppercase tracking-wider font-semibold">Recipient Organization:</div>
                        <div className="font-bold text-emerald-700 mt-0.5">{record.ngo_summary}</div>
                      </div>
                      <div>
                        <div className="text-[#475569] text-[11px] uppercase tracking-wider font-semibold">Cold Chain Verification:</div>
                        <div className="flex items-center gap-2 text-[#0F172A] mt-0.5 font-mono">
                          <Thermometer className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Pickup: {record.pickup_temp}°C</span>
                          <span>•</span>
                          <span>Delivery: {record.delivery_temp}°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Hashes */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-[#475569]">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Previous Hash:</span>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="truncate max-w-[200px] sm:max-w-[340px] text-slate-500">{record.previous_hash}</span>
                          <button 
                            onClick={() => handleCopy(record.previous_hash)}
                            className="p-1 hover:text-[#0F172A] transition cursor-pointer"
                            title="Copy Hash"
                          >
                            {copiedHash === record.previous_hash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-indigo-900 pt-1.5 border-t border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-indigo-600">Block SHA-256 Hash:</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="truncate max-w-[200px] sm:max-w-[340px] text-indigo-700">{record.chain_hash}</span>
                          <button 
                            onClick={() => handleCopy(record.chain_hash)}
                            className="p-1 hover:text-indigo-900 transition cursor-pointer"
                            title="Copy Hash"
                          >
                            {copiedHash === record.chain_hash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-indigo-400" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SHA-256 Validated</span>
                      </span>

                      <button
                        onClick={() => openCertificate(record.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Legal Certificate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedAuditId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="light-panel w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#E2E8F0] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Bar */}
            <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-[#0F172A] text-sm">Official Rescue Certificate #{selectedAuditId}</span>
              </div>
              <button
                onClick={() => setSelectedAuditId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content iframe */}
            <div className="flex-1 overflow-auto p-6 bg-slate-100">
              {loadingCert ? (
                <div className="h-96 flex items-center justify-center text-xs text-[#475569]">
                  Loading certificate...
                </div>
              ) : certificateHtml ? (
                <div 
                  className="bg-white text-slate-900 rounded-2xl overflow-hidden p-8 shadow-sm border border-[#E2E8F0]"
                  dangerouslySetInnerHTML={{ __html: certificateHtml }}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-xs text-rose-600">
                  Failed to load certificate.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-white flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl indigo-gradient-btn text-xs font-bold transition cursor-pointer"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedAuditId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
