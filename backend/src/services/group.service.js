import { query, pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Find user's group membership (group_id, member_role)
 */
export const findUserMembership = async (userId) => {
  const { rows } = await query(
    `SELECT gm.group_id, gm.member_role, g.name as group_name, g.created_by
     FROM group_members gm
     JOIN groups g ON g.id = gm.group_id
     WHERE gm.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Create a new group (student becomes leader)
 */
export const createGroup = async (name, userId) => {
  // Check if student already in a group
  const existing = await findUserMembership(userId);
  if (existing) {
    throw ApiError.conflict('You are already in a group');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: groupRows } = await client.query(
      `INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *`,
      [name, userId]
    );
    const group = groupRows[0];

    await client.query(
      `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'leader')`,
      [group.id, userId]
    );

    await client.query('COMMIT');
    return group;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get user's group with all members
 */
export const getMyGroup = async (userId) => {
  const membership = await findUserMembership(userId);
  if (!membership) return null;

  const { rows: group } = await query(
    'SELECT * FROM groups WHERE id = $1',
    [membership.group_id]
  );

  const { rows: members } = await query(
    `SELECT u.id, u.name, u.email, u.student_id, gm.member_role, gm.joined_at
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY gm.member_role ASC, gm.joined_at ASC`,
    [membership.group_id]
  );

  return {
    ...group[0],
    my_role: membership.member_role,
    members,
  };
};

/**
 * Add a member to the leader's group by email or student_id
 */
export const addMember = async (leaderId, identifier) => {
  // Verify the leader is actually a leader
  const membership = await findUserMembership(leaderId);
  if (!membership) throw ApiError.notFound('You are not in a group');
  if (membership.member_role !== 'leader') throw ApiError.forbidden('Only the group leader can add members');

  // Find user by email or student_id
  const { rows: users } = await query(
    'SELECT id, name, email, student_id, role FROM users WHERE email = $1 OR student_id = $1',
    [identifier]
  );
  if (users.length === 0) throw ApiError.notFound('User not found with that email or student ID');

  const targetUser = users[0];

  // Cannot add admins
  if (targetUser.role === 'admin') throw ApiError.badRequest('Cannot add an admin to a group');

  // Check if already in a group
  const targetMembership = await findUserMembership(targetUser.id);
  if (targetMembership) throw ApiError.conflict('User is already in a group');

  await query(
    `INSERT INTO group_members (group_id, user_id, member_role) VALUES ($1, $2, 'member')`,
    [membership.group_id, targetUser.id]
  );

  return { id: targetUser.id, name: targetUser.name, email: targetUser.email, student_id: targetUser.student_id, member_role: 'member' };
};

/**
 * Remove a member from the leader's group
 */
export const removeMember = async (leaderId, targetUserId) => {
  const membership = await findUserMembership(leaderId);
  if (!membership) throw ApiError.notFound('You are not in a group');
  if (membership.member_role !== 'leader') throw ApiError.forbidden('Only the group leader can remove members');

  if (leaderId === targetUserId) throw ApiError.badRequest('Leader cannot remove themselves. Delete the group instead.');

  const targetMembership = await findUserMembership(targetUserId);
  if (!targetMembership || targetMembership.group_id !== membership.group_id) {
    throw ApiError.notFound('User is not in your group');
  }

  await query(
    'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
    [membership.group_id, targetUserId]
  );
};

/**
 * Delete the group (leader only, must be sole member)
 */
export const deleteGroup = async (leaderId) => {
  const membership = await findUserMembership(leaderId);
  if (!membership) throw ApiError.notFound('You are not in a group');
  if (membership.member_role !== 'leader') throw ApiError.forbidden('Only the group leader can delete the group');

  // Check member count
  const { rows } = await query(
    'SELECT COUNT(*) as count FROM group_members WHERE group_id = $1',
    [membership.group_id]
  );

  if (parseInt(rows[0].count, 10) > 1) {
    throw ApiError.badRequest('Cannot delete group with other members. Remove them first.');
  }

  // Delete group (cascading will delete group_members, assignment_groups, submissions)
  await query('DELETE FROM groups WHERE id = $1', [membership.group_id]);
};

/**
 * Get all groups with members (admin)
 */
export const getAllGroups = async () => {
  const { rows: groups } = await query(
    `SELECT g.*, u.name as creator_name,
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
     FROM groups g
     JOIN users u ON u.id = g.created_by
     ORDER BY g.created_at DESC`
  );

  // Get members for all groups in one query
  const { rows: allMembers } = await query(
    `SELECT gm.group_id, u.id, u.name, u.email, u.student_id, gm.member_role, gm.joined_at
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     ORDER BY gm.member_role ASC, gm.joined_at ASC`
  );

  const membersByGroup = {};
  for (const member of allMembers) {
    if (!membersByGroup[member.group_id]) membersByGroup[member.group_id] = [];
    membersByGroup[member.group_id].push(member);
  }

  return groups.map((g) => ({
    ...g,
    members: membersByGroup[g.id] || [],
  }));
};
