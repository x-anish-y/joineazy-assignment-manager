import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function CompletionDonut({ percentage = 0, total = 0, completed = 0 }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const pending = Math.max(0, total - completed);
  const data = [
    { name: 'Submitted', value: completed, color: '#4f46e5', secondary: '#818cf8' },
    { name: 'Pending', value: pending, color: '#e2e8f0', secondary: '#f1f5f9' },
  ];

  const displayData = total === 0 ? [{ name: 'No data', value: 1, color: '#f1f5f9', secondary: '#f8fafc' }] : data;

  const getStatusBadge = (pct) => {
    if (pct >= 80) return { label: 'High Completion', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (pct >= 40) return { label: 'Steady Progress', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    return { label: 'Action Needed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  };

  const status = getStatusBadge(percentage);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const isCompleted = item.name === 'Submitted';
      return (
        <div className="bg-slate-900/95 text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/60 text-xs backdrop-blur-md flex items-center gap-2 pointer-events-none select-none">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: isCompleted ? '#6366f1' : '#94a3b8' }}
          />
          <span className="font-semibold text-slate-200">{item.name}:</span>
          <span className="font-extrabold text-white text-sm">{item.value}</span>
          <span className="text-[11px] text-slate-400 font-medium">
            ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-between h-full"
    >
      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="donutPrimaryGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="donutSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <filter id="donutShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" floodColor="#4f46e5" />
              </filter>
            </defs>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={86}
              cornerRadius={8}
              paddingAngle={total > 0 && completed > 0 && completed < total ? 5 : 0}
              dataKey="value"
              stroke="transparent"
              animationBegin={100}
              animationDuration={900}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {displayData.map((entry, index) => {
                const isCompleted = entry.name === 'Submitted';
                const fillUrl = isCompleted ? 'url(#donutPrimaryGrad)' : 'url(#donutSecondaryGrad)';
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillUrl}
                    style={{
                      filter: isCompleted ? 'url(#donutShadow)' : 'none',
                      transition: 'all 0.3s ease',
                      transform: activeIndex === index ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              position={{ y: 4 }}
              wrapperStyle={{ zIndex: 50, pointerEvents: 'none', outline: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label Metric: Always 100% visible, never faded out, so both center metric & shifted hover tooltip are simultaneously visible */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            {percentage}%
          </motion.span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Turn-in Rate
          </span>
          <span
            className={`mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.bg} ${status.text} ${status.border}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* KPI Details Row with interactive hover highlight */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 text-xs">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
            activeIndex === 0
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/30 shadow-sm'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Submitted</p>
            <p className="font-extrabold text-slate-800 text-sm">
              {completed} <span className="text-[10px] text-slate-400 font-normal">/ {total}</span>
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
            activeIndex === 1
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30 shadow-sm'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
            <p className="font-extrabold text-slate-800 text-sm">
              {pending} <span className="text-[10px] text-slate-400 font-normal">/ {total}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
