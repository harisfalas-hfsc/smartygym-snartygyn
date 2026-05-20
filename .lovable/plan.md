# Responsive layout rule

- Tablet portrait must render exactly like mobile.
- Tablet landscape must render exactly like desktop.
- Shared breakpoint logic lives in `src/hooks/use-mobile.tsx`, `src/hooks/useIsPortraitMode.tsx`, and `tailwind.config.ts`.
- Current rule: landscape viewports at 1024px+ use desktop; portrait/narrower views use mobile unless width is 1200px+ desktop.
- Do not reintroduce a simple width-only 768px/1024px cutoff for shell or homepage layout.
