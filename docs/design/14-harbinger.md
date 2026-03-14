# DIVINE DOMINION — The Harbinger

> Cross-references: [Overview](01-overview.md) · [Divine Powers](06-divine-powers.md) · [Follower Voices](13-follower-voices.md) · [Events](08-events.md) · [Eras](07-eras-and-endgame.md) · [In-Game Interactions](09c-in-game-interactions.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Purpose

The alien fleet doesn't just arrive at year 2200. They sent something ahead — a transmitted intelligence, beamed across the void centuries before the fleet. Its job: slow humanity down so they can't build the Defense Grid in time.

The Harbinger is **not a god**. It has no worshippers, no religion, no commandments. It can only disrupt. And it does it from the shadows, making its interference look like natural bad luck — until you start noticing patterns.

It transforms the alien invasion from a passive timer into an active story with a hidden antagonist.

---

## Core Design Principles

1. **Creates dilemmas, not just damage.** The Harbinger forces the player to choose between two things they care about — it doesn't just pile on bad luck.
2. **Amplifies existing tensions.** It can't create problems from nothing. Two nations already have border disputes? The Harbinger tips them into war. A region is already vulnerable to disease? The Harbinger pushes it over. Every interference feels plausible.
3. **No playstyle punished.** Signal Strength grows with time (fleet proximity), not player actions. Aggressive and pacifist strategies are equally viable.
4. **Rewards attentive play.** Players who notice patterns early gain a strategic advantage.
5. **Generates stories.** Its interference should create memorable moments, not just stat penalties.

---

## Resource: Signal Strength

The Harbinger's power grows with time as the fleet approaches. It is NOT tied to player actions.

| Era | Signal Strength | Actions Budget | Harbinger State |
|-----|----------------|---------------|-----------------|
| 1-6 | 0 | 0 | Dormant |
| 7 | 3 | 1-2 | Subtle interference |
| 8 | 6 | 2-3 | Building (patterns emerge) |
| 9 | 10 | 3-4 | Confirmed (player knows) |
| 10 | 15 | 5-6 | Aggressive (overlay unlocks) |
| 11 | 20 | 6-8 | Full assault |
| 12 | 25 | 8-10 | Desperate (all-out) |

> **Stage 3 must define:** Exact Signal Strength growth curve formula, tick-level budget spending.

---

## Sabotage Actions (6)

| Action | Cost | Effect | Disguise (hidden) | Revealed Look |
|--------|------|--------|--------------------|---------------|
| **Whisper of Discord** | 2 | Nudges a nation toward war | Natural diplomatic breakdown | Purple whisper trail on map |
| **Corruption** | 3 | Reduces city Dev by -1 over 10 game-years | Economic stagnation | Dark corruption VFX on city |
| **False Miracle** | 4 | Rival religion "performs a miracle," stealing followers | Rival religion's hidden rule triggering | Purple halo (fake miracle exposed) |
| **Plague Seed** | 3 | Introduces disease into a strategic location | Natural disease emergence | Purple disease origin marker |
| **Sever** | 2 | Breaks a trade route or alliance | Trade disruption / diplomatic failure | Purple cut line on trade route |
| **Veil** | 4 | Hides a region's true overlay state for 1 era. Shows "⚠ Data unreliable" indicator. | N/A | Shimmer on region (data questionable) |

The Veil does NOT show completely false data. It adds a visible "⚠ Data unreliable" indicator to affected regions in the overlay, so the player knows *something* is wrong — they just don't know what's been changed. This preserves tension without making the overlay untrustworthy.

> **Stage 3 must define:** Action resolution formulas, interaction with existing event/disease/trade systems.
> **Stage 6 must tune:** All action costs, effect magnitudes, Veil duration.

---

## Adaptive AI Strategy

The Harbinger reads the player's strategy and targets what matters most:

| Player Strategy | Harbinger Response |
|----------------|-------------------|
| Science rush (high-Dev cities) | Corrupts top science cities, provokes wars near Dev-8+ nations |
| Faith expansion (religion spread) | Seeds False Miracles for rival religions in contested regions |
| Peace & cooperation (alliances) | Whispers Discord between the player's closest allies |
| Military dominance (wars) | Plague Seeds behind front lines, Severs supply trade routes |
| Balanced approach | Targets the weakest link in the player's strategy |

> **Stage 4 must define:** Exact targeting algorithm, how Harbinger reads world state, decision tree for action selection.

---

## Rubber Banding

The Harbinger has a hidden pressure parameter:

- **Player far ahead** (3+ nations at Dev 8+, strong alliances) → Harbinger uses full budget, targets aggressively.
- **Player struggling** (few followers, losing wars, science stalled) → Harbinger uses only 50-70% of budget, targets less critical areas.
- **Close race** → Harbinger uses 80-90% budget. The default.

This creates close finishes almost every time. Whether the player wins or loses, it should feel earned.

> **Stage 6 must tune:** Rubber banding thresholds, budget scaling curve.

---

## Visibility Timeline

| Era | What the Player Sees |
|-----|---------------------|
| 1-6 | Nothing. Pure god game. Harbinger is dormant. |
| 7 | No explicit signals. Attentive players might notice high-Dev cities get hit disproportionately. |
| 8 | **Follower Voices sense it.** Prophet: *"Lord, I dream of a shadow. Something watches us from beyond the stars."* Scholar: *"The patterns are wrong. These plagues are too precise."* These are petition-style messages — dismissable but unsettling. |
| 8-9 | **"Strange Signal" event chain.** 2-3 narrative events: "Astronomers detect a faint signal from beyond the solar system." → "The signal is repeating. It's not natural." → "The signal originates from the direction the alien fleet is approaching." |
| 9 | **Confirmation.** Special unmissable event (auto-pause): *"You sense it now — a presence. Not a god. Something older. Something alien. It has been working against you."* From this point, the player KNOWS. |
| 10 | **Anomaly overlay layer unlocks.** Regions under Harbinger influence show a faint purple-dark shimmer. New Voice petition type: *"The darkness corrupts our lands. Purge it, Lord."* |
| 11-12 | **Full visibility.** Harbinger actions show as dark-purple VFX on the map. No more hiding. |

> **Stage 5 must define:** All event text for the discovery chain, Voice sensing petition templates, Earth History reveal text.
> **Stage 7 must define:** Harbinger VFX (corruption, Veil shimmer, sabotage trails, purge effect).

---

## Counter-Play

| Counter | How It Works |
|---------|-------------|
| **Shield of Faith** | Blocks all Harbinger actions in a region for the shield's duration |
| **Divine Purge** (new combo) | Shield of Faith + Miracle on a corrupted region = removes corruption + immunizes for 1 era |
| **Follower Voice detection** | Voices in a region passively detect Harbinger activity. Prophets and Scholars give early warnings via petitions. |
| **Whisper cancellation** | Player's Peace whisper on a region cancels a Harbinger Discord whisper |
| **Prosperity resistance** | Nations at Dev 8+ have 50% resistance to Harbinger actions (cost doubled for the Harbinger) |
| **Anomaly overlay** (Era 10+) | See where the Harbinger has acted. Plan shielding and purging. |

> **Stage 3 must define:** Shield blocking formula, prosperity resistance formula, whisper cancellation mechanics.
> **Stage 6 must tune:** Divine Purge cost/power, resistance thresholds.

---

## Interaction with Existing Systems

| System | Interaction |
|--------|------------|
| **Follower Voices** | Prophets and Scholars sense Harbinger presence in their region (Era 8+). New petition type: "Purge the darkness." The Harbinger can target Voice regions — threatening to corrupt or kill a Voice creates personal stakes. |
| **Power Combos** | New combo: Shield + Miracle = "Divine Purge" (removes Harbinger corruption, immunizes 1 era). Existing combos unchanged. |
| **Divine Whispers** | Player's Peace whisper directly cancels Harbinger's Discord whisper on the same region. |
| **Events** | Some events in Eras 7+ are secretly Harbinger-caused. They carry a hidden `alienCaused` flag. Earth History reveals which events were natural vs. alien on replay. |
| **Overlay** | New "Anomaly" layer (Era 10+) shows Harbinger interference zones. Veil action adds "⚠ Data unreliable" indicator to affected regions on other layers. |
| **Hypocrisy** | No interaction — the Harbinger doesn't care about commandments. |
| **Progressive Unlock** | No interaction — power unlock schedule unchanged. |
| **Earth History** | Post-game reveal: events marked as Harbinger-caused are highlighted. "You didn't know it at the time, but the Plague of 1923 was no accident." |

---

## Narrative Role

### First Run (no meta-knowledge)

The player experiences 6 eras of pure god game. Around Era 7-8, things start going wrong — but it feels like bad luck. Era 9 brings the revelation: something is working against you. Eras 10-12 become an active duel. The alien invasion isn't just a clock — it has a scout, and that scout has been sabotaging you.

### Subsequent Runs (meta-knowledge)

Veterans know the Harbinger exists from the start. They prepare from Era 1 — building prosperity to create natural resistance, positioning Follower Voices as early-warning scouts, saving Shield charges for the late game. The same 12 eras feel completely different.

### The Harbinger Is Not a Rival God

It has no worshippers, no faith, no commandments. It cannot bless. It cannot inspire. It can only break things. This preserves the game's identity: rival religions are still passive, you are still the only deity who acts with purpose. The Harbinger is a force of nature — alien nature — not a competing divinity.

---

## Stage Ownership Summary

| Stage | Must Define |
|-------|------------|
| **3 (Systems)** | Signal Strength growth formula, sabotage action resolution, adaptive targeting algorithm, rubber banding formula, Veil mechanics, Shield blocking, prosperity resistance, whisper cancellation |
| **4 (World AI)** | How Harbinger reads world state, target selection decision tree, interaction with nation AI, sabotage integration into event system |
| **5 (Content)** | Discovery event chain text (Eras 7-12), Voice Harbinger-sensing petition templates, "data unreliable" overlay text, Earth History reveal text |
| **6 (Balance)** | Signal Strength budget per era, all action costs, adaptive pressure curve, rubber banding thresholds, prosperity resistance values, Divine Purge cost/power |
| **7 (Art/Audio)** | Harbinger VFX (purple-dark corruption, Veil shimmer, sabotage trails, purge effect), SFX (alien presence hum, corruption sound, purge sound, Signal event sounds) |
| **8 (Tech/QA)** | `harbinger.ts` module spec, test cases (targeting correctness, rubber banding verification, visibility timeline, Veil indicator), anomaly overlay layer |

---

## Finalized Constants (Stage 6 — Tuned)

See [constants.md](constants.md) for the full table. All values validated through Monte Carlo scenario analysis.

| Constant | Value | Notes |
|----------|-------|-------|
| `HARBINGER_DORMANT_ERAS` | [1, 6] | Eras with no activity |
| `HARBINGER_ACTIVE_ERA_START` | 7 | First era with sabotage |
| `HARBINGER_SIGNAL_STRENGTH_ERA_7` | 3 | Starting budget |
| `HARBINGER_SIGNAL_STRENGTH_ERA_12` | 25 | Maximum budget |
| `HARBINGER_ACTION_DISCORD_COST` | 2 | Whisper of Discord |
| `HARBINGER_ACTION_CORRUPTION_COST` | 3 | Corruption |
| `HARBINGER_ACTION_FALSE_MIRACLE_COST` | 4 | False Miracle |
| `HARBINGER_ACTION_PLAGUE_SEED_COST` | 3 | Plague Seed |
| `HARBINGER_ACTION_SEVER_COST` | 2 | Sever |
| `HARBINGER_ACTION_VEIL_COST` | 4 | Veil |
| `HARBINGER_PROSPERITY_RESISTANCE_DEV` | 8 | Dev level for 50% resistance |
| `HARBINGER_PROSPERITY_RESISTANCE_FACTOR` | 0.5 | Cost multiplier when resisted (effective cost ×2.0) |
| `HARBINGER_RUBBER_BAND_LOW` | 0.5 | Budget fraction when player struggling |
| `HARBINGER_RUBBER_BAND_MID` | 0.8 | Budget fraction in close race (default) |
| `HARBINGER_RUBBER_BAND_HIGH` | 1.0 | Budget fraction when player far ahead |
| `HARBINGER_VISIBILITY_VOICES_ERA` | 8 | Era Follower Voices start sensing |
| `HARBINGER_VISIBILITY_CONFIRMED_ERA` | 9 | Era player gets confirmation event |
| `HARBINGER_VISIBILITY_OVERLAY_ERA` | 10 | Era Anomaly overlay layer unlocks |
| `HARBINGER_CORRUPTION_DEV_LOSS` | 1 | Dev levels lost per Corruption action |
| `HARBINGER_CORRUPTION_DURATION_YEARS` | 10 | Game-years for Corruption to take effect |
| `HARBINGER_VEIL_DURATION_ERAS` | 1 | How long Veil lasts |

### Rubber Banding Thresholds

| Player State | Detection Criteria | Budget Usage |
|-------------|-------------------|-------------|
| **Far ahead** | 3+ nations at Dev 8+, OR player religion covers 50%+ of regions | 100% (full budget) |
| **Close race** | Neither ahead nor struggling | 80% (default) |
| **Struggling** | 0-1 nations at Dev 5+, OR player religion covers <20% of regions | 50% |

### Adaptive Pressure Curve

| Player Strategy | Primary Target (60%) | Secondary Target (40%) |
|----------------|---------------------|----------------------|
| `science_rush` | Corrupts highest-Dev cities | Provokes wars near Dev 8+ nations |
| `faith_expansion` | False Miracles in contested regions | Severs trade routes to faithful nations |
| `peace_cooperation` | Discord between strongest allies | Corruption in alliance capitals |
| `military_dominance` | Plague Seeds behind front lines | Severs supply trade routes |
| `balanced` | Targets weakest stat | Rotates between targets per era |

### Difficulty Scaling Interaction

On higher Earths (3+), Harbinger budget is multiplied by the global difficulty scaling factor (1.0 at Earth 1-2, up to 1.25 at Earth 10+). This means Era 12 budget goes from 25 to 31 at maximum scaling. The Harbinger is the primary late-game difficulty lever.
