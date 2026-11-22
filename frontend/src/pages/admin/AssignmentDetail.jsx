import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Edit,
  Search,
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Mail,
} from 'lucide-react';
import { getAssignment } from '../../api/assignments.js';
import {
  getAssignmentGroupStatus,
  getAssignmentStudentStatus,
} from '../../api/analytics.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';

export default function AdminAssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('groups'); // groups | students
  const [groupRows, setGroupRows] = useState([]);
  const [studentRows, setStudentRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | submitted | pending | overdue

  useEffect(() => {
    async function loadData() {
      try {
        const [asgnRes, grpRes, stuRes] = await Promise.allSettled([
          getAssignment(id),
          getAssignmentGroupStatus(id),
          getAssignmentStudentStatus(id),
        ]);

        if (asgnRes.status === 'fulfilled' && asgnRes.value.success) {
          setAssignment(asgnRes.value.data.assignment);
        }
        if (grpRes.status === 'fulfilled' && grpRes.value.success) {
          setGroupRows(grpRes.value.data.groups || []);
        }
        if (stuRes.status === 'fulfilled' && stuRes.value.success) {
          setStudentRows(stuRes.value.data.students || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assignment) return null;

  // Filtered rows
  const filteredGroups = groupRows.filter((g) => {
    const matchesSearch = g.group_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return g.status === statusFilter;
  });

  const filteredStudents = studentRows.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (s.student_id && s.student_id.toLowerCase().includes(term)) ||
      (s.group_name && s.group_name.toLowerCase().includes(term));
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const isPastDue = new Date(assignment.due_date) < new Date();
  const submittedGroupsCount = groupRows.filter((g) => g.status === 'submitted').length;
  const totalTarget = groupRows.length;
  const pct = totalTarget > 0 ? Math.round((submittedGroupsCount / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/assignments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Assignments
      </Link>

      {/* Assignment Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" size="sm">
                {assignment.target === 'all' ? 'All Groups' : 'Specific Groups'}
              </Badge>
              <span
                className={`text-xs font-semibold ${
                  isPastDue ? 'text-rose-600' : 'text-slate-500'
                }`}
              >
                {formatDueCountdown(assignment.due_date)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {assignment.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Due: {formatDate(assignment.due_date)}
              </span>
              <span>•</span>
              <a
                href={assignment.onedrive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                OneDrive Link <ExternalLink className="h-3 w-3" />
              </a>
              <span>•</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {submittedGroupsCount} / {totalTarget} Groups ({pct}%)
              </span>
            </div>
          </div>

          <Link to={`/admin/assignments/${assignment.id}/edit`}>
            <Button size="sm" variant="secondary">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs: Group-wise vs Student-wise */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1.5" />
            Group-wise ({groupRows.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 inline mr-1.5" />
            Student-wise ({studentRows.length})
          </button>
        </div>

        {/* Status Pills & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['all', 'submitted', 'pending', 'overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? 'Filter groups...' : 'Filter students...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Group-wise View */}
      {activeTab === 'groups' && (
        <Card noPadding>
          {filteredGroups.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No group records found"
                description="No groups match the selected filter criteria."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3.5">Group Name</th>
                    <th className="px-6 py-3.5">Submission Status</th>
                    <th className="px-6 py-3.5">Confirmed By</th>
                    <th className="px-6 py-3.5">Confirmed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredGroups.map((g) => (
                    <tr key={g.group_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {g.group_name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={g.status}>
                          {g.status === 'submitted' ? '✓ Submitted' : g.status === 'overdue' ? '⚠ Overdue' : '⏳ Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {g.confirmed_by_name ? (
                          <span className="font-medium text-slate-800">{g.confirmed_by_name}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {g.confirmed_at ? formatDate(g.confirmed_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Student-wise View */}
      {activeTab === 'students' && (
        <Card noPadding>
          {filteredStudents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={GraduationCap}
                title="No student records found"
                description="No students match the selected filter criteria."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Student ID</th>
                    <th className="px-6 py-3.5">Team & Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Confirmed By</th>
                    <th className="px-6 py-3.5">Confirmed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.user_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {s.student_id ? `#${s.student_id}` : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        {s.group_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-800">{s.group_name}</span>
                            <Badge variant={s.member_role === 'leader' ? 'leader' : 'member'} size="sm">
                              {s.member_role}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium text-[11px]">No team</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={s.status}>
                          {s.status === 'submitted' ? '✓ Submitted' : s.status === 'overdue' ? '⚠ Overdue' : '⏳ Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        {s.confirmed_by_name ? (
                          <span className="font-medium text-slate-800">{s.confirmed_by_name}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {s.confirmed_at ? formatDate(s.confirmed_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
