#!/usr/bin/env node
/**
 * Quick production/local health check for TheChoiceList.
 * Usage:
 *   npm run setup:check
 *   SETUP_CHECK_URL=http://localhost:4321 npm run setup:check
 */

const base = (process.env.SETUP_CHECK_URL ?? 'https://thechoicelist-blogger.vercel.app').replace(
  /\/$/,
  '',
);
const healthUrl = `${base}/api/health`;

const checks = [];

function pass(label, detail) {
  checks.push({ ok: true, label, detail });
  console.log(`✅ ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail) {
  checks.push({ ok: false, label, detail });
  console.error(`❌ ${label}${detail ? ` — ${detail}` : ''}`);
}

async function checkHealth() {
  try {
    const res = await fetch(healthUrl, { headers: { Accept: 'application/json' } });
    const body = await res.json();

    if (!res.ok) {
      fail('Health endpoint', `HTTP ${res.status}: ${body.message ?? JSON.stringify(body)}`);
      return;
    }

    if (body.ok && body.mode === 'supabase') {
      pass(
        'Health endpoint',
        `${body.message} (${body.categoriesCount ?? 0} categories, ${body.publishedPostsCount ?? 0} published posts)`,
      );
    } else if (body.ok && body.mode === 'demo') {
      fail('Health endpoint', 'Still in demo mode — set Vercel env vars and redeploy');
    } else {
      fail('Health endpoint', body.message ?? 'Unexpected response');
    }
  } catch (err) {
    fail('Health endpoint', err instanceof Error ? err.message : String(err));
  }
}

async function checkEdgeFunction() {
  const fnUrl =
    process.env.DAILY_CONTENT_URL ??
    'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content';

  try {
    const res = await fetch(fnUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (res.status === 404) {
      fail('Edge Function daily-content', 'Not deployed yet (HTTP 404)');
    } else if (res.status === 401) {
      pass('Edge Function daily-content', 'Deployed (requires auth — expected)');
    } else {
      pass('Edge Function daily-content', `HTTP ${res.status}`);
    }
  } catch (err) {
    fail('Edge Function daily-content', err instanceof Error ? err.message : String(err));
  }
}

console.log(`\nTheChoiceList setup check → ${healthUrl}\n`);

await checkHealth();
await checkEdgeFunction();

const failed = checks.filter((c) => !c.ok).length;
console.log(failed === 0 ? '\nAll checks passed.\n' : `\n${failed} check(s) need attention. See docs/COMPLETE_SETUP.md\n`);
process.exit(failed === 0 ? 0 : 1);
