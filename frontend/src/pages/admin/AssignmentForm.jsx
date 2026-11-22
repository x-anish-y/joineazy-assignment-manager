import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Link as LinkIcon, Calendar, Users } from 'lucide-react';
import {
  createAssignment,
  getAssignment,
  updateAssignment,
} from '../../api/assignments.js';
import { getAllGroups } from '../../api/analytics.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { toast } from '../../components/ui/Toast.jsx';

export default function AssignmentForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    onedrive_link: '',
    target: 'all', // all | groups
    group_ids: [],
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadInitialData() {
      try {
        const groupsRes = await getAllGroups();
        if (groupsRes.success && groupsRes.data?.groups) {
          setAvailableGroups(groupsRes.data.groups);
        }

        if (isEditing) {
          const asgnRes = await getAssignment(id);
          if (asgnRes.success && asgnRes.data?.assignment) {
            const a = asgnRes.data.assignment;
            // Format datetime-local string (YYYY-MM-DDTHH:mm)
            const d = new Date(a.due_date);
            const pad = (n) => String(n).padStart(2, '0');
            const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

            setFormData({
              title: a.title,
              description: a.description || '',
              due_date: localIso,
              onedrive_link: a.onedrive_link,
              target: a.target,
              group_ids: a.targeted_groups ? a.targeted_groups.map((g) => g.group_id) : [],
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load assignment data');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [id, isEditing]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.due_date) {
      errs.due_date = 'Due date is required';
    } else if (isNaN(Date.parse(formData.due_date))) {
      errs.due_date = 'Invalid date format';
    }
    if (!formData.onedrive_link.trim()) {
      errs.onedrive_link = 'OneDrive link is required';
    } else if (!formData.onedrive_link.startsWith('https://')) {
      errs.onedrive_link = 'OneDrive link must be a valid HTTPS URL';
    }
    if (formData.target === 'groups' && formData.group_ids.length === 0) {
      errs.group_ids = 'Please select at least one group';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGroupToggle = (groupId) => {
    setFormData((prev) => {
      const exists = prev.group_ids.includes(groupId);
      return {
        ...prev,
        group_ids: exists
          ? prev.group_ids.filter((g) => g !== groupId)
          : [...prev.group_ids, groupId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: new Date(formData.due_date).toISOString(),
        onedrive_link: formData.onedrive_link.trim(),
        target: formData.target,
        group_ids: formData.target === 'groups' ? formData.group_ids : undefined,
      };

      if (isEditing) {
        const res = await updateAssignment(id, payload);
        if (res.success) {
          toast.success('Assignment updated successfully!');
          navigate('/admin/assignments');
        }
      } else {
        const res = await createAssignment(payload);
        if (res.success) {
          toast.success('Assignment created successfully!');
          navigate('/admin/assignments');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save assignment';
      setErrors({ form: msg });
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/admin/assignments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Assignments
      </Link>

      <PageHeader
        title={isEditing ? 'Edit Assignment' : 'Create New Assignment'}
        subtitle="Set title, OneDrive repository, deadline, and target audiences"
      />

      <Card>
        {errors.form && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Assignment Title"
            icon={FileText}
            required
            placeholder="e.g. Milestone 2: Backend System Architecture"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
          />

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Description / Instructions
            </label>
            <textarea
              rows={4}
              placeholder="Provide instructions, required files, grading rubric notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-xl border border-border text-sm p-3 bg-surface text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-text-muted/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date and Time"
              type="datetime-local"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              error={errors.due_date}
            />

            <Input
              label="OneDrive Folder Link"
              type="url"
              icon={LinkIcon}
              required
              placeholder="https://onedrive.live.com/..."
              value={formData.onedrive_link}
              onChange={(e) => setFormData({ ...formData, onedrive_link: e.target.value })}
              error={errors.onedrive_link}
              helperText="Must be an HTTPS URL"
            />
          </div>

          {/* Target Audience Selection */}
          <div className="pt-2 border-t border-border-subtle">
            <label className="block text-xs font-semibold text-text mb-2">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.target === 'all'
                    ? 'border-primary bg-primary-light text-primary font-semibold shadow-xs'
                    : 'border-border hover:bg-surface-hover text-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={formData.target === 'all'}
                  onChange={() => setFormData({ ...formData, target: 'all' })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-xs font-bold text-text">All Students / Groups</p>
                  <p className="text-[11px] text-text-muted font-normal">Assigned to every registered team</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.target === 'groups'
                    ? 'border-primary bg-primary-light text-primary font-semibold shadow-xs'
                    : 'border-border hover:bg-surface-hover text-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  value="groups"
                  checked={formData.target === 'groups'}
                  onChange={() => setFormData({ ...formData, target: 'groups' })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-xs font-bold text-text">Specific Groups</p>
                  <p className="text-[11px] text-text-muted font-normal">Select specific groups below</p>
                </div>
              </label>
            </div>
          </div>

          {/* Group Checklist if target === 'groups' */}
          {formData.target === 'groups' && (
            <div className="p-4 bg-surface-hover border border-border rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">
                  Select Targeted Groups ({formData.group_ids.length} selected)
                </span>
                {errors.group_ids && (
                  <span className="text-xs text-danger font-medium">{errors.group_ids}</span>
                )}
              </div>

              {availableGroups.length === 0 ? (
                <p className="text-xs text-text-muted">No groups registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {availableGroups.map((g) => {
                    const checked = formData.group_ids.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-surface border-primary text-text font-medium shadow-xs'
                            : 'bg-surface/50 border-border text-text-muted hover:bg-surface hover:text-text'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleGroupToggle(g.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="truncate">{g.name}</span>
                        <span className="text-[10px] text-text-muted ml-auto shrink-0">
                          ({g.member_count} members)
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <Link to="/admin/assignments">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={submitting} size="md">
              <Save className="h-4 w-4 mr-1.5" />
              {isEditing ? 'Save Changes' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
