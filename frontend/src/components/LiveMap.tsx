import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Donation, NGO, MatchResult } from '../types';

interface LiveMapProps {
  donations: Donation[];
  ngos: NGO[];
  matches: MatchResult[];
}

// Custom Leaflet DivIcons with clean vibrant contrast styling
const createDonorIcon = (urgency: string) => {
  const isCrit = urgency === 'CRITICAL';
  const isUrg = urgency === 'URGENT';
  const color = isCrit ? '#E11D48' : isUrg ? '#D97706' : '#059669';
  const bgBadge = isCrit ? '#FFF1F2' : isUrg ? '#FFFBEB' : '#ECFDF5';

  return L.divIcon({
    className: 'custom-donor-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: ${bgBadge}; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.12);">
          🍲
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createNgoIcon = () => {
  return L.divIcon({
    className: 'custom-ngo-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="width: 28px; height: 28px; border-radius: 9px; background-color: #4F46E5; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
          🏥
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const LiveMap: React.FC<LiveMapProps> = ({ donations, ngos, matches }) => {
  // Center of India
  const center: [number, number] = [21.5, 78.5];

  // Match polyline coordinate pairs
  const matchRoutes = matches
    .map((match) => {
      const don = donations.find((d) => d.id === match.donation_id);
      const ngo = ngos.find((n) => n.id === match.ngo_id);
      if (don && ngo && don.latitude && don.longitude && ngo.latitude && ngo.longitude) {
        // If real street geometry is returned by OpenRouteService, render actual road curves!
        const isRoadRoute = Boolean(match.route_geometry && match.route_geometry.length > 2);
        const coords: [number, number][] = isRoadRoute
          ? (match.route_geometry as [number, number][])
          : [
              [don.latitude, don.longitude],
              [ngo.latitude, ngo.longitude],
            ];

        return {
          coords,
          label: `${don.donor_name} → ${ngo.name}`,
          tier: match.tier || 1,
          isRoadRoute,
          mode: match.routing_mode || 'Haversine Heuristic',
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="w-full h-full map-isolate-container rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Polylines for Matches */}
        {matchRoutes.map((route, i) => (
          <Polyline
            key={`route-${i}`}
            positions={route!.coords}
            pathOptions={{
              color: route!.tier === 1 ? '#4F46E5' : '#D97706',
              weight: route!.isRoadRoute ? 5 : 4,
              dashArray: route!.isRoadRoute ? undefined : '8, 8',
              opacity: 0.95,
            }}
          />
        ))}

        {/* Donors */}
        {donations.map((d) => (
          <Marker
            key={`donor-${d.id}`}
            position={[d.latitude, d.longitude]}
            icon={createDonorIcon(d.urgency_level)}
          >
            <Popup>
              <div className="text-xs space-y-2 p-1 min-w-[180px]">
                <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1.5">
                  <span className="text-base">🍲</span>
                  <span>{d.donor_name}</span>
                </div>
                <div className="text-[#475569] capitalize">
                  {d.food_category.replace('_', ' ')} • <span className="font-bold text-[#0F172A] font-mono">{d.quantity_kg} kg</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.urgency_level === 'CRITICAL'
                        ? 'badge-rose'
                        : d.urgency_level === 'URGENT'
                        ? 'badge-amber'
                        : 'badge-emerald'
                    }`}
                  >
                    {d.urgency_level}
                  </span>
                  <span className="text-[#0F172A] font-mono text-[11px] font-bold">{Math.max(0, d.remaining_minutes).toFixed(0)}m left</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* NGOs */}
        {ngos.map((n) => (
          <Marker key={`ngo-${n.id}`} position={[n.latitude, n.longitude]} icon={createNgoIcon()}>
            <Popup>
              <div className="text-xs space-y-2 p-1 min-w-[180px]">
                <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1.5">
                  <span className="text-base">🏥</span>
                  <span className="text-indigo-700">{n.name}</span>
                </div>
                <div className="text-[#475569] capitalize">Type: {n.org_type.replace('_', ' ')}</div>
                <div className="text-[#475569]">
                  Capacity: <span className="font-bold font-mono text-indigo-600">{n.available_capacity_kg} kg</span> available
                </div>
                <div className="text-[#475569] text-[10px]">Beneficiaries: {n.beneficiary_count} people</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Tactical HUD Legend with lower z-index so it NEVER breaches navbar */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl text-xs space-y-2 border border-[#E2E8F0] shadow-md text-[#475569]">
        <div className="font-bold text-[#0F172A] text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>Tactical Map Telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
          <span className="text-[11px] font-medium">Critical Surplus (&lt;60m)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
          <span className="text-[11px] font-medium">Urgent Surplus (&lt;180m)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-md bg-indigo-600 shadow-sm"></span>
          <span className="text-[11px] font-medium text-indigo-700">Recipient NGO / Shelter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-indigo-600 rounded"></span>
          <span className="text-[11px] font-medium text-indigo-700">Live Street Route (OpenRouteService)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 border-t-2 border-dashed border-amber-600"></span>
          <span className="text-[11px] font-medium text-amber-700">Tier 2 Upcycling Flow</span>
        </div>
      </div>
    </div>
  );
};
