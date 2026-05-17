// QA test suite — works in Node.js and browser (pure fetch, no Node APIs)

export interface TestResult {
  name: string;
  passed: boolean;
  reason?: string;
  ms: number;
}

export interface Suite {
  category: string;
  tests: TestResult[];
}

const API = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000')
  : 'http://localhost:5000';

const APP = 'http://localhost:3000';

// ── Helpers ────────────────────────────────────────────────────────────────

async function check(name: string, fn: () => Promise<void>): Promise<TestResult> {
  const t0 = Date.now();
  try {
    await fn();
    return { name, passed: true, ms: Date.now() - t0 };
  } catch (e: unknown) {
    return { name, passed: false, reason: e instanceof Error ? e.message : String(e), ms: Date.now() - t0 };
  }
}

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertHas<T extends object>(obj: T, key: string): void {
  assert(key in obj && (obj as Record<string, unknown>)[key] !== undefined, `Missing field: ${key}`);
}

async function json(res: Response): Promise<Record<string, unknown>> {
  try { return await res.json(); } catch { return {}; }
}

// ── Token helpers ──────────────────────────────────────────────────────────

async function getUserToken(): Promise<string> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'marco@pacificplumbing.com', password: 'password123' }),
  });
  assert(res.ok, `Login failed with status ${res.status}`);
  const data = await json(res);
  assert(typeof data.access_token === 'string' && data.access_token.length > 10, 'No valid access_token');
  return data.access_token as string;
}

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${API}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin@123' }),
  });
  assert(res.ok, `Admin login failed with status ${res.status}`);
  const data = await json(res);
  assert(typeof data.access_token === 'string' && data.access_token.length > 10, 'No valid access_token');
  return data.access_token as string;
}

function auth(token: string): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── Auth tests ─────────────────────────────────────────────────────────────

async function runAuthTests(): Promise<Suite> {
  return {
    category: 'Auth',
    tests: [
      await check('Login with correct credentials returns 200 + token', async () => {
        const token = await getUserToken();
        assert(token.length > 20, 'Token too short');
      }),
      await check('Login with wrong password returns 401', async () => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'marco@pacificplumbing.com', password: 'wrongpassword' }),
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
      }),
      await check('Login with empty body returns 401', async () => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
      }),
      await check('Register with existing email returns 409', async () => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'marco@pacificplumbing.com', password: 'password123' }),
        });
        assert(res.status === 409, `Expected 409, got ${res.status}`);
      }),
      await check('Register with short password returns 400', async () => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'new@example.com', password: 'short' }),
        });
        assert(res.status === 400, `Expected 400, got ${res.status}`);
      }),
      await check('Protected route without token returns 401', async () => {
        const res = await fetch(`${API}/api/dashboard/stats`);
        assert(res.status === 401, `Expected 401, got ${res.status}`);
      }),
    ],
  };
}

// ── Dashboard tests ────────────────────────────────────────────────────────

