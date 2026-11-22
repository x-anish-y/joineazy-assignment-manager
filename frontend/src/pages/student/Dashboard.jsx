import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAssignments } from '../../api/assignments.js';
import { getGroupProgress } from '../../api/groups.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';

export default function StudentDashboard() {
  const { user, group } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [asgnRes, progRes] = await Promise.allSettled([
          getAssignments(),
          group ? getGroupProgress() : Promise.resolve({ data: { progress: null } }),
        ]);

        if (asgnRes.status === 'fulfilled' && asgnRes.value.success) {
          setAssignments(asgnRes.value.data.assignments || []);
        }

        if (progRes.status === 'fulfilled' && progRes.value.data?.progress) {
          setProgress(progRes.value.data.progress);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [group]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate status counts
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const overdueCount = assignments.filter((a) => a.status === 'overdue').length;
  const completionPercentage = assignments.length > 0
    ? Math.round((submittedCount / assignments.length) * 100)
    : 0;

  // Upcoming assignments: sort pending and overdue by due_date
  const upcomingAssignments = [...assignments]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name}! 👋`}
        subtitle="Track assignments, team submissions, and project milestones"
        actions={
          <Link to="/student/assignments">
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4 mr-1.5" />
              All Assignments
            </Button>
          </Link>
        }
      />

      {/* Progress & Team Alert */}
      {!group && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">You are not in a group yet!</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Assignments are submitted at the team level. Create your group or have a teammate add you.
              </p>
            </div>
          </div>
          <Link to="/student/group">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 whitespace-nowrap">
              Create / View Group
            </Button>
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
              %
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{completionPercentage}%</span>
              <span className="text-xs text-slate-500 font-medium">({submittedCount}/{assignments.length})</span>
            </div>
            <ProgressBar value={completionPercentage} size="sm" className="mt-3" colorScheme="dynamic" />
          </div>
        </Card>

        {/* Submitted */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Submitted</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">{submittedCount}</span>
            <p className="text-xs text-slate-500 mt-1">Confirmed submissions</p>
          </div>
        </Card>

        {/* Pending */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <p className="text-xs text-slate-500 mt-1">Awaiting confirmation</p>
          </div>
        </Card>

        {/* Overdue */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">{overdueCount}</span>
            <p className="text-xs text-slate-500 mt-1">Past due date</p>
          </div>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Assignments */}
        <div className="lg:col-span-2">
          <Card
            title="Upcoming Deadlines"
            subtitle="Assignments targeted for you and your group"
            action={
              <Link to="/student/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {upcomingAssignments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No assignments found"
                description="You're all caught up! No active assignments."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/student/assignments/${assignment.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 text-sm truncate"
                        >
                          {assignment.title}
                        </Link>
                        <Badge variant={assignment.status} size="sm">
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Due: {formatDate(assignment.due_date)}</span>
                        <span className="text-slate-300">•</span>
                        <span className={assignment.status === 'overdue' ? 'text-rose-600 font-medium' : ''}>
                          {formatDueCountdown(assignment.due_date)}
                        </span>
                      </div>
                    </div>

                    <Link to={`/student/assignments/${assignment.id}`}>
                      <Button size="sm" variant="secondary" className="shrink-0 w-full sm:w-auto">
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Team Snapshot */}
        <div className="space-y-6">
          <Card
            title="My Group"
            subtitle={group ? `${group.members?.length || 1} team members` : 'No group joined'}
            action={
              <Link to="/student/group" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Manage
              </Link>
            }
          >
            {group ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{group.name}</span>
                    <Badge variant={group.my_role === 'leader' ? 'leader' : 'member'} size="sm">
                      {group.my_role === 'leader' ? '👑 Leader' : '👤 Member'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Members</p>
                  <div className="divide-y divide-slate-100">
                    {group.members?.map((m) => (
                      <div key={m.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-slate-800">{m.name} {m.id === user.id && '(You)'}</p>
                          <p className="text-slate-400 text-[11px]">{m.student_id ? `#${m.student_id}` : m.email}</p>
                        </div>
                        {m.member_role === 'leader' && (
                          <Badge variant="leader" size="sm">Leader</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Solo student"
                description="Form a group to collaborate and submit assignments."
                actionLabel="Create Group"
                onAction={() => window.location.href = '/student/group'}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
