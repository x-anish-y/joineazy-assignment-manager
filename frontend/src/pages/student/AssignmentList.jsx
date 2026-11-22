import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import { getAssignments } from '../../api/assignments.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | submitted | overdue

  const fetchAssignments = async () => {
    try {
      const res = await getAssignments();
      if (res.success && res.data?.assignments) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    overdue: assignments.filter((a) => a.status === 'overdue').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="View and confirm project deliverables for your team"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'submitted', label: 'Submitted', count: counts.submitted },
            { id: 'overdue', label: 'Overdue', count: counts.overdue },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filterStatus === tab.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Assignment Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments match your criteria"
          description={
            search
              ? `No assignments found matching "${search}". Try clearing your search.`
              : `There are currently no assignments in "${filterStatus}" status.`
          }
          actionLabel={search ? 'Clear Search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((assignment) => {
            const isSubmitted = assignment.status === 'submitted';
            const isOverdue = assignment.status === 'overdue';

            return (
              <Card
                key={assignment.id}
                className="flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={assignment.status}>
                        {isSubmitted ? '✓ Submitted' : isOverdue ? '⚠ Overdue' : '⏳ Pending'}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {assignment.target === 'all' ? 'All Groups' : 'Specific Groups'}
                      </Badge>
                    </div>

                    <span
                      className={`text-xs font-semibold shrink-0 ${
                        isOverdue ? 'text-rose-600' : isSubmitted ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {formatDueCountdown(assignment.due_date)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5">
                    <Link
                      to={`/student/assignments/${assignment.id}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {assignment.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {assignment.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due {formatDate(assignment.due_date)}</span>
                  </div>

                  <Link to={`/student/assignments/${assignment.id}`}>
                    <Button size="sm" variant={isSubmitted ? 'secondary' : 'primary'}>
                      {isSubmitted ? 'View Submission' : 'Submit'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
