// Legacy ESLint plugins expect a callable CommonJS export. The matching
// implementation and attached helpers come entirely from patched upstream.
const modern = require('@huja/minimatch-engine');
const callable = (...args) => modern.minimatch(...args);
Object.assign(callable, modern.minimatch);
// eslint-plugin-import/no-internal-modules uses makeRe() only through .test().
// Version 11 no longer compiles regexes: retain that test interface while
// delegating to its bounded matcher. This is intentionally not a RegExp API.
callable.makeRe = (pattern, options) => {
  const matcher = new modern.Minimatch(pattern, options);
  return { test: value => matcher.match(value) };
};
module.exports = callable;
