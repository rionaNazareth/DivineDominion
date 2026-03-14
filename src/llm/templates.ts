// =============================================================================
// DIVINE DOMINION — LLM Templates & Fallbacks
// All 5 LLM call types. Every call has a complete fallback.
// See docs/design/10-llm-integration.md
// =============================================================================

import type { EraId, GameState, VoiceType } from '../types/game.js';
import type { LLMCallOptions } from './client.js';
import { LLM, ERAS } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function eraNumber(eraId: EraId): number {
  return ERAS.findIndex(e => e.id === eraId) + 1; // 1-indexed
}

// ---------------------------------------------------------------------------
// Call #1 — Rival Religion Generation
// ---------------------------------------------------------------------------

export interface RivalReligionContext {
  seed: number;
  existingReligionNames: string[];
  worldPersonalities: string[];
}

export interface GeneratedRivalReligion {
  name: string;
  personality: string;
  commandmentTheme: string;
  hiddenRuleHint: string;
  flavorText: string;
}

export function buildRivalReligionPrompt(ctx: RivalReligionContext): LLMCallOptions {
  const prompt = `You are a game designer creating rival religions for a civilization simulation spanning 1600–2200 AD.

Existing religions (avoid duplicating names or themes): ${ctx.existingReligionNames.join(', ')}
World personalities present: ${ctx.worldPersonalities.join(', ')}

Generate 3 unique rival religions as JSON. Each must feel distinct in theme, tone, and strategy.

Respond with JSON array of 3 objects:
[
  {
    "name": "Short unique name (2-4 words)",
    "personality": "one of: peaceful|expansionist|scholarly|militant|apocalyptic|isolationist|syncretic|mercantile",
    "commandmentTheme": "1 sentence describing their core moral code",
    "hiddenRuleHint": "1 sentence cryptic hint about their secret doctrine",
    "flavorText": "1 sentence evocative description"
  }
]

Max ${LLM.ERA_NARRATIVE_MAX_WORDS} words total.`;

  return {
    prompt,
    schema: { type: 'object' },
    maxTokens: 400,
  };
}

/** Fallback: pre-made rival religions pool (10 entries). */
export const RIVAL_RELIGION_FALLBACKS: GeneratedRivalReligion[] = [
  { name: 'The Order of the Flame', personality: 'militant', commandmentTheme: 'Faith spread by the sword is faith that lasts.', hiddenRuleHint: 'Their fervor doubles when pressed into corners.', flavorText: 'Red banners and iron convictions.' },
  { name: 'Children of the Harvest', personality: 'peaceful', commandmentTheme: 'Abundance is holy; waste is sin.', hiddenRuleHint: 'Their prosperity conceals a cold pragmatism.', flavorText: 'They feed nations and ask only devotion.' },
  { name: 'Seekers of Unity', personality: 'syncretic', commandmentTheme: 'All gods are one god; all paths lead home.', hiddenRuleHint: 'Their unity hides a hierarchy none see coming.', flavorText: 'Open arms, open borders, open questions.' },
  { name: 'The Ascendant Path', personality: 'scholarly', commandmentTheme: 'Knowledge is divine; ignorance is heresy.', hiddenRuleHint: 'Science and faith are weapons, both.', flavorText: 'Librarians who build armies.' },
  { name: 'Iron Covenant', personality: 'expansionist', commandmentTheme: 'Territory is theology; borders are scripture.', hiddenRuleHint: 'They never stop moving.', flavorText: 'Every new land is a new commandment.' },
  { name: 'The Veil of Seasons', personality: 'isolationist', commandmentTheme: 'Purity requires distance; the world corrupts.', hiddenRuleHint: 'Isolation breeds something unexpected.', flavorText: 'Beautiful and unreachable as winter mountains.' },
  { name: 'Merchant Saints', personality: 'mercantile', commandmentTheme: 'Trade is prayer; profit is providence.', hiddenRuleHint: 'Their god has a price for everything.', flavorText: 'They buy converts as easily as cities.' },
  { name: 'Harbingers of the End', personality: 'apocalyptic', commandmentTheme: 'The world must break before it can be saved.', hiddenRuleHint: 'They welcome disaster as revelation.', flavorText: 'Their prophecies have an unsettling accuracy.' },
  { name: 'The Gentle Law', personality: 'peaceful', commandmentTheme: 'Mercy given freely is strength, not weakness.', hiddenRuleHint: 'Their forgiveness has limits no one knows.', flavorText: 'They outlast empires by outlasting anger.' },
  { name: 'The Unbroken Circle', personality: 'syncretic', commandmentTheme: 'What is taken must be returned; balance is divine.', hiddenRuleHint: 'They remember every debt.', flavorText: 'Ancient, patient, and watching.' },
];

