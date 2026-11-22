import { query } from '../config/db.js';

/**
 * Summary analytics: total students, groups, assignments, overall completion %
 */
export const getSummary = async () => {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
      (SELECT COUNT(*) FROM groups) as total_groups,
      (SELECT COUNT(*) FROM assignments) as total_assignments,
      (SELECT COUNT(*) FROM submissions) as total_submissions
  `);

  const { total_students, total_groups, total_assignments, total_submissions } = rows[0];

  // Overall completion: submissions / (assignments × groups that should submit)
  const { rows: targetRows } = await query(`
    SELECT
      COALESCE(SUM(
        CASE a.target
          WHEN 'all' THEN (SELECT COUNT(*) FROM groups)
          WHEN 'groups' THEN (SELECT COUNT(*) FROM assignment_groups ag WHERE ag.assignment_id = a.id)
        END
      ), 0) as total_expected
    FROM assignments a
  `);

  const totalExpected = parseInt(targetRows[0].total_expected, 10);
  const completionPct = totalExpected === 0 ? 0 : Math.round((parseInt(total_submissions, 10) / totalExpected) * 100);

  return {
    total_students: parseInt(total_students, 10),
    total_groups: parseInt(total_groups, 10),
    total_assignments: parseInt(total_assignments, 10),
    total_submissions: parseInt(total_submissions, 10),
    completion_percentage: completionPct,
  };
};

/**
 * Per-assignment completion %
 */
export const getPerAssignmentCompletion = async () => {
  const { rows } = await query(`
    SELECT a.id, a.title, a.due_date, a.target,
      (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submitted_count,
      CASE a.target
        WHEN 'all' THEN (SELECT COUNT(*) FROM groups)
        WHEN 'groups' THEN (SELECT COUNT(*) FROM assignment_groups ag WHERE ag.assignment_id = a.id)
      END as target_count
    FROM assignments a
    ORDER BY a.created_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    due_date: r.due_date,
    target: r.target,
    submitted_count: parseInt(r.submitted_count, 10),
    target_count: parseInt(r.target_count, 10),
    completion_percentage: parseInt(r.target_count, 10) === 0
      ? 0
      : Math.round((parseInt(r.submitted_count, 10) / parseInt(r.target_count, 10)) * 100),
  }));
};

/**
 * Per-group completion %
 */
export const getPerGroupCompletion = async () => {
  const { rows } = await query(`
    SELECT g.id, g.name,
      (SELECT COUNT(*) FROM submissions s WHERE s.group_id = g.id) as submitted_count,
      (
        SELECT COUNT(*)
        FROM assignments a
        WHERE a.target = 'all'
           OR (a.target = 'groups' AND EXISTS (
                SELECT 1 FROM assignment_groups ag WHERE ag.assignment_id = a.id AND ag.group_id = g.id
              ))
      ) as total_assignments
    FROM groups g
    ORDER BY g.name ASC
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    submitted_count: parseInt(r.submitted_count, 10),
    total_assignments: parseInt(r.total_assignments, 10),
    completion_percentage: parseInt(r.total_assignments, 10) === 0
      ? 0
      : Math.round((parseInt(r.submitted_count, 10) / parseInt(r.total_assignments, 10)) * 100),
  }));
};
