const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const match = require('minimatch');

test('legacy ESLint matching calls use patched upstream and preserve glob behaviour', () => {
  const upstream = createRequire(require.resolve('minimatch'))('@huja/minimatch-engine/package.json');
  assert.equal(upstream.version, '11.0.4');
  for (const [file, pattern, expected, options] of [
    ['app/page.tsx', '**/*.tsx', true], ['app/page.ts', '**/*.tsx', false],
    ['.hidden', '*', false], ['.hidden', '*', true, { dot: true }],
    ['TeamCard', 'Team*', true], ['foo.js', '*.{js,ts}', true],
    ['node_modules/test.js', '**/*.js', true], ['foo.js', '!*.ts', true],
  ]) assert.equal(match(file, pattern, options), expected);
  assert.deepEqual(match.match(['a.ts', 'b.js'], '*.ts'), ['a.ts']);
  assert.equal(new match.Minimatch('*.ts').match('a.ts'), true);
  assert.equal(match.defaults({ dot: true })('.hidden', '*'), true);
  assert.equal(match.makeRe('private/**').test('private/secret'), true);
  assert.equal(match.makeRe('private/**').test('public/file'), false);
});

test('real ESLint React and import rules still exercise legacy calls', async () => {
  const { ESLint } = require('eslint');
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [{
    files: ['**/*.jsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react: require('eslint-plugin-react'), import: require('eslint-plugin-import') },
    rules: {
      'react/forbid-component-props': ['error', { forbid: [{ propNamePattern: 'data-*' }] }],
      'import/no-internal-modules': ['error', { forbid: ['private/**'] }],
    },
  }] });
  const [bad] = await eslint.lintText('import x from "private/secret"; const App = () => <Panel data-secret="x" />;', { filePath: 'fixture.jsx' });
  assert.ok(bad.messages.some(x => x.ruleId === 'import/no-internal-modules'));
  assert.ok(bad.messages.some(x => x.ruleId === 'react/forbid-component-props'));
  const [good] = await eslint.lintText('import x from "public"; const App = () => <Panel title="ok" />;', { filePath: 'fixture.jsx' });
  assert.equal(good.errorCount, 0);
});

test('glob preprocessing regression completes inside an isolated time limit', () => {
  const code = `const m=require('minimatch'); new m.Minimatch('**/../'.repeat(24)+'target',{optimizationLevel:2}).match('target');`;
  const result = spawnSync(process.execPath, ['-e', code], { cwd: process.cwd(), timeout: 5000, encoding: 'utf8' });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
});
