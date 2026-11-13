const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadRoute(file, mocks, extra = '') {
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled + extra, { exports, require: name => mocks[name] || {}, process: { env: { REPORT_DELAY_MINUTES: '0' } }, console: { error() {} }, Date, Response, Set });
  return exports;
}
async function startCase(db, expected) {
  const callbacks = [];
  const route = loadRoute('app/api/quiz/start/route.ts', {
    'next/server': { after: fn => callbacks.push(fn) },
    '@/lib/server/supabase': { getSupabase: () => db, rateLimit: async () => true, requestIp: () => 'test' },
    '@/lib/quiz': { SECTORS: [{ value: 'test' }] },
  });
  const result = await route.POST({ json: async () => ({ company: 'TEST ONLY', sector: 'test', email: 'test@example.com' }) });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), expected);
  assert.equal(callbacks.length, expected.sessionId ? 1 : 0);
}
async function deliveryCase(sendResult, consent, accepted, throws = false, configured = true) {
  const writes = [];
  let nurture = 0;
  const db = { from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { email: 'test@example.com', company: 'TEST ONLY', consent, final_score: 42, report_sent_at: null } }) }) }),
    update: value => ({ eq: async () => { writes.push(value); return { error: null }; } }),
  }) };
  const route = loadRoute('app/api/quiz/complete/route.ts', {
    '@/lib/server/supabase': { getSupabase: () => db },
    '@/lib/server/resend': { getResend: () => configured ? { emails: { send: async () => { if (throws) throw new Error('service down'); return sendResult; } } } : null, addToNurture: async () => { nurture++; } },
    '@/lib/server/quiz-report': { composeReportEmail: () => ({ score: 42, subject: 'test', html: 'test', text: 'test' }) },
  }, '\nexports.testSend = sendReportAndTag;');
  await route.testSend('test-session', {}, null);
  assert.equal(writes.length, accepted ? 1 : 0);
  if (accepted) assert.equal(writes[0].report_email_id, 'accepted-id');
  assert.equal(nurture, accepted && consent ? 1 : 0);
}
(async () => {
  const fallback = { sessionId: null, mode: 'self-assessment', emailAvailable: false };
  await startCase(null, fallback);
  await startCase({ from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'DB unavailable' } }) }) }) }) }, fallback);
  await startCase({ from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'saved-id' }, error: null }) }) }) }) }, { sessionId: 'saved-id', mode: 'saved' });
  await deliveryCase({ data: null, error: { message: 'rejected' } }, true, false);
  await deliveryCase({ data: null, error: null }, true, false);
  await deliveryCase({ data: { id: 'accepted-id' }, error: null }, true, true);
  await deliveryCase({ data: { id: 'accepted-id' }, error: null }, false, true);
  await deliveryCase(null, true, false, true);
  await deliveryCase(null, true, false, false, false);
  console.log('PASS: 3 session states and 6 email acceptance/consent cases. No external services called.');
})().catch(error => { console.error(error); process.exitCode = 1; });
