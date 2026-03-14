# DIVINE DOMINION — Divine Energy, Blessings & Disasters

> Cross-references: [Overview](01-overview.md) · [Commandments](03-commandments.md) · [World](04-world.md) · [Religions](05-religions.md) · [Follower Voices](13-follower-voices.md) · [Harbinger](14-harbinger.md) · [In-Game Interactions](09c-in-game-interactions.md) · [Eras](07-eras-and-endgame.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Divine Energy

Divine Energy is the resource spent to cast blessings and disasters. Only the **player's God** uses it — rival Gods never intervene.

| Property | Value | Notes |
|----------|-------|-------|
| **Starting** | 10 | At game start |
| **Maximum** | 20 | Cap for the run |
| **Base regen** | 1 per real-time minute | Passive recovery |
| **Bonus** | Sacrifices commandment | Converts resources → extra energy |

**~80 energy-cost interventions** per full 4-hour game (at base regen). Each cast is meaningful. Player must choose when to act. Divine Whispers (see below) are free and do not count against this budget.

---

## Blessings (6)

Blessings help your followers. Target a region; effect applies.

| Blessing | Cost | Cooldown | Effect |
|----------|------|----------|--------|
| **Bountiful Harvest** | 2 | 2 min | +food, +happiness, +population growth |
| **Inspiration** | 3 | 4 min | +research in region |
| **Miracle** | 4 | 6 min | Mass conversion to your faith |
| **Prophet** | 5 | 8 min | Spawns charismatic leader who spreads faith |
| **Shield of Faith** | 3 | 4 min | +defense for region (vs. invasion) |
| **Golden Age** | 6 | 12 min | +all stats (food, research, happiness, defense) |

---

## Disasters (6)

Disasters harm regions. Use on enemies — or accept the moral cost of using on neutrals.

| Disaster | Cost | Cooldown | Effect |
|----------|------|----------|--------|
| **Earthquake** | 4 | 6 min | Destroys infrastructure |
| **Great Flood** | 3 | 5 min | Devastates cities, disrupts supply |
| **Plague** | 5 | 10 min | Disease spreads in region |
| **Great Storm** | 2 | 3 min | Disrupts trade and troop movement |
| **Famine** | 3 | 5 min | Crop failure, unrest |
| **Wildfire** | 4 | 6 min | Destroys forests and cities |

---

## Divine Whispers

Whispers are micro-interventions — subtle nudges to nation AI. They cost **0 energy** but have per-region and global cooldowns. They fill the passive gaps between events and energy-cost powers.

| Whisper | Icon | Effect on Nation AI |
|---------|------|-------------------|
| **War** | Sword | +aggression, +military priority for 1 era-tick |
| **Peace** | Dove | +diplomacy, -aggression for 1 era-tick |
| **Science** | Flask | +research priority, +development focus for 1 era-tick |
| **Faith** | Prayer hands | +religious fervor, +conversion susceptibility for 1 era-tick |

| Property | Value | Notes |
|----------|-------|-------|
| Energy cost | 0 | Free |
| Per-region cooldown | 30 sec (real) | Per whisper type per region |
| Global cooldown | 10 sec (real) | Between any whisper on any region |
| AI nudge strength | 0.15 | Weight modifier on nation AI decision |
| Compound bonus | +0.05 per repeat | Stacks up to 3× on same nation (caps at 0.30) |

Whispers are accessed via the **bottom sheet** when a region is tapped — not via the FAB. See [09c-in-game-interactions.md](09c-in-game-interactions.md) § 9 for full interaction spec.

### Targeted Whispers (War & Peace)

War and Peace whispers support an optional **targeted** mode: long-press the whisper button, then tap a neighboring nation to specify *who* to fight or reconcile with. The AI nudge applies to that specific nation pair instead of the general aggression/diplomacy weight. Same cooldowns, same stacking. Science and Faith whispers are always untargeted.

If a Follower Voice lives in the whispered region, they gain +0.02 loyalty per whisper. See [13-follower-voices.md](13-follower-voices.md).

---

## Power Combos

When divine powers interact with specific world states or follow other powers, dramatic chain reactions occur. Combos are **discovered, not taught** — the player learns through experimentation.

### Combo Table (MVP — 9 combos)

| Combo ID | Trigger | Condition | Effect |
|----------|---------|-----------|--------|
| `quake_scatter` | Earthquake | Army in target region | Army scatters — 20% strength loss, 30% defect to nearby nations |
| `storm_fleet` | Great Storm | Naval trade route in region | Fleet destroyed, trade route severed for 2× normal duration |
| `flood_famine` | Great Flood | Region already has low food | Triggers Famine event automatically — double devastation |
| `plague_trade` | Plague | Active trade routes in region | Disease spreads along ALL connected trade routes |
| `harvest_golden` | Bountiful Harvest | Region at Dev 6+ | Triggers mini Golden Age (3-year duration, free) |
| `inspire_prophet` | Inspiration | Prophet is in region | Prophet's conversion rate doubles for 1 era-tick |
| `shield_miracle` | Shield of Faith → Miracle | Same region, within 2 real-minutes | "Divine Fortress" — defense + conversion at 1.5× each |
| `wildfire_rebirth` | Wildfire | Region at Dev 3+ | After fire: region rebuilds with +1 Dev (creative destruction) |
| `divine_purge` | Shield of Faith → Miracle | Region corrupted by Harbinger (Era 7+) | Removes Harbinger corruption + immunizes region for 1 era. See [Harbinger](14-harbinger.md). |

### Combo Properties

| Property | Value |
|----------|-------|
| Number of combos (MVP) | 9 (8 standard + Divine Purge anti-Harbinger) |
| Combo modifier range | 1.3×–2.0× base effect |
| Discovery feedback | "Divine Chain" toast (gold+purple gradient) |
| Logged as | Pivotal moment in Earth History |

Combos do NOT cost extra energy — they are bonus effects on an already-paid power. See [09c-in-game-interactions.md](09c-in-game-interactions.md) § 10 for interaction spec (chain icons, hints, notifications).

### Combo Discovery Text (Stage 5)

When a combo is discovered for the first time, a "Divine Chain" toast appears with combo-specific text:

| Combo ID | Discovery Text |
|----------|---------------|
| `quake_scatter` | *"The earth opens. The army scatters. Sometimes geography is the best general."* |
| `storm_fleet` | *"The storm finds the fleet. Wood splinters. Trade routes drown. Nature and divinity agree on something."* |
| `flood_famine` | *"Flood meets famine. The devastation compounds. This is what 'adding insult to injury' looks like on a divine scale."* |
| `plague_trade` | *"Disease finds the trade routes. It spreads along golden lines, turning prosperity into a highway for suffering."* |
| `harvest_golden` | *"The harvest triggers something greater. A mini golden age blooms — free of charge. Even gods appreciate a buy-one-get-one."* |
| `inspire_prophet` | *"Inspiration finds the Prophet. Their words catch fire. Conversion doubles. Your voice, amplified through theirs."* |
| `shield_miracle` | *"Shield meets Miracle. A Divine Fortress forms — defense and conversion intertwined. Faith becomes a wall."* |
| `wildfire_rebirth` | *"The fire destroys. The ashes grow. The region rebuilds stronger than before. Creative destruction — divinely authored."* |
| `divine_purge` | *"Shield and Miracle combine against alien corruption. The darkness burns away. The region is immunized. Take that, Harbinger."* |

### Whisper Feedback Text (Stage 5)

When a Divine Whisper influences a nation, brief feedback text appears:

| Whisper Type | Success | Partial | Resisted |
|-------------|---------|---------|----------|
| **War** | *"Aggression stirs. Swords are drawn."* | *"Tensions rise, but cooler heads hold — for now."* | *"Your whisper falls on deaf ears. They choose peace. Annoying."* |
| **War (targeted)** | *"Eyes turn toward {target}. Old grudges sharpen."* | *"They consider {target}, but not today."* | *"They refuse to see {target} as an enemy. Stubborn."* |
| **Peace** | *"Calm descends. Weapons are sheathed."* | *"The urge for peace flickers, then fades."* | *"They want blood too much. Your peace bounces off."* |
| **Peace (targeted)** | *"An olive branch extends toward {target}."* | *"A moment of hesitation. The swords lower — briefly."* | *"The hatred runs too deep. Not even a god can force forgiveness."* |
| **Science** | *"Curiosity ignites. Scholars lean forward."* | *"A brief spark of inspiration. Nothing lasting."* | *"They'd rather pray than think. Your nudge goes nowhere."* |
| **Faith** | *"Devotion swells. Prayers grow louder."* | *"A flicker of fervor. It may catch."* | *"Faith doesn't come on command. Even yours."* |

---

## Progressive Power Unlock

Powers are **not all available from the start**. They unlock era-by-era, keeping early gameplay simple and introducing depth gradually.

| Era | Blessing Unlocked | Disaster Unlocked | Cumulative Total |
|-----|-------------------|-------------------|-----------------|
| 1 (Renaissance) | Bountiful Harvest | Great Storm | 2 |
| 2 (Exploration) | Inspiration | Great Flood | 4 |
| 3 (Enlightenment) | Shield of Faith | Plague | 6 |
| 4 (Revolution) | Miracle | Famine | 8 |
| 5 (Industry) | Prophet | Wildfire | 10 |
| 6+ (Empire onward) | Golden Age | Earthquake | 12 |

Each unlock triggers a one-time toast notification. The newly unlocked power glows on its first FAB appearance.

The FAB uses **smart context selection** (see [09c-in-game-interactions.md](09c-in-game-interactions.md) § 2) to show only 3–4 of the most relevant unlocked powers at any time, with a "..." button for the full set.

---

## Divine Hypocrisy System

If your **commandments** say one thing and your **actions** say another, followers notice. Consequences apply.

### Hypocrisy Penalties

| Commandment | Conflicting Action | Penalty |
|-------------|-------------------|---------|
| All Life is Sacred | Use Plague | -15% faith, +10% schism |
| Turn the Other Cheek | Any disaster | -10% faith |
| The Earth is Sacred | Earthquake | -20% faith |
| Fear God's Wrath | Never use disasters (30+ years) | Followers doubt; -10% faith |
| Signs and Wonders | 30 years with no Miracle | -15% retention |

### Core Tension for Peace Players

A pacifist religion (e.g., Turn the Other Cheek, All Life is Sacred) **can** use disasters defensively — e.g., Earthquake on an invading army's supply line. But followers judge. Each use chips away at faith and increases schism risk.

**Truly pacifist** = accept military vulnerability. Rely on culture, diplomacy, research, and defensive blessings (Shield of Faith) instead of disasters. The game supports both paths; the tradeoff is explicit.

---

## Note: The Harbinger

The Harbinger (see [14-harbinger.md](14-harbinger.md)) is an alien intelligence that sabotages humanity from Era 7 onward. It is **NOT a divine power user** — it has no energy, no blessings, no commandments. Its 6 sabotage actions (Whisper of Discord, Corruption, False Miracle, Plague Seed, Sever, Veil) use a separate resource (Signal Strength) and are defined in the Harbinger doc. Divine powers interact with the Harbinger only through counter-play: Shield of Faith blocks it, and the Divine Purge combo (Shield + Miracle on a corrupted region) removes its corruption.

---

## Stage 6: Power Balance Pass

### Blessing Effects (exact per-stat impact during duration)

| Blessing | happiness | popGrowth | economy | research | faith | defense | dev |
|----------|-----------|-----------|---------|----------|-------|---------|-----|
| Bountiful Harvest | +0.10 | +0.15 | +0.10 | — | — | — | — |
| Inspiration | — | — | — | +0.20 | — | — | +0.05/yr |
| Miracle | +0.05 | — | — | — | +0.25 | — | — |
| Prophet | — | — | — | — | +0.15 | — | — |
| Shield of Faith | — | — | — | — | — | +0.30 | — |
| Golden Age | +0.15 | +0.10 | +0.15 | +0.15 | +0.05 | +0.10 | +0.03/yr |

### Disaster Effects (exact per-stat impact)

| Disaster | popLoss | devLoss | happiness | economy | military | Special |
|----------|---------|---------|-----------|---------|----------|---------|
| Earthquake | −5% | −1.0 | −0.10 | −0.20 | — | Destroys infrastructure |
| Great Flood | −3% | −0.3 | −0.05 | −0.20 | — | Disrupts trade routes |
| Plague | by severity | — | −0.15 | −0.10 | — | Creates divine disease (2× natural) |
| Great Storm | — | — | — | −0.10 | −0.15 | Disrupts trade + army movement |
| Famine | −2%/tick | — | −0.15 | — | −0.05 | Stacks with Flood combo |
| Wildfire | −2% | −0.5 | −0.05 | −0.15 | — | Combo: rebirth at Dev 3+ |

### Power Tier List

| Tier | Powers | Rationale |
|------|--------|-----------|
| S | Golden Age, Miracle | Golden Age = strongest per-use (6 energy, +all stats). Miracle = game-changing mass conversion. |
| A | Prophet, Shield of Faith, Plague | Prophet = sustained faith engine. Shield = defensive anchor + anti-Harbinger. Plague = devastating + trades routes spread. |
| B | Inspiration, Earthquake, Wildfire | Good impact, situational. Earthquake = targeted dev kill. Wildfire = combo-eligible. |
| C | Bountiful Harvest, Great Storm, Great Flood, Famine | Cheap utility. Use frequently, save energy for S/A-tier moments. |

### Whisper Tuning (Validated — no changes from Stage 3)

| Property | Value | Status |
|----------|-------|--------|
| AI nudge strength | 0.15 | **Confirmed** — meaningful without overriding AI autonomy |
| Compound bonus | +0.05/repeat, cap 0.30 | **Confirmed** — 3 repeats to cap prevents spam dominance |
| Per-region cooldown | 30 sec | **Confirmed** — aligns with event cadence |
| Global cooldown | 10 sec | **Confirmed** — allows rapid multi-region whispers |
| Loyalty bonus per whisper | +0.02 | **Confirmed** — minor but cumulative Voice benefit |

### Combo Modifier Values (Finalized)

| Combo ID | Modifier | Value | Notes |
|----------|----------|-------|-------|
| `quake_scatter` | Strength loss / defect rate | 0.20 / 0.30 | 20% strength lost, 30% defect to nearby |
| `storm_fleet` | Disruption multiplier | 2.0× | Trade severed twice as long |
| `flood_famine` | Population loss | 2.0× base flood loss | Double devastation |
| `plague_trade` | Spread scope | All connected routes | Coverage is the power |
| `harvest_golden` | Bonus duration | 3 game-years | Free mini Golden Age at Dev 6+ |
| `inspire_prophet` | Conversion rate | 2.0× for 1 era-tick | Prophet doubles output |
| `shield_miracle` | Defense + conversion | 1.5× each | 120-sec window to chain |
| `wildfire_rebirth` | Dev bonus | +1 Dev level | At Dev 3+ only |
| `divine_purge` | Corruption removal | Instant + 1 era immunity | Cost: Shield (3) + Miracle (4) = 7 energy |

### Hypocrisy Interaction Table

Calibrated for **Sometimes Worth It** — moderate penalty with recovery over ~2 eras.

| Commandment | Conflicting Action | Severity | Gain | Faith Loss/Tick | Recovery |
|-------------|-------------------|----------|------|----------------|----------|
| `all_life_sacred` | Plague or Famine | severe | +0.25 | 0.002 | ~2 eras |
| `all_life_sacred` | Earthquake, Wildfire, Flood | moderate | +0.12 | 0.0015 | ~1 era |
| `turn_other_cheek` | Any disaster power | moderate | +0.12 | 0.0015 | ~1 era |
| `turn_other_cheek` | War whisper | mild | +0.05 | 0.001 | ~0.5 era |
| `earth_is_sacred` | Earthquake | severe | +0.25 | 0.002 | ~2 eras |
| `earth_is_sacred` | Wildfire, Flood | moderate | +0.12 | 0.0015 | ~1 era |
| `fear_gods_wrath` | No disaster for 30+ game-years | moderate | +0.12 | 0.0015 | ~1 era |
| `signs_and_wonders` | No Miracle for 30+ game-years | moderate | +0.12 | 0.0015 | ~1 era |
| `god_is_silent` | Miracle | mild | +0.05 | 0.001 | ~0.5 era |
| `charity_above_all` | Famine on low-economy nation | moderate | +0.12 | 0.0015 | ~1 era |
| `forgive_and_redeem` | Disaster on recently converted region | mild | +0.05 | 0.001 | ~0.5 era |

A pacifist (Turn Other Cheek + All Life is Sacred) using Earthquake to stop an invasion gains +0.37 hypocrisy (severe + moderate). At decay 0.00125/tick, this clears in ~3 eras. The penalty is real but survivable — an emergency option, not a casual tool.
