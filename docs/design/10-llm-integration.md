# LLM Integration

> Cross-references: [Overview](01-overview.md) · [Tech](11-tech.md) · [Events](08-events.md) · [Eras & Endgame](07-eras-and-endgame.md) · [Religions](05-religions.md) · [Harbinger](14-harbinger.md) · [Follower Voices](13-follower-voices.md) · [INDEX](../INDEX.md)

---

## Core Principle

**LLM is narrative voice, not gameplay engine. The game is 100% playable offline with template text.**

The simulation runs locally. Events come from weighted tables. Commandments are pre-defined data. The LLM adds narrative personality — making each playthrough feel narrated for you specifically. It synthesizes the *combination* of your commandments, actions, and world state into text that templates can't produce because the combinatorics are too large.

**What LLM uniquely provides:** awareness of your specific playthrough. A template says "your religion grew." An LLM says "the doctrine of 'Knowledge Above All' turned the Northern Plains into a beacon of learning — ironic, given you flooded their neighbors last era." That combination-awareness is the irreplaceable value.

---

## LLM Call Budget

~17 calls per 4-hour game. All non-blocking. All have template fallbacks. Strategy: expand existing call prompts to do more work rather than adding calls.

| # | Call | When | Count | Max Tokens | Fallback |
|---|------|------|-------|------------|----------|
| 1 | Rival religion generation | Loading screen | 1 | 400 | Pool of 10 pre-made religions (see `05b-religions-premade.md`) |
| 2 | Commandment scripture | Loading screen (parallel with #1) | 1 | 80 | Archetype-based paragraph |
| 3 | Enhanced era narrative | Every era transition | 12 | 250 | Template summary + template event text |
| 4 | Follower Voice petition | High-stakes petitions only | 2 | 100 | Type-specific petition template |
| 5 | Earth Eulogy | Game end (result screen) | 1 | 200 | Stats card + template ending |
| | **Total** | | **17** | | |

### What changed from old budget (16 calls)

- **Removed 3 standalone calls:** Religion origin, alien revelation, endgame summary
- **Folded them into expanded calls:** Origin → Commandment Scripture. Alien revelation → Era 9 narrative. Endgame summary → Earth Eulogy (strictly better).
- **Added 3 new calls:** Commandment Scripture (+1), Follower Voice (+2)
- **Enhanced 12 existing calls:** Era narratives now include player archetype, event flavor, and Harbinger voice (Eras 7-12). Same call count, 3× more value.
- **Net:** +1 call, massively more narrative depth.

---

## Call Details

### 1. Rival Religion Generation (existing)

Same as before. Generates rival religions during loading screen.

### 2. Commandment Scripture (new)

Runs during world gen loading screen, parallel with religion generation. The LLM interprets the player's specific 10-commandment combination as a philosophy.

**Why LLM:** 50 commandments × C(50,10) combinations = billions of possible sets. Templates can't interpret each combination's unique character. The LLM detects tension pairs, thematic clusters, and ironies.

```
System: You are the founding prophet of a new religion.

The god has spoken 10 laws:
{commandments_list_with_effects}

Tension pairs present: {tension_pairs_or_none}
Archetype origin: {shepherd|judge|conqueror|custom}

Write a 2-sentence scripture — a poetic interpretation of what this 
combination of laws means as a philosophy. Be specific to the 
contradictions or harmony in THIS set. Dramatic, mythic tone.

Max 40 words.
```

**Appears:** Loading screen, shareable commandment card, Earth History header.

**Fallback:** Archetype-based paragraph: "Yours is the way of the Shepherd — mercy tempered by order."

### 3. Enhanced Era Narrative (expanded from existing)

Same 12 calls, but the prompt now produces 3 outputs instead of 1:

```
System: You are the narrator of a civilization simulation spanning 
1600-2200 AD. You also characterize the player's god based on their 
actions.

Context:
- Player's religion: {religion_name}
- Commandments: {commandments_list}
- Era just completed: {era_name} ({start_year}-{end_year})
- Religion controls: {percentage}% of world population
- Major events this era: {events_list}
- Divine interventions used: {powers_used} (blessings: {n}, disasters: {n})
- Wars this era: {wars_summary}
- Science level: {tech_milestone}
- Player action pattern: {action_summary — e.g. "heavy disaster use, 
  no whispers, ignored 2 petitions"}
{if era >= 7}
- Harbinger active: {harbinger_actions_this_era}
- Harbinger target: {what_harbinger_attacked}
- Player counter-play: {shields_used, purges_done, whisper_cancels}
{endif}

Generate as JSON:
{
  "era_summary": "3 sentences. Dramatic, historical tone.",
  "god_epithet": "A 2-4 word title for how the player played this era. 
    Examples: 'the Silent Judge', 'the Wrathful Shepherd', 
    'the Scholar Who Floods'",
  "prophecy": "1 sentence hint about next era.",
  "quote": "1 sentence fictional quote from a historical figure.",
  {if era >= 7}
  "harbinger_whisper": "1-2 sentences from the Harbinger's perspective.
    Taunting, deceptive, or threatening. References specific player 
    actions. The Harbinger is an alien intelligence, not a god — 
    cold, analytical, but learning to mimic human emotion."
  {endif}
}

Max 150 words total.
```

**Why LLM for Harbinger voice:** Templates can say "Strange whispers spread." The LLM says "You blessed the Northern Plains four times. I noticed. They won't help you now." It references your *specific actions*, making the Harbinger feel like it's watching you. This is impossible with templates because the input space (player action history) is unbounded.

**Fallback:**
- Era summary: "{era_name} saw {event_count} events. {religion_name} {grew/shrank} to {percentage}%."
- God epithet: null (not shown)
- Harbinger whisper: "Strange signals disrupt the region." / "Something is watching."

### 4. Follower Voice Petition (new, high-stakes only)

Only 2 calls per game, reserved for moments with the highest emotional impact:

1. **First petition ever** — the player's first encounter with a named character asking for help
2. **Heretic confrontation OR betrayal/death moment** — whichever comes first

The LLM gets the Voice's personality, loyalty, history with the player, and the current world context.

**Why LLM:** A Prophet, General, and Heretic all asking for "Cast Harvest" should sound completely different. The LLM creates personality through voice, not just variable substitution.

```
System: You are {voice_name}, a {voice_type} in a civilization where 
the player is god. You are speaking directly to your god.

Your personality: {type_description}
Your loyalty: {loyalty_value} (0=hostile, 1=devoted)
Your request: {petition_type} — {petition_action}
Your history: {petitions_answered}/{petitions_denied}
Player's recent actions near you: {recent_divine_actions_in_region}
Player's commandments: {commandments_list}
{if heretic}
You believe the god's commandments are wrong because: {contradiction}
{endif}

Speak to your god in 2-3 sentences. Be specific to your situation.
{voice_type} tone: {prophet=reverent|general=blunt|scholar=measured|
ruler=political|heretic=accusatory}

Max 50 words.
```

**Fallback:** Type-specific template: "My Lord, the people of {region} need {action}. Grant us your blessing."

### 5. Earth Eulogy (replaces endgame summary)

Single call at game end. Generates a ~100-word narrative of the entire playthrough — a story, not a stats card. This is the shareable viral hook.

```
System: Write the eulogy for a dead world — or a celebration for a 
saved one.

Outcome: {win|lose|ascension}
God's title: {latest_god_epithet}
Commandments: {commandments_list}
Scripture: {commandment_scripture_from_call_2}
Key moments: {pivotal_moments_list — max 8}
Named characters: {follower_voices_with_fates}
Stats: {followers, interventions, blessings, disasters, wars, eras}
Harbinger: {harbinger_actions_summary, purges_done}
Play style: {overall_action_pattern}

Write a 4-6 sentence story of this Earth. Reference specific moments 
and characters by name. End with a line about the god — not humanity.
Dramatic, mythic tone. This will be shared as a screenshot.

Max 100 words.
```

**Fallback:** Template combining outcome type + top 3 pivotal moments + stats summary.

---

## Fallback System

Every LLM call has a template fallback. Fallbacks are functionally complete — the player never notices whether LLM is active.

### Fallback quality rule

Fallbacks must be **complete but generic**. The player gets all necessary information; they just don't get the personalization. A player who never connects to the internet has a full, satisfying game. A player with LLM gets a game that feels like it was written for them.

### Detailed Fallback Templates

**1. Rival Religion Fallback:**
Pool of 10 pre-made religions (see `05-religions.md` §10 Pre-Made Rival Religions). Randomly select 3-5 based on world seed. Each has full commandments, hidden rules, and flavor text.

**2. Commandment Scripture Fallback:**

| Archetype Origin | Fallback Scripture |
|-----------------|-------------------|
| Shepherd | *"Yours is the way of the Shepherd — mercy tempered by order, growth measured by the souls you guide rather than the lands you claim."* |
| Judge | *"Yours is the way of the Judge — justice absolute, consequence certain, and a world that fears your silence more than your wrath."* |
| Conqueror | *"Yours is the way of the Conqueror — faith forged in fire, borders drawn in blood, and a doctrine that spreads by the sword's edge."* |
| Custom (no archetype) | *"Your commandments speak of a god who defies simple labels — a faith built from contradictions, held together by will alone."* |

**3. Era Narrative Fallback:**
See `02b-era-narratives.md` for complete per-era templates with variable slots.

**4. God Epithet Fallback:** Not shown (graceful absence — the UI element is hidden).

**5. Harbinger Whisper Fallback (Eras 7-12):**

| Era | Fallback Text |
|-----|--------------|
| 7 | *"Strange signals disrupt the region."* |
| 8 | *"Something is watching."* |
| 9 | *"The interference is deliberate. It has a source."* |
| 10 | *"The Harbinger adjusts its strategy. It's learning."* |
| 11 | *"Signal strength intensifies. The fleet draws closer."* |
| 12 | *"All remaining resources deployed. This is the end — theirs or yours."* |

**6. Follower Voice Petition Fallback:**

| Voice Type | Fallback Template |
|------------|------------------|
| Prophet | *"My Lord, the people of {region} need your blessing. Grant us your light."* |
| Ruler | *"The nation of {nation} requests divine favor. Bless our cause, Lord."* |
| General | *"We fight in your name, Lord. Aid us in battle."* |
| Scholar | *"The academy of {region} seeks your inspiration, Lord. Guide our research."* |
| Heretic | *"Your commandments betray us, god. I demand reform."* |

**7. Earth Eulogy Fallback:**

Narrative templates, not stats cards. The eulogy is the shareable moment — it must read like a story.

| Outcome | Fallback Template |
|---------|------------------|
| United Front | *"Earth #{earth_number} survived. {religion_name} spread across {conversion_count} regions, weathered {war_count} wars, and when the sky darkened, {followers_at_end} souls stood together. You blessed {blessings_used} times and burned {disasters_used}. The Grid held. Not because they were ready — because you made them ready."* |
| Lone Guardian | *"One nation. That's all it took. On Earth #{earth_number}, {nation_name} built what the world couldn't build together. {religion_name} gave them the doctrine; you gave them {blessings_used} miracles. The rest of humanity owes everything to a people they feared more than the stars."* |
| Survival | *"Earth #{earth_number} survived — barely. The Grid was ragged, the defense desperate. {followers_at_end} souls lived through what {war_count} wars and {disasters_used} divine storms couldn't prevent. They'll rebuild. They'll remember what you did. And what you didn't."* |
| Extinction | *"Earth #{earth_number} fell. {religion_name} lasted {eras_survived} eras. You intervened {total_interventions} times — {blessings_used} blessings, {disasters_used} catastrophes. It wasn't enough. It never feels like enough. The silence returns. Again."* |
| Self-Destruction | *"They didn't even make it. Earth #{earth_number} ended in nuclear fire before the aliens arrived. {war_count} wars, and the last one was the one they couldn't take back. {religion_name} taught them faith. It didn't teach them patience."* |
| Ascension | *"Earth #{earth_number} transcended. Across {eras_survived} eras, {religion_name} guided {followers_at_end} souls past war, past fear, past the limits of what you thought they could become. When the aliens arrived, they didn't find prey. They found something new."* |
| Abandoned | *"Earth #{earth_number}. You stopped answering around era {abandonment_era}. {religion_name} had {followers_at_end} followers when you left. They noticed. They carried on. Whatever they built — or didn't — they did it without you."* |

---

## LLM Provider

| Property | Value |
|----------|-------|
| Provider | Gemini Flash (free tier) |
| Max tokens per call | 80–400 (varies by call, see budget table) |
| Timeout | 5 seconds |
| Retry | 1 retry, then fallback |
| Cost per game | $0.00 (free tier) |
| Calls per game | ~17 |
| Total tokens per game | ~3,200 (well within free tier) |
