/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness intercepts server imports without contacting Supabase. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(file, mocks) {
  const filename = path.resolve(__dirname, '..', file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(mocks, id) ? mocks[id] : original(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return mod.exports;
}
const navigation = { redirect(url) { throw new Error(`redirect:${url}`); } };

test('admin authorization rejects anonymous, inactive, missing and forbidden profiles', async () => {
  for (const scenario of [
    { user: null, profile: null, destination: '/login?error=inactive' },
    { user: { id: 'u' }, profile: null, destination: '/login?error=inactive' },
    { user: { id: 'u' }, profile: { role: 'administrator', is_active: false }, destination: '/login?error=inactive' },
    { user: { id: 'u' }, profile: { role: 'spieler', is_active: true }, destination: '/admin?error=forbidden' },
    { user: { id: 'u' }, profile: { role: 'administrator', is_active: true } },
  ]) {
    const client = {
      auth: { getUser: async () => ({ data: { user: scenario.user } }) },
      from(table) {
        assert.equal(table, 'user_profiles');
        const q = { select() { return q; }, eq(key, value) { assert.equal(key, 'id'); assert.equal(value, 'u'); return q; },
          maybeSingle: async () => ({ data: scenario.profile, error: null }) };
        return q;
      },
    };
    const roles = load('lib/auth/roles.ts', { 'next/navigation': navigation, '../supabase/server': { createClient: async () => client } });
    if (scenario.destination) await assert.rejects(roles.requireRole(['administrator']), { message: `redirect:${scenario.destination}` });
    else assert.equal(await roles.requireRole(['administrator']), scenario.profile);
  }
});

test('login handles missing/invalid credentials, routes roles, and logout signs out', async () => {
  let calls = 0, fail = false, role = 'spieler', signedOut = false;
  const client = {
    auth: {
      signInWithPassword: async input => { calls++; assert.deepEqual(input, { email: 'member@example.test', password: 'test-password' }); return { error: fail ? new Error('invalid') : null }; },
      getUser: async () => ({ data: { user: { id: 'u' } } }),
      signOut: async () => { signedOut = true; },
    },
    from() { const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: { role } }) }; return q; },
  };
  const actions = load('app/login/actions.ts', { 'next/navigation': navigation, '../../lib/supabase/server': { createClient: async () => client } });
  assert.ok((await actions.login({}, new FormData())).error);
  assert.equal(calls, 0);
  const form = new FormData(); form.set('email', ' member@example.test '); form.set('password', 'test-password');
  fail = true; assert.ok((await actions.login({}, form)).error);
  fail = false; await assert.rejects(actions.login({}, form), { message: 'redirect:/spielerportal' });
  role = 'administrator'; await assert.rejects(actions.login({}, form), { message: 'redirect:/admin' });
  await assert.rejects(actions.logout(), { message: 'redirect:/login' }); assert.equal(signedOut, true);
});

test('Supabase proxy validates the user and forwards refreshed cookies to request and response', async () => {
  const { NextRequest } = require('next/server');
  const request = new NextRequest('http://localhost/admin', { headers: { cookie: 'existing=value' } });
  let validated = false;
  const proxy = load('lib/supabase/proxy.ts', { '@supabase/ssr': {
    createServerClient(_url, _key, options) {
      assert.ok(options.cookies.getAll().some(c => c.name === 'existing'));
      return { auth: { getUser: async () => {
        validated = true;
        options.cookies.setAll([{ name: 'sb-test-auth-token', value: 'refreshed', options: { httpOnly: true, sameSite: 'lax', path: '/' } }]);
        return { data: { user: null }, error: null };
      } } };
    },
  } });
  const response = await proxy.updateSession(request);
  assert.equal(validated, true);
  assert.equal(request.cookies.get('sb-test-auth-token').value, 'refreshed');
  const cookie = response.cookies.get('sb-test-auth-token');
  assert.equal(cookie.value, 'refreshed'); assert.equal(cookie.httpOnly, true); assert.equal(cookie.sameSite, 'lax');
});
