# Legacy ESLint compatibility

This development-only facade exports minimatch 11's callable function,
including its helpers and Minimatch class, for consumers expecting version 3's
CommonJS export. No old matcher implementation is copied or renamed.
Keep this directory in Git: npm resolves the root override from this path.
Remove it when the ESLint plugins support modern minimatch exports directly.
Only compatibility with this project's toolchain is intended.

The import plugin's optional no-internal-modules rule uses makeRe().test().
That interface delegates to Minimatch.match(), without constructing a regex.
The returned object is not a RegExp and does not support exec/source/flags.
The committed tarball is generated using npm pack from these sources.