// ---------------------------------------------------------------------------
// Call #2 — Commandment Scripture
// ---------------------------------------------------------------------------

export interface ScriptureContext {
  commandmentNames: string[];
  commandmentEffects: string[];
  tensionPairs: string[];
  archetypeOrigin: 'shepherd' | 'judge' | 'conqueror' | 'custom';
}

export function buildScripturePrompt(ctx: ScriptureContext): LLMCallOptions {
  const prompt = `System: You are the founding prophet of a new religion.

The god has spoken 10 laws:
${ctx.commandmentNames.map((name, i) => `- ${name}: ${ctx.commandmentEffects[i] ?? ''}`).join('\n')}

Tension pairs present: ${ctx.tensionPairs.length > 0 ? ctx.tensionPairs.join(', ') : 'none'}
Archetype origin: ${ctx.archetypeOrigin}

Write a 2-sentence scripture — a poetic interpretation of what this combination of laws means as a philosophy. Be specific to the contradictions or harmony in THIS set. Dramatic, mythic tone.

Max ${LLM.COMMANDMENT_SCRIPTURE_MAX_WORDS} words.`;

  return { prompt, maxTokens: 80 };
}

/** Fallback scriptural text keyed by archetype. */
export const SCRIPTURE_FALLBACKS: Record<ScriptureContext['archetypeOrigin'], string> = {
  shepherd: 'Yours is the way of the Shepherd — mercy tempered by order, growth measured by the souls you guide rather than the lands you claim.',
  judge: 'Yours is the way of the Judge — justice absolute, consequence certain, and a world that fears your silence more than your wrath.',
  conqueror: 'Yours is the way of the Conqueror — faith forged in fire, borders drawn in blood, and a doctrine that spreads by the sword\'s edge.',
  custom: 'Your commandments speak of a god who defies simple labels — a faith built from contradictions, held together by will alone.',
};

// ---------------------------------------------------------------------------
// Call #3 — Enhanced Era Narrative
// ---------------------------------------------------------------------------

export interface EraNarrativeContext {
  eraId: EraId;
  eraName: string;
  startYear: number;
  endYear: number;
  religionName: string;
  commandments: string[];
  faithPercent: number;
  eventNames: string[];
  powersUsed: { blessings: number; disasters: number };
  warCount: number;
  techMilestone: string;
  actionSummary: string;
  harbingerActive: boolean;
  harbingerActions?: string[];
  harbingerTarget?: string;
  playerCounterPlay?: string;
}

export interface EraNarrativeResult {
  era_summary: string;
  god_epithet: string | null;
  prophecy: string;
  quote: string;
  harbinger_whisper?: string;
}

export function buildEraNarrativePrompt(ctx: EraNarrativeContext): LLMCallOptions {
  const eraNum = eraNumber(ctx.eraId);
  const harbingerSection = ctx.harbingerActive && eraNum >= 7
    ? `
- Harbinger active: ${(ctx.harbingerActions ?? []).join(', ') || 'none'}
- Harbinger target: ${ctx.harbingerTarget ?? 'unknown'}
- Player counter-play: ${ctx.playerCounterPlay ?? 'none'}`
    : '';

  const harbingerJsonField = ctx.harbingerActive && eraNum >= 7
    ? `\n  "harbinger_whisper": "1-2 sentences from the Harbinger's perspective. Taunting, deceptive, or threatening. References specific player actions. The Harbinger is an alien intelligence, not a god — cold, analytical, but learning to mimic human emotion."`
    : '';

  const prompt = `System: You are the narrator of a civilization simulation spanning 1600–2200 AD. You also characterize the player's god based on their actions.

Context:
- Player's religion: ${ctx.religionName}
- Commandments: ${ctx.commandments.slice(0, 5).join(', ')}
- Era just completed: ${ctx.eraName} (${ctx.startYear}–${ctx.endYear})
- Religion controls: ${ctx.faithPercent}% of world population
- Major events this era: ${ctx.eventNames.slice(0, 4).join(', ') || 'none'}
- Divine interventions used: ${ctx.powersUsed.blessings + ctx.powersUsed.disasters} (blessings: ${ctx.powersUsed.blessings}, disasters: ${ctx.powersUsed.disasters})
- Wars this era: ${ctx.warCount}
- Science level: ${ctx.techMilestone}
- Player action pattern: ${ctx.actionSummary}${harbingerSection}

Generate as JSON:
{
  "era_summary": "3 sentences. Dramatic, historical tone.",
  "god_epithet": "A 2-4 word title for how the player played this era. Examples: 'the Silent Judge', 'the Wrathful Shepherd'. Can be null if unclear.",
  "prophecy": "1 sentence hint about next era.",
  "quote": "1 sentence fictional quote from a historical figure."${harbingerJsonField}
}

Max ${LLM.ERA_NARRATIVE_MAX_WORDS} words total.`;

  return { prompt, schema: { type: 'object' }, maxTokens: 250 };
}

