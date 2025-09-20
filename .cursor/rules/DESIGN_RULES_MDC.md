# DESIGN_RULES_MDC.md — UI Guidelines (Group 1)

## 0) Foundations
- **Colors:** Material Design 3 roles (primary, surface, on-surface, outline, error).
- **Typography:** Roboto Flex (preferred) or Inter fallback.
  - Display-lg 57/64, Headline-md 28/36, Title-md 16/24 (600), Body-md 14/20, Label-md 12/16 (600).
- **Shape:** 8–20px radii, full pill for chips/FAB.
- **Spacing:** 4pt scale (4,8,12,16…).
- **Motion:** 120–200ms core, 300ms transitions; ease-standard, ease-emphasized.
- **Density:** 44px min touch target.

---

## 1) Layout & Responsiveness
- **Breakpoints:** xs ≤360, sm 361–599, md 600–1023, lg 1024–1439, xl ≥1440.
- **Grid:** xs/sm 4-col, md 8-col, lg/xl 12-col.
- **Nav:** xs/sm bottom app bar, md top app bar, lg/xl nav rail + top bar.
- **Dialogs:** xs/sm full sheet; md+ centered 560–720px.

---

## 2) Components
- **Buttons:** Filled (primary), Tonal (secondary), Outlined (tertiary), Error. Sentence case. Min H 44px. Icon buttons need aria-label.
- **Text fields:** Filled (dense), Outlined (general). Inline error with `aria-describedby`.
- **Cards:** Elev-1, interactive whole card, hover elev-2, focus ring.
- **Navigation:** Bottom bar (3–5 items, labels), Nav rail ≥ lg.
- **Chips:** Filter chips for hub selection, badges only for counts.

---

## 3) States & Elevation
- Hover: elev+1, pressed: elev-1, focus: outline 2px.
- Contrast: text vs surface ≥ 4.5:1.
- Provide light/dark themes.

---

## 4) Motion
- GSAP or CSS transitions.
- Animate only opacity/transform.
- Respect prefers-reduced-motion.

---

## 5) Accessibility
- WCAG 2.2 AA compliance.
- Keyboard reachable, visible focus, skip link.
- All form elements labeled, errors described.
- Images with alt text.
- Targets ≥ 44x44px, ≥8px spacing.
- Map view must have list alternative.

---

## 6) Content Rules
- Clear, concise, supportive tone.
- Sentence case (no ALL CAPS).
- Use action verbs (“Add chore”, “Verify with photo”).
- Headers may ellipsize; body text wraps.

---

## 7) App-Specific Patterns
- **Hub switcher:** md+ segmented in top app bar, sm bottom sheet. Persist last hub.
- **Chore verification:** Photo proof required; parent approval card; gamified points/leaderboard.
- **Location:** Status chip (online/offline, last seen); geofence alerts = snackbar + sheet, not blocking modal.
- **Vault:** Two-step (auth + passcode/biometric). Copy reveal hides after timeout.

---

## 8) Design Review Checklist
- [ ] Material color roles used; AA contrast
- [ ] Typography scale consistent
- [ ] Touch targets ≥44px
- [ ] Layout adapts at breakpoints
- [ ] Motion respects reduced-motion
- [ ] Focus rings visible; skip link present
- [ ] Map has list alt view
- [ ] Vault has 2-step access
- [ ] CLS ≤0.1; skeletons for async
- [ ] Material Symbols with aria-labels
- [ ] Empty, error, loading states designed
