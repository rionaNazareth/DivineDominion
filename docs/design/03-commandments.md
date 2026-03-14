# DIVINE DOMINION — The 10 Commandments System

> Cross-references: [Overview](01-overview.md) · [Narrative](02-narrative.md) · [Divine Powers](06-divine-powers.md) · [Religions](05-religions.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## How It Works

At game start, the player selects **10 commandments** from a categorized menu. Each commandment has:

- **Name** — Short, memorable (e.g., "Turn the Other Cheek")
- **Scripture** — One-line poetic interpretation (the `flavorText` field in `game.ts`)
- **Effect** — Numerical modifier + behavior tag (shown via "More info" progressive disclosure)
- **Category** — One of 7 (Expansion, Conflict, Knowledge, Society, Divine, Nature, Morality)
- **Tension tag** — Optional; conflicts with other commandments create schism risk

---

## 7 Categories — 35 Base + 15 Unlockable = 50 Total

### EXPANSION

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `preach_to_all_lands` | Preach to All Lands | *"Go forth and let no ear remain unblessed."* | +25% missionary effectiveness |
| `convert_by_example` | Convert by Example | *"Let your deeds speak where words cannot reach."* | Slow conversion, high retention |
| `holy_conquest` | Holy Conquest | *"The sword carries the word where the tongue cannot."* | Military auto-converts; +resentment in conquered regions |
| `welcome_all` | Welcome All | *"Every stranger is a congregation waiting to form."* | +30% conversion, +15% schism risk |
| `sacred_borders` | Sacred Borders | *"What is yours is holy. Defend it."* | No expansion; +40% defense |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `hidden_faith` | The Hidden Faith | *"Faith needs no temple. It thrives in whispers."* | +30% conversion in hostile regions, -20% visible influence | Win pure peace |
| `cultural_hegemony` | Cultural Hegemony | *"Let them sing our songs before they learn our prayers."* | +25% conversion via trade routes, +15% happiness for trade partners | Survive past 1900 |

### CONFLICT

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `turn_other_cheek` | Turn the Other Cheek | *"Suffer the blow, and let the bruise convert the striker."* | Can't declare wars; +20% sympathy conversion |
| `righteous_defense` | Righteous Defense | *"Strike no first blow. Strike the last."* | Can't declare wars; +30% counter-attack |
| `smite_the_wicked` | Smite the Wicked | *"There is no peace with the unrighteous."* | Holy wars enabled; +20% morale, -40% diplomacy |
| `conquer_and_enlighten` | Conquer and Enlighten | *"Victory is the first step of education."* | Conquest with integration bonuses |
| `diplomatic_union` | Diplomatic Union | *"The table is mightier than the sword."* | +30% diplomacy, -15% military |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `mercenary_blessing` | Mercenary Blessing | *"Gold buys swords. Swords buy time. Time buys salvation."* | Convert economy to troops (+20%); -10% follower loyalty | Win a run |
| `asymmetric_warfare` | Asymmetric Warfare | *"The mountain does not charge. It simply does not move."* | +30% defense when outnumbered; -15% attack when outnumbering | Lose 3 times |

### KNOWLEDGE

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `seek_truth` | Seek Truth Above All | *"Question everything. Even this."* | +30% research, +10% schism risk |
| `sacred_knowledge` | Sacred Knowledge | *"Wisdom is a flame to be guarded, not scattered."* | +15% research, slower to spread |
| `forbidden_knowledge` | Forbidden Knowledge | *"Some doors are sealed for your protection."* | -20% research, +25% cohesion |
| `teach_every_child` | Teach Every Child | *"An unschooled child is a prayer unanswered."* | +20% research, +population, slower military |
| `learn_from_all` | Learn from All | *"Even the heathen teaches, if you listen."* | +25% research in regions with trade contact |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `steal_the_fire` | Steal the Fire | *"Knowledge hoarded is knowledge begging to be taken."* | +20% tech gain from trade/conquest; -10% relations | Visit 10 Earths |
| `dangerous_experiments` | Dangerous Experiments | *"God favors the bold. God also favors the fireproof."* | +40% research; 5% per era of catastrophic lab accident | Survive past 1900 |

### SOCIETY

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `share_all_wealth` | Share All Wealth | *"What you hoard, you worship. And there is only one god here."* | +25% happiness, -10% economy |
| `reward_the_strong` | Reward the Strong | *"Excellence is its own prayer."* | +15% economy, +inequality |
| `honor_elders` | Honor the Elders | *"The old tree's roots hold the young forest."* | +20% stability, -15% innovation |
| `celebrate_life` | Celebrate Life | *"Every birth is a hymn. Every feast, a sermon."* | +20% population, +happiness, -10% military discipline |
| `discipline_above_all` | Discipline Above All | *"Order is the architecture of divinity."* | +20% productivity, -15% happiness |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `caste_system` | Caste System | *"Each soul has its station. To question it is to question the divine plan."* | +25% economy, +15% stability; -20% happiness | Win pure war |
| `nomadic_tradition` | Nomadic Tradition | *"The earth is a gift, not a prison. Walk it."* | +30% exploration, +20% trade; -25% defense, -15% construction | Visit 10 Earths |

### DIVINE

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `sacrifices_please_god` | Sacrifices Please God | *"Give unto the fire, and the fire gives back."* | Resources → bonus divine energy |
| `help_themselves` | God Helps Those Who Help Themselves | *"I made you capable. Use it."* | Less energy cost, less controllable powers |
| `signs_and_wonders` | Signs and Wonders | *"Let the sky crack open. Let them remember who I am."* | Miracles more effective; followers expect them |
| `god_is_silent` | God is Silent | *"I speak in harvests, in rain, in the absence of plague. Listen harder."* | Powers cost less; followers more independent |
| `fear_gods_wrath` | Fear God's Wrath | *"I am kind. Do not test how kind."* | Disasters on rebels effective; authoritarian tone |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `divine_economy` | Divine Economy | *"Commerce is communion. Every trade route is a prayer line."* | Trade routes generate +0.1 energy/min each (max +0.5); -15% miracles | Win a run |
| `prophet_lineage` | Prophet Lineage | *"My voice passes from parent to child. The bloodline is the doctrine."* | Prophets live 50% longer, 80% lineage chance; -20% other voice types | Survive past 1900 |
| `echoes_of_creation` | Echoes of Creation | *"My touch is not a pin. It is a wave."* | Divine powers splash to adjacent regions at 30%; -20% precision | Win a run |

### NATURE

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `earth_is_sacred` | The Earth is Sacred | *"The dirt beneath your feet is my skin. Tread carefully."* | Disasters 50% less severe; -10% industry |
| `dominion_over_nature` | Dominion Over Nature | *"I gave you the world. I did not say to leave it as you found it."* | +15% resources; disasters hit harder |
| `harmony_with_seasons` | Harmony with Seasons | *"Plant with the rain. Harvest with the sun. Wait with the winter."* | Slow stable growth; weather blessings cheaper |
| `build_great_works` | Build Great Works | *"Let your towers reach toward me. I enjoy the view."* | +20% construction, +influence |
| `wander_and_explore` | Wander and Explore | *"Stay in one place and you worship the ground. Move, and you worship the horizon."* | +exploration, +trade, weaker defense |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `weather_mastery` | Weather Mastery | *"The storm is my instrument. I choose when it plays."* | Disasters -70% in your regions; predict disasters 1 era early; -15% energy regen | Win pure peace |
| `industrial_zeal` | Industrial Zeal | *"Smoke rises like prayer. Build more chimneys."* | +35% economy, +20% dev speed; -25% disaster resistance | Visit 10 Earths |

### MORALITY

| ID | Commandment | Scripture | Effect |
|----|-------------|-----------|--------|
| `all_life_sacred` | All Life is Sacred | *"Every heartbeat is a note in my symphony. Silence none."* | No plague/famine powers; +25% diplomacy |
| `justice_absolute` | Justice is Absolute | *"The law bends for no one. Not even me."* | High order, rigid enforcement |
| `forgive_and_redeem` | Forgive and Redeem | *"The enemy of today is the convert of tomorrow."* | 2× integration speed for conquered/converted |
| `ends_justify_means` | The Ends Justify the Means | *"History remembers the victors. I remember everything."* | No moral penalties; followers lose faith over time |
| `charity_above_all` | Charity Above All | *"Give until it hurts. Then give because it hurts."* | +diplomacy, -economy |

#### Unlockable

| ID | Commandment | Scripture | Effect | Unlock |
|----|-------------|-----------|--------|--------|
| `holy_martyrdom` | Holy Martyrdom | *"The blood of the faithful is the seed of the church."* | Follower deaths → +30% conversion in that region, +20% sympathy; -10% pop growth | Lose 3 times |
| `zealotry` | Zealotry | *"Half-faith is no faith. Burn with it or burn from it."* | +40% faith spread, +25% holy war morale; -30% diplomacy, +20% schism risk | Win pure war |

---

## Tension System

Conflicting commandments are **allowed** but create a permanent schism risk modifier.

### Base Tension Pairs

| Tension Pair | Schism Modifier |
|--------------|-----------------|
| Turn the Other Cheek ↔ Smite the Wicked | +25% |
| Share All Wealth ↔ Reward the Strong | +20% |
| Seek Truth Above All ↔ Sacred Knowledge | +15% |
| All Life is Sacred ↔ The Ends Justify the Means | +30% |
| God is Silent ↔ Signs and Wonders | +20% |
| The Earth is Sacred ↔ Dominion Over Nature | +25% |

### Unlockable Tension Pairs

| Tension Pair | Schism Modifier |
|--------------|-----------------|
| The Hidden Faith ↔ Preach to All Lands | +20% |
| Mercenary Blessing ↔ Share All Wealth | +20% |
| Steal the Fire ↔ Sacred Knowledge | +25% |
| Caste System ↔ Share All Wealth | +30% |
| Nomadic Tradition ↔ Sacred Borders | +25% |
| Industrial Zeal ↔ The Earth is Sacred | +30% |
| Holy Martyrdom ↔ All Life is Sacred | +30% |
| Zealotry ↔ Diplomatic Union | +25% |

---

## Unlocking Commandments

Players start with **all 35 base** commandments unlocked. The 15 unlockable commandments are earned through play:

| Condition | Commandments Unlocked | Count |
|-----------|----------------------|-------|
| Survive past 1900 | Cultural Hegemony, Dangerous Experiments, Prophet Lineage + 0-1 base | 3 |
| Win a run | Mercenary Blessing, Divine Economy, Echoes of Creation + 0-1 base | 3 |
| Lose 3 times | Asymmetric Warfare, Holy Martyrdom + 0-1 base | 2 |
| Win pure peace (no conquest) | Hidden Faith, Weather Mastery | 2 |
| Win pure war (conquest path) | Caste System, Zealotry | 2 |
| Visit 10 Earths | Steal the Fire, Nomadic Tradition, Industrial Zeal | 3 |
| **Total unlockable** | | **15** |

---

## Combinatorial Depth

**50 total commandments** → C(50,10) = **10 billion+** combinations from the full pool. Even the starting pool of 25 yields **3.2M+ combinations**. Every religion feels unique. The 10-commandment constraint forces meaningful tradeoffs — you cannot have everything.

---

## Stage 6: Commandment Balance Matrix

Exact `CommandmentEffects` values (see `game.ts`). These are authoritative for implementation. Additive stacking, capped at +0.75 / −0.50 per stat.

### Exact Modifier Values

| ID | Positive Modifiers | Negative Modifiers |
|----|-------------------|-------------------|
| `preach_to_all_lands` | missionaryEffectiveness: +0.25 | — |
| `convert_by_example` | conversionRetention: +0.20, passiveSpread: true | conversionRate: −0.15 |
| `holy_conquest` | autoConvertOnConquest: true | conversionRetention: −0.10, happiness: −0.05 |
| `welcome_all` | conversionRate: +0.30 | schismRisk: +0.15 |
| `sacred_borders` | defenseBonus: +0.40 | canDeclareWar: false |
| `hidden_faith` | conversionRate: +0.30† | missionaryEffectiveness: −0.20 |
| `cultural_hegemony` | tradeBonus: +0.25, happiness: +0.10 | — |
| `turn_other_cheek` | conversionRate: +0.20 | canDeclareWar: false |
| `righteous_defense` | defenseBonus: +0.30 | canDeclareWar: false |
| `smite_the_wicked` | holyWarEnabled: true, militaryMorale: +0.20 | diplomacyBonus: −0.40 |
| `conquer_and_enlighten` | attackBonus: +0.10, integrationSpeed: +0.30 | — |
| `diplomatic_union` | diplomacyBonus: +0.30 | militaryStrength: −0.15 |
| `mercenary_blessing` | militaryStrength: +0.20 | economicOutput: −0.10 |
| `asymmetric_warfare` | defenseBonus: +0.30 | attackBonus: −0.15 |
| `seek_truth` | researchSpeed: +0.30 | schismRisk: +0.10 |
| `sacred_knowledge` | researchSpeed: +0.15 | conversionRate: −0.10 |
| `forbidden_knowledge` | stability: +0.15, schismRisk: −0.10 | researchSpeed: −0.20 |
| `teach_every_child` | researchSpeed: +0.20, populationGrowth: +0.10 | militaryStrength: −0.10 |
| `learn_from_all` | researchSpeed: +0.15†, tradeBonus: +0.10 | — |
| `steal_the_fire` | researchSpeed: +0.20†, tradeBonus: +0.10 | diplomacyBonus: −0.10 |
| `dangerous_experiments` | researchSpeed: +0.40 | disasterResistance: −0.15, accidentRisk: 0.05‡ |
| `share_all_wealth` | happiness: +0.25 | economicOutput: −0.10 |
| `reward_the_strong` | economicOutput: +0.15 | happiness: −0.10 |
| `honor_elders` | stability: +0.20 | researchSpeed: −0.15 |
| `celebrate_life` | populationGrowth: +0.20, happiness: +0.10 | militaryMorale: −0.10 |
| `discipline_above_all` | productivityBonus: +0.20 | happiness: −0.15 |
| `caste_system` | economicOutput: +0.25, stability: +0.15 | happiness: −0.20 |
| `nomadic_tradition` | explorationSpeed: +0.30, tradeBonus: +0.20 | defenseBonus: −0.25, constructionSpeed: −0.15 |
| `sacrifices_please_god` | divineEnergyRegenMod: +0.30 | — |
| `help_themselves` | divineEnergyCostMod: −0.15 | miracleEffectiveness: −0.10 |
| `signs_and_wonders` | miracleEffectiveness: +0.30 | — |
| `god_is_silent` | divineEnergyCostMod: −0.20, stability: +0.10 | — |
| `fear_gods_wrath` | stability: +0.15, militaryMorale: +0.10 | — |
| `divine_economy` | divineEnergyRegenMod: +0.15, tradeBonus: +0.10 | miracleEffectiveness: −0.15 |
| `prophet_lineage` | *(Voice system: Prophet lifespan ×1.5, lineage 0.80)* | *(Other voice types −0.20)* |
| `echoes_of_creation` | *(Power system: splash adjacent at 0.30×)* | *(Precision −0.20)* |
| `earth_is_sacred` | disasterResistance: +0.50 | industrialOutput: −0.10 |
| `dominion_over_nature` | economicOutput: +0.15 | disasterResistance: −0.15 |
| `harmony_with_seasons` | stability: +0.10, divineEnergyCostMod: −0.10 | — |
| `build_great_works` | constructionSpeed: +0.20, missionaryEffectiveness: +0.10 | — |
| `wander_and_explore` | explorationSpeed: +0.25, tradeBonus: +0.15 | defenseBonus: −0.15 |
| `weather_mastery` | disasterResistance: +0.70 | divineEnergyRegenMod: −0.15 |
| `industrial_zeal` | economicOutput: +0.35, researchSpeed: +0.20 | disasterResistance: −0.25 |
| `all_life_sacred` | diplomacyBonus: +0.25 | canUsePlague: false, canUseFamine: false |
| `justice_absolute` | stability: +0.25 | happiness: −0.10 |
| `forgive_and_redeem` | integrationSpeed: +0.30, conversionRetention: +0.15 | — |
| `ends_justify_means` | hypocrisyDisabled: true | faithDecayPerTick: +0.001 |
| `charity_above_all` | diplomacyBonus: +0.20 | economicOutput: −0.15 |
| `holy_martyrdom` | conversionRate: +0.20, diplomacyBonus: +0.15 | populationGrowth: −0.10 |
| `zealotry` | missionaryEffectiveness: +0.40, militaryMorale: +0.25 | diplomacyBonus: −0.30, schismRisk: +0.20 |

### Synergy Pairs (strong together)

| Pair | Combined Benefit | Risk |
|------|-----------------|------|
| `seek_truth` + `dangerous_experiments` | +0.70 research (capped 0.75) | Fragile: +0.10 schism, −0.15 disaster resistance |
| `sacred_borders` + `righteous_defense` | +0.70 defense (capped 0.75) | Can't declare any wars |
| `smite_the_wicked` + `zealotry` | +0.45 morale, holy war + faith spread | −0.70 diplomacy, +0.20 schism |
| `share_all_wealth` + `celebrate_life` | +0.35 happiness, +0.20 population | −0.10 economy, −0.10 morale |
| `cultural_hegemony` + `learn_from_all` | +0.35 trade, research via trade | Requires trade infrastructure |
| `earth_is_sacred` + `weather_mastery` | +1.20 disaster resist (capped 0.75) | −0.10 industry, −0.15 energy regen |
| `sacrifices_please_god` + `divine_economy` | +0.45 energy regen | −0.15 miracle effectiveness |
| `industrial_zeal` + `seek_truth` | +0.55 research, +0.35 economy | −0.25 disaster resistance |

### Degenerate Build Validation

All of these are caught by the +0.75 stacking cap:

| Stack | Raw Sum | Capped |
|-------|---------|--------|
| Max research (6 commandments) | +1.45 | +0.75 |
| Max defense (3 commandments) | +1.00 | +0.75 |
| Max economy (4 commandments) | +0.90 | +0.75 |
| Max disaster resist (2 commandments) | +1.20 | +0.75 |

‡ **Dangerous Experiments accident:** 5% chance per era (checked at era boundary) of a catastrophic lab accident in the player's highest-Dev region. Effect: −1 Dev level, −5% population, −0.10 happiness. Equivalent to a mild Earthquake on your own city. Over 12 eras, ~46% chance of at least one accident. The +0.40 research bonus vastly outweighs a single accident, but multiple accidents compound. The risk is the price of progress.

† **Conditional modifiers:** These values apply only when a condition is met. `learn_from_all` research bonus requires active trade routes in the region. `steal_the_fire` research bonus applies to tech gained via trade or conquest, not base research. `hidden_faith` conversion bonus applies in hostile regions (where player religion influence < 0.30). Implementation should check the condition before applying the modifier; the listed value is the bonus when active, not a flat global.
