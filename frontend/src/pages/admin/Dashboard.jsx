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
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
import Skeleton from '../../components/ui/Skeleton.jsx';
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
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton variant="circular" className="h-44 w-44 mx-auto" />
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Students Enrolled',
      value: summary?.total_students ?? 0,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
      badge: 'Active Roster',
    },
    {
      label: 'Active Teams',
      value: summary?.total_groups ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      badge: 'Collaborating',
    },
    {
      label: 'Course Assignments',
      value: summary?.total_assignments ?? 0,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Assigned',
    },
    {
      label: 'Confirmed Submissions',
      value: summary?.total_submissions ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
      badge: `${summary?.completion_percentage ?? 0}% completed`,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <PageHeader
        title="Professor Dashboard"
        subtitle="Real-time class performance metrics, deliverable status, and team completion rates"
        actions={
          <Link to="/admin/assignments/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Assignment
            </Button>
          </Link>
        }
      />

      {/* Summary KPI Cards with Framer Motion Stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {card.label}
                  </p>
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-text tracking-tight">
                    {card.value}
                  </p>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-hover border border-border px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Overall Completion */}
        <motion.div variants={itemVariants}>
          <Card
            title="Overall Turn-in Rate"
            subtitle="Confirmed deliverables vs expected submissions"
            className="h-full flex flex-col justify-between"
          >
            <CompletionDonut
              percentage={summary?.completion_percentage ?? 0}
              total={
                summary?.total_submissions
                  ? Math.round(
                      summary.total_submissions /
                        ((summary.completion_percentage || 1) / 100)
                    )
                  : summary?.total_assignments
                  ? summary.total_assignments * (summary.total_groups || 1)
                  : 0
              }
              completed={summary?.total_submissions ?? 0}
            />
          </Card>
        </motion.div>

        {/* Bar Chart: Per-Assignment Completion (Default Horizontal for Long Titles) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card
            title="Per-Assignment Completion Rate"
            subtitle="Submission progress across course deliverables (toggle between columns and horizontal view)"
          >
            <GroupBarChart
              data={assignmentStats}
              xKey="title"
              yKey="completion_percentage"
              barName="Turn-in Rate"
              defaultHorizontal={true}
              allowToggle={true}
            />
          </Card>
        </motion.div>
      </div>

      {/* Secondary Analytics Section: Team Progress + Quick Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Per-Group Completion (Vertical Columns with sleek width) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card
            title="Team Progress Rates"
            subtitle="Comparison of completed assignments across registered student groups"
          >
            <GroupBarChart
              data={groupStats}
              xKey="name"
              yKey="completion_percentage"
              barName="Team Completion"
              defaultHorizontal={false}
              allowToggle={true}
            />
          </Card>
        </motion.div>

        {/* Recent Assignments Quick Access List */}
        <motion.div variants={itemVariants}>
          <Card
            title="Recent Deliverables"
            subtitle="Quick assignment access & tracking"
            action={
              <Link
                to="/admin/assignments"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {recentAssignments.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No assignments created yet.</p>
            ) : (
              <div className="divide-y divide-border-subtle">
                {recentAssignments.map((a) => (
                  <div key={a.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/admin/assignments/${a.id}`}
                        className="text-xs font-bold text-text hover:text-primary truncate max-w-[170px]"
                        title={a.title}
                      >
                        {a.title}
                      </Link>
                      <span className="text-[10px] font-bold text-primary bg-primary-light border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                        {a.submission_count} / {a.total_target_groups}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>Due {formatDate(a.due_date)}</span>
                      <Link
                        to={`/admin/assignments/${a.id}`}
                        className="text-primary hover:underline font-medium text-[11px]"
                      >
                        Track →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
