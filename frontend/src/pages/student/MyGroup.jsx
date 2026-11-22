import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  ShieldAlert,
  Calendar,
  Mail,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getMyGroup,
  createGroup,
  addMember,
  removeMember,
  deleteGroup,
} from '../../api/groups.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../utils/formatters.js';
import { toast } from '../../components/ui/Toast.jsx';

export default function MyGroup() {
  const { user, group, refreshGroup } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);

  // Modals & form state
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [addIdentifier, setAddIdentifier] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

  const fetchGroup = async () => {
    try {
      const res = await getMyGroup();
      if (res.success && res.data?.group) {
        setGroupData(res.data.group);
      } else {
        setGroupData(null);
      }
    } catch (err) {
      console.error(err);
      setGroupData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    setCreating(true);
    try {
      const res = await createGroup(createName.trim());
      if (res.success) {
        toast.success(`Group "${createName}" created! You are the leader.`);
        setCreateName('');
        await refreshGroup();
        await fetchGroup();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addIdentifier.trim()) {
      toast.error('Enter email or student ID');
      return;
    }
    setAddingMember(true);
    try {
      const res = await addMember(addIdentifier.trim());
      if (res.success) {
        toast.success(`Added ${res.data.member.name} to the group!`);
        setAddIdentifier('');
        setIsAddModalOpen(false);
        await refreshGroup();
        await fetchGroup();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    try {
      const res = await removeMember(memberToRemove.id);
      if (res.success) {
        toast.success(`Removed ${memberToRemove.name} from the group.`);
        setMemberToRemove(null);
        await refreshGroup();
        await fetchGroup();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to remove member');
    } finally {
      setRemovingMember(false);
    }
  };

  const handleDeleteGroup = async () => {
    setDeletingGroup(true);
    try {
      const res = await deleteGroup();
      if (res.success) {
        toast.success('Group deleted successfully.');
        setIsDeleteModalOpen(false);
        await refreshGroup();
        await fetchGroup();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete group');
    } finally {
      setDeletingGroup(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const isLeader = groupData?.my_role === 'leader';
  const members = groupData?.members || [];
  const canDeleteGroup = isLeader && members.length === 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Group"
        subtitle={
          groupData
            ? `Collaborate with your team on assignments`
            : `Create or join a team to work on course assignments`
        }
        actions={
          groupData && isLeader ? (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Member
              </Button>
            </div>
          ) : null
        }
      />

      {/* Case 1: No Group */}
      {!groupData && (
        <div className="max-w-xl mx-auto">
          <Card
            title="Create a New Group"
            subtitle="You are not in a group yet. Form one now!"
          >
            <div className="mb-6 p-4 rounded-xl bg-primary-light border border-primary/20 text-xs text-text leading-relaxed">
              <p className="font-semibold text-text flex items-center gap-1.5 mb-1">
                <Crown className="h-4 w-4 text-primary" />
                Group Leader Privileges:
              </p>
              By creating this group, you will become the <strong>Leader</strong>. Leaders can add and remove members by their university email or student ID.
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Group Name"
                placeholder="e.g. Phoenix Project, ByteSquad"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />

              <Button type="submit" loading={creating} className="w-full">
                Create Group
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Case 2: In a Group */}
      {groupData && (
        <div className="space-y-6">
          {/* Group Overview Banner */}
          <div className="bg-surface/85 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                {groupData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-text">{groupData.name}</h2>
                  <Badge variant={isLeader ? 'leader' : 'member'}>
                    {isLeader ? '👑 Leader' : '👤 Member'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-text-muted" />
                    Created {formatDate(groupData.created_at)}
                  </span>
                  <span>•</span>
                  <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
            </div>

            {isLeader && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Member
              </Button>
            )}
          </div>

          {/* Members List Table */}
          <Card
            title={`Team Members (${members.length})`}
            subtitle="All members can confirm submissions for assignments on behalf of the group"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-hover text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Student ID</th>
                    <th className="px-6 py-3.5">Joined Date</th>
                    {isLeader && <th className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs text-text">
                  {members.map((member) => {
                    const isSelf = member.id === user.id;
                    const isMemberLeader = member.member_role === 'leader';
                    return (
                      <tr key={member.id} className="hover:bg-surface-hover/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text flex items-center gap-1.5">
                            {member.name}
                            {isSelf && (
                              <span className="text-[10px] font-medium text-text-muted bg-surface-hover border border-border px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={isMemberLeader ? 'leader' : 'member'} size="sm">
                            {isMemberLeader ? 'Leader' : 'Member'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-text-muted">
                          {member.student_id ? (
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3 text-text-muted" />
                              {member.student_id}
                            </span>
                          ) : (
                            <span className="text-text-muted/60">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {formatDate(member.joined_at)}
                        </td>
                        {isLeader && (
                          <td className="px-6 py-4 text-right">
                            {!isMemberLeader ? (
                              <button
                                onClick={() => setMemberToRemove(member)}
                                className="text-danger hover:text-danger/80 font-medium text-xs p-1 rounded hover:bg-danger-light transition-colors cursor-pointer"
                                title="Remove member"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="text-text-muted/50 text-[11px]">Cannot remove leader</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Leader Danger Zone: Delete Group */}
          {isLeader && (
            <Card className="border-danger/30 bg-danger-light">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-danger flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-danger" />
                    Danger Zone: Delete Group
                  </h4>
                  <p className="text-xs text-text-muted mt-1 max-w-lg">
                    {canDeleteGroup
                      ? 'You are the sole member of this group. Deleting it will remove the group permanently.'
                      : 'You cannot delete the group while other members are in it. Remove all members first.'}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!canDeleteGroup}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete Group
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modal: Add Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={addingMember} onClick={handleAddMember}>
              Add to Group
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter the student's email address or student ID. They must be registered and not belong to another group.
          </p>
          <Input
            label="Email or Student ID"
            placeholder="e.g. stu2@joineazy.test or STU002"
            required
            autoFocus
            value={addIdentifier}
            onChange={(e) => setAddIdentifier(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal: Confirm Remove Member */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Team Member"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={removingMember} onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from <strong>{groupData?.name}</strong>?
        </p>
        <p className="text-xs text-slate-500 mt-2">
          They will no longer be part of this group and can join or create another team.
        </p>
      </Modal>

      {/* Modal: Confirm Delete Group */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Group"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deletingGroup} onClick={handleDeleteGroup}>
              Yes, Delete Group
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{groupData?.name}</strong>?
        </p>
        <p className="text-xs text-rose-600 font-medium mt-2">
          This action cannot be undone. All group data and associated submissions will be removed.
        </p>
      </Modal>
    </div>
  );
}
