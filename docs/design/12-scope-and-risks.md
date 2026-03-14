# Scope, Risks & Kill List

> Cross-references: [Tech](11-tech.md) · [Constants](constants.md) · [Overview](01-overview.md) · [Eras](07-eras-and-endgame.md) · [Divine Powers](06-divine-powers.md) · [Follower Voices](13-follower-voices.md) · [Harbinger](14-harbinger.md) · [In-Game Interactions](09c-in-game-interactions.md) · [INDEX](../INDEX.md)

---

## MVP Scope (Minimum Viable Playthrough)

| Feature | MVP | Full Vision |
|---------|-----|-------------|
| World map | 1 fixed layout | Procedural (Voronoi + noise) |
| Commandments | 35 base + 15 unlockable = 50 total | 50+ (7 categories, unlockables) |
| Rival religions | 5 pre-made selected from pool of 10 (see `05b-religions-premade.md`) | 8-12 LLM-generated |
| Blessings | 6 (progressive unlock: 2 at start → all 6 by Era 6) | 6 |
| Disasters | 6 (progressive unlock: 2 at start → all 6 by Era 6) | 6 |
| Divine Whispers | 4 types (war, peace, science, faith) — free, always available | 4 types |
| Power Combos | 9 combos (8 standard + Divine Purge, discovered through play) | 12+ combos |
| Follower Voices | 5 types (Prophet, Ruler, General, Scholar, Heretic), max 5 alive | 5 types, max 5 alive |
| Harbinger | 6 sabotage actions, adaptive AI, dormant Eras 1-6, active 7+ | 6 actions + expanded targeting + more sabotage types |
| Event templates | 30 templates (all included) + Harbinger discovery chain (3-4 events) | 80+ with choices |
| Science milestones | 5 MVP-critical (Printing Press, Industrialization, Electricity, Nuclear Power, Defense Grid) | 11 |
| LLM | None (templates only) | ~17 calls per game (narrative voice, Harbinger, Voices, Eulogy) |
| Game duration | 2 hours compressed | 4 hours full |
| Multiverse meta | Basic (Earth counter) | Full (commandment unlocks, titles, callbacks) |
| Divine Overlay | All 4 layers (Religion, Military, Trade, Science) + Disease/Alien contextual | Same |
| Disease system | Natural emergence + divine power (no immunity/quarantine) | Full lifecycle with immunity + quarantine AI |
| Trade routes | Functional (wealth, tech, religion, disease spread) | + player-controlled embargoes and manual routes |

---

## Complexity by System

| System | Complexity | Notes |
|--------|-----------|-------|
| World map generation | Medium | Voronoi diagram for regions, noise for terrain |
| Nation simulation | High | Autonomous nations with economy, military, diplomacy |
| Religion spread | Medium | Influence model (heat diffusion across regions) |
| Commandment system | Low | Pre-made menu with numerical modifiers |
| Divine powers | Low | Tap-to-target, apply effects to region |
| Army & warfare | Medium | Visible units, pathfinding, battle resolution |
| Disease system | Medium | Emergence, spread along routes, recovery |
| Trade routes | Medium | Formation, effects, visualization |
| Event system | Medium | Weighted random tables with variable fills |
| Science progression | Low | Global counter with milestone checks |
| Harbinger AI | Medium | Adaptive opponent with 6 sabotage actions, rubber banding, visibility timeline |
| Alien endgame | Medium | Harbinger transforms timer into active duel + narrative reveals |
| Visual era progression | Medium | Palette swaps, icon evolution, map style shifts |
| Divine Overlay | Medium | 6 overlay layers (4 selectable + 2 contextual) rendered as semi-transparent overlays |
| LLM integration | Low | Fewer than 20 calls, all with fallbacks |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Balance** — 50 commandments interacting | High | Monte Carlo testing (1000 sims), balance criteria defined upfront, MVP ships all 50 |
| **Pacing** — 4 hours must stay engaging | Medium | 12-era structure with escalating stakes, auto-pause on events, alien twist at 3-hour mark |
| **"Is it fun to watch"** — map must feel alive | Medium | Living map systems (armies, trade, disease), visual era evolution, Divine Whispers fill passive gaps, Follower Voices add emotional stakes, God's Overlay adds information depth |
| **Mobile UX** — map on small screens | Medium | Full-screen map, floating UI, contextual dual-arc FAB (max 6 buttons), large touch targets, zoom levels |
| **Emergent behavior** — simulation surprises | High | Invariant tests ("no nation should own 100% by year X"), seed-based reproducibility, simulation logs |
| **Scope creep** — "one more commandment" | High | All 50 commandments ship at launch. Scope creep risk is post-launch expansion content, not base game. |
| **Agent execution** — LLM agents building the simulation | Medium | Pure TS logic (testable), clear specs, logic-only prototype before rendering |
| **Harbinger tuning** — AI must feel smart but fair | Medium | Rubber banding prevents blowouts. Adaptive targeting tested via Monte Carlo. Stage 6 tunes all numbers. |
| **Art production** — vector map assets | Low | Geometric style is cheap to produce. Programmatic gradients, no hand-drawn sprites. |

