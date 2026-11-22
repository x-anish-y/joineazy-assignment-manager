import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CompletionDonut({ percentage = 0, total = 0, completed = 0 }) {
  const data = [
    { name: 'Completed', value: completed, color: '#4f46e5' }, // Indigo-600
    { name: 'Remaining', value: Math.max(0, total - completed), color: '#e2e8f0' }, // Slate-200
  ];

  // If both are 0, show neutral placeholder
  const displayData = total === 0 ? [{ name: 'No data', value: 1, color: '#f1f5f9' }] : data;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={total > 0 && completed > 0 && completed < total ? 4 : 0}
              dataKey="value"
              strokeWidth={0}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip
                formatter={(val, name) => [`${val} submissions`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{percentage}%</span>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Completion</span>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span>Submitted ({completed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span>Pending ({Math.max(0, total - completed)})</span>
        </div>
      </div>
    </div>
  );
}