async function runDashboardTests(token: string): Promise<Suite> {
  return {
    category: 'Dashboard',
    tests: [
      await check('GET /api/dashboard/stats returns 200', async () => {
        const res = await fetch(`${API}/api/dashboard/stats`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Dashboard stats has all required fields', async () => {
        const res = await fetch(`${API}/api/dashboard/stats`, { headers: auth(token) });
        const data = await json(res);
        for (const key of ['missed_calls_today', 'sms_sent_today', 'bookings_count', 'revenue_recovered', 'calls_this_week', 'recent_calls']) {
          assertHas(data, key);
        }
      }),
      await check('calls_this_week has exactly 7 entries', async () => {
        const res = await fetch(`${API}/api/dashboard/stats`, { headers: auth(token) });
        const data = await json(res);
        const week = data.calls_this_week as unknown[];
        assert(Array.isArray(week) && week.length === 7, `Expected 7-item array, got ${JSON.stringify(week?.length)}`);
      }),
      await check('recent_calls is an array', async () => {
        const res = await fetch(`${API}/api/dashboard/stats`, { headers: auth(token) });
        const data = await json(res);
        assert(Array.isArray(data.recent_calls), 'recent_calls is not an array');
      }),
      await check('Dashboard response is under 3 seconds', async () => {
        const t0 = Date.now();
        const res = await fetch(`${API}/api/dashboard/stats`, { headers: auth(token) });
        assert(res.ok, `Request failed: ${res.status}`);
        assert(Date.now() - t0 < 3000, 'Response took over 3 seconds');
      }),
    ],
  };
}

// ── Call log tests ─────────────────────────────────────────────────────────

async function runCallLogTests(token: string): Promise<Suite> {
  return {
    category: 'Call Log',
    tests: [
      await check('GET /api/calls returns 200 with calls array', async () => {
        const res = await fetch(`${API}/api/calls`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        assert(Array.isArray(data.calls), 'calls field is not an array');
        assertHas(data, 'total');
      }),
      await check('GET /api/calls?status=missed returns only missed calls', async () => {
        const res = await fetch(`${API}/api/calls?status=missed`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        const calls = data.calls as Array<Record<string, unknown>>;
        assert(Array.isArray(calls), 'calls is not an array');
        for (const c of calls) {
          assert(c.call_status === 'missed', `Found non-missed call: ${c.call_status}`);
        }
      }),
      await check('GET /api/calls?emergency=true returns 200', async () => {
        const res = await fetch(`${API}/api/calls?emergency=true`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        assert(Array.isArray(data.calls), 'calls is not an array');
      }),
      await check('Call log entries have required fields', async () => {
        const res = await fetch(`${API}/api/calls`, { headers: auth(token) });
        const data = await json(res);
        const calls = data.calls as Array<Record<string, unknown>>;
        if (calls.length > 0) {
          const c = calls[0];
          for (const f of ['id', 'caller_number', 'call_status', 'created_at']) {
            assertHas(c, f);
          }
        }
      }),
    ],
  };
}

// ── SMS inbox tests ────────────────────────────────────────────────────────

async function runSmsTests(token: string): Promise<Suite> {
  return {
    category: 'SMS Inbox',
    tests: [
      await check('GET /api/sms/conversations returns 200', async () => {
        const res = await fetch(`${API}/api/sms/conversations`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Conversations response has conversations array and total', async () => {
        const res = await fetch(`${API}/api/sms/conversations`, { headers: auth(token) });
        const data = await json(res);
        assertHas(data, 'conversations');
        assertHas(data, 'total');
        assert(Array.isArray(data.conversations), 'conversations is not an array');
      }),
      await check('Conversation entries have required fields', async () => {
        const res = await fetch(`${API}/api/sms/conversations`, { headers: auth(token) });
        const data = await json(res);
        const convs = data.conversations as Array<Record<string, unknown>>;
        if (convs.length > 0) {
          const c = convs[0];
          for (const f of ['caller_number', 'messages', 'call_count', 'last_call_at']) {
            assertHas(c, f);
          }
        }
      }),
      await check('GET /api/sms returns 200 with sms array', async () => {
        const res = await fetch(`${API}/api/sms`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        assertHas(data, 'sms');
        assert(Array.isArray(data.sms), 'sms is not an array');
      }),
    ],
  };
}

// ── Settings tests ─────────────────────────────────────────────────────────

async function runSettingsTests(token: string): Promise<Suite> {
  return {
    category: 'Settings',
    tests: [
      await check('GET /api/settings returns 200', async () => {
        const res = await fetch(`${API}/api/settings`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Settings has required fields', async () => {
        const res = await fetch(`${API}/api/settings`, { headers: auth(token) });
        const data = await json(res);
        for (const f of ['id', 'name', 'sms_message', 'business_hours', 'emergency_keywords']) {
          assertHas(data, f);
        }
      }),
      await check('PUT /api/settings returns 200', async () => {
        const getRes = await fetch(`${API}/api/settings`, { headers: auth(token) });
        const current = await json(getRes) as Record<string, unknown>;
        const res = await fetch(`${API}/api/settings`, {
          method: 'PUT',
          headers: auth(token),
          body: JSON.stringify({ name: current.name }),
        });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Settings does not include billing data', async () => {
        const res = await fetch(`${API}/api/settings`, { headers: auth(token) });
        const data = await json(res);
        assert(!('plan' in data), 'Settings response should not include plan (belongs in /api/billing)');
        assert(!('price' in data), 'Settings response should not include price (belongs in /api/billing)');
      }),
    ],
  };
}

// ── Billing tests ──────────────────────────────────────────────────────────

async function runBillingTests(token: string): Promise<Suite> {
  return {
    category: 'Billing',
    tests: [
      await check('GET /api/billing returns 200', async () => {
        const res = await fetch(`${API}/api/billing`, { headers: auth(token) });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Billing response has plan, price, all_plans', async () => {
        const res = await fetch(`${API}/api/billing`, { headers: auth(token) });
        const data = await json(res);
        for (const f of ['plan', 'price', 'all_plans']) {
          assertHas(data, f);
        }
      }),
      await check('all_plans has starter ($29), growth ($79), pro ($149)', async () => {
        const res = await fetch(`${API}/api/billing`, { headers: auth(token) });
        const data = await json(res);
        const plans = data.all_plans as Record<string, { price: number }>;
        assert(plans.starter?.price === 29, `Starter price should be 29, got ${plans.starter?.price}`);
        assert(plans.growth?.price === 79, `Growth price should be 79, got ${plans.growth?.price}`);
        assert(plans.pro?.price === 149, `Pro price should be 149, got ${plans.pro?.price}`);
      }),
      await check('Current plan is a valid plan name', async () => {
        const res = await fetch(`${API}/api/billing`, { headers: auth(token) });
        const data = await json(res);
        const valid = ['starter', 'growth', 'pro'];
        assert(valid.includes(data.plan as string), `Invalid plan: ${data.plan}`);
      }),
    ],
  };
}

// ── Admin tests ────────────────────────────────────────────────────────────

async function runAdminTests(adminToken: string): Promise<Suite> {
  return {
    category: 'Admin',
    tests: [
      await check('Admin login with correct credentials returns 200 + token', async () => {
        const token = await getAdminToken();
        assert(token.length > 20, 'Token too short');
      }),
      await check('Admin login with wrong password returns 401', async () => {
        const res = await fetch(`${API}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@gmail.com', password: 'wrongpassword' }),
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
      }),
      await check('GET /api/admin/dashboard returns 200', async () => {
        const res = await fetch(`${API}/api/admin/dashboard`, { headers: auth(adminToken) });
        assert(res.ok, `Expected 200, got ${res.status}`);
      }),
      await check('Admin dashboard has mrr, active_businesses, total_users', async () => {
        const res = await fetch(`${API}/api/admin/dashboard`, { headers: auth(adminToken) });
        const data = await json(res);
        for (const f of ['mrr', 'active_businesses', 'total_users', 'sms_sent_30d', 'calls_today']) {
          assertHas(data, f);
        }
      }),
      await check('GET /api/admin/businesses returns 200 with businesses array', async () => {
        const res = await fetch(`${API}/api/admin/businesses`, { headers: auth(adminToken) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        assert(Array.isArray(data.businesses), 'businesses is not an array');
        assertHas(data, 'total');
      }),
      await check('GET /api/admin/revenue returns 200 with mrr and arr', async () => {
        const res = await fetch(`${API}/api/admin/revenue`, { headers: auth(adminToken) });
        assert(res.ok, `Expected 200, got ${res.status}`);
        const data = await json(res);
        assertHas(data, 'mrr');
        assertHas(data, 'arr');
      }),
      await check('Admin route rejects user token', async () => {
        const userToken = await getUserToken();
        const res = await fetch(`${API}/api/admin/dashboard`, { headers: auth(userToken) });
        assert(res.status === 403, `Expected 403, got ${res.status}`);
      }),
    ],
  };
}

// ── Navigation tests ───────────────────────────────────────────────────────

async function runNavigationTests(): Promise<Suite> {
  const routes = [
    '/',
    '/login',
    '/dashboard',
    '/inbox',
    '/settings',
    '/billing',
    '/admin/login',
    '/admin/dashboard',
    '/admin/businesses',
  ];

  const tests: TestResult[] = await Promise.all(
    routes.map(route =>
      check(`${route} returns 200`, async () => {
        const res = await fetch(`${APP}${route}`);
        assert(res.ok, `Expected 200, got ${res.status}`);
      })
    )
  );

  return { category: 'Navigation', tests };
}

// ── Main ───────────────────────────────────────────────────────────────────

export async function runAllTests(): Promise<Suite[]> {
  let userToken = '';
  let adminToken = '';

  try { userToken = await getUserToken(); } catch { /* individual auth tests will surface the error */ }
  try { adminToken = await getAdminToken(); } catch { /* individual admin tests will surface the error */ }

  return [
    await runAuthTests(),
    await runDashboardTests(userToken),
    await runCallLogTests(userToken),
    await runSmsTests(userToken),
    await runSettingsTests(userToken),
    await runBillingTests(userToken),
    await runAdminTests(adminToken),
    await runNavigationTests(),
  ];
}
