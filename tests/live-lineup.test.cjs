const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const baseRequire = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(mocks, id) ? mocks[id] : baseRequire(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  }).outputText, filename);
  return mod.exports;
}

const clock = load('lib/live-clock.ts');
const { summarizeLineupEvents } = load('lib/lineup-events.ts');
const now = Date.UTC(2026, 8, 20, 14, 22, 24);
const running = { current_minute: 1, clock_phase: 'second_half', clock_started_at: new Date(now - 22 * 60000 - 24000).toISOString(), clock_base_minute: 45 };

function actionHarness(match = running, readError = null) {
  const writes = [], pushes = [];
  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'operator' } } }) },
    from(table) {
      let operation, payload;
      const query = {
        select() { return query; }, eq() { return query; },
        maybeSingle: async () => ({ data: match, error: readError }),
        update(data) { operation = 'update'; payload = data; return query; },
        insert(data) { operation = 'insert'; payload = data; return query; },
        then(resolve, reject) {
          writes.push({ table, operation, payload });
          return Promise.resolve({ error: null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const actions = load('app/admin/live/actions.ts', {
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect(url) { throw new Error(`redirect:${url}`); } },
    '../../../lib/auth/roles': { requireRole: async () => {} },
    '../../../lib/live-clock': { calculateLiveMinute: data => clock.calculateLiveMinute(data, now) },
    '../../../lib/push/server': { sendLivePush: async data => { pushes.push(data); } },
    '../../../lib/supabase/server': { createClient: async () => supabase },
  });
  return { actions, writes, pushes };
}

for (const [action, extra] of [
  ['addGoal', { side: 'home', player_id: 'p1', secondary_player_id: 'p2' }],
  ['addGoal', { side: 'away' }],
  ['addCard', { card: 'yellow', player_id: 'p1' }],
  ['addCard', { card: 'red', player_id: 'p1' }],
  ['addSubstitution', { player_id: 'p1', secondary_player_id: 'p2' }],
]) {
  test(`${action} ${JSON.stringify(extra)} saves 67 despite stale minute 1`, async () => {
    const h = actionHarness();
    const form = new FormData();
    for (const [key, value] of Object.entries({ match_id: 'match', minute: '1', ...extra })) form.set(key, value);
    await assert.rejects(h.actions[action](form), /^Error: redirect:/);
    assert.equal(h.writes.find(w => w.table === 'match_events').payload.minute, 67);
    assert.equal(h.writes.find(w => w.table === 'matches').payload.current_minute, 67);
    assert.equal(h.pushes[0].minute, 67);
  });
}

test('goal works without minute field and preserves paused time', async () => {
  const h = actionHarness({ ...running, clock_phase: 'paused', current_minute: 73 });
  const form = new FormData(); form.set('match_id', 'match'); form.set('side', 'home');
  await assert.rejects(h.actions.addGoal(form), /^Error: redirect:/);
  assert.equal(h.writes.find(w => w.table === 'match_events').payload.minute, 73);
});

test('clock read failure prevents all writes', async () => {
  for (const action of ['addGoal', 'addCard', 'addSubstitution']) {
    const h = actionHarness(null, { message: 'offline' });
    const form = new FormData(); form.set('match_id', 'match'); form.set('side', 'home'); form.set('card', 'yellow');
    await assert.rejects(h.actions[action](form), /konnte nicht geladen/);
    assert.equal(h.writes.length, 0);
  }
});

test('clock handles halftime, restart and added time', () => {
  assert.equal(clock.calculateLiveMinute({ ...running, clock_phase: 'halftime', current_minute: 48 }, now), 48);
  assert.equal(clock.calculateLiveMinute({ ...running, clock_started_at: new Date(now).toISOString() }, now), 45);
  assert.equal(clock.calculateLiveMinute({ ...running, clock_base_minute: 70 }, now), 92);
  assert.equal(clock.formatLiveMinute(92, 'second_half'), "90+2'");
  assert.equal(clock.formatLiveMinute(47, 'first_half'), "45+2'");
});

function event(id, type, player = 'p1', secondary = null) {
  return { id: String(id), event_type: type, player_id: player, secondary_player_id: secondary, minute: id, created_at: new Date(now + id * 1000).toISOString() };
}

test('goals, cards and substitutions attach only to the right player', () => {
  const summary = summarizeLineupEvents([
    event(1, 'goal', 'p1', 'assist'), event(2, 'goal'), event(3, 'goal', null),
    event(4, 'yellow_card'), event(5, 'red_card', 'p2'), event(6, 'substitution', 'p2', 'p1'), event(7, 'note', 'note-player'),
  ]);
  assert.deepEqual(summary.get('p1'), { goals: 2, yellowCards: 1, redCards: 0, substitution: 'out' });
  assert.deepEqual(summary.get('p2'), { goals: 0, yellowCards: 0, redCards: 1, substitution: 'in' });
  assert.equal(summary.has('assist'), false);
  assert.equal(summary.has('note-player'), false);
});

test('Undo and corrections remove badges and old totals', () => {
  const events = [event(1, 'goal'), event(2, 'yellow_card'), event(3, 'yellow_card'), event(4, 'substitution', 'p2', 'p1')];
  assert.equal(summarizeLineupEvents(events).get('p1').yellowCards, 2);
  assert.equal(summarizeLineupEvents(events.slice(0, 3)).get('p1').substitution, null);
  assert.equal(summarizeLineupEvents(events.slice(0, 2)).get('p1').yellowCards, 1);
  const corrected = summarizeLineupEvents([{ ...events[0], player_id: 'p2' }]);
  assert.equal(corrected.has('p1'), false);
  assert.equal(corrected.get('p2').goals, 1);
  assert.equal(summarizeLineupEvents([]).size, 0);
});

test('substitution order survives reversed ticker and halftime minute reset', () => {
  const first = { ...event(1, 'substitution', 'p1', 'p2'), minute: 48 };
  const second = { ...event(2, 'substitution', 'p2', 'p1'), minute: 46 };
  const events = [second, first];
  assert.equal(summarizeLineupEvents(events).get('p1').substitution, 'out');
  assert.equal(events[0], second);
});

test('badges render multiple goals, yellow-red, red and switch labels', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Badges = load('components/match-center/PlayerEventBadges.tsx').default;
  const markup = renderToStaticMarkup(React.createElement(Badges, { status: { goals: 3, yellowCards: 2, redCards: 0, substitution: 'out' } }));
  assert.match(markup, /3 Tore/); assert.match(markup, /Gelb-Rot/); assert.match(markup, /Ausgewechselt/);
  assert.match(renderToStaticMarkup(React.createElement(Badges, { status: { goals: 0, yellowCards: 0, redCards: 1, substitution: 'in' } })), /Rote Karte/);
  assert.equal(renderToStaticMarkup(React.createElement(Badges, {})), '');
});

test('public formation receives events and removes goal after Undo', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Badges = load('components/match-center/PlayerEventBadges.tsx').default;
  const Display = load('components/match-center/FormationDisplay.tsx', {
    '../../lib/lineup-events': { summarizeLineupEvents },
    './PlayerEventBadges': { default: Badges, __esModule: true },
  }).default;
  const props = { players: [{ id: 'p1', last_name: 'Müller', shirt_number: 7 }], entries: [{ id: 's1', player_id: 'p1', role: 'starter', pitch_x: 50, pitch_y: 50 }], events: [event(1, 'goal')] };
  assert.match(renderToStaticMarkup(React.createElement(Display, props)), /aria-label="1 Tor"/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(Display, { ...props, events: [] })), /aria-label="1 Tor"/);
});

