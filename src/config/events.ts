// =============================================================================
// DIVINE DOMINION — Event Templates (80 total, 8 categories × 10)
// =============================================================================
// Source of truth: docs/design/event-index.json + docs/design/08-events.md
// Types: src/types/game.ts (GameEvent, EventChoice, EventOutcome, EventCategory)
// =============================================================================

import type { EventCategory } from '../types/game.js';

// ---------------------------------------------------------------------------
// Template types (extend runtime types with trigger/weight metadata)
// ---------------------------------------------------------------------------

export interface EventTemplate {
  id: string;
  category: EventCategory;
  title: string;
  description: string;
  eraRange: [number, number];
  baseWeight: number;
  choices: EventTemplateChoice[];
  autoResolve: EventTemplateOutcome;
  alienCaused?: boolean;
}

export interface EventTemplateChoice {
  label: string;
  description: string;
  outcome: EventTemplateOutcome;
}

export interface EventTemplateOutcome {
  effects: Partial<EventEffects>;
  narrativeText: string;
}

export interface EventEffects {
  faithChange: number;
  happinessChange: number;
  researchChange: number;
  economyChange: number;
  militaryChange: number;
  populationChange: number;
  developmentChange: number;
}

// ---------------------------------------------------------------------------
// Military events (EVT_001–010)
// ---------------------------------------------------------------------------

