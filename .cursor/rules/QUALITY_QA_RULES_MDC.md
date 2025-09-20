# QUALITY_QA_RULES_MDC.md — Security, Unit Testing & QA (Group 1)

## 1) Security Rules (Frontend & Backend)

### 1.1 Frontend (React/PWA)
- **No secrets in repo**: Use environment injection; never hardcode API keys or project IDs.
- **CSP**: nonce-based scripts; restrict to self + required Google domains; no `unsafe-inline`.
- **Sanitization**: sanitize any user-rendered HTML with **DOMPurify**; never `dangerouslySetInnerHTML` unguarded.
- **PII**: never log tokens, emails, addresses, precise geolocation, or vault data.
- **Auth checks**: client-side guards for route access; server is source of truth.
- **Service Worker**: don't cache auth pages/responses; version and purge on deploy.
- **Permissions UX**: granular toggles for location; clear purpose and retention in settings.
- **Clipboard/Secrets UX**: one-time reveal; auto re-mask; copy buttons with timeout.

### 1.2 Firebase & Cloud Functions
- **Auth required** for every Function; verify ID token and **custom claims**.
- **Authorization**: check user role and hub membership (`hubId in claims.hubs`) per request.
- **Rate limiting**: per-IP and per-user quotas; exponential backoff for retries.
- **Validation**: Zod schemas for all payloads; reject unknown keys; normalize server-side.
- **Logging**: structured logs (severity, traceId, hubId), redact PII by default.
- **Secrets**: Google Secret Manager; never environment variables in code for secrets.
- **Storage uploads**: restrict MIME types; generate signed URLs server-side; scan images if feasible.
- **Geo features**: snap-to-road optional; quantize coordinates before storing; default retention 30 days.

### 1.3 Firestore Security Rules (requirements)
- Read/write only if `request.auth != null` AND user **in hub** AND role allows action.
- Parents can create/update/delete chores; assignees can toggle status with photo proof.
- Vault readable/writable only by parent role; enforce document-level ownership.
- Locations write: only self; read: parent or self in same hub.
- Deny by default; log denies in analytics (without PII).

---

## 2) Unit & Integration Testing Rules

### 2.1 Unit Tests (Jest + RTL)
- **Naming**: `*.test.ts[x]` colocated with source.
- **Contents**: one behavior per `it()`, AAA pattern (Arrange-Act-Assert).
- **A11y assertions**: use `getByRole`, `getByLabelText`, `toHaveAccessibleName`.
- **Mocks**: mock time (`vi.useFakeTimers()`), geolocation, network; no real fetch.
- **Firebase/Maps**: use jest mocks or test doubles; never hit real services.
- **Coverage**: lines/branches/functions >= **85%**; fail CI below threshold.
- **Determinism**: avoid timers without control; flush promises with utilities.

**Example (component):**
```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChoreCard } from "./ChoreCard";

it("requires photo before completing", async () => {
  render(<ChoreCard title="Dishes" requiresPhoto />);
  await userEvent.click(screen.getByRole("button", { name: /complete/i }));
  expect(screen.getByText(/photo required/i)).toBeInTheDocument();
});
```

### 2.2 Integration Tests
- Run against **Firebase emulators** (Auth, Firestore, Functions, Storage).
- Seed data via emulator scripts; clear between tests.
- Test critical flows: auth login, hub switch, chore verify (with photo), geofence alert enqueue, vault entry.

### 2.3 E2E (Playwright)
- Smoke on PRs: login, navigate hubs, create chore, verify with photo (mock), open vault (mock biometric).
- Full nightly suite for regression with visual snapshots.

---

## 3) Code Quality Rules

### 3.1 Linting & Formatting
- ESLint strict (`typescript-eslint`, `react`, `jsx-a11y`, `import`, `security`, `sonarjs`).
- Prettier enforced; Husky + lint-staged on pre-commit.
- No `any` unless justified; no `ts-ignore` unless commented with reason and ticket.

### 3.2 Architecture & Structure
- Features are isolated; components <= 200 LOC; hooks extract logic.
- API calls only in `/lib` or `/features/*/api.ts` with typed clients.
- React Query keys co-located; include invalidation in mutations.

### 3.3 Performance
- Code-split routes/features; lazy-load Maps; memoize heavy lists (windowing when needed).
- Images: `width/height` set; lazy & responsive sources.
- Avoid long tasks; move heavy work to Web Workers or Functions.

### 3.4 Accessibility
- Keyboard-first, visible focus, skip to content.
- Semantic landmarks (`header/main/nav/footer`).
- Forms: labels, `aria-describedby` for errors, helpful hints.

---

## 4) QA Process

### 4.1 PR Template (checks to include)
- [ ] Problem & approach
- [ ] Screenshots/GIFs
- [ ] Tests added/updated (unit/integration/e2e)
- [ ] a11y notes (roles/labels/focus)
- [ ] Perf notes (CWV budget impact)
- [ ] Security/privacy impact (data, roles, retention)
- [ ] Docs updated (ADR/API)

### 4.2 CI Gates
- Lint, typecheck, unit (coverage >= 85%), build
- Emulators up → e2e smoke
- Lighthouse CI budgets
- `@axe-core/cli` accessibility scan
- CodeQL + `npm audit --audit-level=high`

### 4.3 Release Readiness
- Monitoring dashboards (Sentry, Firebase Performance) show healthy
- Feature-flag rollout plan defined
- Rollback path documented