/** Fallback era narratives from docs/design/02b-era-narratives.md */
export const ERA_NARRATIVE_FALLBACKS: Record<EraId, (vars: {
  religionName: string;
  nationName: string;
  regionName: string;
  warCount: number;
  conversionCount: number;
  population: string;
  rivalReligion: string;
  techMilestone: string;
  faithPercent: number;
  devLevel: number;
  eventCount: number;
  heresyCount: number;
  defenseStatus: string;
  gridStatus: string;
}) => string> = {
  renaissance: (v) => `${v.religionName} takes root in the ${v.regionName}. The ${v.nationName} are young, curious, and remarkably prone to setting things on fire. ${v.warCount} wars have already started. Your followers number ${v.population} — a modest start for a god.`,
  exploration: (v) => `Ships sail, and with them, your doctrine. ${v.religionName} reaches new shores — ${v.conversionCount} regions now know your name, though ${v.heresyCount} of them are already getting the commandments wrong. ${v.rivalReligion} grows in the ${v.regionName}. Competition, it seems, is divine.`,
  enlightenment: (v) => `Scholars question everything — including you. ${v.techMilestone} changes the world. ${v.religionName} controls ${v.faithPercent}% of minds, which is impressive until you realize the other ${100 - v.faithPercent}% have opinions. ${v.warCount} wars this era. Knowledge is rarely peaceful.`,
  revolution: (v) => `The old order crumbles. ${v.warCount} revolutions, ${v.eventCount} crises, and at least one regicide that your followers are pretending wasn't their fault. ${v.religionName} has ${v.population} followers who are discovering that faith and politics mix like fire and lamp oil.`,
  industry: (v) => `Smoke rises. Cities swell. ${v.nationName} reaches Dev ${v.devLevel}, which means they've invented both factory labor and the concept of the weekend. ${v.religionName} has ${v.faithPercent}% of the world. Whether that's enough depends on what you do with the next century.`,
  empire: (v) => `Empires stretch across continents. ${v.warCount} conflicts, and the stakes keep rising. ${v.population} people follow ${v.religionName}. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile.`,
  atomic: (v) => `They've split the atom. This is either the beginning of salvation or the beginning of the end. ${v.techMilestone} achieved. ${v.religionName} has ${v.faithPercent}% of humanity. Somewhere in the numbers, something doesn't add up — but you can't quite see what.`,
  digital: (v) => `Information moves at the speed of light. Faith moves at the speed of doubt. ${v.religionName} contends with ${v.conversionCount} connected regions and ${v.heresyCount} questioning ones. Your prophets dream of shadows. Your scholars see patterns they can't explain. Something is interfering.`,
  signal: (v) => `The signal is confirmed. Something is coming. ${v.nationName} leads the global response with Dev ${v.devLevel}. ${v.religionName} has ${v.faithPercent}% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know.`,
  revelation: (v) => `They can see it now. A darkening where stars should be. ${v.warCount} wars continue as if geography still matters. ${v.techMilestone} gives humanity a fighting chance — barely. ${v.religionName} must hold ${v.faithPercent}% of the world together long enough to build something extraordinary.`,
  preparation: (v) => `Planetary Defense is ${v.defenseStatus}. Every war is a distraction you can't afford. Every plague is a setback that might kill billions. ${v.religionName}'s ${v.population} followers are building, praying, and hoping you have a plan. You hope so too.`,
  arrival: (v) => `This is it. The fleet enters visual range. Defense Grid: ${v.gridStatus}. ${v.population} souls depend on what you've built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new.`,
};

/** Harbinger whisper fallbacks by era number (7-12). */
export const HARBINGER_WHISPER_FALLBACKS: Record<number, string> = {
  7: 'Strange signals disrupt the region.',
  8: 'Something is watching.',
  9: 'The interference is deliberate. It has a source.',
  10: 'The Harbinger adjusts its strategy. It\'s learning.',
  11: 'Signal strength intensifies. The fleet draws closer.',
  12: 'All remaining resources deployed. This is the end — theirs or yours.',
};

