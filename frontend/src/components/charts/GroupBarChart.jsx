import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, AlignLeft, CheckCircle2 } from 'lucide-react';

export default function GroupBarChart({
  data = [],
  xKey = 'name',
  yKey = 'completion_percentage',
  barName = 'Completion Rate',
  defaultHorizontal = false,
  allowToggle = true,
}) {
  const [isHorizontal, setIsHorizontal] = useState(defaultHorizontal);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <BarChart3 className="h-4 w-4" />
        </div>
        <span>No performance metrics recorded yet</span>
      </div>
    );
  }

  // Format labels nicely without ugly mid-word truncation
  const formattedData = data.map((d) => {
    const rawName = d[xKey] || '';
    return {
      ...d,
      fullName: rawName,
      displayName: rawName.length > 18 ? `${rawName.substring(0, 16)}…` : rawName,
      completionRate: Math.min(100, Math.max(0, Math.round(d[yKey] || 0))),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isComplete = item.completionRate === 100;

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/60 text-xs backdrop-blur-md max-w-xs space-y-2">
          <div className="flex items-start justify-between gap-2 border-b border-slate-700/50 pb-2">
            <span className="font-bold text-slate-100 text-sm leading-snug">{item.fullName}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                isComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
              }`}
            >
              {item.completionRate}%
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300 text-[11px]">
            {item.submitted_count !== undefined && item.target_count !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Teams Submitted:</span>
                <span className="font-semibold text-white">
                  {item.submitted_count} / {item.target_count}
                </span>
              </div>
            )}

            {item.submitted_count !== undefined && item.total_assignments !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Assignments Completed:</span>
                <span className="font-semibold text-white">
                  {item.submitted_count} / {item.total_assignments}
                </span>
              </div>
            )}

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${item.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-3"
    >
      {/* Chart View Toggle Controls */}
      {allowToggle && (
        <div className="flex justify-end items-center gap-1">
          <button
            type="button"
            onClick={() => setIsHorizontal(false)}
            title="Vertical column chart"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              !isHorizontal
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Columns</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHorizontal(true)}
            title="Horizontal bar chart (recommended for long names)"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isHorizontal
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Horizontal</span>
          </button>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {!isHorizontal ? (
            /* Vertical Column Layout */
            <BarChart
              data={formattedData}
              margin={{ top: 20, right: 15, left: -20, bottom: 40 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="barPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <linearGradient id="barSuccessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="displayName"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                dy={8}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)', radius: 8 }} />

              <Bar
                dataKey="completionRate"
                maxBarSize={46}
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                background={{ fill: '#f8fafc', radius: [8, 8, 0, 0] }}
              >
                <LabelList
                  dataKey="completionRate"
                  position="top"
                  formatter={(val) => (val > 0 ? `${val}%` : '')}
                  style={{ fill: '#475569', fontSize: '11px', fontWeight: 600 }}
                />
                {formattedData.map((entry, index) => {
                  const fill = entry.completionRate === 100 ? 'url(#barSuccessGrad)' : 'url(#barPrimaryGrad)';
                  return <Cell key={`bar-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          ) : (
            /* Horizontal Bar Layout (Best for Long Assignment / Group Titles) */
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 10, right: 35, left: 10, bottom: 10 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient id="barHorizGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <linearGradient id="barHorizSuccess" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />

              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />

              <YAxis
                dataKey="displayName"
                type="category"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                width={120}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)', radius: 8 }} />

              <Bar
                dataKey="completionRate"
                maxBarSize={28}
                radius={[0, 8, 8, 0]}
                animationDuration={800}
                background={{ fill: '#f8fafc', radius: [0, 8, 8, 0] }}
              >
                <LabelList
                  dataKey="completionRate"
                  position="right"
                  formatter={(val) => `${val}%`}
                  style={{ fill: '#334155', fontSize: '11px', fontWeight: 700 }}
                />
                {formattedData.map((entry, index) => {
                  const fill = entry.completionRate === 100 ? 'url(#barHorizSuccess)' : 'url(#barHorizGrad)';
                  return <Cell key={`bar-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
