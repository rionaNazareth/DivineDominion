# DIVINE DOMINION — Pre-Made Rival Religions

> Cross-references: [Religions System](05-religions.md) · [Commandments](03-commandments.md) · [Nation AI](04b-nation-ai.md) · [LLM Integration](10-llm-integration.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

> Real-world inspired archetypes. Each has unique commandments, hidden rules, and personality. LLM can generate additional religions at runtime; these serve as the pre-made pool and LLM fallbacks.

### 1. Order of the Flame

| Property | Value |
|----------|-------|
| **Archetype** | `militant` |
| **Color** | `#DC143C` (Crimson) |
| **Symbol** | A sword wreathed in fire |
| **Commandments** | `smite_the_wicked`, `holy_conquest`, `fear_gods_wrath`, `dominion_over_nature`, `reward_the_strong`, `discipline_above_all`, `sacred_borders`, `sacrifices_please_god`, `justice_absolute`, `righteous_defense` |
| **Flavor** | *"The Flame does not ask. The Flame takes, purifies, and ascends. We are the sword of a god who does not forgive."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `at_war` (any active war) | `military_boost` × 0.15 for 20 ticks | "They always seem stronger once the fighting starts" |
| `faith_above` > 0.7 | `disaster_on_enemy` chance 0.08 for 20 ticks | "Bad luck follows their enemies when faith runs high" |
| `population_above` > 150,000 | `faith_boost` × 0.02 for 20 ticks | "The bigger they get, the more zealous they become" |

### 2. Children of the Harvest

| Property | Value |
|----------|-------|
| **Archetype** | `peaceful` |
| **Color** | `#8FBC8F` (Sage Green) |
| **Symbol** | A golden wheat sheaf encircling a crescent moon |
| **Commandments** | `turn_other_cheek`, `share_all_wealth`, `celebrate_life`, `earth_is_sacred`, `harmony_with_seasons`, `all_life_sacred`, `teach_every_child`, `charity_above_all`, `convert_by_example`, `diplomatic_union` |
| **Flavor** | *"Our god speaks in the growing of grain and the laughter of children. There is no sermon louder than a shared meal."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `at_peace_ticks` ≥ 50 ticks | `population_boost` × 0.02 for 20 ticks | "Their population surges during long peace" |
| `faith_above` > 0.6 | `happiness_boost` × 0.05 for 20 ticks | "Their people seem unusually content when devout" |
| `development_above` > 5 | `economy_boost` × 0.08 for 20 ticks | "Prosperous Harvest cities grow richer than expected" |

### 3. Watchers of the Deep

| Property | Value |
|----------|-------|
| **Archetype** | `scholarly` |
| **Color** | `#191970` (Midnight Blue) |
| **Symbol** | An open eye within a spiral of stars |
| **Commandments** | `seek_truth`, `teach_every_child`, `learn_from_all`, `sacred_knowledge`, `build_great_works`, `convert_by_example`, `god_is_silent`, `diplomatic_union`, `honor_elders`, `forgive_and_redeem` |
| **Flavor** | *"God is in the equation. God is in the star chart. God is in the footnote you almost missed. Look deeper."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `development_above` > 5 | `economy_boost` × 0.10 for 20 ticks | "Advanced Watcher cities grow richer than expected" |
| `trade_routes_above` > 2 | `development_boost` × 0.03 for 20 ticks | "Connected Watcher cities develop faster" |
| `era_reached` ≥ 5 | `faith_boost` × 0.02 for 20 ticks | "Their faith strengthens as the world modernizes" |

### 4. Cult of Endings

| Property | Value |
|----------|-------|
| **Archetype** | `apocalyptic` |
| **Color** | `#4A4A4A` (Ash Grey) |
| **Symbol** | A cracked sun above dark waves |
| **Commandments** | `fear_gods_wrath`, `smite_the_wicked`, `ends_justify_means`, `sacrifices_please_god`, `dominion_over_nature`, `signs_and_wonders`, `holy_conquest`, `discipline_above_all`, `forbidden_knowledge`, `sacred_borders` |
| **Flavor** | *"All things end. We are not afraid of the ending. We are the ending."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `era_reached` ≥ 8 | `disaster_on_enemy` chance 0.10 for 20 ticks | "Natural disasters spike near the Cult's enemies in later eras" |
| `army_strength_above` > 15,000 | `military_boost` × 0.12 for 20 ticks | "Their armies grow disproportionately when already strong" |
| `population_below` < 50,000 | `faith_boost` × 0.03 for 20 ticks | "Desperation fuels their devotion" |

### 5. Seekers of Unity

| Property | Value |
|----------|-------|
| **Archetype** | `syncretic` |
| **Color** | `#FFBF00` (Warm Amber) |
| **Symbol** | Five rivers meeting in a single pool |
| **Commandments** | `welcome_all`, `learn_from_all`, `diplomatic_union`, `forgive_and_redeem`, `celebrate_life`, `share_all_wealth`, `convert_by_example`, `teach_every_child`, `charity_above_all`, `harmony_with_seasons` |
| **Flavor** | *"Every god is a face of the same truth. Every faith, a road to the same mountain. We walk all roads."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `faith_above` > 0.7 | `happiness_boost` × 0.05 for 20 ticks | "Their people seem unusually content when devout" |
| `trade_routes_above` > 3 | `faith_boost` × 0.02 for 20 ticks | "Trade connections strengthen their faith" |
| `at_peace_ticks` ≥ 40 ticks | `development_boost` × 0.03 for 20 ticks | "Prolonged peace accelerates their development" |

### 6. The Silent Fortress

| Property | Value |
|----------|-------|
| **Archetype** | `isolationist` |
| **Color** | `#708090` (Slate Grey) |
| **Symbol** | A walled tower beneath still clouds |
| **Commandments** | `sacred_borders`, `forbidden_knowledge`, `righteous_defense`, `honor_elders`, `discipline_above_all`, `god_is_silent`, `sacred_knowledge`, `earth_is_sacred`, `justice_absolute`, `help_themselves` |
| **Flavor** | *"We need nothing from beyond our walls. Our god is the stone beneath us and the silence above."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `region_count_below` < 4 | `faith_boost` × 0.03 for 20 ticks | "The smaller they are, the more devout" |
| `at_peace_ticks` ≥ 60 ticks | `development_boost` × 0.04 for 20 ticks | "They develop rapidly in long isolation" |
| `population_above` > 100,000 | `natural_disaster_shield` for 20 ticks | "Natural disasters seem to avoid their territory" |

### 7. Golden Covenant

| Property | Value |
|----------|-------|
| **Archetype** | `mercantile` |
| **Color** | `#DAA520` (Rich Gold) |
| **Symbol** | A scale balanced with a coin and a prayer |
| **Commandments** | `reward_the_strong`, `wander_and_explore`, `build_great_works`, `learn_from_all`, `convert_by_example`, `diplomatic_union`, `welcome_all`, `help_themselves`, `dominion_over_nature`, `celebrate_life` |
| **Flavor** | *"God loves a profit. Every trade route is a prayer line. Every coin exchanged is communion."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `trade_routes_above` > 3 | `economy_boost` × 0.12 for 20 ticks | "Their economy booms when trade routes multiply" |
| `development_above` > 6 | `population_boost` × 0.02 for 20 ticks | "Prosperous Covenant cities attract migrants" |
| `at_peace_ticks` ≥ 30 ticks | `faith_boost` × 0.02 for 20 ticks | "Peace is good for business — and business is good for faith" |

### 8. The Wandering Path

| Property | Value |
|----------|-------|
| **Archetype** | `expansionist` |
| **Color** | `#008080` (Teal) |
| **Symbol** | A compass rose with an eye at its center |
| **Commandments** | `preach_to_all_lands`, `welcome_all`, `wander_and_explore`, `convert_by_example`, `teach_every_child`, `celebrate_life`, `signs_and_wonders`, `conquer_and_enlighten`, `build_great_works`, `learn_from_all` |
| **Flavor** | *"To stay is to stagnate. To move is to pray. Our god walks ahead of us — always just beyond the next horizon."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `region_count_above` > 6 | `faith_boost` × 0.03 for 20 ticks | "Their faith strengthens as they spread" |
| `population_above` > 200,000 | `military_boost` × 0.10 for 20 ticks | "Large populations fuel their military expansion" |
| `trade_routes_above` > 2 | `development_boost` × 0.02 for 20 ticks | "Trade connections accelerate their development" |

### 9. Keepers of the Veil

| Property | Value |
|----------|-------|
| **Archetype** | `peaceful` *(variant: mystical focus)* |
| **Color** | `#6A0DAD` (Deep Purple) |
| **Symbol** | A half-closed eye behind a translucent curtain |
| **Commandments** | `god_is_silent`, `sacred_knowledge`, `harmony_with_seasons`, `earth_is_sacred`, `honor_elders`, `turn_other_cheek`, `convert_by_example`, `forgive_and_redeem`, `teach_every_child`, `all_life_sacred` |
| **Flavor** | *"The truth is a veil. We do not tear it — we learn to see through it. Patience is prayer. Stillness is worship."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `at_peace_ticks` ≥ 40 ticks | `happiness_boost` × 0.06 for 20 ticks | "Long peace brings extraordinary contentment" |
| `development_above` > 7 | `faith_boost` × 0.03 for 20 ticks | "Advanced cities deepen their faith, not question it" |
| `faith_above` > 0.8 | `natural_disaster_shield` for 20 ticks | "Their most devout regions seem protected from nature's wrath" |

### 10. The Iron Dawn

| Property | Value |
|----------|-------|
| **Archetype** | `militant` *(variant: revolutionary liberation)* |
| **Color** | `#B22222` (Firebrick) |
| **Symbol** | A rising fist holding a broken chain |
| **Commandments** | `smite_the_wicked`, `conquer_and_enlighten`, `share_all_wealth`, `ends_justify_means`, `discipline_above_all`, `preach_to_all_lands`, `teach_every_child`, `signs_and_wonders`, `sacrifices_please_god`, `seek_truth` |
| **Flavor** | *"God did not make us free. God made us capable of taking freedom. The chains break when the faithful rise."* |

**Hidden Rules:**

| Condition | Effect | Observable Pattern |
|-----------|--------|--------------------|
| `at_war` (any active war) | `faith_boost` × 0.03 for 20 ticks | "War strengthens their conviction" |
| `population_above` > 100,000 | `military_boost` × 0.12 for 20 ticks | "Large populations fuel revolutionary fervor" |
| `era_reached` ≥ 4 | `economy_boost` × 0.06 for 20 ticks | "They thrive as the world modernizes" |

> **Note:** Religions 9 and 10 share base archetypes (`peaceful` and `militant` respectively) but have distinctly different commandment sets and hidden rules. The archetype determines nation AI bias weights; the commandments and hidden rules create unique identities. At runtime, world gen rolls 8-12 religions then caps at `nationCount - 1` (see `04-world.md`). If LLM is unavailable, religions are drawn from this pool. If more than 10 are needed, reuse entries with name variations.
