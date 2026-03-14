# DIVINE DOMINION — Era Transition Narrative Templates

> Cross-references: [Narrative](02-narrative.md) · [Eras](07-eras-and-endgame.md) · [LLM Integration](10-llm-integration.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Purpose

Each era transition displays a narrative summary. The LLM generates a personalized version (see `10-llm-integration.md` Call #3); these templates are the fallback. Variable slots in `{curly_braces}` are filled from `WorldState` and `GameState`.

## Template Variables

| Variable | Source | Type |
|----------|--------|------|
| `{religion_name}` | Player religion name | string |
| `{nation_name}` | Largest player-religion nation | string |
| `{region_name}` | Player's origin region | string |
| `{war_count}` | Wars this era | number |
| `{conversion_count}` | Regions with player religion majority | number |
| `{population}` | Player religion total followers | formatted number |
| `{rival_religion}` | Largest rival religion name | string |
| `{tech_milestone}` | Latest science milestone name | string |
| `{faith_percent}` | World population following player religion | percentage |
| `{dev_level}` | Average development of player-religion nations | number |
| `{event_count}` | Events that fired this era | number |
| `{heresy_count}` | Regions with active schism risk | number |
| `{defense_status}` | Defense Grid state: `"not started"` / `"under construction"` / `"partially built"` | string |
| `{grid_status}` | Defense Grid result: `"online"` / `"offline"` / `"60% operational"` | string |

---

## Era 1 — Renaissance (1600–1650)

**Template:** *"{religion_name} takes root in the {region_name}. The {nation_name} are young, curious, and remarkably prone to setting things on fire. {war_count} wars have already started. Your followers number {population} — a modest start for a god."*

| Fill | World State |
|------|-------------|
| Peaceful start | *"The Way of Silence takes root in the Western Highlands. The Valdorn are young, curious, and remarkably prone to setting things on fire. 0 wars have already started. Your followers number 12,000 — a modest start for a god."* |
| Aggressive start | *"The Iron Doctrine takes root in the Central Plains. The Kavari are young, curious, and remarkably prone to setting things on fire. 2 wars have already started. Your followers number 18,000 — a modest start for a god."* |
| Isolated start | *"The Harmony of Seasons takes root in the Northern Tundra. The Frostborne are young, curious, and remarkably prone to setting things on fire. 1 war has already started. Your followers number 8,000 — a modest start for a god."* |

## Era 2 — Exploration (1650–1700)

**Template:** *"Ships sail, and with them, your doctrine. {religion_name} reaches new shores — {conversion_count} regions now know your name, though {heresy_count} of them are already getting the commandments wrong. {rival_religion} grows in the {region_name}. Competition, it seems, is divine."*

| Fill | World State |
|------|-------------|
| Expanding | *"Ships sail, and with them, your doctrine. The Way of Silence reaches new shores — 6 regions now know your name, though 1 of them is already getting the commandments wrong. The Order of the Flame grows in the Eastern Coast. Competition, it seems, is divine."* |
| Stagnant | *"Ships sail, and with them, your doctrine. The Iron Doctrine reaches new shores — 3 regions now know your name, though 2 of them are already getting the commandments wrong. The Children of the Harvest grows in the Central Valley. Competition, it seems, is divine."* |
| Dominant | *"Ships sail, and with them, your doctrine. The Harmony of Seasons reaches new shores — 9 regions now know your name, though 0 of them is already getting the commandments wrong. The Seekers of Unity grows in the Southern Desert. Competition, it seems, is divine."* |

## Era 3 — Enlightenment (1700–1750)

**Template:** *"Scholars question everything — including you. {tech_milestone} changes the world. {religion_name} controls {faith_percent}% of minds, which is impressive until you realize the other {100 - faith_percent}% have opinions. {war_count} wars this era. Knowledge is rarely peaceful."*

| Fill | World State |
|------|-------------|
| Science-focused | *"Scholars question everything — including you. Scientific Method changes the world. The Seekers' Path controls 28% of minds, which is impressive until you realize the other 72% have opinions. 1 war this era. Knowledge is rarely peaceful."* |
| War-torn | *"Scholars question everything — including you. Printing Press changes the world. The Iron Doctrine controls 15% of minds, which is impressive until you realize the other 85% have opinions. 4 wars this era. Knowledge is rarely peaceful."* |
| Balanced | *"Scholars question everything — including you. Scientific Method changes the world. The Harmony of Seasons controls 22% of minds, which is impressive until you realize the other 78% have opinions. 2 wars this era. Knowledge is rarely peaceful."* |

## Era 4 — Revolution (1750–1800)

**Template:** *"The old order crumbles. {war_count} revolutions, {event_count} crises, and at least one regicide that your followers are pretending wasn't their fault. {religion_name} has {population} followers who are discovering that faith and politics mix like fire and lamp oil."*

| Fill | World State |
|------|-------------|
| Revolutionary | *"The old order crumbles. 3 revolutions, 7 crises, and at least one regicide that your followers are pretending wasn't their fault. The People's Light has 340,000 followers who are discovering that faith and politics mix like fire and lamp oil."* |
| Stable | *"The old order crumbles. 1 revolution, 4 crises, and at least one regicide that your followers are pretending wasn't their fault. The Way of Silence has 180,000 followers who are discovering that faith and politics mix like fire and lamp oil."* |
| Theocratic | *"The old order crumbles. 2 revolutions, 9 crises, and at least one regicide that your followers are pretending wasn't their fault. The Iron Doctrine has 520,000 followers who are discovering that faith and politics mix like fire and lamp oil."* |

## Era 5 — Industry (1800–1870)

**Template:** *"Smoke rises. Cities swell. {nation_name} reaches Dev {dev_level}, which means they've invented both factory labor and the concept of the weekend. {religion_name} has {faith_percent}% of the world. Whether that's enough depends on what you do with the next century."*

| Fill | World State |
|------|-------------|
| Industrial | *"Smoke rises. Cities swell. Valdorn reaches Dev 6, which means they've invented both factory labor and the concept of the weekend. The Seekers' Path has 31% of the world. Whether that's enough depends on what you do with the next century."* |
| Agricultural | *"Smoke rises. Cities swell. Kavari reaches Dev 4, which means they've invented both factory labor and the concept of the weekend. The Harmony of Seasons has 18% of the world. Whether that's enough depends on what you do with the next century."* |
| Advanced | *"Smoke rises. Cities swell. Valdorn reaches Dev 7, which means they've invented both factory labor and the concept of the weekend. The Iron Doctrine has 42% of the world. Whether that's enough depends on what you do with the next century."* |

## Era 6 — Empire (1870–1920)

**Template:** *"Empires stretch across continents. {war_count} conflicts, and the stakes keep rising. {population} people follow {religion_name}. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile."*

| Fill | World State |
|------|-------------|
| Imperial | *"Empires stretch across continents. 5 wars, and the stakes keep rising. 1.2M people follow The Iron Doctrine. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile."* |
| Peaceful | *"Empires stretch across continents. 1 war, and the stakes keep rising. 800K people follow The Way of Silence. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile."* |
| Fractured | *"Empires stretch across continents. 7 wars, and the stakes keep rising. 400K people follow The Harmony of Seasons. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile."* |

## Era 7 — Atomic (1920–1960)

**Template:** *"They've split the atom. This is either the beginning of salvation or the beginning of the end. {tech_milestone} achieved. {religion_name} has {faith_percent}% of humanity. Somewhere in the numbers, something doesn't add up — but you can't quite see what."*

| Fill | World State |
|------|-------------|
| Nuclear race | *"They've split the atom. This is either the beginning of salvation or the beginning of the end. Nuclear Power achieved. The Iron Doctrine has 35% of humanity. Somewhere in the numbers, something doesn't add up — but you can't quite see what."* |
| Science lag | *"They've split the atom. This is either the beginning of salvation or the beginning of the end. Electricity achieved. The Harmony of Seasons has 25% of humanity. Somewhere in the numbers, something doesn't add up — but you can't quite see what."* |
| Dominant faith | *"They've split the atom. This is either the beginning of salvation or the beginning of the end. Nuclear Power achieved. The Seekers' Path has 52% of humanity. Somewhere in the numbers, something doesn't add up — but you can't quite see what."* |

## Era 8 — Digital (1960–2000)

**Template:** *"Information moves at the speed of light. Faith moves at the speed of doubt. {religion_name} contends with {conversion_count} connected regions and {heresy_count} questioning ones. Your prophets dream of shadows. Your scholars see patterns they can't explain. Something is interfering."*

| Fill | World State |
|------|-------------|
| Connected | *"Information moves at the speed of light. Faith moves at the speed of doubt. The Seekers' Path contends with 14 connected regions and 3 questioning ones. Your prophets dream of shadows. Your scholars see patterns they can't explain. Something is interfering."* |
| Fragmented | *"Information moves at the speed of light. Faith moves at the speed of doubt. The Way of Silence contends with 7 connected regions and 5 questioning ones. Your prophets dream of shadows. Your scholars see patterns they can't explain. Something is interfering."* |
| Under siege | *"Information moves at the speed of light. Faith moves at the speed of doubt. The Iron Doctrine contends with 10 connected regions and 6 questioning ones. Your prophets dream of shadows. Your scholars see patterns they can't explain. Something is interfering."* |

## Era 9 — Signal (2000–2050)

**Template:** *"The signal is confirmed. Something is coming. {nation_name} leads the global response with Dev {dev_level}. {religion_name} has {faith_percent}% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know."*

| Fill | World State |
|------|-------------|
| Prepared | *"The signal is confirmed. Something is coming. Valdorn leads the global response with Dev 9. The Seekers' Path has 40% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know."* |
| Unprepared | *"The signal is confirmed. Something is coming. Kavari leads the global response with Dev 6. The Harmony of Seasons has 20% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know."* |
| Divided | *"The signal is confirmed. Something is coming. Frostborne leads the global response with Dev 7. The Iron Doctrine has 30% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know."* |

## Era 10 — Revelation (2050–2100)

**Template:** *"They can see it now. A darkening where stars should be. {war_count} wars continue as if geography still matters. {tech_milestone} gives humanity a fighting chance — barely. {religion_name} must hold {faith_percent}% of the world together long enough to build something extraordinary."*

| Fill | World State |
|------|-------------|
| Racing | *"They can see it now. A darkening where stars should be. 2 wars continue as if geography still matters. Space Programs gives humanity a fighting chance — barely. The Seekers' Path must hold 45% of the world together long enough to build something extraordinary."* |
| Losing | *"They can see it now. A darkening where stars should be. 4 wars continue as if geography still matters. Internet gives humanity a fighting chance — barely. The Way of Silence must hold 15% of the world together long enough to build something extraordinary."* |
| United | *"They can see it now. A darkening where stars should be. 0 wars continue as if geography still matters. Space Programs gives humanity a fighting chance — barely. The Iron Doctrine must hold 55% of the world together long enough to build something extraordinary."* |

## Era 11 — Preparation (2100–2150)

**Template:** *"Planetary Defense is {defense_status}. Every war is a distraction you can't afford. Every plague is a setback that might kill billions. {religion_name}'s {population} followers are building, praying, and hoping you have a plan. You hope so too."*

| Fill | World State |
|------|-------------|
| On track | *"Planetary Defense is under construction. Every war is a distraction you can't afford. Every plague is a setback that might kill billions. The Seekers' Path's 3.2M followers are building, praying, and hoping you have a plan. You hope so too."* |
| Behind | *"Planetary Defense is not started. Every war is a distraction you can't afford. Every plague is a setback that might kill billions. The Harmony of Seasons' 900K followers are building, praying, and hoping you have a plan. You hope so too."* |
| Desperate | *"Planetary Defense is partially built. Every war is a distraction you can't afford. Every plague is a setback that might kill billions. The Iron Doctrine's 2.1M followers are building, praying, and hoping you have a plan. You hope so too."* |

## Era 12 — Arrival (2150–2200)

**Template:** *"This is it. The fleet enters visual range. Defense Grid: {grid_status}. {population} souls depend on what you've built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new."*

| Fill | World State |
|------|-------------|
| Ready | *"This is it. The fleet enters visual range. Defense Grid: online. 4.5M souls depend on what you've built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new."* |
| Not ready | *"This is it. The fleet enters visual range. Defense Grid: offline. 1.8M souls depend on what you've built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new."* |
| Partial | *"This is it. The fleet enters visual range. Defense Grid: 60% operational. 3.1M souls depend on what you've built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new."* |

---

## Mid-Era Milestone Toast Templates

> Ambient narrative between era transitions. Auto-dismiss after 4 seconds. See [Eras](07-eras-and-endgame.md) for rules.

| Category | Template | Example |
|----------|----------|---------|
| Population | *"Your followers number {milestone}."* | "Your followers number one million." |
| Territory | *"Your faith is now the majority in {count} regions."* | "Your faith is now the majority in 5 regions." |
| War end | *"The {war_name} has ended. {casualties} dead. {cities_razed} cities razed."* | "The Northern War has ended. 40,000 dead. Two cities razed." |
| Trade | *"A new trade route connects your {direction_a} and {direction_b} followers."* | "A new trade route connects your eastern and western followers." |
| Science | *"The {milestone_name} spreads your scripture faster than any prophet."* | "The printing press spreads your scripture faster than any prophet." |
| Rival growth | *"The followers of {rival_religion} grow restless in the {direction}."* | "The followers of Solrath grow restless in the south." |
| Divine echo | *"Your people speak of your {power_name} for generations."* | "Your people speak of your miracle for generations." |
| Dev milestone | *"Your capital has grown into a true {city_tier}."* | "Your capital has grown into a true city." |
