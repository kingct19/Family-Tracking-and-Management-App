# CURSOR_RULES_MDC.md — Cursor Guardrails & Prompts (Group 1)

> Pin this in Cursor's **Rules** so AI outputs comply with our engineering standards.

## 1) Global Project Context
- Stack: **React + TypeScript + Vite + Firebase (Auth/Firestore/Storage/Functions)**, React Query, Zustand, GSAP, PWA (Workbox), Google Maps JS API.
- Non-negotiables: **TDD-first**, **WCAG 2.2 AA**, **OWASP-ASVS mindset**, **Core Web Vitals budgets**.

## 2) Cursor System Prompt (copy-paste)
```
You are coding inside a React + TypeScript + Firebase PWA (Vite). Follow these house rules:

A) Structure & Style
- Use /features/<name>/ with colocated files: Component.tsx, hooks.ts, api.ts, types.ts, Component.test.tsx.
- Export typed API wrappers from /lib; no ad-hoc fetch in components.
- Use React Query for server state; Zustand for local UI state.
- ESLint strict + Prettier; avoid ts-ignore; prefer composition over inheritance.

B) TDD & Unit Testing
- For every component/hook/util, generate Jest + React Testing Library tests.
- Tests assert roles/names/labels (a11y); mock time/geolocation; no real network.
- Use Firebase emulators for integration tests; mock Google Maps API.
- Coverage target: >= 85% lines/branches; deterministic tests only.

C) Accessibility & UX
- All interactives have labels, keyboard support, and visible focus.
- Prefer semantic HTML; manage focus on dialogs, toasts, routes.
- Respect prefers-reduced-motion; animate opacity/transform only.

D) Security & Privacy
- Never log tokens, PII, vault contents, or raw geolocation.
- Validate all inputs with Zod; sanitize HTML (DOMPurify) before rendering.
- Assume least-privilege Firestore Rules; pass hubId and enforce claims server-side in Functions.
- Use Remote Config feature flags; guard sensitive features by role and hub membership.

E) Performance
- Route/feature code-splitting; lazy-load Maps; memoize heavy lists.
- Keep LCP <= 2.5s, CLS <= 0.1, TBT <= 200ms; avoid long tasks on main thread.

F) Deliverables in PRs
- Include: problem statement, approach, screenshots/GIF, test plan (unit/integration/e2e), perf/a11y notes.
- Update ADRs if architecture changes.

Generate code and tests that satisfy these rules by default.
```

## 3) Snippets the AI Should Prefer
- **Zod schema + sanitizer** for inputs
- **React Query** mutation/query templates
- **Firebase Functions** with auth/claims checks
- **RTL** test helpers for a11y assertions
- **Playwright** smoke tests scaffold
