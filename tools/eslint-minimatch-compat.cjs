/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS preload for legacy ESLint plugins. */
// Keep the installed package genuine minimatch@11.0.4. Adapt only its in-memory
// CommonJS export in lint/test processes, never its files or package metadata.
const id = require.resolve('minimatch');
const modern = require(id);
if (typeof modern !== 'function') {
  const callable = (...args) => modern.minimatch(...args);
  Object.assign(callable, modern, modern.minimatch);
  // eslint-plugin-import uses only .test(), not the full RegExp interface.
  callable.makeRe = (pattern, options) => {
    const matcher = new modern.Minimatch(pattern, options);
    return { test: value => matcher.match(value) };
  };
  require.cache[id].exports = callable;
}
module.exports = require(id);