const MILITARY_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_001', category: 'military', title: 'Border Skirmish',
    description: 'Soldiers of {nation_a} have crossed into {region}, a contested territory claimed by {nation_b}. Shots have been fired. Both sides look to you.',
    eraRange: [1, 12], baseWeight: 1.2,
    choices: [
      { label: 'Bless the Defenders', description: 'Grant your protection to those who hold the line.', outcome: { effects: { faithChange: 0.10, militaryChange: 500 }, narrativeText: 'Your light shines on the defenders. Their resolve stiffens.' } },
      { label: 'Curse the Aggressors', description: 'Let divine displeasure scatter the invaders.', outcome: { effects: { militaryChange: -300, happinessChange: -0.05 }, narrativeText: 'A divine wind scatters the advance. The aggressors retreat, shaken.' } },
      { label: 'Stay Silent', description: 'Let mortals settle mortal disputes.', outcome: { effects: { faithChange: -0.05 }, narrativeText: 'Your silence speaks louder than any miracle. Both sides wonder if you care.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03 }, narrativeText: 'The skirmish resolves on its own. Your followers notice your absence.' },
  },
  {
    id: 'EVT_002', category: 'military', title: 'Full-Scale Invasion',
    description: '{nation_a} has launched a full invasion of {nation_b}. Armies march. Cities burn. Your followers are caught in the crossfire — on both sides.',
    eraRange: [2, 12], baseWeight: 0.8,
    choices: [
      { label: 'Shield the Innocent', description: 'Protect civilian regions from the worst of it.', outcome: { effects: { happinessChange: 0.10, populationChange: 500 }, narrativeText: 'A miraculous calm settles over the villages. The armies march around them, baffled.' } },
      { label: 'Aid the Weaker Side', description: 'Even the odds. The underdog deserves a chance.', outcome: { effects: { militaryChange: 800, faithChange: 0.05 }, narrativeText: 'The smaller army finds new strength. Deserters return. Something has changed.' } },
      { label: 'Let It Burn', description: 'War is the forge. Let it shape what comes next.', outcome: { effects: { populationChange: -1000, developmentChange: -0.5 }, narrativeText: 'The war takes its toll. Cities fall. But from the ashes, harder nations will rise.' } },
    ],
    autoResolve: { effects: { populationChange: -500, happinessChange: -0.08 }, narrativeText: 'The invasion grinds on. No divine hand intervenes.' },
  },
  {
    id: 'EVT_003', category: 'military', title: 'Arms Race',
    description: '{nation_a} and {nation_b} are building weapons faster than they can build reasons to use them. Military spending consumes resources that could go to science or faith.',
    eraRange: [3, 12], baseWeight: 1.0, alienCaused: true,
    choices: [
      { label: 'Inspire Disarmament', description: 'Whisper peace. Redirect resources to development.', outcome: { effects: { militaryChange: -400, researchChange: 0.10 }, narrativeText: 'A wave of pacifism sweeps both nations. Swords are melted. Books are printed.' } },
      { label: 'Bless the Builders', description: 'If they must build, let them build well.', outcome: { effects: { militaryChange: 600, developmentChange: 0.3 }, narrativeText: 'The arms race produces unexpected innovations. Military engineering advances civilian technology.' } },
      { label: 'Stay Silent', description: 'They\'ll tire eventually. Probably.', outcome: { effects: { happinessChange: -0.05, militaryChange: 200 }, narrativeText: 'The arms race continues. Treasuries empty. Tensions mount.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03, militaryChange: 100 }, narrativeText: 'The arms race simmers without resolution.' },
  },
  {
    id: 'EVT_004', category: 'military', title: 'Siege of the Capital',
    description: 'Enemy forces surround the capital of {nation_a}. If it falls, the nation may not survive. Your faithful within the walls pray desperately.',
    eraRange: [2, 12], baseWeight: 0.6,
    choices: [
      { label: 'Shield of Faith', description: 'Protect the capital with divine power.', outcome: { effects: { faithChange: 0.15, militaryChange: 300 }, narrativeText: 'A golden light descends on the walls. Arrows turn. Siege engines falter. Your name echoes from the ramparts.' } },
      { label: 'Earthquake the Besiegers', description: 'The earth itself rejects the invaders.', outcome: { effects: { militaryChange: -600, developmentChange: -0.3 }, narrativeText: 'The ground cracks beneath the siege camp. Devastating — and indiscriminate. Some of your own followers were in the way.' } },
      { label: 'Evacuate the Faithful', description: 'Save the people. Let the city fall.', outcome: { effects: { populationChange: 300, faithChange: 0.05, developmentChange: -1.0 }, narrativeText: 'Your followers flee with their lives and their faith intact. The city burns behind them.' } },
    ],
    autoResolve: { effects: { faithChange: -0.10, populationChange: -800 }, narrativeText: 'The siege grinds on. Without divine aid, the capital\'s fate rests on mortal courage alone.' },
  },
  {
    id: 'EVT_005', category: 'military', title: 'Naval Confrontation',
    description: 'Warships of {nation_a} and {nation_b} face off along a vital trade route near {region}. Commerce has stopped. Your followers in coastal cities watch nervously.',
    eraRange: [2, 12], baseWeight: 0.9,
    choices: [
      { label: 'Storm the Aggressor', description: 'A divine tempest scatters the attacking fleet.', outcome: { effects: { militaryChange: -400, faithChange: 0.08 }, narrativeText: 'The storm comes from nowhere. The aggressor\'s fleet scatters like leaves. Your coastal followers fall to their knees.' } },
      { label: 'Calm the Seas', description: 'Force both fleets to stand down through miraculous calm.', outcome: { effects: { happinessChange: 0.05, faithChange: 0.03 }, narrativeText: 'The wind dies. The waves flatten. In the eerie stillness, neither captain dares give the order to fire.' } },
      { label: 'Stay Silent', description: 'The sea sorts its own problems.', outcome: { effects: { faithChange: -0.03 }, narrativeText: 'The confrontation resolves through mortal negotiation. Your followers wonder why the sea god stayed home.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'The standoff ends without divine intervention. Trade slowly resumes.' },
  },
  {
    id: 'EVT_006', category: 'military', title: 'Ceasefire Proposal',
    description: 'After years of bloodshed, {nation_a} offers peace. {nation_b}\'s generals want to press the advantage. Your followers serve in both armies.',
    eraRange: [1, 12], baseWeight: 1.1,
    choices: [
      { label: 'Bless the Peace', description: 'Let this war end. Enough blood.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.05 }, narrativeText: 'Doves circle the negotiation tent. An omen, the diplomats agree. The treaty is signed before sunset.' } },
      { label: 'Undermine the Truce', description: 'Peace now means weakness later. They need to finish this.', outcome: { effects: { militaryChange: 400, happinessChange: -0.08 }, narrativeText: 'The ceasefire collapses. Accusations fly. Your generals find their second wind.' } },
      { label: 'Stay Silent', description: 'Let them decide their own fate.', outcome: { effects: { faithChange: -0.02 }, narrativeText: 'The ceasefire holds — barely. Both sides eye each other across the truce line.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The ceasefire takes effect without divine endorsement.' },
  },
  {
    id: 'EVT_007', category: 'military', title: 'Mercenary Company',
    description: 'A renowned mercenary company offers its services to {nation_a}. Gold for swords — a simple transaction, if your commandments allow it.',
    eraRange: [1, 8], baseWeight: 0.7,
    choices: [
      { label: 'Hire Them', description: 'Gold buys swords. Swords buy time.', outcome: { effects: { militaryChange: 1000, happinessChange: -0.03 }, narrativeText: 'The mercenaries arrive — professional, expensive, and entirely amoral. Your generals look relieved.' } },
      { label: 'Reject Them', description: 'Your faithful fight their own battles.', outcome: { effects: { faithChange: 0.05, militaryChange: -200 }, narrativeText: 'The mercenaries shrug and ride on. Your followers take pride in fighting alone.' } },
      { label: 'Redirect to Enemy', description: 'Pay them to fight for the other side. Then change your mind.', outcome: { effects: { militaryChange: 200, happinessChange: -0.05 }, narrativeText: 'The mercenaries switch sides mid-battle. Chaos ensues. Your generals call it \'strategy.\'' } },
    ],
    autoResolve: { effects: {}, narrativeText: 'The mercenaries find employment elsewhere.' },
  },
  {
    id: 'EVT_008', category: 'military', title: 'War Hero Emerges',
    description: 'Commander {leader} of {nation_a} has won three impossible victories. The soldiers worship them. Your followers among them are starting to worship {leader} almost as much as they worship you.',
    eraRange: [1, 12], baseWeight: 0.6,
    choices: [
      { label: 'Bless the Hero', description: 'Elevate them. A divine champion inspires faith.', outcome: { effects: { faithChange: 0.10, militaryChange: 500 }, narrativeText: 'You anoint {leader} with divine favor. The army roars. A new legend is born — under your auspices.' } },
      { label: 'Humble the Hero', description: 'There is only one object of worship here.', outcome: { effects: { faithChange: 0.05, militaryChange: -200 }, narrativeText: '{leader} stumbles in the next engagement. Nothing fatal — just enough to remind everyone who\'s really in charge.' } },
    ],
    autoResolve: { effects: { faithChange: -0.02 }, narrativeText: '{leader}\'s legend grows on its own merits. Your role in their success goes unacknowledged.' },
  },
  {
    id: 'EVT_009', category: 'military', title: 'Desertion Crisis',
    description: 'The armies of {nation_a} are bleeding soldiers. Men slip away in the night, returning to farms and families. The generals demand you do something about morale.',
    eraRange: [2, 12], baseWeight: 0.9,
    choices: [
      { label: 'Inspire Courage', description: 'Remind them what they\'re fighting for.', outcome: { effects: { militaryChange: 300, faithChange: 0.05 }, narrativeText: 'Dreams of glory and divine purpose spread through the camps. The deserters return, shame-faced but resolute.' } },
      { label: 'Let Them Go', description: 'A soldier who doesn\'t want to fight won\'t fight well.', outcome: { effects: { militaryChange: -500, happinessChange: 0.08 }, narrativeText: 'The army shrinks, but the remaining soldiers are willing. Quality over quantity.' } },
      { label: 'Punish Deserters', description: 'Make an example. Discipline is divine.', outcome: { effects: { militaryChange: 100, happinessChange: -0.10, faithChange: -0.03 }, narrativeText: 'The executions are public. The desertions stop. Something else stops too — the easy laughter around campfires.' } },
    ],
    autoResolve: { effects: { militaryChange: -300, happinessChange: 0.03 }, narrativeText: 'The desertions continue at a steady trickle. The war effort weakens.' },
  },
  {
    id: 'EVT_010', category: 'military', title: 'Weapons of Mass Destruction',
    description: '{nation_a} has developed weapons capable of annihilating entire cities. The question isn\'t whether they can. It\'s whether anyone should.',
    eraRange: [7, 12], baseWeight: 0.5,
    choices: [
      { label: 'Forbid Their Use', description: 'Some lines should never be crossed. Even by you.', outcome: { effects: { faithChange: 0.10, militaryChange: -300 }, narrativeText: 'Your commandment echoes through laboratories. The weapons are mothballed. Scientists weep with relief.' } },
      { label: 'Encourage Deterrence', description: 'Let the threat of annihilation prevent annihilation.', outcome: { effects: { militaryChange: 800, happinessChange: -0.10 }, narrativeText: 'The weapons exist. Everyone knows it. Peace holds — tense, fragile, radioactive.' } },
      { label: 'Stay Silent', description: 'This decision is above even a god\'s pay grade.', outcome: { effects: { happinessChange: -0.08 }, narrativeText: 'Without divine guidance, the decision falls to mortal politicians. That\'s either reassuring or terrifying.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05 }, narrativeText: 'The weapons program proceeds without divine comment. The world sleeps a little less soundly.' },
  },
];

// ---------------------------------------------------------------------------
// Religious events (EVT_011–020)
// ---------------------------------------------------------------------------

const RELIGIOUS_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_011', category: 'religious', title: 'Prophet Arises',
    description: 'In the dusty streets of {region}, a voice rings out. {leader} claims to have heard you speak. The crowd is listening. Whether you actually spoke is... debatable.',
    eraRange: [1, 12], baseWeight: 1.0,
    choices: [
      { label: 'Endorse the Prophet', description: 'They speak truly. Or close enough.', outcome: { effects: { faithChange: 0.15, happinessChange: 0.05 }, narrativeText: 'A sign appears — a ray of light, a sudden rain, something undeniable. {leader}\'s words gain divine weight.' } },
      { label: 'Discredit the Prophet', description: 'You don\'t need middle management.', outcome: { effects: { faithChange: -0.05, happinessChange: -0.03 }, narrativeText: 'The prophet\'s next prediction fails spectacularly. The crowd disperses. You feel slightly guilty.' } },
      { label: 'Observe', description: 'Let them prove themselves. Or not.', outcome: { effects: { faithChange: 0.03 }, narrativeText: 'The prophet gains a small following. Time will tell if they\'re genuine or just charismatic.' } },
    ],
    autoResolve: { effects: { faithChange: 0.05 }, narrativeText: 'The self-proclaimed prophet gathers a modest following on their own merits.' },
  },
  {
    id: 'EVT_012', category: 'religious', title: 'Holy Pilgrimage',
    description: 'Thousands of your faithful are walking to {region}, the site where you first blessed this Earth. The journey is dangerous — but their faith is unwavering.',
    eraRange: [1, 12], baseWeight: 0.8,
    choices: [
      { label: 'Bless the Journey', description: 'Protect the pilgrims. They\'ve earned it.', outcome: { effects: { faithChange: 0.12, happinessChange: 0.08 }, narrativeText: 'Not a single pilgrim falls ill. Not a single bandit attacks. They arrive in tears of joy. A miracle — or very good luck.' } },
      { label: 'Test Their Faith', description: 'A storm on the mountain pass. Those who persist deserve your blessing.', outcome: { effects: { faithChange: 0.08, populationChange: -100 }, narrativeText: 'The storm claims a few. The rest arrive transformed — harder, holier, utterly devoted.' } },
      { label: 'Ignore', description: 'Faith should sustain itself without constant validation.', outcome: { effects: { faithChange: 0.02 }, narrativeText: 'The pilgrimage proceeds without incident. Pleasant, uneventful, and slightly disappointing for everyone involved.' } },
    ],
    autoResolve: { effects: { faithChange: 0.05 }, narrativeText: 'The pilgrimage concludes safely. Your followers return with renewed purpose.' },
  },
  {
    id: 'EVT_013', category: 'religious', title: 'Heresy Spreads',
    description: 'The followers of {religion} in neighboring {region} are whispering new ideas to your faithful. Some of your flock find these ideas... interesting.',
    eraRange: [2, 12], baseWeight: 1.1,
    choices: [
      { label: 'Suppress the Heresy', description: 'Stamp it out. Hard.', outcome: { effects: { faithChange: 0.10, happinessChange: -0.08 }, narrativeText: 'The heretical texts burn. The whispers stop. Your faithful are loyal again — if a bit quieter than before.' } },
      { label: 'Debate Publicly', description: 'Let truth defend itself in the open.', outcome: { effects: { faithChange: -0.03, researchChange: 0.05 }, narrativeText: 'The theological debates draw crowds. Your doctrine holds up — mostly. A few converts are lost, but intellectual respect is gained.' } },
      { label: 'Tolerate', description: 'Diversity of thought isn\'t heresy. Usually.', outcome: { effects: { faithChange: -0.05, happinessChange: 0.05 }, narrativeText: 'The foreign ideas circulate freely. Your faith evolves subtly — adapting, absorbing, becoming something slightly new.' } },
    ],
    autoResolve: { effects: { faithChange: -0.05 }, narrativeText: 'The heretical ideas spread unchecked. Some of your faithful are swayed.' },
  },
  {
    id: 'EVT_014', category: 'religious', title: 'Miracle Reported',
    description: 'A farmer in {region} claims a golden light healed their dying child. The village is in awe. You... didn\'t actually do that. Did you?',
    eraRange: [1, 12], baseWeight: 0.7,
    choices: [
      { label: 'Claim Credit', description: 'Of course you did that. You\'re a god. It\'s what you do.', outcome: { effects: { faithChange: 0.10, happinessChange: 0.05 }, narrativeText: 'Your followers celebrate. A shrine is erected on the spot. You decide not to mention you were actually watching a different continent at the time.' } },
      { label: 'Stay Modest', description: 'Let the mystery stand. Faith doesn\'t need receipts.', outcome: { effects: { faithChange: 0.05 }, narrativeText: 'The miracle becomes legend. Unconfirmed, undenied, unstoppable.' } },
    ],
    autoResolve: { effects: { faithChange: 0.05 }, narrativeText: 'The miracle story spreads by word of mouth. Faith grows modestly.' },
  },
  {
    id: 'EVT_015', category: 'religious', title: 'The Great Schism',
    description: 'Followers of {religion} in {region} have split over the meaning of \'{commandment}.\' A charismatic preacher says your words mean something different. Your faithful are choosing sides.',
    eraRange: [3, 12], baseWeight: 0.8,
    choices: [
      { label: 'Support the Orthodox', description: 'Your words mean what they\'ve always meant.', outcome: { effects: { faithChange: 0.15, happinessChange: -0.10, researchChange: -0.05 }, narrativeText: 'You make your will known. The orthodox rejoice. The reformers burn with resentment.' } },
      { label: 'Support the Reformers', description: 'Perhaps your words need reinterpretation for a new age.', outcome: { effects: { faithChange: -0.10, happinessChange: 0.05, researchChange: 0.10 }, narrativeText: 'Change is divine too. The reformers carry your blessing into new interpretations.' } },
      { label: 'Stay Silent', description: 'Ambiguity is a feature, not a bug.', outcome: { effects: { faithChange: -0.05, happinessChange: -0.05 }, narrativeText: 'Your silence is interpreted by both sides as agreement. The schism deepens.' } },
    ],
    autoResolve: { effects: { faithChange: -0.08 }, narrativeText: 'Without divine guidance, the split widens. A new faith is born from yours.' },
  },
  {
    id: 'EVT_016', category: 'religious', title: 'Reformation Movement',
    description: 'Scholars and priests in {nation_a} are demanding that {religion} modernize its teachings. They want to drop \'{commandment}\' and adopt something more... progressive.',
    eraRange: [3, 12], baseWeight: 0.7,
    choices: [
      { label: 'Embrace Reform', description: 'Adapt or die. Even gods know this.', outcome: { effects: { faithChange: -0.05, researchChange: 0.10, happinessChange: 0.05 }, narrativeText: 'The reformation sweeps through your faithful. Old traditions fall. New energy rises.' } },
      { label: 'Reject Reform', description: 'Your words are eternal. They don\'t need updating.', outcome: { effects: { faithChange: 0.10, researchChange: -0.05, happinessChange: -0.05 }, narrativeText: 'The reformers are silenced. Your doctrine stands unchanged — rigid, ancient, and increasingly out of touch.' } },
      { label: 'Negotiate', description: 'Keep the core, update the edges.', outcome: { effects: { faithChange: 0.02, researchChange: 0.05 }, narrativeText: 'A compromise emerges. The essential commandments hold, but the interpretation softens. Everyone claims victory.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03, researchChange: 0.03 }, narrativeText: 'The reformation debate continues without resolution. Tensions simmer.' },
  },
  {
    id: 'EVT_017', category: 'religious', title: 'Interfaith Dialogue',
    description: 'Leaders of {religion} and {religion} meet in {region} to discuss their differences. It\'s either the beginning of understanding or the beginning of a very polite war.',
    eraRange: [3, 12], baseWeight: 0.6,
    choices: [
      { label: 'Encourage Unity', description: 'Perhaps these faiths have more in common than they think.', outcome: { effects: { faithChange: -0.05, happinessChange: 0.10 }, narrativeText: 'The dialogue produces a joint statement of shared values. Cynics call it meaningless. Your followers call it hope.' } },
      { label: 'Assert Dominance', description: 'Dialogue is fine, but there\'s only one true faith.', outcome: { effects: { faithChange: 0.08, happinessChange: -0.05 }, narrativeText: 'Your representative dominates the debate. The rival faith retreats — impressed, offended, and plotting revenge.' } },
      { label: 'Observe', description: 'Let them talk. You\'ll learn something about your rival.', outcome: { effects: { faithChange: 0.02, researchChange: 0.03 }, narrativeText: 'The dialogue reveals the inner workings of the rival faith. Useful intelligence, wrapped in theological pleasantries.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The dialogue produces polite disagreement and excellent catering.' },
  },
  {
    id: 'EVT_018', category: 'religious', title: 'Sacred Text Discovered',
    description: 'Archaeologists in {region} have unearthed ancient writings that predate your religion. The texts suggest... things. Things that could validate your commandments — or contradict them entirely.',
    eraRange: [2, 10], baseWeight: 0.5,
    choices: [
      { label: 'Declare Them Proof', description: 'These texts prove your divine authority predates memory.', outcome: { effects: { faithChange: 0.12, researchChange: 0.05 }, narrativeText: 'The texts are interpreted as prophecy fulfilled. Your faith gains historical weight. Scholars aren\'t entirely convinced, but they\'re outnumbered.' } },
      { label: 'Suppress the Discovery', description: 'Some truths are too complicated for the faithful.', outcome: { effects: { faithChange: 0.05, researchChange: -0.08 }, narrativeText: 'The texts disappear into a vault. The archaeologists are reassigned to less interesting digs.' } },
      { label: 'Open Debate', description: 'Let scholars examine them freely. Truth can handle scrutiny.', outcome: { effects: { faithChange: -0.03, researchChange: 0.10 }, narrativeText: 'The texts spark a generation of scholarship. Some conclusions are uncomfortable. All of them are fascinating.' } },
    ],
    autoResolve: { effects: { researchChange: 0.03 }, narrativeText: 'The texts are studied quietly. Their impact remains scholarly rather than spiritual.' },
  },
  {
    id: 'EVT_019', category: 'religious', title: 'Inquisition',
    description: 'Your most zealous followers in {nation_a} want to root out unbelievers. They have lists. They have enthusiasm. They have very sharp implements.',
    eraRange: [2, 8], baseWeight: 0.6,
    choices: [
      { label: 'Sanction the Inquisition', description: 'Purify the faith. Whatever the cost.', outcome: { effects: { faithChange: 0.15, happinessChange: -0.15, populationChange: -200 }, narrativeText: 'The purge begins. Your faithful are pure — and terrified. The unbelievers are gone. So is much of the neighborhood.' } },
      { label: 'Forbid It', description: 'Forced faith is no faith at all.', outcome: { effects: { faithChange: -0.05, happinessChange: 0.08 }, narrativeText: 'Your zealots are bitterly disappointed. But the marketplaces stay full, and the foreign quarter breathes easier.' } },
      { label: 'Redirect to Scholarship', description: 'Convert through argument, not arrest.', outcome: { effects: { faithChange: 0.03, researchChange: 0.05 }, narrativeText: 'The would-be inquisitors become theologians. Their debates are less bloody but significantly more boring.' } },
    ],
    autoResolve: { effects: { faithChange: 0.05, happinessChange: -0.05 }, narrativeText: 'A small-scale purge occurs without your guidance. The results are predictably ugly.' },
  },
  {
    id: 'EVT_020', category: 'religious', title: 'Divine Doubt',
    description: 'Philosophers in {region} are asking uncomfortable questions. \'If God is all-powerful, why does suffering exist?\' Your followers are intrigued. You are annoyed.',
    eraRange: [5, 12], baseWeight: 0.8,
    choices: [
      { label: 'Demonstrate Power', description: 'They want proof? Give them proof.', outcome: { effects: { faithChange: 0.10, researchChange: -0.05 }, narrativeText: 'A timely miracle silences the doubters. The philosophers retreat to less dangerous topics like mathematics.' } },
      { label: 'Embrace the Questioning', description: 'Faith that can\'t survive questions isn\'t faith.', outcome: { effects: { faithChange: -0.05, researchChange: 0.10 }, narrativeText: 'The philosophical movement produces brilliant theology. Your faith becomes more sophisticated — and slightly less certain.' } },
      { label: 'Stay Silent', description: 'The best answer to \'does God exist?\' is no answer at all.', outcome: { effects: { faithChange: -0.03, researchChange: 0.05 }, narrativeText: 'Your silence is interpreted as either profound wisdom or cosmic indifference. Both interpretations attract followers.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03, researchChange: 0.03 }, narrativeText: 'The philosophical movement runs its course. Some faith is lost. Some wisdom is gained.' },
  },
];

// ---------------------------------------------------------------------------
// Scientific events (EVT_021–030)
// ---------------------------------------------------------------------------

const SCIENTIFIC_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_021', category: 'scientific', title: 'Breakthrough Discovery',
    description: 'Scholars at {region}\'s academy have made a discovery that could change everything. The implications are staggering — and your clergy are already arguing about whether it\'s heresy.',
    eraRange: [1, 12], baseWeight: 1.0,
    choices: [
      { label: 'Fund the Research', description: 'Knowledge is divine. Even the uncomfortable kind.', outcome: { effects: { researchChange: 0.15, faithChange: -0.03 }, narrativeText: 'Gold flows to the academy. The breakthrough accelerates. Your clergy grumble but can\'t argue with results.' } },
      { label: 'Restrict to Sacred Use', description: 'Knowledge serves the faith, not the other way around.', outcome: { effects: { researchChange: 0.05, faithChange: 0.08 }, narrativeText: 'The discovery is framed as divine revelation. The science advances, but only in directions your clergy approve.' } },
      { label: 'Suppress', description: 'Some knowledge isn\'t ready for the world.', outcome: { effects: { researchChange: -0.10, faithChange: 0.05 }, narrativeText: 'The research is locked away. The scholars are quietly reassigned. Progress waits for a more open-minded generation.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'The discovery circulates among scholars. Its impact is gradual but real.' },
  },
  {
    id: 'EVT_022', category: 'scientific', title: 'University Founded',
    description: '{nation_a} proposes a grand academy in {region}. It would be the first institution dedicated purely to knowledge. Your faithful are divided: is learning prayer or competition?',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Bless the Academy', description: 'Let knowledge flourish under your divine banner.', outcome: { effects: { researchChange: 0.12, faithChange: 0.05, developmentChange: 0.5 }, narrativeText: 'The university rises, its gates inscribed with your commandments. Scholars arrive from across the known world.' } },
      { label: 'Demand Religious Curriculum', description: 'Education is fine, as long as they learn the right things.', outcome: { effects: { researchChange: 0.05, faithChange: 0.10 }, narrativeText: 'The university opens with theology as its primary discipline. The science is good. The prayers are better.' } },
      { label: 'Oppose', description: 'Organized knowledge is organized doubt.', outcome: { effects: { researchChange: -0.05, faithChange: 0.03 }, narrativeText: 'The university plan stalls. Your clergy celebrate. Your scholars quietly begin meeting in basements.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05, developmentChange: 0.3 }, narrativeText: 'The university opens without divine endorsement. It does fine anyway.' },
  },
  {
    id: 'EVT_023', category: 'scientific', title: 'Genius Inventor',
    description: 'A brilliant mind in {region} has invented something remarkable. The device is practical, revolutionary, and — according to your priests — possibly satanic.',
    eraRange: [2, 12], baseWeight: 0.6,
    choices: [
      { label: 'Champion the Inventor', description: 'Genius is a gift from above. Even when it\'s inconvenient.', outcome: { effects: { researchChange: 0.10, developmentChange: 0.5 }, narrativeText: 'Your endorsement makes the inventor a celebrity. The device spreads. Your priests learn to live with it.' } },
      { label: 'Study Quietly', description: 'Observe the invention. Don\'t commit.', outcome: { effects: { researchChange: 0.05 }, narrativeText: 'The invention spreads at its own pace. Your faithful adopt it when convenient and ignore it when not.' } },
    ],
    autoResolve: { effects: { researchChange: 0.03 }, narrativeText: 'The invention finds its way into daily life without divine comment.' },
  },
  {
    id: 'EVT_024', category: 'scientific', title: 'Research Sabotage',
    description: 'Someone has destroyed the laboratory in {region}. Years of research, gone. The scholars suspect espionage from {nation_b}. Your scholars are devastated.',
    eraRange: [3, 12], baseWeight: 0.6, alienCaused: true,
    choices: [
      { label: 'Inspire Rebuilding', description: 'Knowledge lost can be recovered. With divine motivation.', outcome: { effects: { researchChange: 0.05, faithChange: 0.05 }, narrativeText: 'The scholars rebuild with renewed vigor. The setback becomes a rallying cry for knowledge.' } },
      { label: 'Retaliate', description: 'If they destroy knowledge, they\'ll learn what your wrath looks like.', outcome: { effects: { researchChange: -0.03, militaryChange: 200 }, narrativeText: 'Your response is swift and unsubtle. {nation_b}\'s own scholars suddenly find their labs catching fire.' } },
      { label: 'Investigate', description: 'Find out who did this before reacting.', outcome: { effects: { researchChange: 0.02 }, narrativeText: 'The investigation reveals uncomfortable truths. The sabotage wasn\'t foreign — it was domestic, motivated by religious conservatism.' } },
    ],
    autoResolve: { effects: { researchChange: -0.05 }, narrativeText: 'The research is lost. The scholars mourn. The culprit is never found.' },
  },
  {
    id: 'EVT_025', category: 'scientific', title: 'Printing Revolution',
    description: 'The printing press arrives in {region}. Suddenly, your commandments can reach millions. So can everyone else\'s ideas. The democratization of knowledge is a double-edged sword.',
    eraRange: [1, 4], baseWeight: 1.0,
    choices: [
      { label: 'Print Your Scripture', description: 'Every home gets a copy. Your words, in every hand.', outcome: { effects: { faithChange: 0.15, researchChange: 0.05 }, narrativeText: 'Your commandments spread like wildfire. Literacy follows faith. Both prosper.' } },
      { label: 'Control the Presses', description: 'Only approved texts may be printed.', outcome: { effects: { faithChange: 0.08, researchChange: -0.05 }, narrativeText: 'The presses serve the faith. Unauthorized texts are seized. The monks are finally typing less.' } },
      { label: 'Let Knowledge Flow', description: 'Presses for everyone. Even the heretics.', outcome: { effects: { faithChange: -0.05, researchChange: 0.12 }, narrativeText: 'Ideas multiply. Not all of them are yours. The intellectual explosion is glorious and slightly terrifying.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05, faithChange: 0.03 }, narrativeText: 'The printing press changes everything, with or without divine guidance.' },
  },
  {
    id: 'EVT_026', category: 'scientific', title: 'Industrial Accident',
    description: 'A factory explosion in {region} has killed hundreds. The survivors blame the owners. The owners blame the workers. Everyone is looking at you.',
    eraRange: [4, 9], baseWeight: 0.7,
    choices: [
      { label: 'Heal the Wounded', description: 'Show mercy. Then show anger at those responsible.', outcome: { effects: { happinessChange: 0.08, faithChange: 0.05, populationChange: -100 }, narrativeText: 'Your blessing eases the suffering. The guilty find themselves judged — by your followers, not by you. Close enough.' } },
      { label: 'Demand Safety', description: 'Progress without safety isn\'t progress.', outcome: { effects: { developmentChange: -0.3, happinessChange: 0.05 }, narrativeText: 'New regulations slow production. Workers live longer. The economy complains.' } },
      { label: 'Accept the Cost', description: 'Progress demands sacrifice. This is the price of advancement.', outcome: { effects: { developmentChange: 0.3, happinessChange: -0.08 }, narrativeText: 'The factory reopens. Production resumes. The memorial is small and easily overlooked.' } },
    ],
    autoResolve: { effects: { populationChange: -200, happinessChange: -0.05 }, narrativeText: 'The accident is mourned briefly, then forgotten. The factory reopens.' },
  },
  {
    id: 'EVT_027', category: 'scientific', title: 'Medical Breakthrough',
    description: 'A physician in {region} has discovered a treatment that could save thousands. The catch: it was tested on prisoners. Your faithful are uncomfortable.',
    eraRange: [3, 12], baseWeight: 0.7,
    choices: [
      { label: 'Distribute the Cure', description: 'The knowledge exists. Use it. Debate the ethics later.', outcome: { effects: { populationChange: 500, happinessChange: 0.05, researchChange: 0.05 }, narrativeText: 'The treatment saves thousands. The moral debate continues, but the dead do not complain about methodology.' } },
      { label: 'Destroy the Research', description: 'Knowledge gained through suffering is tainted.', outcome: { effects: { faithChange: 0.08, researchChange: -0.08 }, narrativeText: 'The research is burned. Your followers applaud the moral stance. The next plague will be slightly more lethal.' } },
      { label: 'Allow with Conditions', description: 'Use the cure. Ban the method. Both matter.', outcome: { effects: { populationChange: 300, researchChange: 0.03, faithChange: 0.03 }, narrativeText: 'The treatment is distributed alongside a divine decree against future experiments on prisoners. A messy compromise.' } },
    ],
    autoResolve: { effects: { researchChange: 0.03 }, narrativeText: 'The treatment spreads through medical networks without divine endorsement.' },
  },
  {
    id: 'EVT_028', category: 'scientific', title: 'Space Race Begins',
    description: '{nation_a} and {nation_b} are competing to reach the stars. Your faithful in both nations pour resources into rockets instead of temples. Is this progress or blasphemy?',
    eraRange: [8, 11], baseWeight: 0.8,
    choices: [
      { label: 'Bless the Endeavor', description: 'The heavens are your domain. Let them visit.', outcome: { effects: { researchChange: 0.15, faithChange: 0.05 }, narrativeText: 'Your blessing makes the space program a religious mission. Rockets carry prayers. The stars feel closer.' } },
      { label: 'Redirect to Defense', description: 'Something\'s coming. Those rockets need to point at the sky for different reasons.', outcome: { effects: { researchChange: 0.08, militaryChange: 500 }, narrativeText: 'The space program becomes a defense program. The scientists grumble but comply. You know something they don\'t. Yet.' } },
      { label: 'Observe', description: 'Let them reach for the stars. You already know what\'s up there.', outcome: { effects: { researchChange: 0.10 }, narrativeText: 'The space race accelerates without divine interference. Both nations make breakthroughs. Competition breeds excellence.' } },
    ],
    autoResolve: { effects: { researchChange: 0.08 }, narrativeText: 'The space race proceeds on its own momentum.' },
  },
  {
    id: 'EVT_029', category: 'scientific', title: 'Forbidden Discovery',
    description: 'Researchers in {region} have discovered something that challenges the fundamental assumptions of your religion. The data is clear. The implications are devastating.',
    eraRange: [4, 12], baseWeight: 0.5,
    choices: [
      { label: 'Embrace Truth', description: 'If truth contradicts your doctrine, update the doctrine.', outcome: { effects: { faithChange: -0.10, researchChange: 0.15 }, narrativeText: 'Your faith evolves. Some followers leave. Those who remain believe more deeply — their faith survived evidence.' } },
      { label: 'Reinterpret', description: 'The discovery doesn\'t contradict you. It proves you were more subtle than anyone realized.', outcome: { effects: { faithChange: 0.03, researchChange: 0.05 }, narrativeText: 'Your clergy perform impressive theological gymnastics. The discovery is absorbed into doctrine. Everyone saves face.' } },
      { label: 'Suppress', description: 'The world isn\'t ready.', outcome: { effects: { faithChange: 0.08, researchChange: -0.10 }, narrativeText: 'The research disappears. The researchers are encouraged to study something less dangerous, like volcanoes.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03, researchChange: 0.05 }, narrativeText: 'The discovery circulates in academic circles. Its impact is slow but persistent.' },
  },
  {
    id: 'EVT_030', category: 'scientific', title: 'Knowledge Sharing Summit',
    description: 'Scholars from multiple nations gather in {region} to share discoveries. The potential for progress is enormous. So is the potential for intellectual theft.',
    eraRange: [5, 12], baseWeight: 0.6,
    choices: [
      { label: 'Host Openly', description: 'All knowledge shared freely. Your nation leads by example.', outcome: { effects: { researchChange: 0.12, faithChange: 0.03 }, narrativeText: 'The summit produces breakthroughs in every field. Your nation is seen as the center of learning. The rival scholars are grateful — and slightly envious.' } },
      { label: 'Share Selectively', description: 'Give a little, learn a lot.', outcome: { effects: { researchChange: 0.08 }, narrativeText: 'Your scholars share carefully curated knowledge and absorb everything offered in return. Diplomacy, dressed as academia.' } },
      { label: 'Spy', description: 'Why share when you can just... take notes?', outcome: { effects: { researchChange: 0.10, happinessChange: -0.03 }, narrativeText: 'Your \'scholars\' return with notebooks full of stolen ideas. The summit organizers will figure it out eventually.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'The summit proceeds without divine involvement. Progress is made. Coffee is consumed.' },
  },
];

// ---------------------------------------------------------------------------
// Natural events (EVT_031–040)
// ---------------------------------------------------------------------------

const NATURAL_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_031', category: 'natural', title: 'Devastating Earthquake',
    description: 'The ground shakes in {region}. Buildings collapse. Dust rises. Your followers dig through rubble, calling your name between sobs.',
    eraRange: [1, 12], baseWeight: 0.8,
    choices: [
      { label: 'Send Aid', description: 'Miraculously calm the aftershocks. Bless the rescue efforts.', outcome: { effects: { faithChange: 0.12, happinessChange: 0.05, developmentChange: -0.5 }, narrativeText: 'The aftershocks stop. Rescuers find survivors in impossible places. Your name is whispered in gratitude.' } },
      { label: 'Rebuild Stronger', description: 'The old buildings were weak. Divine inspiration for better architecture.', outcome: { effects: { developmentChange: 0.3, populationChange: -300 }, narrativeText: 'The destroyed city rebuilds with inspired engineering. It was terrible — but the new city is magnificent.' } },
      { label: 'Accept the Tragedy', description: 'The earth moves. That\'s not your fault. (This time.)', outcome: { effects: { faithChange: -0.05, populationChange: -500 }, narrativeText: 'You offer no explanation and no comfort. Your followers grieve. Some begin to wonder.' } },
    ],
    autoResolve: { effects: { populationChange: -400, developmentChange: -0.5 }, narrativeText: 'The earthquake takes its toll without divine mitigation.' },
  },
  {
    id: 'EVT_032', category: 'natural', title: 'Great Drought',
    description: 'No rain for months in {region}. Crops wither. Rivers shrink. Your followers\' prayers for rain have a certain urgency to them.',
    eraRange: [1, 12], baseWeight: 1.0,
    choices: [
      { label: 'Send Rain', description: 'They asked nicely.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.10 }, narrativeText: 'Clouds gather from nowhere. Rain falls — gentle, soaking, miraculous. The crops recover. Your followers weep.' } },
      { label: 'Inspire Irrigation', description: 'Teach them to fish. Or in this case, to dig.', outcome: { effects: { developmentChange: 0.5, researchChange: 0.05 }, narrativeText: 'Divinely inspired engineering produces irrigation canals. The drought ends, and the next one won\'t be as bad.' } },
      { label: 'Let Nature Take Its Course', description: 'Droughts happen. That\'s how deserts work.', outcome: { effects: { happinessChange: -0.10, populationChange: -300 }, narrativeText: 'The drought takes its toll. Some leave. Some die. The land waits for rain that comes on its own schedule.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.08, populationChange: -200 }, narrativeText: 'The drought persists. The faithful wait for rain that doesn\'t come.' },
  },
  {
    id: 'EVT_033', category: 'natural', title: 'Bountiful Harvest',
    description: 'The harvest in {region} is extraordinary. Granaries overflow. Even the livestock look surprised. Your followers credit divine favor. (It was mostly good soil, but you\'ll take it.)',
    eraRange: [1, 12], baseWeight: 1.0,
    choices: [
      { label: 'Claim Credit', description: 'Yes, that was you. Obviously.', outcome: { effects: { faithChange: 0.08, happinessChange: 0.08 }, narrativeText: 'A festival is declared in your honor. The abundance becomes legend. You decide not to mention the exceptional rainfall.' } },
      { label: 'Share with Neighbors', description: 'Generosity converts hearts more than miracles.', outcome: { effects: { faithChange: 0.05, happinessChange: 0.05 }, narrativeText: 'Your followers share their surplus with neighboring regions. Goodwill spreads. Some of those neighbors start asking about your commandments.' } },
      { label: 'Store for Hard Times', description: 'Abundance is temporary. Preparation is divine.', outcome: { effects: { happinessChange: 0.03, populationChange: 200 }, narrativeText: 'The granaries fill. When the next drought comes, your followers will be ready. Forward thinking — very godlike.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.05 }, narrativeText: 'The bountiful harvest is celebrated and consumed. Life goes on, slightly fatter.' },
  },
  {
    id: 'EVT_034', category: 'natural', title: 'Plague Outbreak',
    description: 'Disease spreads through {region}. The sick pile up. Physicians are overwhelmed. Your followers ask why you let this happen. (You\'re wondering the same thing.)',
    eraRange: [1, 12], baseWeight: 0.9,
    choices: [
      { label: 'Heal the Sick', description: 'A miraculous recovery. You\'re a god, not a monster.', outcome: { effects: { populationChange: 300, faithChange: 0.10 }, narrativeText: 'The plague recedes. Patients recover overnight. Your name is added to medical prayers for generations.' } },
      { label: 'Quarantine', description: 'Sacrifice the few to save the many. Hard math, divine authority.', outcome: { effects: { populationChange: -200, happinessChange: -0.05, faithChange: 0.03 }, narrativeText: 'The quarantine holds. The plague burns itself out. The sealed district is mourned but not regretted.' } },
      { label: 'Do Nothing', description: 'Disease is natural. Interfering creates dependence.', outcome: { effects: { populationChange: -600, faithChange: -0.08 }, narrativeText: 'The plague runs its course. The death toll is high. Survivors are stronger, but they have questions.' } },
    ],
    autoResolve: { effects: { populationChange: -400, happinessChange: -0.08 }, narrativeText: 'The plague spreads unchecked. Population drops. Faith wavers.' },
  },
  {
    id: 'EVT_035', category: 'natural', title: 'Great Storm',
    description: 'A storm of unprecedented fury batters {region}. Ships sink. Roofs fly. Your coastal followers huddle in what remains of their homes.',
    eraRange: [1, 12], baseWeight: 0.9, alienCaused: true,
    choices: [
      { label: 'Calm the Storm', description: 'Enough destruction. Show them the sky can obey.', outcome: { effects: { faithChange: 0.10, happinessChange: 0.05 }, narrativeText: 'The wind dies mid-howl. The waves flatten. In the sudden silence, your followers fall to their knees.' } },
      { label: 'Redirect the Storm', description: 'Point it at someone who deserves it.', outcome: { effects: { faithChange: 0.05, developmentChange: -0.3 }, narrativeText: 'The storm pivots unnaturally. It hammers an enemy\'s coastline instead. Your followers call it justice. Meteorologists call it impossible.' } },
      { label: 'Let It Pass', description: 'Storms end. That\'s what storms do.', outcome: { effects: { populationChange: -200, developmentChange: -0.3 }, narrativeText: 'The storm rages and subsides. The damage is significant but not permanent. Your followers rebuild, slightly dampened.' } },
    ],
    autoResolve: { effects: { populationChange: -150, developmentChange: -0.3 }, narrativeText: 'The storm passes without divine intervention. The coast is battered but standing.' },
  },
  {
    id: 'EVT_036', category: 'natural', title: 'Wildfire Season',
    description: 'Fire sweeps through the forests of {region}. The flames are indiscriminate — they don\'t check which god the trees worship.',
    eraRange: [1, 12], baseWeight: 0.7,
    choices: [
      { label: 'Send Rain', description: 'Fire meets water. Classic.', outcome: { effects: { developmentChange: -0.2, happinessChange: 0.05 }, narrativeText: 'Rain falls in impossible quantities. The fire dies hissing. Your followers celebrate their very wet miracle.' } },
      { label: 'Controlled Burn', description: 'Guide the fire to clear deadwood. Destruction as renovation.', outcome: { effects: { developmentChange: 0.3, populationChange: -100 }, narrativeText: 'The fire burns exactly where it should — clearing old growth, enriching soil. Next year\'s harvest will be exceptional.' } },
      { label: 'Evacuate', description: 'Save the people. Let the forest burn.', outcome: { effects: { populationChange: 100, developmentChange: -0.5 }, narrativeText: 'Your followers flee with their lives. The forest is ash. But ash grows things.' } },
    ],
    autoResolve: { effects: { developmentChange: -0.5, populationChange: -200 }, narrativeText: 'The wildfire burns unchecked until the rains come.' },
  },
  {
    id: 'EVT_037', category: 'natural', title: 'Volcanic Eruption',
    description: 'The mountain near {region} has woken up. Ash clouds darken the sky. Lava flows toward the settlements. This is very much not a drill.',
    eraRange: [1, 12], baseWeight: 0.3,
    choices: [
      { label: 'Divert the Lava', description: 'Part the flow like a burning sea.', outcome: { effects: { faithChange: 0.15, developmentChange: -0.3 }, narrativeText: 'The lava splits around the city as if guided by invisible walls. The volcano is unimpressed but your followers are ecstatic.' } },
      { label: 'Let It Flow', description: 'Volcanoes are bigger than gods. Sometimes.', outcome: { effects: { populationChange: -500, developmentChange: -1.0, faithChange: -0.08 }, narrativeText: 'The eruption buries everything beneath it. The survivors relocate. The volcano steams in smug indifference.' } },
    ],
    autoResolve: { effects: { populationChange: -400, developmentChange: -1.0 }, narrativeText: 'The eruption takes its toll. The mountain doesn\'t care about prayers.' },
  },
  {
    id: 'EVT_038', category: 'natural', title: 'Flood Plains Overflow',
    description: 'The river near {region} has exceeded its banks. Farmland drowns. Homes float. Your followers discover that waterproof prayer books would have been a good investment.',
    eraRange: [1, 12], baseWeight: 0.8,
    choices: [
      { label: 'Recede the Waters', description: 'Command the river back to its bed.', outcome: { effects: { faithChange: 0.10, developmentChange: -0.2 }, narrativeText: 'The river obeys. Your followers marvel. The ducks are confused.' } },
      { label: 'Inspire Levees', description: 'Teach them to build walls the river can\'t cross.', outcome: { effects: { developmentChange: 0.5, populationChange: -100 }, narrativeText: 'Divine inspiration produces engineering. The levees hold against the next flood. Civilization advances through wet feet.' } },
      { label: 'Accept the Flood', description: 'Rivers flood. That\'s the deal with rivers.', outcome: { effects: { populationChange: -300, developmentChange: -0.3 }, narrativeText: 'The flood recedes naturally. The silt it leaves behind will make next year\'s crops extraordinary. Small comfort.' } },
    ],
    autoResolve: { effects: { populationChange: -200, developmentChange: -0.3 }, narrativeText: 'The flood runs its course. Muddy recovery begins.' },
  },
  {
    id: 'EVT_039', category: 'natural', title: 'Animal Migration',
    description: 'A vast herd crosses through {region}. The animals trample crops but bring abundant hunting. Your followers see an omen — of what, they can\'t agree.',
    eraRange: [1, 6], baseWeight: 0.5,
    choices: [
      { label: 'Bless the Hunt', description: 'Abundance walks through your land. Take it.', outcome: { effects: { populationChange: 200, happinessChange: 0.05 }, narrativeText: 'The hunt is glorious. Your followers feast. The herds move on, slightly reduced.' } },
      { label: 'Protect the Herd', description: 'These creatures are sacred. Let them pass.', outcome: { effects: { faithChange: 0.05, happinessChange: 0.03 }, narrativeText: 'The herd passes unharmed. Your followers gain a reputation for respect of nature. The crops are less enthusiastic.' } },
    ],
    autoResolve: { effects: { populationChange: 100 }, narrativeText: 'The herds pass through. Some hunting, some trampling. Life continues.' },
  },
  {
    id: 'EVT_040', category: 'natural', title: 'Resource Discovery',
    description: 'Miners in {region} have struck something valuable — gold, iron, gems, the kind of thing that makes nations covetous and workers optimistic.',
    eraRange: [1, 10], baseWeight: 0.6,
    choices: [
      { label: 'Share the Wealth', description: 'The bounty belongs to all your faithful.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.05 }, narrativeText: 'The riches are distributed. Everyone prospers a little. Your followers praise divine generosity.' } },
      { label: 'Fund Development', description: 'Invest the resources in progress.', outcome: { effects: { developmentChange: 0.5, researchChange: 0.05 }, narrativeText: 'The wealth flows into infrastructure and academies. The region leaps forward in development.' } },
      { label: 'Build a Temple', description: 'The most magnificent temple the world has ever seen.', outcome: { effects: { faithChange: 0.12, happinessChange: -0.03 }, narrativeText: 'Gold adorns every surface. The temple draws pilgrims from across the continent. Some workers grumble about priorities.' } },
    ],
    autoResolve: { effects: { developmentChange: 0.3 }, narrativeText: 'The resources are exploited at market pace. Steady growth follows.' },
  },
];

// ---------------------------------------------------------------------------
// Cultural events (EVT_041–050)
// ---------------------------------------------------------------------------

const CULTURAL_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_041', category: 'cultural', title: 'Renaissance Blooms',
    description: 'In {region}, art, science, and philosophy converge into something magnificent. Painters capture the divine. Sculptors carve truth from marble. Your followers produce works that will outlast empires.',
    eraRange: [1, 4], baseWeight: 0.6,
    choices: [
      { label: 'Inspire the Artists', description: 'Let divine visions flow through their brushes.', outcome: { effects: { researchChange: 0.10, faithChange: 0.08, happinessChange: 0.05 }, narrativeText: 'The Renaissance produces masterworks of divine art. Your commandments are painted on ceilings. Your faithful weep at the beauty.' } },
      { label: 'Commission Sacred Works', description: 'Art should serve the faith.', outcome: { effects: { faithChange: 0.12, researchChange: 0.03 }, narrativeText: 'The artists produce religious works of staggering beauty. Every painting is a sermon. Every statue, a prayer.' } },
      { label: 'Let Creativity Run Free', description: 'Art doesn\'t need a leash. Even divine art.', outcome: { effects: { researchChange: 0.12, faithChange: -0.03, happinessChange: 0.08 }, narrativeText: 'The Renaissance explodes in every direction. Some works glorify you. Some question you. All of them are extraordinary.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05, happinessChange: 0.05 }, narrativeText: 'The Renaissance blooms without divine patronage. Beauty finds its own way.' },
  },
  {
    id: 'EVT_042', category: 'cultural', title: 'Great Art Movement',
    description: 'A new artistic movement sweeps through {nation_a}. Its themes challenge tradition — and your commandments. The art is brilliant. The theology is... creative.',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Celebrate', description: 'Art is worship in another form.', outcome: { effects: { happinessChange: 0.08, faithChange: 0.03 }, narrativeText: 'You endorse the movement. Your followers incorporate it into worship. The services become significantly more interesting.' } },
      { label: 'Censor', description: 'Some art crosses lines. Your lines.', outcome: { effects: { happinessChange: -0.05, faithChange: 0.05 }, narrativeText: 'The controversial works are seized. The artists go underground. The censored art becomes exponentially more popular.' } },
      { label: 'Ignore', description: 'Art is beneath divine notice. Officially.', outcome: { effects: { happinessChange: 0.03 }, narrativeText: 'The art movement runs its course. Your followers adopt what they like and ignore the rest. How democratic.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The art movement thrives without divine comment.' },
  },
  {
    id: 'EVT_043', category: 'cultural', title: 'Philosophy Emerges',
    description: 'Thinkers in {region} propose radical ideas about governance, morality, and the nature of divinity. Some of their conclusions about you are flattering. Others are not.',
    eraRange: [2, 8], baseWeight: 0.7,
    choices: [
      { label: 'Engage', description: 'Philosophy sharpens faith. Debate is divine exercise.', outcome: { effects: { researchChange: 0.10, faithChange: -0.03 }, narrativeText: 'Your theologians engage the philosophers. The resulting debates produce new schools of thought. Attendance is excellent.' } },
      { label: 'Suppress', description: 'Thinking is fine. Thinking too much is dangerous.', outcome: { effects: { researchChange: -0.08, faithChange: 0.05 }, narrativeText: 'The philosophers are discouraged. Their ideas persist in private letters and secret meetings. Ideas are annoyingly persistent.' } },
      { label: 'Co-opt', description: 'Make the philosophy serve the faith.', outcome: { effects: { researchChange: 0.05, faithChange: 0.05 }, narrativeText: 'The philosophical movement is absorbed into religious scholarship. The thinkers get funding. You get intellectual credibility.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'Philosophy spreads through the educated classes. Its impact is gradual and persistent.' },
  },
  {
    id: 'EVT_044', category: 'cultural', title: 'Cultural Festival',
    description: 'Your followers in {region} have organized a grand festival celebrating faith, harvest, and life. Music, dancing, feasting — the works. It\'s rather touching, actually.',
    eraRange: [1, 12], baseWeight: 0.8,
    choices: [
      { label: 'Bless the Festival', description: 'They earned this. Let them celebrate under clear skies.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.08 }, narrativeText: 'The weather is perfect. The wine is abundant. The singing carries across three provinces. A perfect day. You almost smile.' } },
      { label: 'Observe Quietly', description: 'Joy doesn\'t need divine endorsement.', outcome: { effects: { happinessChange: 0.05, faithChange: 0.03 }, narrativeText: 'The festival unfolds beautifully. Your followers celebrate without prompting. Organic joy — the best kind.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.05 }, narrativeText: 'The festival is a success. Hangovers follow.' },
  },
  {
    id: 'EVT_045', category: 'cultural', title: 'Language Schism',
    description: 'Your faith has spread so far that your commandments are being recited in {nation_a}\'s language — and they don\'t quite mean the same thing. Translation is interpretation. Interpretation is heresy. Probably.',
    eraRange: [3, 10], baseWeight: 0.6,
    choices: [
      { label: 'Establish a Sacred Language', description: 'One language for divine matters. No more mistranslations.', outcome: { effects: { faithChange: 0.08, researchChange: -0.03 }, narrativeText: 'A sacred language is decreed. Unity of interpretation follows. Cultural distinctiveness suffers.' } },
      { label: 'Embrace Local Translations', description: 'Your words should meet people where they are.', outcome: { effects: { faithChange: -0.03, happinessChange: 0.05 }, narrativeText: 'Your commandments take on local flavor. The faith diversifies. Theologians have job security for centuries.' } },
      { label: 'Stay Silent', description: 'Languages evolve. So does faith.', outcome: { effects: { faithChange: -0.02 }, narrativeText: 'The linguistic drift continues. Some commandments mean subtly different things in different regions. This will definitely not cause problems later.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03 }, narrativeText: 'The language drift continues unchecked. Regional variations multiply.' },
  },
  {
    id: 'EVT_046', category: 'cultural', title: 'Golden Age of Literature',
    description: 'Writers in {nation_a} are producing works of extraordinary quality. Epic poems, philosophical treatises, satirical plays. Some of the satire is about you. It\'s annoyingly good.',
    eraRange: [2, 8], baseWeight: 0.6,
    choices: [
      { label: 'Patronize the Arts', description: 'Fund the writers. Even the satirists.', outcome: { effects: { happinessChange: 0.08, researchChange: 0.08, faithChange: 0.03 }, narrativeText: 'Your patronage produces a literary golden age. The satirists are grateful and slightly less biting. Slightly.' } },
      { label: 'Commission Religious Texts', description: 'Direct the literary talent toward sacred works.', outcome: { effects: { faithChange: 0.10, researchChange: 0.03 }, narrativeText: 'The writers produce religious epics that will be quoted for centuries. Some of the metaphors are genuinely inspired.' } },
      { label: 'Let It Flourish', description: 'Literature doesn\'t need a divine editor.', outcome: { effects: { happinessChange: 0.05, researchChange: 0.05 }, narrativeText: 'The literary movement produces masterworks. Some glorify you, some mock you, all of them are brilliant.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03, researchChange: 0.03 }, narrativeText: 'The golden age of literature enriches the culture without divine patronage.' },
  },
  {
    id: 'EVT_047', category: 'cultural', title: 'Musical Revolution',
    description: 'New forms of music sweep through {region}. The traditional hymns are being replaced with something... different. It\'s catchy. Your clergy are horrified.',
    eraRange: [3, 12], baseWeight: 0.5,
    choices: [
      { label: 'Embrace the New Sound', description: 'Your worship evolves. The congregations grow.', outcome: { effects: { happinessChange: 0.08, faithChange: 0.03 }, narrativeText: 'The new music fills your temples with energy and young people. Your clergy learn to tolerate it. Some even tap their feet.' } },
      { label: 'Preserve Tradition', description: 'Sacred music is sacred for a reason.', outcome: { effects: { faithChange: 0.05, happinessChange: -0.03 }, narrativeText: 'The traditional hymns continue. They are beautiful, timeless, and attended by an aging congregation.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The musical revolution happens regardless. The old hymns persist alongside the new.' },
  },
  {
    id: 'EVT_048', category: 'cultural', title: 'Monument Constructed',
    description: '{nation_a} proposes building a monument to your glory in {region}. It will be visible for miles. It will also be very, very expensive.',
    eraRange: [1, 12], baseWeight: 0.6,
    choices: [
      { label: 'Approve Grand Design', description: 'Let them build something worthy. No expense spared.', outcome: { effects: { faithChange: 0.12, happinessChange: 0.05, developmentChange: 0.3 }, narrativeText: 'The monument rises. It takes a generation to build and it will stand for twenty. Your followers are awed. Your treasury is less so.' } },
      { label: 'Redirect to Practical Use', description: 'Build a hospital instead. More godlike, less vain.', outcome: { effects: { happinessChange: 0.08, populationChange: 200 }, narrativeText: 'The hospital saves lives. The workers are relieved. The monument enthusiasts are disappointed. Priorities.' } },
      { label: 'Decline', description: 'Monuments are for insecure gods.', outcome: { effects: { faithChange: -0.03, happinessChange: 0.03 }, narrativeText: 'Your modesty is noted. Some find it inspiring. Others find it suspicious.' } },
    ],
    autoResolve: { effects: { faithChange: 0.03 }, narrativeText: 'A modest monument is built without divine input. It\'s fine.' },
  },
  {
    id: 'EVT_049', category: 'cultural', title: 'Counter-Culture Movement',
    description: 'Young people in {region} reject tradition, authority, and quite possibly personal hygiene. They question everything — especially you.',
    eraRange: [5, 12], baseWeight: 0.7,
    choices: [
      { label: 'Listen', description: 'Even rebels sometimes have a point.', outcome: { effects: { happinessChange: 0.08, faithChange: -0.05 }, narrativeText: 'You acknowledge their grievances. The movement softens. Some rebels become reformers. Progress, messily achieved.' } },
      { label: 'Ignore', description: 'This too shall pass.', outcome: { effects: { happinessChange: -0.03 }, narrativeText: 'The counter-culture burns bright and fades. Some ideas stick. Most don\'t. The cycle of youth repeats.' } },
      { label: 'Suppress', description: 'Order is more important than self-expression.', outcome: { effects: { happinessChange: -0.10, faithChange: 0.05 }, narrativeText: 'The movement is crushed. The survivors go underground, angrier and better organized. This always goes well.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'The counter-culture movement thrives and fades on its own timeline.' },
  },
  {
    id: 'EVT_050', category: 'cultural', title: 'Cultural Exchange',
    description: 'Traders from {nation_b} bring foreign art, food, and ideas to {region}. Your followers are fascinated. Your priests are nervous. Both reactions are understandable.',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Welcome the Exchange', description: 'Foreign ideas make local faith stronger.', outcome: { effects: { happinessChange: 0.05, researchChange: 0.05, faithChange: -0.03 }, narrativeText: 'The cultural exchange enriches both sides. Your followers adopt foreign cooking techniques. The theology remains mercifully unchanged.' } },
      { label: 'Restrict Foreign Influence', description: 'Your culture is divine. It doesn\'t need supplements.', outcome: { effects: { faithChange: 0.05, researchChange: -0.03 }, narrativeText: 'The foreign traders are tolerated but contained. Your culture remains pristine. Your cuisine remains bland.' } },
      { label: 'Absorb and Convert', description: 'Take their best ideas. Add your commandments. Sell it back.', outcome: { effects: { faithChange: 0.05, happinessChange: 0.03 }, narrativeText: 'Your followers adopt foreign art styles and fill them with divine content. Cultural appropriation or divine synthesis? Both.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'Cultural exchange happens naturally through trade. Both sides are enriched.' },
  },
];

// ---------------------------------------------------------------------------
// Political events (EVT_051–060)
// ---------------------------------------------------------------------------

const POLITICAL_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_051', category: 'political', title: 'Revolution',
    description: 'The people of {nation_a} have had enough. Crowds fill the streets. Barricades go up. The old government trembles. Your followers are on both sides.',
    eraRange: [3, 12], baseWeight: 0.8,
    choices: [
      { label: 'Support the Rebels', description: 'The old order has failed. Bless the new one.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.05, militaryChange: -300 }, narrativeText: 'Your divine endorsement tips the balance. The revolution succeeds. The new government is grateful — and knows who to thank.' } },
      { label: 'Support the Crown', description: 'Stability is sacred. Even imperfect stability.', outcome: { effects: { militaryChange: 400, happinessChange: -0.08 }, narrativeText: 'Your blessing steadies the loyalists. The revolution is crushed. Order is restored. Resentment is not.' } },
      { label: 'Stay Neutral', description: 'Gods don\'t take sides in mortal politics. Usually.', outcome: { effects: { faithChange: -0.05 }, narrativeText: 'The revolution plays out without divine interference. Whoever wins will remember that you didn\'t help.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05, militaryChange: -200 }, narrativeText: 'The revolution grinds on. Both sides suffer. Neither credits divine involvement.' },
  },
  {
    id: 'EVT_052', category: 'political', title: 'Alliance Formed',
    description: '{nation_a} and {nation_b} propose a formal alliance. Together, they\'d be formidable. The question is whether your interests align with theirs.',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Bless the Alliance', description: 'United they stand. Under your banner, preferably.', outcome: { effects: { faithChange: 0.05, militaryChange: 300 }, narrativeText: 'The alliance is sealed with your divine endorsement. Both nations feel invincible. Their enemies feel nervous.' } },
      { label: 'Warn Against It', description: 'Alliances create obligations. Obligations create wars.', outcome: { effects: { faithChange: 0.03, happinessChange: -0.03 }, narrativeText: 'Your warning gives the diplomats pause. The alliance proceeds, but with caution. Escape clauses are extensive.' } },
      { label: 'Stay Silent', description: 'Let politics sort itself out.', outcome: { effects: {}, narrativeText: 'The alliance forms without divine comment. Both nations wonder where you stand.' } },
    ],
    autoResolve: { effects: {}, narrativeText: 'The alliance proceeds without divine endorsement. Diplomats manage without celestial oversight.' },
  },
  {
    id: 'EVT_053', category: 'political', title: 'Assassination',
    description: 'The ruler of {nation_a} is dead. A blade in the dark, and everything changes. Your followers mourn — or celebrate, depending on which faction they supported.',
    eraRange: [1, 12], baseWeight: 0.5,
    choices: [
      { label: 'Punish the Assassins', description: 'Murder is not policy. Not under your watch.', outcome: { effects: { faithChange: 0.08, happinessChange: -0.03 }, narrativeText: 'Divine justice falls on the conspirators. The message is clear: your followers are protected. Even the inconvenient ones.' } },
      { label: 'Elevate the Successor', description: 'The old ruler is gone. Shape the new one.', outcome: { effects: { faithChange: 0.05, developmentChange: 0.3 }, narrativeText: 'A devout successor takes the throne with your endorsement. The transition is smoother than anyone expected.' } },
      { label: 'Stay Silent', description: 'Rulers die. That\'s what rulers do.', outcome: { effects: { faithChange: -0.03, happinessChange: -0.05 }, narrativeText: 'The power vacuum creates chaos. Factions clash. Your silence is interpreted as indifference — or complicity.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05 }, narrativeText: 'The assassination triggers a succession crisis. The nation wobbles.' },
  },
  {
    id: 'EVT_054', category: 'political', title: 'Trade Dispute',
    description: 'Merchants of {nation_a} and {nation_b} are fighting over trade route access near {region}. Gold is involved. Principle is involved. Mostly gold.',
    eraRange: [2, 12], baseWeight: 0.8,
    choices: [
      { label: 'Mediate', description: 'Divine arbitration. Fair, final, and slightly intimidating.', outcome: { effects: { happinessChange: 0.05, faithChange: 0.05 }, narrativeText: 'Your judgment splits the trade route fairly. Both sides grumble. Both sides comply. Divine arbitration has that effect.' } },
      { label: 'Favor Your Followers', description: 'Your people get the better deal. That\'s the point of having a god.', outcome: { effects: { faithChange: 0.08, happinessChange: -0.03 }, narrativeText: 'Your followers get the lion\'s share. The other side seethes. Trade flows — unevenly, but it flows.' } },
      { label: 'Ignore', description: 'Merchants sort out merchant problems.', outcome: { effects: { faithChange: -0.02 }, narrativeText: 'The dispute drags on. Lawyers are consulted. Nobody is happy. Lawyers are happy.' } },
    ],
    autoResolve: { effects: {}, narrativeText: 'The trade dispute resolves through mortal negotiation. Slowly.' },
  },
  {
    id: 'EVT_055', category: 'political', title: 'Diplomatic Betrayal',
    description: '{nation_b} has broken their alliance with {nation_a}, attacking while their supposed allies look the other way. Trust is a commodity that just crashed.',
    eraRange: [3, 12], baseWeight: 0.6, alienCaused: true,
    choices: [
      { label: 'Punish the Betrayers', description: 'Oath-breakers deserve divine consequences.', outcome: { effects: { militaryChange: -400, faithChange: 0.08 }, narrativeText: 'Storms, crop failures, and suspicious accidents plague the betrayers. Your message is clear: oaths matter.' } },
      { label: 'Comfort the Betrayed', description: 'Strengthen your allies. They need you now.', outcome: { effects: { faithChange: 0.10, militaryChange: 300 }, narrativeText: 'Your blessing rallies the betrayed nation. From the ashes of broken trust, stronger resolve emerges.' } },
      { label: 'Stay Silent', description: 'Betrayal is a mortal sport.', outcome: { effects: { faithChange: -0.05 }, narrativeText: 'The betrayal reshuffles the political landscape. Your followers wonder why divine justice is on vacation.' } },
    ],
    autoResolve: { effects: { faithChange: -0.03 }, narrativeText: 'The betrayal stands. Alliances shift. Trust becomes scarce.' },
  },
  {
    id: 'EVT_056', category: 'political', title: 'Peace Treaty',
    description: 'After years of war, {nation_a} and {nation_b} are ready to talk. The treaty will define borders, trade, and prisoners. Your influence could tip the terms.',
    eraRange: [2, 12], baseWeight: 0.9,
    choices: [
      { label: 'Bless Fair Terms', description: 'Both sides sacrifice. Both sides gain. That\'s peace.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.08 }, narrativeText: 'The treaty is fair. Neither side is fully satisfied — the mark of genuine diplomacy. Peace settles like dust after a storm.' } },
      { label: 'Demand Favorable Terms', description: 'Your followers deserve the better deal.', outcome: { effects: { faithChange: 0.05, happinessChange: 0.03 }, narrativeText: 'Your followers get favorable terms. The losing side swallows their pride. The peace holds — for now.' } },
      { label: 'Sabotage the Treaty', description: 'Peace now means complacency later. They need to keep fighting.', outcome: { effects: { militaryChange: 200, happinessChange: -0.10 }, narrativeText: 'The treaty collapses at the last moment. War resumes. Your followers fight on, wondering why peace is so elusive.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.05 }, narrativeText: 'The peace treaty proceeds without divine intervention. Terms are adequate.' },
  },
  {
    id: 'EVT_057', category: 'political', title: 'Government Reform',
    description: '{nation_a} is transitioning its government. The old system has failed. The new one might be better — or might be worse in exciting new ways.',
    eraRange: [3, 12], baseWeight: 0.7,
    choices: [
      { label: 'Guide Toward Theocracy', description: 'The best government is the one that listens to you.', outcome: { effects: { faithChange: 0.15, researchChange: -0.05 }, narrativeText: 'The new government places your commandments at its core. Church and state become one. Convenient for you, complicated for everyone else.' } },
      { label: 'Support Democracy', description: 'Let the people choose. Even if they choose poorly.', outcome: { effects: { happinessChange: 0.10, faithChange: -0.03 }, narrativeText: 'Elections are held. The people vote. The results are messy, slow, and remarkably resilient.' } },
      { label: 'Stay Out Of It', description: 'Governments change. You don\'t.', outcome: { effects: {}, narrativeText: 'The political transition plays out without divine involvement. The new government eventually stabilizes.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'The government reform happens without divine guidance. Chaos precedes stability, as always.' },
  },
  {
    id: 'EVT_058', category: 'political', title: 'Royal Marriage',
    description: 'The heir of {nation_a} proposes marriage to the heir of {nation_b}. Love or politics? Does it matter? The union could reshape the continent.',
    eraRange: [1, 6], baseWeight: 0.5,
    choices: [
      { label: 'Bless the Union', description: 'Marriage is sacred. Especially when it\'s strategic.', outcome: { effects: { faithChange: 0.05, happinessChange: 0.08 }, narrativeText: 'The wedding is magnificent. Divine doves circle the ceremony. The alliance is sealed with love, gold, and a terrifying prenuptial agreement.' } },
      { label: 'Oppose', description: 'This union serves politics, not faith.', outcome: { effects: { faithChange: 0.03, happinessChange: -0.05 }, narrativeText: 'The marriage is called off — or proceeds without your blessing, which amounts to the same thing. Diplomatic awkwardness ensues.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The royal marriage proceeds without divine comment. The wedding cake is excellent regardless.' },
  },
  {
    id: 'EVT_059', category: 'political', title: 'Colonial Expansion',
    description: '{nation_a} sends settlers to unclaimed territories. The frontier is wild, resource-rich, and entirely uninterested in being claimed by anyone.',
    eraRange: [2, 7], baseWeight: 0.7,
    choices: [
      { label: 'Bless the Settlement', description: 'Expand your faith to new lands.', outcome: { effects: { faithChange: 0.08, populationChange: 200 }, narrativeText: 'The settlers carry your commandments to virgin territory. New temples rise. New problems also arise, but that\'s frontier life.' } },
      { label: 'Warn Against Overreach', description: 'Empires that stretch too thin snap.', outcome: { effects: { faithChange: 0.03, happinessChange: 0.03 }, narrativeText: 'The expansion slows. Resources are conserved. The frontier waits — patient and unconcerned.' } },
      { label: 'Ignore', description: 'Colonialism is a mortal project.', outcome: { effects: { populationChange: 100 }, narrativeText: 'The settlers expand without divine mandate. Some thrive. Some don\'t. The frontier is indifferent.' } },
    ],
    autoResolve: { effects: { populationChange: 100 }, narrativeText: 'Colonial expansion proceeds at its own pace.' },
  },
  {
    id: 'EVT_060', category: 'political', title: 'Sanctions Declared',
    description: '{nation_a} imposes economic sanctions on {nation_b}. Trade freezes. Markets panic. Your followers in both nations feel the pinch.',
    eraRange: [4, 12], baseWeight: 0.6,
    choices: [
      { label: 'Support Sanctions', description: 'Economic pressure is better than military pressure.', outcome: { effects: { happinessChange: -0.05, faithChange: 0.03 }, narrativeText: 'The sanctions bite. Prices rise. The target nation suffers — and learns that your displeasure has economic consequences.' } },
      { label: 'Oppose Sanctions', description: 'Trade should flow freely. Especially to your followers.', outcome: { effects: { happinessChange: 0.03, faithChange: 0.03 }, narrativeText: 'Your opposition to sanctions earns gratitude from both sides. Trade resumes. Diplomats grumble.' } },
      { label: 'Stay Silent', description: 'Economics is beneath divine notice.', outcome: { effects: {}, narrativeText: 'The sanctions play out according to mortal calculations. GDP drops. Patience is tested.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'Sanctions proceed without divine comment. The economy adjusts painfully.' },
  },
];

// ---------------------------------------------------------------------------
// Internal events (EVT_061–070)
// ---------------------------------------------------------------------------

const INTERNAL_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_061', category: 'internal', title: 'Corruption Scandal',
    description: 'Officials in {nation_a} have been caught embezzling funds meant for temple construction. The money went to... wine, horses, and a suspiciously large villa.',
    eraRange: [2, 12], baseWeight: 0.8,
    choices: [
      { label: 'Divine Judgment', description: 'Make an example. Publicly.', outcome: { effects: { faithChange: 0.10, happinessChange: 0.05 }, narrativeText: 'The corrupt officials face divine justice. Lightning doesn\'t actually strike them, but the investigation is thorough enough.' } },
      { label: 'Forgive', description: 'Mercy is divine. Even when it\'s annoying.', outcome: { effects: { faithChange: -0.03, happinessChange: -0.05 }, narrativeText: 'The officials are pardoned. Your followers are divided. The villa remains suspiciously nice.' } },
      { label: 'Reform the System', description: 'Punish the sin, not just the sinner.', outcome: { effects: { developmentChange: 0.3, faithChange: 0.03 }, narrativeText: 'New oversight structures prevent future embezzlement. Bureaucracy increases. So does accountability.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'The scandal fades from public attention. The villa is still very nice.' },
  },
  {
    id: 'EVT_062', category: 'internal', title: 'Tax Revolt',
    description: 'Your followers in {region} refuse to pay taxes. \'God provides,\' they say. \'We don\'t need to provide for the government too.\' They have a point. Sort of.',
    eraRange: [1, 12], baseWeight: 0.9,
    choices: [
      { label: 'Support the Revolt', description: 'Taxes oppress the faithful. Let them keep their earnings.', outcome: { effects: { happinessChange: 0.10, developmentChange: -0.3 }, narrativeText: 'The revolt succeeds. Taxes drop. Infrastructure crumbles. Your followers are happy and potholed.' } },
      { label: 'Crush the Revolt', description: 'Render unto the government what is the government\'s.', outcome: { effects: { happinessChange: -0.08, developmentChange: 0.3 }, narrativeText: 'The revolt is quashed. Taxes are collected. Your followers pay up, resentfully.' } },
      { label: 'Mediate', description: 'Both sides have a point. Find the middle.', outcome: { effects: { happinessChange: 0.03, developmentChange: 0.1 }, narrativeText: 'A compromise is reached. Taxes are reduced but not eliminated. Everyone complains equally, which means it\'s fair.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05 }, narrativeText: 'The tax revolt simmers without resolution. Neither side blinks.' },
  },
  {
    id: 'EVT_063', category: 'internal', title: 'Populist Movement',
    description: 'A charismatic leader in {nation_a} promises everything to everyone. Free bread, free land, free thought. The crowds love it. The math doesn\'t work.',
    eraRange: [3, 12], baseWeight: 0.7,
    choices: [
      { label: 'Support the Movement', description: 'The people deserve better. Even if the economics are dubious.', outcome: { effects: { happinessChange: 0.10, developmentChange: -0.3, faithChange: 0.05 }, narrativeText: 'The populist reforms bring short-term joy. Long-term sustainability is someone else\'s problem. Yours, probably.' } },
      { label: 'Oppose the Demagogue', description: 'Easy promises are dangerous promises.', outcome: { effects: { happinessChange: -0.05, faithChange: 0.03 }, narrativeText: 'The populist leader is discredited. The reforms stall. The underlying grievances remain.' } },
      { label: 'Stay Neutral', description: 'Populism burns itself out. Usually.', outcome: { effects: { happinessChange: 0.03 }, narrativeText: 'The movement peaks and fades. Some reforms stick. Some promises are quietly forgotten.' } },
    ],
    autoResolve: { effects: { happinessChange: 0.03 }, narrativeText: 'The populist movement rises and falls without divine involvement.' },
  },
  {
    id: 'EVT_064', category: 'internal', title: 'Famine Crisis',
    description: 'The granaries of {region} are empty. Children cry. Adults ration. Your followers\' prayers have a desperate, hollow quality.',
    eraRange: [1, 12], baseWeight: 0.8,
    choices: [
      { label: 'Send Harvest', description: 'Fill the granaries. Feed the faithful.', outcome: { effects: { happinessChange: 0.12, faithChange: 0.10, populationChange: 200 }, narrativeText: 'The fields bloom overnight. Impossible, beautiful, and desperately needed. Your followers eat and weep and pray.' } },
      { label: 'Organize Aid', description: 'Inspire neighboring regions to share their surplus.', outcome: { effects: { happinessChange: 0.05, faithChange: 0.05 }, narrativeText: 'Food caravans arrive from neighboring regions. Not a miracle — just organized compassion, divinely nudged.' } },
      { label: 'Let Them Endure', description: 'Hardship builds character. Cold comfort when you\'re starving.', outcome: { effects: { populationChange: -500, faithChange: -0.10 }, narrativeText: 'The famine takes its toll. Your followers survive — fewer, thinner, and questioning your priorities.' } },
    ],
    autoResolve: { effects: { populationChange: -300, happinessChange: -0.10 }, narrativeText: 'The famine grinds on without divine aid. The weak perish. The strong survive to be angry.' },
  },
  {
    id: 'EVT_065', category: 'internal', title: 'Migration Wave',
    description: 'Refugees from {nation_b}\'s wars flood into {region}. They bring skills, stories, and a desperate need for shelter. Also different religious views.',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Welcome Them', description: 'Every refugee is a potential convert.', outcome: { effects: { populationChange: 500, faithChange: -0.05, happinessChange: 0.03 }, narrativeText: 'The refugees are welcomed. They bring skills, labor, and gratitude. Some bring their own gods. Cultural enrichment is complicated.' } },
      { label: 'Seal the Borders', description: 'Your people first. Always.', outcome: { effects: { faithChange: 0.05, happinessChange: -0.03 }, narrativeText: 'The borders close. The refugees are turned away. Your followers feel safe. Your reputation for mercy takes a hit.' } },
      { label: 'Selective Immigration', description: 'Welcome the faithful. Send the rest elsewhere.', outcome: { effects: { populationChange: 200, faithChange: 0.05 }, narrativeText: 'Only refugees who accept your commandments are admitted. A theological immigration policy — novel and somewhat ruthless.' } },
    ],
    autoResolve: { effects: { populationChange: 200 }, narrativeText: 'Refugees trickle in regardless of divine policy. Life finds a way.' },
  },
  {
    id: 'EVT_066', category: 'internal', title: 'Infrastructure Boom',
    description: '{nation_a} is building roads, bridges, and aqueducts at an impressive pace. Progress is visible. So is the bill.',
    eraRange: [3, 12], baseWeight: 0.7,
    choices: [
      { label: 'Bless the Builders', description: 'Prosperity is divine. Especially the paved kind.', outcome: { effects: { developmentChange: 0.5, faithChange: 0.05 }, narrativeText: 'Your blessing makes the construction projects feel sacred. Roads connect your communities. Bridges span your rivers. Progress has never looked so devout.' } },
      { label: 'Redirect to Temples', description: 'Infrastructure for the soul before infrastructure for the feet.', outcome: { effects: { faithChange: 0.10, developmentChange: 0.2 }, narrativeText: 'Temples rise alongside roads. Every new bridge has a chapel at its midpoint. Practical and spiritual — dual-purpose divinity.' } },
      { label: 'Observe', description: 'Let them build. You\'ll take credit later.', outcome: { effects: { developmentChange: 0.3 }, narrativeText: 'The infrastructure boom continues under its own momentum. Your followers enjoy better roads without divine commentary.' } },
    ],
    autoResolve: { effects: { developmentChange: 0.3 }, narrativeText: 'Infrastructure develops steadily without divine involvement.' },
  },
  {
    id: 'EVT_067', category: 'internal', title: 'Labor Strike',
    description: 'Workers in {region}\'s factories have stopped working. They want better conditions, shorter hours, and the right to not die in industrial accidents. Unreasonable demands, clearly.',
    eraRange: [4, 12], baseWeight: 0.7,
    choices: [
      { label: 'Support Workers', description: 'Your followers shouldn\'t die making things.', outcome: { effects: { happinessChange: 0.10, developmentChange: -0.2 }, narrativeText: 'Working conditions improve. Production dips. Your followers live longer. Factory owners are displeased but outnumbered.' } },
      { label: 'Support Owners', description: 'Production serves the greater good. Individual suffering is... regrettable.', outcome: { effects: { developmentChange: 0.3, happinessChange: -0.10 }, narrativeText: 'The strike is broken. Production resumes. The workers return, angry and defeated. Resentment builds like steam pressure.' } },
      { label: 'Arbitrate', description: 'Both sides get something. Neither gets everything.', outcome: { effects: { happinessChange: 0.03, developmentChange: 0.1 }, narrativeText: 'A divine compromise emerges. Shorter hours, slightly better pay, continued production. Everyone is mildly unhappy — the hallmark of fair negotiation.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05, developmentChange: -0.1 }, narrativeText: 'The strike drags on. Production halts. Both sides wait for someone to blink.' },
  },
  {
    id: 'EVT_068', category: 'internal', title: 'Religious Minority Petition',
    description: 'Followers of {religion} in {nation_a} petition for religious freedom. They\'re a minority, but a vocal one. Your majority followers are uncomfortable.',
    eraRange: [2, 12], baseWeight: 0.7,
    choices: [
      { label: 'Grant Freedom', description: 'Let them worship as they please. Confidence, not control.', outcome: { effects: { happinessChange: 0.08, faithChange: -0.05 }, narrativeText: 'Religious freedom is declared. The minority is grateful. Your majority is slightly nervous. The nation is more vibrant — and more complex.' } },
      { label: 'Deny the Petition', description: 'One god, one faith, one set of commandments.', outcome: { effects: { faithChange: 0.08, happinessChange: -0.05 }, narrativeText: 'The petition is rejected. The minority goes underground. Resentment festers in silence.' } },
      { label: 'Limited Tolerance', description: 'They can worship privately. Quietly. Very quietly.', outcome: { effects: { faithChange: 0.03, happinessChange: 0.03 }, narrativeText: 'A compromise that satisfies no one entirely. The minority exists but doesn\'t thrive. Tolerance with fine print.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.03 }, narrativeText: 'The petition goes unanswered. The minority persists in quiet worship.' },
  },
  {
    id: 'EVT_069', category: 'internal', title: 'Census Reveals Shift',
    description: 'A census in {nation_a} reveals surprising demographic changes. The population has shifted — younger, more urban, more... questioning. The data doesn\'t lie. The implications are uncomfortable.',
    eraRange: [3, 12], baseWeight: 0.5,
    choices: [
      { label: 'Adapt', description: 'The world changes. So must the message.', outcome: { effects: { faithChange: -0.03, researchChange: 0.05, happinessChange: 0.05 }, narrativeText: 'Your religion modernizes its approach. Urban temples, youth programs, updated messaging. Old priests grumble. Young converts join.' } },
      { label: 'Double Down', description: 'The message doesn\'t change. The audience will.', outcome: { effects: { faithChange: 0.05, happinessChange: -0.03 }, narrativeText: 'Tradition holds firm. The devout are more devout. The wavering waver further. Polarization is very human.' } },
    ],
    autoResolve: { effects: { faithChange: -0.02 }, narrativeText: 'The demographic shift proceeds without religious adaptation. Attendance declines gradually.' },
  },
  {
    id: 'EVT_070', category: 'internal', title: 'Succession Crisis',
    description: 'The ruler of {nation_a} has died without a clear heir. Three claimants emerge. Two are competent. One is your most devout follower. (Not the same person.)',
    eraRange: [1, 8], baseWeight: 0.6,
    choices: [
      { label: 'Support the Devout', description: 'Faith in the throne room. What could go wrong?', outcome: { effects: { faithChange: 0.12, developmentChange: -0.2 }, narrativeText: 'Your chosen heir takes the throne. The kingdom becomes a theocracy in all but name. Administrative competence declines.' } },
      { label: 'Support the Competent', description: 'God and good governance aren\'t always the same person.', outcome: { effects: { faithChange: -0.05, developmentChange: 0.3 }, narrativeText: 'The most capable heir takes power. The kingdom prospers. Your devout follower sulks. Competence wins over piety.' } },
      { label: 'Stay Silent', description: 'Let them sort it out. It\'s their kingdom.', outcome: { effects: { faithChange: -0.03, happinessChange: -0.05 }, narrativeText: 'The succession crisis drags on. Factions form. The kingdom wobbles. Eventually, someone wins. The losers remember.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.05 }, narrativeText: 'The succession crisis resolves through mortal politics. The strongest claimant prevails.' },
  },
];

// ---------------------------------------------------------------------------
// Alien events (EVT_071–080)
// ---------------------------------------------------------------------------

const ALIEN_EVENTS: EventTemplate[] = [
  {
    id: 'EVT_071', category: 'alien', title: 'Strange Patterns in the Sky',
    description: 'Astronomers in {region} report anomalies in the stellar background. Stars flickering in sequence. Patterns too regular to be natural. Probably nothing. Probably.',
    eraRange: [7, 8], baseWeight: 1.0,
    choices: [
      { label: 'Investigate', description: 'Something\'s out there. Find out what.', outcome: { effects: { researchChange: 0.10, happinessChange: -0.03 }, narrativeText: 'Your scholars turn their telescopes skyward. The patterns are real. The implications are unsettling. Knowledge comes with a cost.' } },
      { label: 'Dismiss', description: 'Stars flicker. That\'s what stars do.', outcome: { effects: { happinessChange: 0.03 }, narrativeText: 'The anomalies are filed under \'interesting but irrelevant.\' The astronomers are reassigned. The stars keep flickering.' } },
      { label: 'Suppress the Data', description: 'Some knowledge serves no purpose but fear.', outcome: { effects: { faithChange: 0.03, researchChange: -0.05 }, narrativeText: 'The astronomical data is classified. The public remains blissfully unaware. You, however, know exactly what those patterns mean.' } },
    ],
    autoResolve: { effects: { researchChange: 0.03 }, narrativeText: 'The anomalies are noted in academic journals. Most people don\'t read academic journals.' },
  },
  {
    id: 'EVT_072', category: 'alien', title: 'Decoded Transmission',
    description: 'Scholars at {region}\'s academy have decoded the alien transmission. The message is simple: coordinates. Arrival estimates. And something that might be a countdown.',
    eraRange: [9, 10], baseWeight: 1.5,
    choices: [
      { label: 'Share with All Nations', description: 'The truth belongs to everyone.', outcome: { effects: { researchChange: 0.15, happinessChange: -0.10 }, narrativeText: 'The truth spreads. Panic follows. But so does cooperation — grudgingly, desperately, humanly.' } },
      { label: 'Classify the Data', description: 'Knowledge is power. Your nation alone holds the timeline.', outcome: { effects: { researchChange: 0.20, faithChange: 0.05 }, narrativeText: 'Your nation alone knows when they arrive. The advantage is enormous. The ethics are... flexible.' } },
      { label: 'Destroy the Evidence', description: 'Some truths are too heavy for the world to carry.', outcome: { effects: { happinessChange: 0.05, researchChange: -0.10 }, narrativeText: 'The data is erased. The countdown continues in silence. Ignorance is bliss — until it isn\'t.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'The decoded data leaks slowly. Rumors spread. No one quite believes it yet.' },
  },
  {
    id: 'EVT_073', category: 'alien', title: 'Fleet Spotted',
    description: 'It\'s no longer theoretical. Telescopes have captured images of the approaching fleet. It\'s vast. It\'s real. And it is not slowing down.',
    eraRange: [10, 11], baseWeight: 1.5,
    choices: [
      { label: 'Mobilize Everything', description: 'Every resource, every nation, every prayer. Now.', outcome: { effects: { researchChange: 0.15, militaryChange: 500, happinessChange: -0.10 }, narrativeText: 'The world shifts to war footing. Factories convert. Scientists work through the night. Your followers pray with unprecedented sincerity.' } },
      { label: 'Maintain Calm', description: 'Panic helps no one. Stay the course.', outcome: { effects: { happinessChange: 0.03, researchChange: 0.05 }, narrativeText: 'Your calm presence prevents mass hysteria. Progress continues at a measured pace. Whether measured is fast enough remains to be seen.' } },
      { label: 'Deny Everything', description: 'The images are fake. The fleet isn\'t real. Everything is fine.', outcome: { effects: { happinessChange: 0.08, researchChange: -0.10 }, narrativeText: 'Denial is a powerful drug. Your followers feel better. The fleet does not care about their feelings.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.08, researchChange: 0.05 }, narrativeText: 'The fleet sighting spreads through global media. The world holds its breath.' },
  },
  {
    id: 'EVT_074', category: 'alien', title: 'Global Panic',
    description: 'The news has sunk in. Riots. Hoarding. Mass prayer services. Doomsday cults. Humanity responds to existential threat the way humanity responds to everything: badly.',
    eraRange: [10, 12], baseWeight: 1.0,
    choices: [
      { label: 'Inspire Hope', description: 'Humanity has survived everything else. This is just bigger.', outcome: { effects: { happinessChange: 0.10, faithChange: 0.10 }, narrativeText: 'Your divine presence steadies the world. Hope is fragile but real. Your followers become pillars of calm in the chaos.' } },
      { label: 'Channel the Fear', description: 'Fear can be fuel. Burn it toward preparation.', outcome: { effects: { militaryChange: 300, researchChange: 0.05, happinessChange: -0.05 }, narrativeText: 'The panic transforms into frantic preparation. Messy, chaotic, but productive. Fear drives faster than hope.' } },
      { label: 'Stay Silent', description: 'Even gods don\'t have answers for everything.', outcome: { effects: { faithChange: -0.08, happinessChange: -0.08 }, narrativeText: 'Your silence in humanity\'s darkest hour is noted. Faith crumbles. Despair creeps in. Your followers feel truly alone.' } },
    ],
    autoResolve: { effects: { happinessChange: -0.10, faithChange: -0.05 }, narrativeText: 'The panic runs its course. Some communities collapse. Others crystallize.' },
  },
  {
    id: 'EVT_075', category: 'alien', title: 'Defense Coalition',
    description: 'Multiple nations propose pooling resources for a unified defense. Old enemies sit across from each other. The discussions are tense. The stakes are extinction.',
    eraRange: [10, 12], baseWeight: 1.0,
    choices: [
      { label: 'Bless the Coalition', description: 'Unite them. There\'s no time for pride.', outcome: { effects: { researchChange: 0.12, faithChange: 0.08 }, narrativeText: 'Your blessing gives the coalition divine legitimacy. Nations that haven\'t spoken in decades share laboratories. It\'s beautiful. It\'s fragile.' } },
      { label: 'Lead Through Your Nation', description: 'Your followers should lead the defense.', outcome: { effects: { faithChange: 0.10, researchChange: 0.08 }, narrativeText: 'Your most faithful nation takes the lead. Other nations contribute grudgingly. The hierarchy is clear. Efficiency improves.' } },
      { label: 'Stay Silent', description: 'Humanity must choose to save itself.', outcome: { effects: { researchChange: 0.05 }, narrativeText: 'The coalition forms without divine mandate. It\'s messier, slower, and entirely human. There\'s something admirable about that.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'The defense coalition forms through mortal diplomacy. Progress is slow but real.' },
  },
  {
    id: 'EVT_076', category: 'alien', title: 'Sabotage Detected',
    description: 'Your scholars have identified the pattern: wars provoked, plagues seeded, trade routes severed — all targeting humanity\'s path to the Defense Grid. Something is actively working against you. Something alien.',
    eraRange: [9, 12], baseWeight: 1.2,
    choices: [
      { label: 'Announce the Threat', description: 'Your followers need to know what they\'re fighting.', outcome: { effects: { faithChange: 0.08, happinessChange: -0.05 }, narrativeText: 'The Harbinger\'s existence is revealed. Fear spikes, but so does resolve. Your followers now know the enemy is already here.' } },
      { label: 'Hunt It Secretly', description: 'Use your divine sight to track and counter the interference.', outcome: { effects: { researchChange: 0.05, faithChange: 0.05 }, narrativeText: 'You begin systematically countering the Harbinger\'s actions. For every war it provokes, you whisper peace. For every plague it seeds, you shield.' } },
      { label: 'Purge the Corruption', description: 'Shield and Miracle on every corrupted region. Burn the alien influence out.', outcome: { effects: { faithChange: 0.12, researchChange: -0.05 }, narrativeText: 'Divine Purges sweep the corrupted regions. The Harbinger\'s influence recedes — temporarily. It will adapt. It always does.' } },
    ],
    autoResolve: { effects: { faithChange: 0.03 }, narrativeText: 'The sabotage pattern is documented. Countermeasures are discussed. Action is slow.' },
  },
  {
    id: 'EVT_077', category: 'alien', title: 'Doomsday Cult',
    description: 'A new faith has sprung up in {region}: the Cult of Endings. They worship the approaching fleet as divine judgment. They want humanity to fail. They\'re growing.',
    eraRange: [9, 12], baseWeight: 0.8,
    choices: [
      { label: 'Crush the Cult', description: 'They worship extinction. They don\'t get to have an opinion.', outcome: { effects: { faithChange: 0.10, happinessChange: -0.05 }, narrativeText: 'The cult is disbanded. Their leaders are arrested. Their followers scatter — but their ideas linger in dark corners.' } },
      { label: 'Debate Them', description: 'Let your prophets face their preachers. Truth wins.', outcome: { effects: { faithChange: 0.05, researchChange: 0.03 }, narrativeText: 'The theological debate draws enormous crowds. Your prophets win — mostly. The cult shrinks but doesn\'t disappear.' } },
      { label: 'Ignore', description: 'Every apocalypse gets its cult. This one will pass.', outcome: { effects: { faithChange: -0.05, happinessChange: -0.03 }, narrativeText: 'The cult grows in your silence. Moderate voices join as the situation worsens. You may have misjudged this one.' } },
    ],
    autoResolve: { effects: { faithChange: -0.05 }, narrativeText: 'The doomsday cult grows unchecked. Their message of surrender resonates with the despairing.' },
  },
  {
    id: 'EVT_078', category: 'alien', title: 'Last Scientist Standing',
    description: 'The lead researcher on the Defense Grid project in {region} is the last person who understands the full system. Everyone else has died, fled, or been corrupted. One mortal holds the key.',
    eraRange: [10, 12], baseWeight: 0.6,
    choices: [
      { label: 'Protect Them', description: 'Shield of Faith. Miracle. Everything you have. One person.', outcome: { effects: { researchChange: 0.15, faithChange: 0.05 }, narrativeText: 'Your divine protection surrounds the scientist. Guards appear. Diseases miss. Accidents don\'t happen. One mortal life, divine bodyguard.' } },
      { label: 'Inspire Backup', description: 'One person shouldn\'t hold the future. Train others.', outcome: { effects: { researchChange: 0.10, developmentChange: 0.3 }, narrativeText: 'Divinely inspired apprentices absorb the scientist\'s knowledge. The project no longer depends on one fragile life.' } },
      { label: 'Trust Mortal Resilience', description: 'They got this far without you. They can finish.', outcome: { effects: { researchChange: 0.05 }, narrativeText: 'The scientist works on, mortal and unprotected and extraordinarily determined. Human stubbornness is its own kind of miracle.' } },
    ],
    autoResolve: { effects: { researchChange: 0.05 }, narrativeText: 'The scientist continues their work. Progress is steady. The world holds its breath.' },
  },
  {
    id: 'EVT_079', category: 'alien', title: 'The Harbinger Speaks',
    description: 'Through a corrupted Prophet, the Harbinger addresses you directly. Not your followers — you. Its voice is cold, precise, and alien. It says: \'You cannot save them all. You know this.\'',
    eraRange: [10, 12], baseWeight: 0.5,
    choices: [
      { label: 'Defy It', description: '\'Watch me.\' — purge the corruption from the Prophet.', outcome: { effects: { faithChange: 0.12, researchChange: 0.05 }, narrativeText: 'You pour divine energy into the Prophet, burning out the alien signal. The Harbinger recoils. The Prophet gasps. Your defiance echoes.' } },
      { label: 'Listen', description: 'Know your enemy. Let it speak.', outcome: { effects: { researchChange: 0.10, faithChange: -0.05 }, narrativeText: 'The Harbinger reveals its strategy — or a version of it. The intelligence is valuable. The psychological damage is real.' } },
    ],
    autoResolve: { effects: { faithChange: -0.05 }, narrativeText: 'The Harbinger\'s message fades. The Prophet is left shaken. Its words linger like poison.' },
  },
  {
    id: 'EVT_080', category: 'alien', title: 'Final Mobilization',
    description: 'This is it. The Defense Grid is partially built. Resources are exhausted. Time is nearly up. Everything humanity has — and everything you\'ve given them — comes down to these final decisions.',
    eraRange: [11, 12], baseWeight: 1.5,
    choices: [
      { label: 'Everything Into Defense', description: 'Strip every temple, every treasury, every last resource. Build the wall.', outcome: { effects: { researchChange: 0.20, faithChange: -0.05, happinessChange: -0.10 }, narrativeText: 'Your temples are dismantled for raw materials. Your followers give everything. The Defense Grid grows. Whether it\'s enough... you\'ll find out soon.' } },
      { label: 'Balance Defense and Morale', description: 'A demoralized humanity won\'t fight well, even behind a wall.', outcome: { effects: { researchChange: 0.10, faithChange: 0.05, happinessChange: 0.03 }, narrativeText: 'The mobilization is steady, not panicked. Your followers maintain their faith and their sanity. The Defense Grid builds at a sustainable pace.' } },
      { label: 'Pray', description: 'You\'ve done what you can. The rest is up to them — and whatever you are.', outcome: { effects: { faithChange: 0.10 }, narrativeText: 'In the final moments, you simply... believe. In them. In yourself. In six hundred years of choices that led to this. It\'s either enough or it isn\'t.' } },
    ],
    autoResolve: { effects: { researchChange: 0.08 }, narrativeText: 'The final mobilization proceeds without divine direction. Humanity faces its test alone — or so it seems.' },
  },
];

// ---------------------------------------------------------------------------
// Master list
// ---------------------------------------------------------------------------

export const ALL_EVENT_TEMPLATES: EventTemplate[] = [
  ...MILITARY_EVENTS,
  ...RELIGIOUS_EVENTS,
  ...SCIENTIFIC_EVENTS,
  ...NATURAL_EVENTS,
  ...CULTURAL_EVENTS,
  ...POLITICAL_EVENTS,
  ...INTERNAL_EVENTS,
  ...ALIEN_EVENTS,
];

export const VALID_EVENT_CATEGORIES: EventCategory[] = [
  'religious', 'political', 'scientific', 'natural', 'cultural', 'military', 'internal', 'alien',
];

export function getEventTemplateById(id: string): EventTemplate | undefined {
  return ALL_EVENT_TEMPLATES.find((t) => t.id === id);
}

export function getEventTemplatesByCategory(category: EventCategory): EventTemplate[] {
  return ALL_EVENT_TEMPLATES.filter((t) => t.category === category);
}
