# DIVINE DOMINION — Nation AI, Government & Harbinger Targeting

> Cross-references: [World](04-world.md) · [Religions](05-religions.md) · [Formulas](formulas.md) · [Constants](constants.md) · [Harbinger](14-harbinger.md) · [Follower Voices](13-follower-voices.md) · [Divine Powers](06-divine-powers.md) · [INDEX](../INDEX.md)

---

## Nation AI Decision Tree (Stage 4 — Deliverable 2)

Every tick (step 13 in tick pipeline), each nation evaluates actions using a weighted-priority system. Nations are processed by sorted ID for determinism.

### Action Evaluation Loop

```
for each nation (sorted by ID):
  if at war → compute peace_score for each enemy
  if not at war → compute war_score for each neighbor
  compute alliance_score for each eligible nation
  compute trade_score for each eligible neighbor
  evaluate government transition
  apply whisper modifiers (see §Whisper Integration)
  execute highest-scoring action above its threshold
```

Only ONE major action per tick per nation (declare war, sue for peace, form/break alliance). Minor actions (recruit, develop) can co-occur.

### War Declaration Score

For each neighboring nation not at war with us:

```
FORMULA: War Declaration Score
INPUTS:
  own_strength: float        — total military strength
  target_strength: float     — target's total military strength
  opinion: float [-1, 1]     — diplomatic opinion of target
  shared_borders: int [0, N] — count of shared border regions
  same_religion: boolean     — whether dominant religions match
  target_at_war: boolean     — whether target is already at war
  war_weariness: float [0,1] — own war weariness
  personality: string        — AI personality archetype
FORMULA:
  military_adv = clamp((own_strength / max(target_strength, 1)) - 1, 0, 1)
  neg_opinion = clamp(-opinion, 0, 1)
  border_dispute = clamp(shared_borders / 3, 0, 1)
  religion_diff = same_religion ? 0.0 : 1.0
  opportunity = target_at_war ? 1.0 : 0.0

  raw_score = military_adv × WAR_SCORE_MILITARY_WEIGHT
            + neg_opinion × WAR_SCORE_OPINION_WEIGHT
            + border_dispute × WAR_SCORE_BORDER_WEIGHT
            + religion_diff × WAR_SCORE_RELIGION_WEIGHT
            + opportunity × WAR_SCORE_OPPORTUNITY_WEIGHT

  war_score = PERSONALITY_WEIGHTS[personality].declare_war × raw_score - war_weariness

  if both nations at Dev 8+:
    war_score ×= NUCLEAR_DETERRENCE_MOD (0.5)

OUTPUT:
  war_score: float — declare war if > WAR_DECLARATION_THRESHOLD (0.60)
  Target the highest-scoring neighbor above threshold.
```

### Peace Score (when at war)

```
FORMULA: Peace Score
INPUTS:
  war_weariness: float [0, 1]
  lost_regions: boolean         — lost any territory since war started
  ticks_at_war: int             — from relation.warStartTick
  stability: float [0, 1]
  personality: string
FORMULA:
  is_losing = lost_regions ? 1.0 : 0.0
  war_duration = min(ticks_at_war / 100, 1.0)
  low_stability = 1.0 - stability

  peace_score = PERSONALITY_WEIGHTS[personality].sue_peace × (
    war_weariness × 0.4 +
    is_losing × 0.3 +
    war_duration × 0.2 +
    low_stability × 0.1
  )
OUTPUT:
  peace_score: float — sue for peace if > PEACE_THRESHOLD (0.50)
```

### Alliance Score

For each non-allied nation with a shared enemy or same religion:

```
shared_enemy = (both at war with same third nation) ? 1.0 : 0.0
shared_religion = (same dominant religion) ? 1.0 : 0.0
opinion_factor = clamp(opinion, 0, 1)

alliance_score = PERSONALITY_WEIGHTS[personality].form_alliance × (
  shared_enemy × 0.4 + shared_religion × 0.3 + opinion_factor × 0.3
)
→ form alliance if > ALLIANCE_OPINION_THRESHOLD (0.30)
```

Military junta nations **cannot** form alliances (skip this evaluation entirely).

### Trade Score

For each adjacent/sea-connected nation, not at war, with `peaceTicks >= TRADE_PEACE_TICKS_REQUIRED`:

