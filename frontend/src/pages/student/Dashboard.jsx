import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  Sparkles,
  Calendar,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAssignments } from '../../api/assignments.js';
import { getGroupProgress } from '../../api/groups.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import TiltCard from '../../components/ui/TiltCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressRing from '../../components/ui/ProgressRing.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import AnimatedNumber from '../../components/ui/AnimatedNumber.jsx';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import MemberAvatars from '../../components/ui/MemberAvatars.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';
import { staggerContainer, staggerItem } from '../../lib/motion.js';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <div>
            <Skeleton variant="card" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate status counts
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const overdueCount = assignments.filter((a) => a.status === 'overdue').length;
  const totalCount = assignments.length;
  const completionPercentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  // Upcoming assignments: sort by due_date
  const upcomingAssignments = [...assignments]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const nextDeadline = upcomingAssignments.find((a) => a.status === 'pending');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <PageHeader
        title={`${getGreeting()}, ${user?.name}! 👋`}
        subtitle="Track assignments, synchronize team confirmations, and hit milestones"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/student/assignments">
              <MagneticButton variant="secondary" size="sm">
                <FileText className="h-4 w-4 mr-1.5" />
                All Assignments
              </MagneticButton>
            </Link>
          </div>
        }
      />

      {/* Progress & Team Alert */}
      {!group && (
        <motion.div
          variants={staggerItem}
          className="bg-warning-light border border-warning/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/15 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text">You are not in a group yet!</h4>
              <p className="text-xs text-text-muted mt-0.5">
                Assignments are submitted at the team level. Create your group or have a teammate add you.
              </p>
            </div>
          </div>
          <Link to="/student/group">
            <MagneticButton size="sm" className="whitespace-nowrap font-bold">
              Create / View Group
            </MagneticButton>
          </Link>
        </motion.div>
      )}

      {/* Hero Progress Ring Banner Card */}
      <motion.div variants={staggerItem}>
        <div className="relative overflow-hidden rounded-3xl bg-surface/90 backdrop-blur-xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <ProgressRing
                percentage={completionPercentage}
                size={110}
                strokeWidth={10}
                glow={true}
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text">Overall Course Progress</h3>
                  <Badge variant={completionPercentage === 100 ? 'submitted' : 'default'} size="sm">
                    {completionPercentage === 100 ? 'All Completed!' : 'In Progress'}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted max-w-md">
                  You have confirmed <strong>{submittedCount}</strong> of{' '}
                  <strong>{totalCount}</strong> deliverables. Keep steady momentum with your squad.
                </p>
                {nextDeadline && (
                  <div className="pt-1 flex items-center gap-1.5 text-xs text-text font-medium">
                    <Clock className="h-3.5 w-3.5 text-warning" />
                    <span>Next due: <strong>{nextDeadline.title}</strong></span>
                    <span className="text-text-muted">({formatDueCountdown(nextDeadline.due_date)})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/student/assignments" className="w-full md:w-auto">
                <MagneticButton className="w-full md:w-auto shadow-md shadow-primary/20">
                  <Flame className="h-4 w-4 mr-2" />
                  Review Tasks
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards Grid with 3D Tilt and Animated Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <motion.div variants={staggerItem}>
          <TiltCard className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Completion
              </span>
              <div className="h-8 w-8 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                %
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text">
                  <AnimatedNumber value={completionPercentage} />%
                </span>
                <span className="text-xs text-text-muted font-medium">
                  ({submittedCount}/{totalCount})
                </span>
              </div>
              <ProgressBar value={completionPercentage} size="sm" className="mt-3" colorScheme="dynamic" />
            </div>
          </TiltCard>
        </motion.div>

        {/* Submitted */}
        <motion.div variants={staggerItem}>
          <TiltCard className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Submitted
              </span>
              <div className="h-8 w-8 rounded-xl bg-success-light flex items-center justify-center text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-success">
                <AnimatedNumber value={submittedCount} />
              </span>
              <p className="text-xs text-text-muted mt-1">Confirmed submissions</p>
            </div>
          </TiltCard>
        </motion.div>

        {/* Pending */}
        <motion.div variants={staggerItem}>
          <TiltCard className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Pending
              </span>
              <div className="h-8 w-8 rounded-xl bg-warning-light flex items-center justify-center text-warning">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-warning">
                <AnimatedNumber value={pendingCount} />
              </span>
              <p className="text-xs text-text-muted mt-1">Awaiting confirmation</p>
            </div>
          </TiltCard>
        </motion.div>

        {/* Overdue */}
        <motion.div variants={staggerItem}>
          <TiltCard className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Overdue
              </span>
              <div className="h-8 w-8 rounded-xl bg-danger-light flex items-center justify-center text-danger">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-danger">
                <AnimatedNumber value={overdueCount} />
              </span>
              <p className="text-xs text-text-muted mt-1">Past due date</p>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Assignments */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card
            title="Upcoming Deadlines"
            subtitle="Assignments targeted for you and your group"
            action={
              <Link
                to="/student/assignments"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
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
              <div className="divide-y divide-border-subtle">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-surface-hover/50 px-2 rounded-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/student/assignments/${assignment.id}`}
                          className="font-semibold text-text hover:text-primary text-sm truncate"
                        >
                          {assignment.title}
                        </Link>
                        <Badge variant={assignment.status} size="sm">
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {formatDate(assignment.due_date)}
                        </span>
                        <span className="text-border">•</span>
                        {/* Live countdown chip */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            assignment.status === 'overdue'
                              ? 'bg-danger-light text-danger border border-danger/30'
                              : 'bg-primary-light text-primary border border-primary/20'
                          }`}
                        >
                          {formatDueCountdown(assignment.due_date)}
                        </span>
                      </div>
                    </div>

                    <Link to={`/student/assignments/${assignment.id}`}>
                      <MagneticButton size="sm" variant="secondary" className="shrink-0 w-full sm:w-auto">
                        Details
                      </MagneticButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right Col: Team Snapshot */}
        <motion.div variants={staggerItem} className="space-y-6">
          <Card
            title="My Group"
            subtitle={group ? `${group.members?.length || 1} team members` : 'No group joined'}
            action={
              <Link to="/student/group" className="text-xs font-semibold text-primary hover:underline">
                Manage
              </Link>
            }
          >
            {group ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-surface-hover rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-text">{group.name}</span>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {group.members?.length || 1} members active
                    </p>
                  </div>
                  <Badge variant={group.my_role === 'leader' ? 'leader' : 'member'} size="sm">
                    {group.my_role === 'leader' ? '👑 Leader' : '👤 Member'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Members
                    </p>
                    <MemberAvatars
                      members={group.members || []}
                      leaderId={group.leader_id}
                      size="sm"
                    />
                  </div>

                  <div className="divide-y divide-border-subtle pt-1">
                    {group.members?.map((m) => (
                      <div
                        key={m.id}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium text-text">
                            {m.name} {m.id === user.id && '(You)'}
                          </p>
                          <p className="text-text-muted text-[11px]">
                            {m.student_id ? `#${m.student_id}` : m.email}
                          </p>
                        </div>
                        {m.member_role === 'leader' && (
                          <Badge variant="leader" size="sm">
                            Leader
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Solo student"
                description="Form a group to collaborate and submit assignments."
                actionLabel="Create Group"
                onAction={() => (window.location.href = '/student/group')}
              />
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
