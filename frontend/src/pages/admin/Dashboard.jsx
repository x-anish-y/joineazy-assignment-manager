import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FileText,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  getSummary,
  getPerAssignmentCompletion,
  getPerGroupCompletion,
} from '../../api/analytics.js';
import { getAssignments } from '../../api/assignments.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import CompletionDonut from '../../components/charts/CompletionDonut.jsx';
import GroupBarChart from '../../components/charts/GroupBarChart.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState([]);
  const [groupStats, setGroupStats] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sumRes, asgnStatsRes, grpStatsRes, asgnListRes] =
          await Promise.allSettled([
            getSummary(),
            getPerAssignmentCompletion(),
            getPerGroupCompletion(),
            getAssignments(),
          ]);

        if (sumRes.status === 'fulfilled' && sumRes.value.success) {
          setSummary(sumRes.value.data.summary);
        }
        if (asgnStatsRes.status === 'fulfilled' && asgnStatsRes.value.success) {
          setAssignmentStats(asgnStatsRes.value.data.assignments || []);
        }
        if (grpStatsRes.status === 'fulfilled' && grpStatsRes.value.success) {
          setGroupStats(grpStatsRes.value.data.groups || []);
        }
        if (asgnListRes.status === 'fulfilled' && asgnListRes.value.success) {
          setRecentAssignments(
            (asgnListRes.value.data.assignments || []).slice(0, 5)
          );
        }
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Students Enrolled',
      value: summary?.total_students ?? 0,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Groups',
      value: summary?.total_groups ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Assignments',
      value: summary?.total_assignments ?? 0,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Submissions Recorded',
      value: summary?.total_submissions ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professor Dashboard"
        subtitle="Overview of class performance, assignment status, and team submissions"
        actions={
          <Link to="/admin/assignments/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Assignment
            </Button>
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Overall Completion */}
        <Card
          title="Overall Submission Rate"
          subtitle="Proportion of total expected team submissions"
        >
          <CompletionDonut
            percentage={summary?.completion_percentage ?? 0}
            total={summary?.total_submissions ? Math.round(summary.total_submissions / ((summary.completion_percentage || 1) / 100)) : 0}
            completed={summary?.total_submissions ?? 0}
          />
        </Card>

        {/* Bar Chart: Per-Assignment Completion */}
        <Card
          title="Per-Assignment Completion"
          subtitle="Submission % across each assignment"
          className="lg:col-span-2"
        >
          <GroupBarChart
            data={assignmentStats}
            xKey="title"
            yKey="completion_percentage"
            barName="Completion %"
          />
        </Card>
      </div>

      {/* Second Row: Group Performance Chart + Recent Assignments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Per-Group Completion */}
        <Card
          title="Team Progress Rates"
          subtitle="Submission completion percentage per group"
          className="lg:col-span-2"
        >
          <GroupBarChart
            data={groupStats}
            xKey="name"
            yKey="completion_percentage"
            barName="Group Completion %"
          />
        </Card>

        {/* Recent Assignments Quick Access */}
        <Card
          title="Manage Assignments"
          subtitle="Quick status review"
          action={
            <Link
              to="/admin/assignments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {recentAssignments.map((a) => (
              <div key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/admin/assignments/${a.id}`}
                    className="text-xs font-bold text-slate-800 hover:text-indigo-600 truncate max-w-[180px]"
                  >
                    {a.title}
                  </Link>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {a.submission_count} / {a.total_target_groups}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Due {formatDate(a.due_date)}</span>
                  <Link
                    to={`/admin/assignments/${a.id}`}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Track →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