test('editor event subscription refreshes after delete and disconnects when hidden', async () => {
  const initial = [event(1, 'goal')];
  let rows = initial, snapshot, callback, effect, removed = 0;
  const listeners = new Map();
  const oldDocument = global.document, oldWindow = global.window;
  global.document = { visibilityState: 'visible', addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  global.window = { addEventListener() {}, removeEventListener() {} };
  const channel = { on(_event, _filter, cb) { callback = cb; return channel; }, subscribe() { return channel; } };
  const query = { select() { return query; }, eq: async () => ({ data: rows, error: null }) };
  const { useLineupEvents } = load('components/match-center/useLineupEvents.ts', {
    react: { useState: initialState => [initialState, value => { snapshot = value; }], useEffect: fn => { effect = fn; } },
    '../../lib/supabase/client': { createClient: () => ({ from: () => query, channel: () => channel, removeChannel: async () => { removed++; } }) },
  });
  let cleanup;
  try {
    assert.equal(useLineupEvents('match', initial), initial);
    cleanup = effect();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(snapshot.events.length, 1);
    rows = []; callback();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(snapshot.events.length, 0);
    document.visibilityState = 'hidden'; listeners.get('visibilitychange')();
    assert.equal(removed, 1);
    document.visibilityState = 'visible'; listeners.get('visibilitychange')();
    await new Promise(resolve => setImmediate(resolve));
    cleanup(); cleanup = null;
    assert.equal(removed, 2);
    assert.equal(listeners.size, 0);
  } finally {
    cleanup?.(); global.document = oldDocument; global.window = oldWindow;
  }
});
