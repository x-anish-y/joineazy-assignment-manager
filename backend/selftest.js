// Self-test script: starts server, tests main flows, then exits
import http from 'http';
import app from './src/app.js';
import { pool } from './src/config/db.js';

const PORT = 5099; // use a different port for testing
let server;
let passed = 0;
let failed = 0;

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

async function run() {
  server = app.listen(PORT, async () => {
    console.log(`Test server on port ${PORT}\n`);

    try {
      // ── Health ───────────────────────────────────────────
      console.log('=== Health ===');
      const health = await req('GET', '/health');
      assert('GET /health → 200', health.status === 200);

      // ── Auth: Register ──────────────────────────────────
      console.log('\n=== Auth ===');
      const reg = await req('POST', '/auth/register', {
        name: 'Test User', email: 'testflow@joineazy.test', student_id: 'TFLOW1', password: 'Test@123'
      });
      assert('Register student → 201', reg.status === 201);
      const testToken = reg.body.data?.token;
      const testUserId = reg.body.data?.user?.id;

      // Register duplicate
      const regDup = await req('POST', '/auth/register', {
        name: 'Test User', email: 'testflow@joineazy.test', student_id: 'TFLOW1', password: 'Test@123'
      });
      assert('Duplicate email → 409', regDup.status === 409);

      // Login
      const login = await req('POST', '/auth/login', {
        email: 'stu1@joineazy.test', password: 'Student@123'
      });
      assert('Login student → 200', login.status === 200);
      const stu1Token = login.body.data?.token;

      const adminLogin = await req('POST', '/auth/login', {
        email: 'prof@joineazy.test', password: 'Admin@123'
      });
      assert('Login admin → 200', adminLogin.status === 200);
      const adminToken = adminLogin.body.data?.token;

      // Me
      const me = await req('GET', '/auth/me', null, stu1Token);
      assert('GET /auth/me → 200 with correct email', me.status === 200 && me.body.data?.user?.email === 'stu1@joineazy.test');

      // ── Groups ──────────────────────────────────────────
      console.log('\n=== Groups ===');

      // Test user creates a group
      const createGrp = await req('POST', '/groups', { name: 'Test Group' }, testToken);
      assert('Create group → 201', createGrp.status === 201);

      // Try creating another (already in a group)
      const createGrp2 = await req('POST', '/groups', { name: 'Another' }, testToken);
      assert('Create 2nd group → 409', createGrp2.status === 409);

      // Get my group
      const myGrp = await req('GET', '/groups/me', null, testToken);
      assert('Get my group → 200', myGrp.status === 200 && myGrp.body.data?.group?.name === 'Test Group');

      // ── Student hitting admin route → 403 ───────────────
      console.log('\n=== Role checks ===');
      const stuAssignment = await req('POST', '/assignments', {
        title: 'Hack', description: 'x', due_date: '2027-01-01', onedrive_link: 'https://onedrive.live.com/x', target: 'all'
      }, stu1Token);
      assert('Student POST /assignments → 403', stuAssignment.status === 403);

      // ── Assignments (admin) ─────────────────────────────
      console.log('\n=== Assignments ===');
      const createAsgn = await req('POST', '/assignments', {
        title: 'Self-Test Assignment', description: 'Testing', due_date: '2027-06-01T00:00:00Z',
        onedrive_link: 'https://onedrive.live.com/selftest', target: 'all'
      }, adminToken);
      assert('Admin create assignment → 201', createAsgn.status === 201);
      const asgnId = createAsgn.body.data?.assignment?.id;

      const listAsgn = await req('GET', '/assignments', null, adminToken);
      assert('Admin list assignments → 200', listAsgn.status === 200);

      const stuList = await req('GET', '/assignments', null, stu1Token);
      assert('Student list assignments → 200 (sees targeted)', stuList.status === 200);

      // ── Submissions ─────────────────────────────────────
      console.log('\n=== Submissions ===');

      // stu1 confirms the self-test assignment (stu1 is in Alpha Team from seed)
      const confirm1 = await req('POST', `/assignments/${asgnId}/confirm`, null, stu1Token);
      assert('Confirm submission → 201', confirm1.status === 201);

      // Confirm again → 409
      const confirm2 = await req('POST', `/assignments/${asgnId}/confirm`, null, stu1Token);
      assert('Duplicate confirm → 409', confirm2.status === 409);

      // ── Student Progress ────────────────────────────────
      console.log('\n=== Student Progress ===');
      const progress = await req('GET', '/groups/me/progress', null, stu1Token);
      assert('Group progress → 200', progress.status === 200 && progress.body.data?.progress?.total > 0);

      // ── Admin Tracking ──────────────────────────────────
      console.log('\n=== Admin Tracking ===');
      const grpStatus = await req('GET', `/admin/assignments/${asgnId}/groups`, null, adminToken);
      assert('Group-wise status → 200', grpStatus.status === 200);

      const stuStatus = await req('GET', `/admin/assignments/${asgnId}/students`, null, adminToken);
      assert('Student-wise status → 200', stuStatus.status === 200);

      const allGrps = await req('GET', '/admin/groups', null, adminToken);
      assert('Admin all groups → 200', allGrps.status === 200);

      // ── Analytics ───────────────────────────────────────
      console.log('\n=== Analytics ===');
      const summary = await req('GET', '/admin/analytics/summary', null, adminToken);
      assert('Summary → 200', summary.status === 200 && summary.body.data?.summary?.total_assignments > 0);

      const perAsgn = await req('GET', '/admin/analytics/assignments', null, adminToken);
      assert('Per-assignment → 200', perAsgn.status === 200);

      const perGrp = await req('GET', '/admin/analytics/groups', null, adminToken);
      assert('Per-group → 200', perGrp.status === 200);

      // ── Cleanup: delete test user's group and test assignment ──
      // Delete test group (need to be sole member first — already is)
      await req('DELETE', '/groups/me', null, testToken);
      await req('DELETE', `/assignments/${asgnId}`, null, adminToken);
      // Delete test user
      await pool.query("DELETE FROM users WHERE email = 'testflow@joineazy.test'");

    } catch (err) {
      console.error('\n💥 Test error:', err);
      failed++;
    }

    console.log(`\n${'='.repeat(40)}`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(40));

    server.close(async () => {
      await pool.end();
      process.exit(failed > 0 ? 1 : 0);
    });
  });
}

run();
