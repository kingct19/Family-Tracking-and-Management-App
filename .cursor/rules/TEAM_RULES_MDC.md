# TEAM_RULES_MDC.md — Engineering Playbook (Group 1)

## 0) Tech Baseline
- **Frontend:** React + TypeScript, Vite, React Router, React Query, Zustand (or Redux Toolkit), GSAP.
- **PWA:** Workbox service worker, offline shell, install prompt.
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions), Remote Config (feature flags).
- **Maps & Geo:** Google Maps JS API; geofencing via Functions/Firestore.
- **Tests:** Jest + React Testing Library (unit/integration), Playwright (e2e).
- **Quality:** ESLint (strict), Prettier, tsc, Commitlint (Conventional Commits).
- **CI/CD:** GitHub Actions (build, lint, type, unit, e2e:smoke, a11y, Lighthouse, CodeQL, audit).
- **Security:** OWASP-ASVS mindset; Firestore Rules; SAST (CodeQL); dep audit; secret scanning.
- **Docs:** `/docs` with ADRs, API contracts, privacy, threat model.

---

## 1) Branching, PRs, Code Review
- `main` protected, always releasable.
- Branches: `feat/<scope>-<desc>`, `fix/…`, `chore/…`.
- Rebase or squash merges; no merge commits.
- PRs < 300 LOC, include problem, approach, screenshots/GIF, test plan, perf/a11y notes.
- Required checks: lint, typecheck, unit, build, smoke e2e, lighthouse-ci, axe-ci, codeql, npm-audit.
- 2 approvals for sensitive paths (`/security`, `/functions`, `/src/location`).

**Commit examples (Conventional Commits):**
```
feat(hubs): switch between family/school groups
fix(chore-verify): require photo proof before completion
docs: add privacy policy draft
refactor(auth): extract session refresh logic
```

---

## 2) Code Style & Structure
- ESLint (`typescript-eslint`, `import`, `jsx-a11y`, `react`, `security`, `sonarjs`)
- Prettier (max line 100, singleQuote, trailingComma all)
- Directory layout:
```
/src
  /app
  /components
  /features
  /lib
  /security
  /styles
  /test
  /types
/functions
/.github/workflows
/docs
```

---

## 3) Testing & QA
- **Unit:** Jest + RTL, coverage ≥ 85%.
- **Integration:** feature slices with mocks.
- **E2E:** Playwright (auth, hub switch, geofence, chore verify, vault).
- Smoke on PRs; full nightly.
- Accessibility: axe-core in tests + CI.
- Performance: LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms.
- Visual QA: Playwright screenshots.

---

## 4) Security & Privacy
- Least privilege; no secrets in repo; data minimization.
- Sanitize all inputs; strict CSP.
- Auth roles: owner, admin, parent, child, viewer.
- Firestore Rules enforce hub membership + role.
- Cloud Functions: require auth, validate with Zod, structured logs (no PII).
- Privacy defaults: location ≤ 30d, chore photos ≤ 90d, vault until owner delete.
- Implement export/delete endpoints.

---

## 5) Performance, Accessibility & UX
- Core Web Vitals budgets enforced in CI.
- Responsive images; code splitting.
- WCAG AA: keyboard focus, skip links, semantic landmarks, reduced motion.

---

## 6) CI/CD
- GitHub Actions: lint → type → unit → build → emulators → smoke e2e → lighthouse → axe → codeql → audit.
- Deploy: Firebase Hosting preview on merge; promote on release tag.

---

## 7) Releases & Flags
- Semantic versioning.
- Feature flags via Remote Config (0% → 5% → 25% → 100% rollout).
- Monitoring: Firebase Perf, Sentry.
- Rollback to last good deploy.

---

## 8) Docs & Decisions
- ADRs in `/docs/adrs/`.
- C4 diagrams in `/docs/arch/`.
- API contracts in `/docs/api/`.

---

## 9) Local Dev
- `npm run dev` = Vite + emulators.
- `.env.example` checked in; never commit real env.
- Husky + lint-staged for pre-commit.
- VSCode: format on save, Tailwind IntelliSense.

---

## 10) Definition of Ready / Done
- **DoR:** acceptance criteria, testability, security/privacy, telemetry.
- **DoD:** tests updated, coverage stable, a11y/perf budgets green, docs updated, no TODOs/logs, flags wired.

---

## Cursor “Rules Prompt”
```
You are coding inside a React + TypeScript + Firebase PWA (Vite).

1) TDD-first with Jest + RTL; Playwright for e2e.
2) Structure: /features/<name> with colocated Component, hooks, api, types, tests.
3) React Query for server cache; Zustand for local state; API wrappers in /lib.
4) Accessibility: labels, keyboard UX, focus, aria-*; tests assert roles/names.
5) Security: no PII/tokens in logs; sanitize HTML; validate inputs; Firestore Rules least privilege.
6) Performance: code-split, memoize, lazy maps; respect CWV budgets.
7) Style: ESLint strict + Prettier; no ts-ignore; small components; prefer composition.
8) PRs: Conventional Commits; include screenshots/test plan; update ADRs.

Generate code and tests following these rules.
```