---

## Timeline Estimate (Agent-Driven Development)

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Design finalization | 2-4 weeks | All docs complete, all specs written, balance criteria defined |
| Simulation prototype (no rendering) | 6-8 weeks | Run 1000 sims, read console output, validate balance |
| MVP rendering + UI | 6-8 weeks | Playable on phone with fixed map, 50 commandments |
| Full vision features | 8-12 weeks | Procedural maps, 50 commandments, LLM, full overlay |
| Balance + polish | 4-8 weeks | Playtesting, tuning, visual polish, sound |
| **Total to MVP** | **~16-20 weeks** | |
| **Total to full release** | **~30-40 weeks** | |

---

## Kill List (Stage 1 — Final)

### CUT — Never Build

| Feature | Why It's Cut |
|---------|-------------|
| **Multiplayer / PvP** | Destroys the contemplative god-game tone. Adds server infrastructure, matchmaking, and balance complexity that dwarfs the rest of the project. The game is a single-player experience. |
| **Social features / chat** | No audience for it. Strategy game on mobile ≠ social platform. Sharing is handled via screenshot cards. |
| **Procedural music generation** | High complexity, low impact. Pre-composed adaptive tracks are cheaper, more reliable, and sound better. |
| **AR / VR mode** | No design fit. The game is a 2D map viewed from above. AR/VR adds nothing to the god fantasy. |
| **Mod support / custom commandments** | Commandment balance is fragile enough with curated content. User-generated commandments would break the simulation. Post-post-launch at earliest. |
| **Real-time multiplayer gods** | Multiple active gods destroys the "only active god" pillar — the core differentiator. |
| **Localization / translation** | English-only. The game's narrative quality depends on tone — mythic dark humor doesn't survive machine translation, and professional translation for 12 era narratives, 80 events, 50 commandments, and procedural templates is cost-prohibitive for a solo indie. Localization is not planned for any release phase. If demand appears post-launch in a specific language, consider a single high-value translation (e.g., Japanese, Portuguese) as a paid content decision, not a pipeline task. |

### DEFER — Build Post-Launch

