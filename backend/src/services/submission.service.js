import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Confirm submission for a student's group on an assignment
 */
export const confirmSubmission = async (assignmentId, userId) => {
  // Get student's group
  const { rows: membership } = await query(
    'SELECT group_id FROM group_members WHERE user_id = $1',
    [userId]
  );
  if (membership.length === 0) throw ApiError.badRequest('You must be in a group to confirm a submission');

  const groupId = membership[0].group_id;

  // Check assignment exists
  const { rows: assignments } = await query(
    'SELECT * FROM assignments WHERE id = $1',
    [assignmentId]
  );
  if (assignments.length === 0) throw ApiError.notFound('Assignment not found');

  const assignment = assignments[0];

  // Check assignment is targeted at this group
  if (assignment.target === 'groups') {
    const { rows: ag } = await query(
      'SELECT 1 FROM assignment_groups WHERE assignment_id = $1 AND group_id = $2',
      [assignmentId, groupId]
    );
    if (ag.length === 0) throw ApiError.forbidden('This assignment is not targeted at your group');
  }

  // Check not already submitted
  const { rows: existing } = await query(
    'SELECT id FROM submissions WHERE assignment_id = $1 AND group_id = $2',
    [assignmentId, groupId]
  );
  if (existing.length > 0) throw ApiError.conflict('Submission already confirmed for this assignment');

  // Create submission
  const { rows } = await query(
    `INSERT INTO submissions (assignment_id, group_id, confirmed_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [assignmentId, groupId, userId]
  );

  return rows[0];
};

/**
 * Student progress: X of Y assignments confirmed, per-assignment status
 */
export const getGroupProgress = async (userId) => {
  const { rows: membership } = await query(
    'SELECT group_id FROM group_members WHERE user_id = $1',
    [userId]
  );
  if (membership.length === 0) throw ApiError.badRequest('You are not in a group');

  const groupId = membership[0].group_id;

  // Get all assignments targeted at this group
  const { rows } = await query(
    `SELECT a.id, a.title, a.due_date,
            s.id as submission_id, s.confirmed_at,
            cu.name as confirmed_by_name
     FROM assignments a
     LEFT JOIN submissions s ON s.assignment_id = a.id AND s.group_id = $1
     LEFT JOIN users cu ON cu.id = s.confirmed_by
     WHERE a.target = 'all'
        OR (a.target = 'groups' AND EXISTS (
             SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id = a.id AND ag.group_id = $1
           ))
     ORDER BY a.due_date ASC`,
    [groupId]
  );

  const total = rows.length;
  const confirmed = rows.filter((r) => r.submission_id).length;
  const percentage = total === 0 ? 0 : Math.round((confirmed / total) * 100);

  const assignments = rows.map((r) => {
    let status;
    if (r.submission_id) {
      status = 'submitted';
    } else if (new Date(r.due_date) < new Date()) {
      status = 'overdue';
    } else {
      status = 'pending';
    }
    return {
      id: r.id,
      title: r.title,
      due_date: r.due_date,
      status,
      confirmed_at: r.confirmed_at,
      confirmed_by_name: r.confirmed_by_name,
    };
  });

  return { total, confirmed, percentage, assignments };
};

/**
 * Admin: group-wise status for an assignment
 */
export const getAssignmentGroupStatus = async (assignmentId) => {
  const { rows: assignments } = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  if (assignments.length === 0) throw ApiError.notFound('Assignment not found');

  const assignment = assignments[0];

  let groupsQuery;
  if (assignment.target === 'all') {
    groupsQuery = `
      SELECT g.id, g.name,
             s.id as submission_id, s.confirmed_at,
             cu.name as confirmed_by_name
      FROM groups g
      LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1
      LEFT JOIN users cu ON cu.id = s.confirmed_by
      ORDER BY g.name ASC`;
  } else {
    groupsQuery = `
      SELECT g.id, g.name,
             s.id as submission_id, s.confirmed_at,
             cu.name as confirmed_by_name
      FROM assignment_groups ag
      JOIN groups g ON g.id = ag.group_id
      LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1
      LEFT JOIN users cu ON cu.id = s.confirmed_by
      WHERE ag.assignment_id = $1
      ORDER BY g.name ASC`;
  }

  const { rows } = await query(groupsQuery, [assignmentId]);

  return rows.map((r) => ({
    group_id: r.id,
    group_name: r.name,
    status: r.submission_id ? 'submitted' : (new Date(assignment.due_date) < new Date() ? 'overdue' : 'pending'),
    confirmed_at: r.confirmed_at,
    confirmed_by_name: r.confirmed_by_name,
  }));
};

/**
 * Admin: student-wise status for an assignment
 */
export const getAssignmentStudentStatus = async (assignmentId) => {
  const { rows: assignments } = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  if (assignments.length === 0) throw ApiError.notFound('Assignment not found');

  const assignment = assignments[0];

  let studentsQuery;
  if (assignment.target === 'all') {
    studentsQuery = `
      SELECT u.id, u.name, u.email, u.student_id,
             g.name as group_name, g.id as group_id,
             gm.member_role,
             s.id as submission_id, s.confirmed_at,
             cu.name as confirmed_by_name
      FROM users u
      LEFT JOIN group_members gm ON gm.user_id = u.id
      LEFT JOIN groups g ON g.id = gm.group_id
      LEFT JOIN submissions s ON s.group_id = gm.group_id AND s.assignment_id = $1
      LEFT JOIN users cu ON cu.id = s.confirmed_by
      WHERE u.role = 'student'
      ORDER BY g.name ASC NULLS LAST, u.name ASC`;
  } else {
    studentsQuery = `
      SELECT u.id, u.name, u.email, u.student_id,
             g.name as group_name, g.id as group_id,
             gm.member_role,
             s.id as submission_id, s.confirmed_at,
             cu.name as confirmed_by_name
      FROM assignment_groups ag
      JOIN groups g ON g.id = ag.group_id
      JOIN group_members gm ON gm.group_id = g.id
      JOIN users u ON u.id = gm.user_id
      LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1
      LEFT JOIN users cu ON cu.id = s.confirmed_by
      WHERE ag.assignment_id = $1
      ORDER BY g.name ASC, u.name ASC`;
  }

  const { rows } = await query(studentsQuery, [assignmentId]);

  return rows.map((r) => ({
    user_id: r.id,
    name: r.name,
    email: r.email,
    student_id: r.student_id,
    group_id: r.group_id,
    group_name: r.group_name,
    member_role: r.member_role,
    status: r.submission_id ? 'submitted' : (new Date(assignment.due_date) < new Date() ? 'overdue' : 'pending'),
    confirmed_at: r.confirmed_at,
    confirmed_by_name: r.confirmed_by_name,
  }));
};
