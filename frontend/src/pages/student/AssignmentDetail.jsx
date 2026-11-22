import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAssignment, confirmSubmission } from '../../api/assignments.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatDate, formatDueCountdown } from '../../utils/formatters.js';
import { toast } from '../../components/ui/Toast.jsx';
import confetti from 'canvas-confetti';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user, group } = useAuth();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentData = async () => {
    try {
      const res = await getAssignment(id);
      if (res.success && res.data?.assignment) {
        setAssignment(res.data.assignment);
      }
    } catch (err) {
      toast.error('Assignment not found');
      navigate('/student/assignments', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const handleConfirmSubmission = async () => {
    setSubmitting(true);
    try {
      const res = await confirmSubmission(id);
      if (res.success) {
        toast.success('Submission confirmed for your group!');
        try {
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#38bdf8', '#10b981', '#f59e0b'],
          });
        } catch (e) {}
        setIsConfirmModalOpen(false);
        await fetchAssignmentData();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to confirm submission';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assignment) return null;

  const isSubmitted = assignment.status === 'submitted';
  const isOverdue = assignment.status === 'overdue';
  const submissionData = assignment.submission;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Assignments
        </Link>
      </div>

      {/* Main Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={assignment.status}>
            {isSubmitted ? '✓ Submitted' : isOverdue ? '⚠ Overdue' : '⏳ Pending'}
          </Badge>
          <Badge variant="default">
            {assignment.target === 'all' ? 'All Students' : 'Group-specific'}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-text tracking-tight">
          {assignment.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-text-muted" />
            <span>Due: <strong className="text-text">{formatDate(assignment.due_date)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-text-muted" />
            <span className={isOverdue ? 'text-danger font-semibold' : ''}>
              {formatDueCountdown(assignment.due_date)}
            </span>
          </div>
          {assignment.creator_name && (
            <div className="flex items-center gap-1.5">
              <span>Posted by Prof. {assignment.creator_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Description & Submission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & OneDrive */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Assignment Description">
            <div className="text-text whitespace-pre-wrap leading-relaxed text-sm">
              {assignment.description || 'No detailed instructions provided.'}
            </div>
          </Card>

          <Card title="Submission Materials">
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Open the designated OneDrive folder to review instructions and upload your deliverable files.
            </p>
            <a
              href={assignment.onedrive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="secondary" className="gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                Open OneDrive Folder
              </Button>
            </a>
          </Card>
        </div>

        {/* Right Col: Two-Step Submission Action */}
        <div className="space-y-6">
          <Card
            title="Submission Confirmation"
            subtitle="Confirmed at team level"
          >
            {isSubmitted ? (
              /* Already Confirmed Banner */
              <div className="p-4 bg-success-light border border-success/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <span>Submission Confirmed!</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 pt-1 border-t border-success/20">
                  <p>
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">Confirmed by:</span>{' '}
                    {submissionData?.confirmed_by_name || 'Team member'}
                  </p>
                  <p>
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">Confirmed at:</span>{' '}
                    {formatDate(submissionData?.confirmed_at)}
                  </p>
                </div>
              </div>
            ) : !group ? (
              /* No Group Warning */
              <div className="p-4 bg-warning-light border border-warning/30 rounded-2xl space-y-3 text-xs text-text">
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Group required</span>
                </div>
                <p className="text-text-muted">
                  You must be in a group to confirm submissions.
                </p>
                <Link to="/student/group">
                  <Button size="sm" variant="secondary" className="w-full mt-1">
                    Go to My Group
                  </Button>
                </Link>
              </div>
            ) : (
              /* Two-step Submission Trigger */
              <div className="space-y-4">
                <div className="p-3.5 bg-surface-hover border border-border rounded-2xl text-xs text-text space-y-1.5">
                  <p className="font-medium text-text flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Submitting for: <span className="font-bold">{group.name}</span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Any team member can confirm after uploading deliverables to OneDrive.
                  </p>
                </div>

                {isOverdue && (
                  <p className="text-xs text-danger font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Note: This assignment is past its due date.
                  </p>
                )}

                {/* Step 1 Button: "Yes, I have submitted" */}
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="w-full shadow-sm"
                  size="lg"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Yes, I have submitted
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Step 2 Modal: Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Submission"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={submitting}
              onClick={handleConfirmSubmission}
            >
              Confirm Submission
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-text">
            Confirm submission for <strong>{group?.name}</strong>?
          </p>
          <div className="p-3 bg-warning-light border border-warning/30 rounded-xl text-xs text-amber-800 dark:text-amber-200 font-medium">
            ⚠️ This cannot be undone once confirmed. Make sure your team's files are properly uploaded to the OneDrive folder.
          </div>
        </div>
      </Modal>
    </div>
  );
}