| Feature | Why It's Safe to Defer |
|---------|----------------------|
| **LLM-generated religions** | Pre-made religion templates are sufficient for 10+ distinct runs. LLM generation adds narrative variety but isn't core gameplay. Ship with 5 hand-crafted religions. |
| **Full procedural world gen (Voronoi + noise)** | Use 3–5 hand-crafted map layouts with randomized nation placement for MVP. Procedural gen adds replayability but isn't needed until players exhaust the fixed layouts. |
| **Full disease system (immunity + quarantine)** | Ship natural disease emergence + divine Plague + trade spread. Defer immunity mechanics and quarantine AI. Full disease lifecycle is post-launch polish. |
| **Sharing / screenshot cards** | Nice-to-have viral mechanic. The game is fun without it. Add when the core loop is proven. |
| **Earth Gallery animated replay** | The visual timeline replay (animated map playback of a past Earth) is deferred. The Earth History interface (commandments, pivotal moments, achievements) ships at launch as MVP-essential. |
| **Achievements / titles system** | Ship with basic Earth counter and commandment unlocks. Formal achievement system with titles adds motivation but isn't blocking fun. |
| **Trade route micro-management** | Ship full trade effects (wealth, tech, religion, disease spread via routes, war disruption). Defer player-controlled trade embargoes and manual route creation. |
| **Ambient music / adaptive soundtrack** | 12 era-specific background tracks with adaptive layering. The game is playable muted on a commute. Full soundtrack is polish, not structure. |
| **Cloud saves / cross-device sync** | Local saves (IndexedDB) for MVP. Cloud sync matters more with a free model (players switch devices more often). Add via a simple cloud sync service post-launch if demand appears. |
| **Async social comparison** | "Your friend saved Earth in 3:12" — async comparison drives organic sharing without PvP. Not blocking fun, but helps growth. |

### MVP-ESSENTIAL — Must Ship

| Feature | Why It's Essential |
|---------|-------------------|
| **Commandment selection (10 chosen from 35 base)** | Core mechanic. The game literally doesn't exist without it. |
| **World map with nations** | The stage. Without visible nations, there's nothing to watch or influence. |
| **Religion spread** | The primary feedback loop. Player needs to see their faith grow (or shrink). |
| **Divine powers (6 blessings, 6 disasters, progressive unlock)** | The player's primary agency. Progressive unlock (2 at start → 12 by Era 6) manages complexity. |
| **Divine Whispers (4 types)** | Free micro-nudges fill passive gaps between events. Constant sense of agency without energy cost. |
| **Power Combos (9: 8 standard + Divine Purge)** | Chain reactions create dramatic moments. Discovered through play — reward experimentation. |
| **Follower Voices (5 types, max 5)** | Named characters add emotional weight. Petitions fill dead time with meaningful choices. |
| **Army / warfare** | Dramatic conflict drives engagement. Wars are the most visible, exciting map events. |
| **Event system (30 templates)** | Decision-making driver. Events give players choices and consequences. |
| **Science progression (5 MVP milestones: Printing Press, Industrialization, Electricity, Nuclear Power, Defense Grid)** | Win condition path. Without visible science progress, the alien threat has no counterplay. |
| **The Harbinger (adaptive alien AI)** | Transforms the alien threat from a passive timer into an active antagonist. 6 sabotage actions, adaptive targeting, rubber banding. Dormant Eras 1-6, active 7+. Creates the mid-to-late game tension that makes the endgame compelling. |
| **Alien invasion endgame** | The twist. The hidden win condition that transforms the game on repeat plays. The Harbinger is its advance scout. |
| **Save / load** | Non-negotiable for a 4-hour game played in 15-minute sessions. |
| **Era progression (visual + mechanical)** | 12 eras with palette shifts and event table changes. Without it, 4 hours feels monotonous. |
| **3 archetype starter packs** | FTUE depends on this. Without archetypes, commandment selection overwhelms new players. |
| **Pause / resume** | Phone-first pillar. The game must handle interruptions gracefully. |
| **Critical SFX** | Divine power casts (12), battle clash/victory/defeat, era transition chime, alien reveal stings (5), win/lose fanfare, event notification + choice confirm, UI taps. ~25-30 short effects. Without sound, wars are flat, victories are hollow, and 4 hours of silence kills engagement. |
| **Trade route effects** | Wealth, technology, religion, and disease spread via trade routes. War disrupts routes. Trade is a real strategic lever, not decoration. Without it, trade is meaningless visual noise. |
| **Natural disease emergence** | Disease emerges from population density and trade routes. Spreads between regions. Recovery based on development and era. Without natural disease, the world feels too clean and controllable. (Immunity/quarantine mechanics deferred.) |
| **Earth History interface** | In-game history tracking commandments chosen, pivotal moments (wars that changed the map, schisms, miracles), and achievements. Viewable during and after each Earth. Players need to see their story. External sharing of history data is deferred. |
