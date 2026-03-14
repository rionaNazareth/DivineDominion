# DIVINE DOMINION — Follower Voices

> Cross-references: [Overview](01-overview.md) · [Divine Powers](06-divine-powers.md) · [Harbinger](14-harbinger.md) · [Events](08-events.md) · [World](04-world.md) · [UI & Visuals](09-ui-and-visuals.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Purpose

Follower Voices are named characters who emerge from the simulation and petition the player for divine action. They transform the god experience from stat management into emotional storytelling — you're not blessing "Region 4," you're answering Ava's prayer to save her people.

3–5 voices are alive at any time. They live, pray, betray, and die across the centuries.

---

## Voice Types (5)

| Type | How They Emerge | What They Petition For | Risk If Ignored |
|------|-----------------|----------------------|-----------------|
| **Prophet** | Player casts Prophet blessing | Spread faith, bless followers, protect holy sites | Becomes Heretic after ~50 game-years |
| **Ruler** | Nation leader's nation has player religion majority | Military blessings, disaster on enemies, political support | Loses faith, nation drifts to rival religion |
| **General** | War breaks out involving player-religion nation | Divine shield, disaster on enemy army, morale boost | Army morale drops, battle outcome worsens |
| **Scholar** | City reaches Dev 6+ with player religion majority | Inspiration blessing, science support | Research slows in that region |
| **Heretic** | Schism event OR ignored Prophet | Demands commandment reform; threatens split | Schism risk increases by +15% |

---

## Emergence Rules

Characters don't spawn randomly. Each type has a trigger condition tied to the simulation:

| Trigger | Voice Type | Cooldown |
|---------|-----------|----------|
| Player casts Prophet blessing | Prophet | 1 per Prophet cast (max 2 alive) |
| Nation with >60% player religion enters war | General | 1 per active war |
| Nation with >60% player religion, leader relevant | Ruler | 1 per nation (max 2 alive) |
| City reaches Dev 6+ in player-religion region | Scholar | 1 per Dev-6+ city (max 1 alive) |
| Schism risk >40% OR Prophet ignored >50 game-years | Heretic | Max 1 alive |

**Total cap:** 5 voices alive simultaneously. If a 6th would emerge, the oldest non-petitioning voice quietly retires (no death notification — they simply "fade from divine attention").

---

## Character Properties

| Property | Description |
|----------|-------------|
| **Name** | Procedurally generated from era-appropriate name pools. Includes origin: "Ava of the Eastern Plains" |
| **Type** | One of the 5 types above |
| **Loyalty** | 0.0–1.0. Starts at 0.7. Fulfilled petitions increase (+0.1). Ignored petitions decrease (-0.15). Below 0.3 = betrayal risk. |
| **Location** | Region where they emerged. They stay in that region unless displaced by war. |
| **Era born** | The era they first appeared. Determines naming style and petition language. |
| **Petition** | Current active request, if any. Null when not petitioning. |
| **Lineage** | Reference to predecessor, if any. "Ava II, granddaughter of the prophet Ava." |

---

## Petition System

### Petition Structure

| Field | Description | Example |
|-------|-------------|---------|
| **Voice name + title** | Who is asking | "Ava of the Eastern Plains (Prophet)" |
| **Request** | 1–2 sentence prayer | "Lord, the people of Valdorn suffer. Bless their harvest." |
| **Action: Fulfill** | What the player does | Cast Bountiful Harvest on Valdorn |
| **Fulfill outcome** | What happens | +0.1 loyalty, +faith in Valdorn, energy cost applies |
| **Action: Deny** | Alternative | Dismiss the petition |
| **Deny outcome** | What happens | -0.15 loyalty. If Prophet: may become Heretic in 50 game-years. |

### Petition Cadence

- Each voice petitions **at most once per real-minute** (not per game-tick)
- Petitions arrive during the gaps between events — they fill dead time
- A voice with pending petition shows a golden prayer indicator on the map
- Unfulfilled petitions persist for **90 real-seconds**, then auto-resolve as Deny (with reduced penalty: -0.08 loyalty instead of -0.15)
- **Petition timers pause while an event card is on screen.** The player should never lose a petition because they were responding to an event.
- **Max 2 petitions pending** at any time. Additional petitions queue behind.

### Petition Types by Voice

| Voice | Petition Types |
|-------|---------------|
| **Prophet** | "Bless [region]", "Cast Miracle in [region]", "Protect [region] from [threat]" |
| **Ruler** | "Smite [enemy nation]", "Shield [my nation]", "Bless our armies" |
| **General** | "Aid us in battle" (Shield), "Strike their supply line" (Storm/Earthquake), "Inspire our troops" |
| **Scholar** | "Inspire our academy" (Inspiration), "Protect our scholars" (Shield during war) |
| **Heretic** | "Reform [commandment]" (unfulfillable — player must choose: suppress or tolerate) |

### Heretic Petitions — Special Case

Heretics don't ask for blessings. They demand commandment changes. The player can't fulfill this (commandments are locked for the run). Instead:

| Response | Effect |
|----------|--------|
| **Suppress** | Heretic disappears. -faith in their region. +schism risk. |
| **Tolerate** | Heretic stays. Schism risk grows slowly (+2% per era). But if the heretic's region thrives, they become a reformer and schism risk drops. |

---

## Lifecycle

```
Trigger condition met
        |
    Voice EMERGES
    (toast: "A voice rises from your followers")
        |
    Voice is ALIVE
    (appears on map, may petition)
        |
    +----+----+----+
    |         |         |
  FULFILLED  IGNORED   BETRAYED
  (loyalty+) (loyalty-) (loyalty<0.3)
    |         |         |
    +----+----+         |
         |              |
    Voice AGES          |
    (lifespan: 100-200  |
     game-years)        |
         |              |
    +----+----+    HERETIC/SCHISM
    |         |    (voice turns against you)
  NATURAL   KILLED
  DEATH     IN WAR
    |         |
    v         v
  Memorial toast
  ("Ava has passed / fallen")
        |
    LINEAGE CHECK
    (30% chance descendant
     appears 50-100 years later)
```

### Death & Memory

- **Natural death:** Voice reaches end of lifespan (100–200 game-years). Memorial toast: "The prophet Ava has passed. Her teachings endure."
- **Killed in war:** Voice is in a region conquered or devastated. Memorial toast: "General Marcus fell at the Battle of the Northern Plains. His soldiers weep." Logged as pivotal moment.
- **Betrayal:** Prophet or Ruler with loyalty <0.3 becomes a Heretic. Toast: "Ava has turned against you. She preaches a new faith."

### Lineage

When a voice dies (naturally or in war), there is a 30% chance a descendant appears 50–100 game-years later:
- Same type as the original
- Name includes lineage: "Ava II, granddaughter of the prophet Ava"
- Starts with loyalty 0.6 (slightly lower — they remember their ancestor's experience)
- If the original was betrayed or suppressed, no lineage spawns

---

## Map Presence

Voices appear on the map at their region:
- **Icon:** Small circular portrait (placeholder silhouette until Stage 7 defines art style) with a colored ring matching their type
- **Size:** 24pt diameter at Regional zoom. Hidden at Strategic zoom. Enlarged at Close-up zoom.
- **Prayer indicator:** Golden pulse animation when they have an active petition
- **Tap target:** 44pt minimum (icon + invisible hit area expansion)
- **Tap behavior:** Opens bottom sheet with character profile + petition (if active)

### Type Colors (rings)

| Type | Ring Color |
|------|-----------|
| Prophet | Gold |
| Ruler | Silver |
| General | Steel/dark |
| Scholar | Blue |
| Heretic | Red |

---

## HUD — Prayer Counter

A small badge next to the energy display in the top HUD:

| State | Display |
|-------|---------|
| No petitions | Hidden (no badge) |
| 1 petition | "1" badge with golden pulse |
| 2 petitions | "2" badge with golden pulse |
| Heretic petition | Badge turns red |

Tapping the prayer counter pans the camera to the nearest petitioning voice and opens their bottom sheet.

---

## Progressive Disclosure

Follower Voices are NOT present in the tutorial. They appear gradually:

| Timeline | What Happens |
|----------|-------------|
| Minutes 0–10 | No voices. Player learns map, FAB, blessings, events. |
| ~Minute 10 (or first war/Prophet cast) | First voice emerges. One-time tooltip: "A voice rises from your followers. They seek your guidance." |
| Era 2–3 | Second voice emerges naturally (Ruler or Scholar from simulation). |
| Era 3+ | System fully active. 3–5 voices, regular petitions. |

---

## Interaction with Other Systems

| System | Interaction |
|--------|------------|
| **Divine Whispers** | Whispering a region where a voice lives increases their loyalty (+0.02 per whisper). They "feel your presence." |
| **Power Combos** | Fulfilling a petition that triggers a combo logs a special pivotal moment: "You answered Ava's prayer, and the earth shook in response." |
| **Events** | Voice emergence IS an event-like notification, but uses the milestone toast style (not the choice-card style). Voices do not compete with events for queue space. |
| **Hypocrisy** | If you fulfill a petition that contradicts your commandments (e.g., General asks you to smite, but you have "Turn the Other Cheek"), hypocrisy penalty still applies. The voice's request doesn't override your moral framework. |
| **Harbinger** | Starting Era 8, Prophets and Scholars can sense Harbinger interference in their region. They issue petition-style warnings: *"Lord, I dream of a shadow. Something watches us."* / *"The patterns are wrong. These plagues are too precise."* The Harbinger can also target a Voice's region — threatening to corrupt or kill a Voice creates personal stakes. New petition type (Era 10+): *"The darkness corrupts our lands. Purge it, Lord."* (Fulfilled via Divine Purge combo: Shield + Miracle.) Some late-game Heretic emergences may be Harbinger-caused rather than organic schism. See [Harbinger](14-harbinger.md). |

---

## Voice Names Per Era (Stage 5)

Names are procedurally selected from era-appropriate pools. Format: "{FirstName} of the {Region}".

| Era | Name Style | Example Names (Male) | Example Names (Female) |
|-----|-----------|---------------------|----------------------|
| 1-2 (Renaissance/Exploration) | Classical European | Marcus, Aldric, Tobias, Henrik | Ava, Elara, Margaux, Solenne |
| 3-4 (Enlightenment/Revolution) | Enlightenment | Edmund, Voltaire, Pascal, Dmitri | Emilia, Charlotte, Josephine, Katarina |
| 5-6 (Industry/Empire) | Victorian/Imperial | Theodore, Albert, Wellington, Rhodes | Victoria, Ada, Florence, Beatrice |
| 7-8 (Atomic/Digital) | Modern | James, Nikolai, Kenji, Ravi | Elena, Mei, Amara, Ingrid |
| 9-10 (Signal/Revelation) | Near-future | Kai, Zephyr, Arjun, Osei | Lena, Yuki, Zara, Nova |
| 11-12 (Preparation/Arrival) | Near-future global | Soren, Idris, Mateo, Haruki | Lina, Priya, Astrid, Kira |

Lineage naming: "{Name} II, {relation} of {original_name}" — relation is "child," "grandchild," or "descendant" depending on generational gap.

---

## Petition Templates Per Voice Type (Stage 5)

> Expanded templates with variable slots. LLM fallback uses these directly.

### Prophet Petitions

| Petition Type | Template Text |
|---------------|--------------|
| Bless region | *"Lord, the people of {region} thirst for your light. Bless their harvest, and they will sing your name for generations."* |
| Cast Miracle | *"I have preached your word in {region}, but words are not enough. Show them a sign. Show them you are real."* |
| Protect region | *"Something threatens {region}, Lord. Shield your faithful. They have earned your protection."* |
| Harbinger warning (Era 8+) | *"Lord, I dream of shadows between the stars. Something watches us from beyond. Something cold."* |
| Harbinger purge (Era 10+) | *"The darkness corrupts {region}. Purge it, Lord. Shield and Miracle — burn the alien taint away."* |

### Ruler Petitions

| Petition Type | Template Text |
|---------------|--------------|
| Smite enemy | *"Lord, {enemy_nation} threatens our borders. Strike them down — or at least make them reconsider."* |
| Shield nation | *"Our armies march, Lord, but we need divine protection. Shield the nation of {nation}."* |
| Bless armies | *"Our soldiers fight in your name. A blessing would remind them why."* |

### General Petitions

| Petition Type | Template Text |
|---------------|--------------|
| Aid in battle | *"Lord, we're outnumbered. A storm, an earthquake, anything — give us an edge."* |
| Strike supply line | *"Their supply routes run through {region}. A well-placed disaster would end this war in weeks."* |
| Inspire troops | *"Morale is crumbling, Lord. The troops need to know you're watching. Show them something."* |

### Scholar Petitions

| Petition Type | Template Text |
|---------------|--------------|
| Inspire academy | *"The academy at {region} is on the verge of a breakthrough. A touch of inspiration — just a nudge."* |
| Protect scholars | *"War approaches {region}. Our scholars are not soldiers. Shield them, Lord."* |
| Harbinger analysis (Era 9+) | *"I've mapped the anomalies. They originate from no known source. Grant me clarity to understand what's interfering."* |

### Heretic Petitions

| Petition Type | Template Text |
|---------------|--------------|
| Reform commandment | *"Your law of '{commandment}' is wrong, god. The people suffer under it. Reform or be abandoned."* |
| Challenge authority | *"I was your prophet once. Now I see the truth: your commandments serve you, not your people."* |
| Harbinger-influenced (Era 9+) | *"Your commandments are lies, god. I've seen what's really coming. Why do you pretend you can stop it?"* |

---

## Constants

See [constants.md](constants.md) for exact values. Key parameters:

| Constant | Value | Notes |
|----------|-------|-------|
| `MAX_VOICES_ALIVE` | 5 | Hard cap |
| `VOICE_TYPES` | 5 | Prophet, Ruler, General, Scholar, Heretic |
| `STARTING_LOYALTY` | 0.7 | Initial loyalty when voice emerges |
| `LOYALTY_GAIN_FULFILL` | 0.10 | Per fulfilled petition |
| `LOYALTY_LOSS_DENY` | 0.15 | Per denied petition |
| `LOYALTY_LOSS_AUTO_DENY` | 0.08 | Per auto-expired petition (reduced penalty) |
| `BETRAYAL_THRESHOLD` | 0.3 | Below this = betrayal risk |
| `PETITION_TIMEOUT_SEC` | 90 | Real-seconds before auto-deny |
| `PETITION_MAX_PENDING` | 2 | Max simultaneous petitions |
| `PETITION_COOLDOWN_SEC` | 60 | Min gap between petitions from same voice |
| `VOICE_LIFESPAN_YEARS` | [100, 200] | Game-years before natural death |
| `LINEAGE_CHANCE` | 0.3 | Probability of descendant spawning |
| `LINEAGE_DELAY_YEARS` | [50, 100] | Game-years before descendant appears |
| `WHISPER_LOYALTY_BONUS` | 0.02 | Loyalty gain when player whispers voice's region |
