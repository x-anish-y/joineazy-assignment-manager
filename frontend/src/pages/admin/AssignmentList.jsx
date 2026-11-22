import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  Users,
} from 'lucide-react';
import { getAssignments, deleteAssignment } from '../../api/assignments.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';
import { toast } from '../../components/ui/Toast.jsx';

export default function AdminAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const fetchAssignments = async () => {
    try {
      const res = await getAssignments();
      if (res.success && res.data?.assignments) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    setDeletingId(assignmentToDelete.id);
    try {
      const res = await deleteAssignment(assignmentToDelete.id);
      if (res.success) {
        toast.success('Assignment deleted successfully');
        setAssignmentToDelete(null);
        await fetchAssignments();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete assignment');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Assignments"
        subtitle="Create, edit, track submissions, and configure targeting"
        actions={
          <Link to="/admin/assignments/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Assignment
            </Button>
          </Link>
        }
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments created yet"
          description="Get started by creating your first course assignment."
          actionLabel="Create Assignment"
          onAction={() => window.location.href = '/admin/assignments/new'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => {
            const totalTarget = parseInt(assignment.total_target_groups, 10) || 0;
            const submitted = parseInt(assignment.submission_count, 10) || 0;
            const percentage = totalTarget > 0 ? Math.round((submitted / totalTarget) * 100) : 0;
            const isPastDue = new Date(assignment.due_date) < new Date();

            return (
              <Card
                key={assignment.id}
                className="hover:border-indigo-200 transition-all"
                noPadding
              >
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
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

                    <h3 className="text-base sm:text-lg font-bold text-text">
                      <Link
                        to={`/admin/assignments/${assignment.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {assignment.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-text-muted line-clamp-2 max-w-2xl">
                      {assignment.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {formatDate(assignment.due_date)}
                      </span>
                      <span>•</span>
                      <a
                        href={assignment.onedrive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        OneDrive <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Progress & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 lg:w-64 border-t lg:border-t-0 pt-4 lg:pt-0 border-border-subtle">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs font-medium text-text-muted mb-1">
                        <span>Submissions</span>
                        <span className="font-bold text-text">
                          {submitted} / {totalTarget} ({percentage}%)
                        </span>
                      </div>
                      <ProgressBar value={percentage} size="sm" colorScheme="dynamic" />
                    </div>

                    <div className="flex items-center gap-2 w-full justify-end">
                      <Link to={`/admin/assignments/${assignment.id}`}>
                        <Button size="sm" variant="secondary" title="View tracking">
                          <Eye className="h-3.5 w-3.5 mr-1 text-text-muted" />
                          Track
                        </Button>
                      </Link>
                      <Link to={`/admin/assignments/${assignment.id}/edit`}>
                        <Button size="sm" variant="secondary" title="Edit assignment">
                          <Edit className="h-3.5 w-3.5 text-text-muted" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAssignmentToDelete(assignment)}
                        className="text-danger hover:bg-danger-light hover:border-danger/30"
                        title="Delete assignment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        title="Delete Assignment"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAssignmentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={!!deletingId}
              onClick={handleDelete}
            >
              Delete Assignment
            </Button>
          </>
        }
      >
        <p className="text-sm text-text">
          Are you sure you want to delete <strong>{assignmentToDelete?.title}</strong>?
        </p>
        <p className="text-xs text-danger font-medium mt-2">
          This will permanently delete this assignment along with all recorded student submissions.
        </p>
      </Modal>
    </div>
  );
}