// ---------------------------------------------------------------------------
// Call #4 — Follower Voice Petition
// ---------------------------------------------------------------------------

export interface VoicePetitionContext {
  voiceName: string;
  voiceType: VoiceType;
  loyalty: number;
  petitionType: string;
  petitionAction: string;
  petitionsAnswered: number;
  petitionsDenied: number;
  recentDivineActionsNearby: string[];
  commandmentNames: string[];
  regionName: string;
  isHeretic: boolean;
  heresyContradiction?: string;
}

export function buildVoicePetitionPrompt(ctx: VoicePetitionContext): LLMCallOptions {
  const typeDescriptions: Record<VoiceType, string> = {
    prophet: 'reverent, poetic, devoted',
    ruler: 'political, pragmatic, measured',
    general: 'blunt, direct, military-minded',
    scholar: 'measured, curious, analytical',
    heretic: 'accusatory, passionate, confrontational',
  };

  const heresySection = ctx.isHeretic && ctx.heresyContradiction
    ? `\nYou believe the god's commandments are wrong because: ${ctx.heresyContradiction}`
    : '';

  const prompt = `System: You are ${ctx.voiceName}, a ${ctx.voiceType} in a civilization where the player is god. You are speaking directly to your god.

Your personality: ${typeDescriptions[ctx.voiceType]}
Your loyalty: ${ctx.loyalty.toFixed(2)} (0=hostile, 1=devoted)
Your request: ${ctx.petitionType} — ${ctx.petitionAction}
Your history: ${ctx.petitionsAnswered} answered / ${ctx.petitionsDenied} denied
Player's recent actions near you: ${ctx.recentDivineActionsNearby.join(', ') || 'none'}
Player's commandments: ${ctx.commandmentNames.slice(0, 5).join(', ')}${heresySection}

Speak to your god in 2-3 sentences. Be specific to your situation.
Tone: ${typeDescriptions[ctx.voiceType]}

Max ${LLM.VOICE_PETITION_MAX_WORDS} words.`;

  return { prompt, maxTokens: 100 };
}

/** Fallback petition text keyed by voice type. */
export const VOICE_PETITION_FALLBACKS: Record<VoiceType, (ctx: { regionName: string; action: string }) => string> = {
  prophet: (ctx) => `My Lord, the people of ${ctx.regionName} need your blessing. Grant us your light and ${ctx.action}.`,
  ruler: (ctx) => `The nation requests divine favor, Lord. Bless our cause and ${ctx.action}.`,
  general: (ctx) => `We fight in your name, Lord. Aid us — ${ctx.action}.`,
  scholar: (ctx) => `The academy of ${ctx.regionName} seeks your inspiration, Lord. Guide our research and ${ctx.action}.`,
  heretic: (_ctx) => `Your commandments betray us, god. I demand reform. The truth demands ${_ctx.action}.`,
};

// ---------------------------------------------------------------------------
// Call #5 — Earth Eulogy
// ---------------------------------------------------------------------------

export type EulogyOutcome = 'united_front' | 'lone_guardian' | 'survival' | 'extinction' | 'self_destruction' | 'ascension' | 'abandoned';

export interface EulogyContext {
  outcome: EulogyOutcome;
  earthNumber: number;
  godEpithet: string | null;
  religionName: string;
  commandmentNames: string[];
  scripture: string | null;
  pivotalMoments: string[];
  namedCharacters: string[];
  stats: {
    followersAtEnd: number;
    totalInterventions: number;
    blessingsUsed: number;
    disastersUsed: number;
    warCount: number;
    erasSurvived: number;
  };
  harbingerSummary: string;
  overallActionPattern: string;
}

export function buildEulogyPrompt(ctx: EulogyContext): LLMCallOptions {
  const prompt = `System: Write the eulogy for a dead world — or a celebration for a saved one.

Outcome: ${ctx.outcome}
God's title: ${ctx.godEpithet ?? 'unnamed'}
Religion: ${ctx.religionName}
Commandments: ${ctx.commandmentNames.slice(0, 5).join(', ')}
Scripture: ${ctx.scripture ?? 'none recorded'}
Key moments: ${ctx.pivotalMoments.slice(0, 8).join('; ')}
Named characters: ${ctx.namedCharacters.slice(0, 5).join(', ') || 'none'}
Stats: ${ctx.stats.followersAtEnd.toLocaleString()} followers, ${ctx.stats.totalInterventions} interventions, ${ctx.stats.blessingsUsed} blessings, ${ctx.stats.disastersUsed} disasters, ${ctx.stats.warCount} wars, ${ctx.stats.erasSurvived} eras
Harbinger: ${ctx.harbingerSummary}
Play style: ${ctx.overallActionPattern}

Write a 4-6 sentence story of this Earth. Reference specific moments and characters by name. End with a line about the god — not humanity. Dramatic, mythic tone. This will be shared as a screenshot.

Max ${LLM.EARTH_EULOGY_MAX_WORDS} words.`;

  return { prompt, maxTokens: 200 };
}