```
peace_factor = min(peaceTicks / 50, 1.0)
econ_complement = clamp(abs(own_dev - target_dev) / 6, 0, 1)
religion_compat = (same religion OR syncretic) ? 1.0 : 0.5

trade_score = PERSONALITY_WEIGHTS[personality].form_trade × (
  peace_factor × 0.3 + econ_complement × 0.4 + religion_compat × 0.3
)
→ form trade if > TRADE.FORMATION_THRESHOLD (0.30)
```

### Worked Example: War Declaration

Nation Aldoria (aggressive, strength 12000) evaluates neighbor Kethis (balanced, strength 8000, opinion -0.4, 2 shared borders, different religion, not at war):

```
military_adv = clamp((12000/8000) - 1, 0, 1) = clamp(0.5, 0, 1) = 0.5
neg_opinion = clamp(0.4, 0, 1) = 0.4
border_dispute = clamp(2/3, 0, 1) = 0.667
religion_diff = 1.0
opportunity = 0.0

raw_score = 0.5×0.30 + 0.4×0.30 + 0.667×0.20 + 1.0×0.15 + 0.0×0.05
          = 0.15 + 0.12 + 0.133 + 0.15 + 0 = 0.553

war_score = 1.5 × 0.553 - 0 (no war weariness) = 0.830
→ 0.830 > 0.60 threshold → Aldoria declares war on Kethis
```

---

## Conquest Resolution

When a battle results in the defender retreating or being destroyed, the winner claims territory:

