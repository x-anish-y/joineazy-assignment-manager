import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function GroupBarChart({
  data = [],
  xKey = 'name',
  yKey = 'completion_percentage',
  barName = 'Completion %',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No chart data available
      </div>
    );
  }

  // Truncate long labels for the X-axis
  const formattedData = data.map((d) => ({
    ...d,
    displayName:
      d[xKey]?.length > 14 ? `${d[xKey].substring(0, 12)}…` : d[xKey],
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="displayName"
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-20}
            textAnchor="end"
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(val) => `${val}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, barName]}
            labelFormatter={(_, arr) => arr[0]?.payload[xKey]}
            contentStyle={{
              backgroundColor: '#0f172a',
              color: '#fff',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.75rem',
            }}
          />
          <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
            {formattedData.map((entry, index) => {
              const val = entry[yKey];
              const color = val === 100 ? '#10b981' : val > 0 ? '#4f46e5' : '#cbd5e1';
              return <Cell key={`bar-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