/** Fallback Earth Eulogy templates from docs/design/10-llm-integration.md */
export function buildEulogyFallback(ctx: EulogyContext): string {
  const s = ctx.stats;
  const r = ctx.religionName;
  const n = ctx.earthNumber;

  switch (ctx.outcome) {
    case 'united_front':
      return `Earth #${n} survived. ${r} spread across ${s.followersAtEnd.toLocaleString()} regions, weathered ${s.warCount} wars, and when the sky darkened, ${s.followersAtEnd.toLocaleString()} souls stood together. You blessed ${s.blessingsUsed} times and burned ${s.disastersUsed}. The Grid held. Not because they were ready — because you made them ready.`;
    case 'lone_guardian':
      return `One nation. That's all it took. On Earth #${n}, a lone nation built what the world couldn't build together. ${r} gave them the doctrine; you gave them ${s.blessingsUsed} miracles. The rest of humanity owes everything to a people they feared more than the stars.`;
    case 'survival':
      return `Earth #${n} survived — barely. The Grid was ragged, the defense desperate. ${s.followersAtEnd.toLocaleString()} souls lived through what ${s.warCount} wars and ${s.disastersUsed} divine storms couldn't prevent. They'll rebuild. They'll remember what you did. And what you didn't.`;
    case 'extinction':
      return `Earth #${n} fell. ${r} lasted ${s.erasSurvived} eras. You intervened ${s.totalInterventions} times — ${s.blessingsUsed} blessings, ${s.disastersUsed} catastrophes. It wasn't enough. It never feels like enough. The silence returns. Again.`;
    case 'self_destruction':
      return `They didn't even make it. Earth #${n} ended in nuclear fire before the aliens arrived. ${s.warCount} wars, and the last one was the one they couldn't take back. ${r} taught them faith. It didn't teach them patience.`;
    case 'ascension':
      return `Earth #${n} transcended. Across ${s.erasSurvived} eras, ${r} guided ${s.followersAtEnd.toLocaleString()} souls past war, past fear, past the limits of what you thought they could become. When the aliens arrived, they didn't find prey. They found something new.`;
    case 'abandoned':
      return `Earth #${n}. You stopped answering. ${r} had ${s.followersAtEnd.toLocaleString()} followers when you left. They noticed. They carried on. Whatever they built — or didn't — they did it without you.`;
  }
}

// ---------------------------------------------------------------------------
// Mid-era milestone toast templates
// ---------------------------------------------------------------------------

export interface MilestoneToastVars {
  milestone?: string;
  count?: number;
  warName?: string;
  casualties?: string;
  citiesRazed?: number;
  directionA?: string;
  directionB?: string;
  milestoneNameSci?: string;
  rivalReligion?: string;
  direction?: string;
  powerName?: string;
  cityTier?: string;
}

export type MilestoneToastCategory =
  | 'population'
  | 'territory'
  | 'war_end'
  | 'trade'
  | 'science'
  | 'rival_growth'
  | 'divine_echo'
  | 'dev_milestone';

export function buildMilestoneToast(
  category: MilestoneToastCategory,
  vars: MilestoneToastVars,
): string {
  switch (category) {
    case 'population':
      return `Your followers number ${vars.milestone ?? 'many'}.`;
    case 'territory':
      return `Your faith is now the majority in ${vars.count ?? 0} regions.`;
    case 'war_end':
      return `The ${vars.warName ?? 'war'} has ended. ${vars.casualties ?? 'many'} dead. ${vars.citiesRazed ?? 0} cities razed.`;
    case 'trade':
      return `A new trade route connects your ${vars.directionA ?? 'eastern'} and ${vars.directionB ?? 'western'} followers.`;
    case 'science':
      return `The ${vars.milestoneNameSci ?? 'new discovery'} spreads your scripture faster than any prophet.`;
    case 'rival_growth':
      return `The followers of ${vars.rivalReligion ?? 'a rival faith'} grow restless in the ${vars.direction ?? 'south'}.`;
    case 'divine_echo':
      return `Your people speak of your ${vars.powerName ?? 'miracle'} for generations.`;
    case 'dev_milestone':
      return `Your capital has grown into a true ${vars.cityTier ?? 'city'}.`;
  }
}
