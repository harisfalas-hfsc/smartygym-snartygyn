

# Fix: Add Missing `@tiptap/core` Dependency

## Problem
The build fails because `@tiptap/core` is imported in `src/components/ui/rich-text-editor.tsx` and `src/lib/tiptap-extensions/table-selection-plugin.ts`, but the package is not listed in `package.json`. It was previously resolved as a transitive dependency of other `@tiptap/*` packages, but Vite's import analysis now fails to resolve it.

## Fix
Add `@tiptap/core` to `package.json` dependencies at the same version as the other tiptap packages (`^3.10.7`).

That single addition will resolve the build error. No other files need changes.