1. **Region transfer:** The battle region transfers to the winning nation. `region.nationId` updates. `region.isCapital` set to false.
2. **Adjacent regions:** If the losing nation has adjacent regions with no garrison AND less than 30% of the winner's strength nearby, those regions also transfer (cascading collapse, max 2 per battle, selected by sorted region ID if more than 2 qualify). Set `relation.lostTerritory = true` on the losing nation's war relation.
3. **Capital capture:** If the captured region was the defender's capital, the defender's new capital becomes the region with the highest city level. If no regions remain, the nation is eliminated.
4. **Nation elimination:** A nation with 0 regions is removed from `WorldState.nations`. Its armies disband. Its trade routes dissolve. Its religion persists in regions (influence doesn't vanish — it decays via normal diffusion).
5. **Religion on conquest:** The conqueror's religion gains influence in captured regions at rate `FORCED_CONVERSION_RATE_MULTIPLIER` (2×). If the conqueror has `autoConvertOnConquest`, influence is set to 0.70 immediately (but retention is lower at 0.70).

---

## Government Evolution (Stage 4 — Deliverable 6)

Governments transition based on development, era, stability, faith, and war state. Transitions are checked once per tick during nation AI evaluation. Only one transition per nation per era.

### Transition Graph

```
monarchy ──→ republic (Dev ≥5, Era ≥4, stability <0.5 OR Era ≥6)
monarchy ──→ theocracy (faith ≥0.80 in 50%+ regions)
monarchy ──→ military_junta (warWeariness >0.70, stability <0.30)

republic ──→ democracy (Dev ≥8, Era ≥7, stability >0.60)
republic ──→ military_junta (at war, stability <0.30)
republic ──→ theocracy (faith ≥0.80 in 60%+ regions)

democracy ──→ military_junta (at war, stability <0.20)

theocracy ──→ republic (Dev ≥7, faith <0.50, Era ≥6)
theocracy ──→ monarchy (stability <0.30, faith <0.40)

military_junta ──→ republic (peace ≥20 ticks, stability >0.50)
military_junta ──→ democracy (Dev ≥9, stability >0.70, peace ≥30 ticks)
```

**Precedence:** When multiple transitions are valid simultaneously, evaluate in the order listed in the graph above (top-to-bottom). The first valid transition fires; skip all others for this era.

When conditions are met but not at the threshold extremes, the transition happens probabilistically:

```
revolution_prob_per_tick = (1 - stability) × REVOLUTION_BASE_PROB_PER_TICK (0.002)
if seeded_random() < revolution_prob_per_tick → transition
```

### Government Modifier Table

| Government | Economy | Dev Growth | Military | Happiness | Special |
|------------|---------|-----------|----------|-----------|---------|
| monarchy | 1.00 | 0.80 | 1.20 | -0.05 | — |
| republic | 1.15 | 1.00 | 1.00 | 0.00 | — |
| democracy | 1.25 | 1.20 | 0.80 | +0.10 | — |
| theocracy | 0.90 | 0.90 | 1.10 | -0.05 | +30% faith spread |
| military_junta | 0.85 | 0.70 | 1.40 | -0.15 | Cannot form alliances |

---

## Divine Whisper AI Integration (Stage 4 — Deliverable 7)

When the player casts a Divine Whisper on a region, it modifies the owning nation's AI decision weights for the **next tick's evaluation**. See `formulas.md` §Whisper Mechanics for base nudge values.

### How each whisper type modifies AI weights

| Whisper Type | AI Effect |
|-------------|-----------|
| **War** | `declare_war` weight += `WHISPER_AI_NUDGE_STRENGTH` (0.15). Target = nation owning the whispered region. |
| **Peace** | `sue_peace` weight += 0.15. If at war, increases peace threshold by nudge. If not at war, `declare_war` weight -= 0.15. |
| **Science** | `develop` weight += 0.15. Biases nation toward development spending over recruitment. |
| **Faith** | Religion spread from this region gets +0.15 multiplier for the tick. No direct AI decision change. |

### Compound whisper effects

3+ same-type whispers on the same nation within 20 ticks: total nudge = `base + WHISPER_COMPOUND_BONUS × stacks` (max 3 stacks → max nudge 0.30). The compound bonus persists until the stack count resets (no same-type whisper for 20 ticks).

### AI resistance

Nations resist whispers proportional to stability: `effective_nudge = nudge × (1 - stability × 0.3)`. A highly stable nation (stability 0.9) reduces whisper effectiveness by 27%. An unstable nation (stability 0.3) reduces it by only 9%.

---

## Follower Voice Emergence (Stage 4 — Deliverable 8)

Voice emergence is checked during tick step 15 (Follower Voice tick). Voices emerge via **event-driven triggers** — specific world state changes cause specific voice types to spawn. This matches the authoritative formulas in `formulas.md` §16.1.

### Emergence triggers (event-driven, not probabilistic)

Each trigger is checked once per tick. If the cap (`MAX_VOICES_ALIVE` = 5) is reached, no new voices spawn.

| Trigger Event | Voice Type | Condition | Max of Type |
|---------------|-----------|-----------|-------------|
| Player casts Prophet blessing | Prophet | Automatic on cast | 2 |
| Nation with ≥60% player faith enters war | General | `nation.player_religion_influence >= 0.60` AND war started this tick | 1 per war |
| Nation has player religion majority, leader relevant | Ruler | `nation.dominantReligion == playerReligion` AND `ruler_count < 2` | 2 |
| Region reaches Dev ≥6 with player religion dominant | Scholar | `region.development >= VOICE_SCHOLAR_DEV_THRESHOLD` AND player religion dominant | 1 |
| Schism risk ≥40% OR Prophet ignored ≥50 game-years | Heretic | `schism_risk >= VOICE_HERETIC_SCHISM_THRESHOLD` OR `prophet_ignored_years >= VOICE_PROPHET_IGNORE_YEARS` | 1 |

### Voice cap enforcement

When at `MAX_VOICES_ALIVE` (5) and a 6th would emerge, retire the oldest non-petitioning voice (no death notification — they fade from relevance). If a voice dies (age, war, betrayal) during the same tick, the slot opens for the next tick — not the same tick.

---

## Harbinger AI Architecture (Stage 4 — Deliverable 9)

The Harbinger activates at Era 7. Every `HARBINGER_TICK_INTERVAL` (10 ticks), it evaluates world state, selects targets, and spends Signal Strength on sabotage. See `14-harbinger.md` for narrative framing and `formulas.md` §Harbinger for budget/cost math.

### Step 1: Assess player strategy

Read world state and classify the player's dominant approach:

```
player_religion_nations = count of nations where dominant religion = player religion
high_dev_nations = count of player-religion nations with Dev ≥ 8
active_alliances = count of alliances involving player-religion nations
active_wars = count of wars involving player-religion nations

if high_dev_nations >= 3                    → 'science_rush'
if player_religion_nations > total_nations × 0.5  → 'faith_expansion'
if active_alliances >= 5                    → 'peace_cooperation'
if active_wars >= 3                         → 'military_dominance'
else                                        → 'balanced'
```

Assessment persists in `HarbingerState.playerStrategyAssessment` and is re-evaluated every Harbinger tick.

### Step 2: Compute effective budget

```
effective_budget = signal_strength_for_era × rubber_band_factor

rubber_band_factor:
  player_score = (player_religion_nations / total_nations) × 0.5
                + (avg_player_dev / 12) × 0.3
                + (alliances / max_possible_alliances) × 0.2
  if player_score > 0.6  → 1.0  (full budget)
  if player_score < 0.3  → 0.5  (half budget)
  else → 0.5 + (player_score - 0.3) / 0.3 × 0.5  (linear interpolation)
```

### Step 3: Select targets by strategy

| Strategy | Priority Targets | Preferred Actions |
|----------|-----------------|-------------------|
| science_rush | Highest-Dev player-religion regions | Corruption, Plague Seed |
| faith_expansion | Contested religion borders (player faith 40-60%) | False Miracle, Discord |
| peace_cooperation | Strongest alliance pairs | Discord, Sever |
| military_dominance | Rear areas, supply trade routes | Plague Seed, Sever |
| balanced | Weakest link (lowest of: dev, faith, stability) | Any affordable action |

### Step 4: Action selection and execution

For each candidate (target, action) pair, compute:

```
impact_score = base_impact[action] × strategy_alignment × (1 / effective_cost)

base_impact: discord=0.6, corruption=0.8, false_miracle=0.7, plague_seed=0.7, sever=0.5, veil=0.6
strategy_alignment: 1.5 if action matches strategy preference, 1.0 otherwise

effective_cost = action_cost
  if target region Dev ≥ HARBINGER_PROSPERITY_RESISTANCE_DEV (8):
    effective_cost = action_cost / HARBINGER_PROSPERITY_RESISTANCE_FACTOR (0.5)  — doubled
```

**Skip checks** (before executing):
- Region has active Shield of Faith → skip (shield blocks all Harbinger actions)
- Region in `immuneRegionIds` (Divine Purge immunity) → skip
- Action cost > remaining budget → skip

Execute highest-scoring pair. Deduct cost from budget. Log to `actionsLog`. Repeat until budget exhausted or no valid targets.

### Step 5: Action resolution

| Action | Resolution |
|--------|-----------|
| Discord | Reduce diplomatic opinion by -0.20 between target nation and its most-allied neighbor for 1 era. If opinion drops below -0.3, increases war likelihood via standard war score formula. |
| Corruption | Add region to `corruptedRegionIds`. Dev loss: `HARBINGER_CORRUPTION_DEV_LOSS_RATE` (0.05) per tick for `HARBINGER_CORRUPTION_DURATION_YEARS` (10 years = 20 ticks). |
| False Miracle | Boost strongest rival religion in target region by +0.15 faith. Generate event with `alienCaused: true`. |
| Plague Seed | Spawn disease (severity: moderate) in target region. `isDivine = false`, `alienCaused` flag on associated event. |
| Sever | If trade route exists through region → disrupt for 10 game-years (intentionally longer than natural `DISRUPTION_DURATION_YEARS` of 5). If alliance exists → reduce opinion by 0.4. |
| Veil | Add region to `veiledRegionIds` for `HARBINGER_VEIL_DURATION_ERAS` (1 era). Overlay shows "⚠ Data unreliable" on that region. |

### Counter-play response

- **Shield blocks:** If Shield cast on corrupted region, corruption pauses (resumes after shield expires unless purged).
- **Divine Purge:** Shield + Miracle on corrupted region → remove from `corruptedRegionIds`, add to `immuneRegionIds` for `COMBO_PURGE_IMMUNITY_ERAS` (1 era).
- **Whisper cancellation:** Player Peace whisper on a Discord-affected region cancels the Discord nudge. Both whispers neutralize.
- **Prosperity resistance:** Dev 8+ regions cost the Harbinger 2× (effective cost doubled). High-dev civilizations are harder to sabotage.
