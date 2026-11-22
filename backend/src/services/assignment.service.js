import { query, pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create assignment with optional group targeting
 */
export const createAssignment = async (data, adminId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, target, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.title, data.description || null, data.due_date, data.onedrive_link, data.target, adminId]
    );
    const assignment = rows[0];

    if (data.target === 'groups' && data.group_ids?.length) {
      const values = data.group_ids
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ');
      await client.query(
        `INSERT INTO assignment_groups (assignment_id, group_id) VALUES ${values}`,
        [assignment.id, ...data.group_ids]
      );
    }

    await client.query('COMMIT');

    // Fetch group_ids if targeted
    if (data.target === 'groups') {
      const { rows: ag } = await query(
        'SELECT group_id FROM assignment_groups WHERE assignment_id = $1',
        [assignment.id]
      );
      assignment.group_ids = ag.map((r) => r.group_id);
    }

    return assignment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update assignment
 */
export const updateAssignment = async (id, data) => {
  const existing = await query('SELECT * FROM assignments WHERE id = $1', [id]);
  if (existing.rows.length === 0) throw ApiError.notFound('Assignment not found');

  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of ['title', 'description', 'due_date', 'onedrive_link', 'target']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  fields.push(`updated_at = NOW()`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (fields.length > 1) { // more than just updated_at
      values.push(id);
      await client.query(
        `UPDATE assignments SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    // Update target groups
    const target = data.target || existing.rows[0].target;
    if (target === 'groups') {
      await client.query('DELETE FROM assignment_groups WHERE assignment_id = $1', [id]);
      if (data.group_ids?.length) {
        const vals = data.group_ids
          .map((_, i) => `($1, $${i + 2})`)
          .join(', ');
        await client.query(
          `INSERT INTO assignment_groups (assignment_id, group_id) VALUES ${vals}`,
          [id, ...data.group_ids]
        );
      }
    } else if (data.target === 'all') {
      // Changed from groups to all — remove group assignments
      await client.query('DELETE FROM assignment_groups WHERE assignment_id = $1', [id]);
    }

    await client.query('COMMIT');

    const { rows } = await query('SELECT * FROM assignments WHERE id = $1', [id]);
    const assignment = rows[0];

    if (assignment.target === 'groups') {
      const { rows: ag } = await query(
        'SELECT group_id FROM assignment_groups WHERE assignment_id = $1',
        [id]
      );
      assignment.group_ids = ag.map((r) => r.group_id);
    }

    return assignment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Delete assignment
 */
export const deleteAssignment = async (id) => {
  const { rowCount } = await query('DELETE FROM assignments WHERE id = $1', [id]);
  if (rowCount === 0) throw ApiError.notFound('Assignment not found');
};

/**
 * Get single assignment by ID
 */
export const getAssignmentById = async (id, user = null) => {
  const { rows } = await query(
    `SELECT a.*,
            u.name as creator_name,
            (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count
     FROM assignments a
     JOIN users u ON u.id = a.created_by
     WHERE a.id = $1`,
    [id]
  );
  if (rows.length === 0) throw ApiError.notFound('Assignment not found');

  const assignment = rows[0];

  if (assignment.target === 'groups') {
    const { rows: ag } = await query(
      `SELECT ag.group_id, g.name as group_name
       FROM assignment_groups ag
       JOIN groups g ON g.id = ag.group_id
       WHERE ag.assignment_id = $1`,
      [id]
    );
    assignment.targeted_groups = ag;
  }

  // If student, attach their group's submission status
  if (user && user.role === 'student') {
    const { rows: membership } = await query(
      'SELECT group_id FROM group_members WHERE user_id = $1',
      [user.id]
    );
    if (membership.length > 0) {
      const groupId = membership[0].group_id;
      const { rows: subRows } = await query(
        `SELECT s.id, s.confirmed_at, cu.name as confirmed_by_name
         FROM submissions s
         JOIN users cu ON cu.id = s.confirmed_by
         WHERE s.assignment_id = $1 AND s.group_id = $2`,
        [id, groupId]
      );
      if (subRows.length > 0) {
        assignment.submission = subRows[0];
        assignment.status = 'submitted';
      } else {
        assignment.status = new Date(assignment.due_date) < new Date() ? 'overdue' : 'pending';
      }
    } else {
      assignment.status = new Date(assignment.due_date) < new Date() ? 'overdue' : 'pending';
    }
  }

  return assignment;
};

/**
 * List all assignments (admin view)
 */
export const listAssignmentsAdmin = async () => {
  const { rows } = await query(
    `SELECT a.*,
            u.name as creator_name,
            (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count,
            CASE a.target
              WHEN 'all' THEN (SELECT COUNT(*) FROM groups)
              WHEN 'groups' THEN (SELECT COUNT(*) FROM assignment_groups ag WHERE ag.assignment_id = a.id)
            END as total_target_groups
     FROM assignments a
     JOIN users u ON u.id = a.created_by
     ORDER BY a.created_at DESC`
  );
  return rows;
};

/**
 * List assignments for a student (targeted at their group + per-group status)
 */
export const listAssignmentsStudent = async (userId) => {
  // Get the student's group
  const { rows: membership } = await query(
    'SELECT group_id FROM group_members WHERE user_id = $1',
    [userId]
  );

  if (membership.length === 0) {
    // No group → only show 'all' assignments with no submission status
    const { rows } = await query(
      `SELECT a.*, u.name as creator_name, NULL as submission_status, NULL as confirmed_at, NULL as confirmed_by_name
       FROM assignments a
       JOIN users u ON u.id = a.created_by
       WHERE a.target = 'all'
       ORDER BY a.due_date ASC`
    );
    return rows.map((r) => ({
      ...r,
      status: new Date(r.due_date) < new Date() ? 'overdue' : 'pending',
    }));
  }

  const groupId = membership[0].group_id;

  const { rows } = await query(
    `SELECT a.*,
            u.name as creator_name,
            s.id as submission_id,
            s.confirmed_at,
            cu.name as confirmed_by_name
     FROM assignments a
     JOIN users u ON u.id = a.created_by
     LEFT JOIN submissions s ON s.assignment_id = a.id AND s.group_id = $1
     LEFT JOIN users cu ON cu.id = s.confirmed_by
     WHERE a.target = 'all'
        OR (a.target = 'groups' AND EXISTS (
             SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id = a.id AND ag.group_id = $1
           ))
     ORDER BY a.due_date ASC`,
    [groupId]
  );

  return rows.map((r) => {
    let status;
    if (r.submission_id) {
      status = 'submitted';
    } else if (new Date(r.due_date) < new Date()) {
      status = 'overdue';
    } else {
      status = 'pending';
    }
    return { ...r, status };
  });
};
