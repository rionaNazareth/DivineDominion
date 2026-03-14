# Phase 6 — Polish

> Prerequisites: Phase 5 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [12-scope-and-risks](../design/12-scope-and-risks.md)

---

## Reading List

Read these before writing any code:

- **Design:** `docs/design/12-scope-and-risks.md` — MVP scope, timeline, risks
- **Design:** `docs/design/monte-carlo-scenarios.json` — 20 executable balance scenarios
- **Test spec:** `docs/design/test-spec.md` — §9 Monte Carlo Validation Spec, §4 Performance Budget, §12 Device Testing Matrix

---

## 6.1 Balance Testing

Monte Carlo framework:

- Run 1000 sims with varied commandment combinations
- Check win rates
- Identify broken combos (overpowered/underpowered)
- Document findings, tune constants

---

## 6.2 Sharing System

- Commandment card generation (shareable image)
- Earth history timeline (shareable text/image)
- Web Share API for mobile

---

## 6.3 Analytics

PostHog or similar:

- Track commandment popularity
- Win rates
- Divine power usage
- Session length
- Privacy-compliant, opt-in where required

---

## 6.4 Performance Optimization

- Simulation tick budget (ensure 60fps or target frame rate)
- Rendering culling (off-screen regions)
- Mobile frame rate targets (30fps minimum on low-end devices)

---

## 6.5 Mobile Deployment

- Capacitor build for iOS/Android
- App icon
- Splash screen
- Push notifications (optional)
