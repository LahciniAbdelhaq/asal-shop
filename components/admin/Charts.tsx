'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { day: string; label: string; revenue: number; orders: number };

const AMBER = '#C8861A';
const INK = '#4B4239';
const GRID = '#EEE8DF';

function Tip({ active, payload, unit, currency }: { active?: boolean; payload?: { payload: Point }[]; unit: 'revenue' | 'orders'; currency: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #E7E0D5', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 20px rgba(0,0,0,.08)', fontSize: 12.5 }}>
      <div style={{ color: '#8C8174', marginBottom: 2 }}>{p.label}</div>
      <strong style={{ color: '#1F1A15' }}>
        {unit === 'revenue' ? `${Math.round(p.revenue).toLocaleString('fr-FR')} ${currency}` : `${p.orders} commande${p.orders > 1 ? 's' : ''}`}
      </strong>
    </div>
  );
}

const axis = { tick: { fill: INK, fontSize: 11.5 }, axisLine: false, tickLine: false } as const;

export function RevenueChart({ data, currency }: { data: Point[]; currency: string }) {
  return (
    <div className="chart-box" role="img" aria-label="Chiffre d’affaires par jour">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AMBER} stopOpacity={0.28} />
              <stop offset="100%" stopColor={AMBER} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="day" {...axis} minTickGap={24} />
          <YAxis {...axis} width={56} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR')} k` : String(v))} />
          <Tooltip content={<Tip unit="revenue" currency={currency} />} cursor={{ stroke: '#B9AE9F', strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="revenue" stroke={AMBER} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data }: { data: Point[] }) {
  return (
    <div className="chart-box" style={{ height: 200 }} role="img" aria-label="Nombre de commandes par jour">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="day" {...axis} minTickGap={24} />
          <YAxis {...axis} width={56} allowDecimals={false} />
          <Tooltip content={<Tip unit="orders" currency="" />} cursor={{ fill: 'rgba(200,134,26,.08)' }} />
          <Bar dataKey="orders" fill="#2B2118" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
