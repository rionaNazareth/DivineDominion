// =============================================================================
// DIVINE DOMINION — Narrative Templates
// =============================================================================
// Source of truth: docs/design/02b-era-narratives.md
// LLM Call #3 generates personalized versions; these are the fallbacks.
// Variable slots: {religion_name}, {nation_name}, {region_name}, {war_count},
//   {conversion_count}, {population}, {rival_religion}, {tech_milestone},
//   {faith_percent}, {dev_level}, {event_count}, {heresy_count},
//   {defense_status}, {grid_status}
// =============================================================================

import type { EraId, EndingType } from '../types/game.js';

// ---------------------------------------------------------------------------
// Era narrative fallback templates (12 eras)
// ---------------------------------------------------------------------------

export const ERA_NARRATIVE_TEMPLATES: Record<EraId, string> = {
  renaissance:
    '{religion_name} takes root in the {region_name}. The {nation_name} are young, curious, and remarkably prone to setting things on fire. {war_count} wars have already started. Your followers number {population} — a modest start for a god.',

  exploration:
    'Ships sail, and with them, your doctrine. {religion_name} reaches new shores — {conversion_count} regions now know your name, though {heresy_count} of them are already getting the commandments wrong. {rival_religion} grows in the {region_name}. Competition, it seems, is divine.',

  enlightenment:
    'Scholars question everything — including you. {tech_milestone} changes the world. {religion_name} controls {faith_percent}% of minds, which is impressive until you realize the other {100 - faith_percent}% have opinions. {war_count} wars this era. Knowledge is rarely peaceful.',

  revolution:
    'The old order crumbles. {war_count} revolutions, {event_count} crises, and at least one regicide that your followers are pretending wasn\'t their fault. {religion_name} has {population} followers who are discovering that faith and politics mix like fire and lamp oil.',

  industry:
    'Smoke rises. Cities swell. {nation_name} reaches Dev {dev_level}, which means they\'ve invented both factory labor and the concept of the weekend. {religion_name} has {faith_percent}% of the world. Whether that\'s enough depends on what you do with the next century.',

  empire:
    'Empires stretch across continents. {war_count} conflicts, and the stakes keep rising. {population} people follow {religion_name}. Enough to build something lasting, if they stop fighting long enough. The world has never been more connected, or more fragile.',

  atomic:
    'They\'ve split the atom. This is either the beginning of salvation or the beginning of the end. {tech_milestone} achieved. {religion_name} has {faith_percent}% of humanity. Somewhere in the numbers, something doesn\'t add up — but you can\'t quite see what.',

  digital:
    'Information moves at the speed of light. Faith moves at the speed of doubt. {religion_name} contends with {conversion_count} connected regions and {heresy_count} questioning ones. Your prophets dream of shadows. Your scholars see patterns they can\'t explain. Something is interfering.',

  signal:
    'The signal is confirmed. Something is coming. {nation_name} leads the global response with Dev {dev_level}. {religion_name} has {faith_percent}% of humanity — and for the first time, you know exactly why that matters. The Harbinger has been working against you. Now you know.',

  revelation:
    'They can see it now. A darkening where stars should be. {war_count} wars continue as if geography still matters. {tech_milestone} gives humanity a fighting chance — barely. {religion_name} must hold {faith_percent}% of the world together long enough to build something extraordinary.',

  preparation:
    'Planetary Defense is {defense_status}. Every war is a distraction you can\'t afford. Every plague is a setback that might kill billions. {religion_name}\'s {population} followers are building, praying, and hoping you have a plan. You hope so too.',

  arrival:
    'This is it. The fleet enters visual range. Defense Grid: {grid_status}. {population} souls depend on what you\'ve built across six centuries. No more eras. No more transitions. Just the end — or the beginning of something new.',
};

// ---------------------------------------------------------------------------
// Mid-era milestone toast templates
// ---------------------------------------------------------------------------

export const MILESTONE_TOAST_TEMPLATES = {
  population: 'Your followers number {milestone}.',
  territory: 'Your faith is now the majority in {count} regions.',
  war_end: 'The {war_name} has ended. {casualties} dead. {cities_razed} cities razed.',
  trade: 'A new trade route connects your {direction_a} and {direction_b} followers.',
  science: 'The {milestone_name} spreads your scripture faster than any prophet.',
  rival_growth: 'The followers of {rival_religion} grow restless in the {direction}.',
  divine_echo: 'Your people speak of your {power_name} for generations.',
  dev_milestone: 'Your capital has grown into a true {city_tier}.',
} as const;

// ---------------------------------------------------------------------------
// Endgame narrative templates (win/lose variants)
// ---------------------------------------------------------------------------

export interface EndgameNarrative {
  ending: EndingType;
  title: string;
  winVariant: string;
  loseVariant?: string;
}

export const ENDGAME_NARRATIVES: EndgameNarrative[] = [
  {
    ending: 'united_front',
    title: 'United Front',
    winVariant:
      'The Defense Grid goes online. Not because one nation built it — because all of them did. {religion_name} was the thread that held them together when everything else frayed. The alien fleet reaches the outer edge of the solar system and stops. Then retreats. They expected prey. They found something else. {population} souls watched the stars together, praying in {conversion_count} languages, and the universe blinked first.',
  },
  {
    ending: 'lone_guardian',
    title: 'Lone Guardian',
    winVariant:
      '{nation_name} stands alone. Other nations fell, failed, or were consumed by the Harbinger\'s long game. But {religion_name}\'s {population} faithful never wavered. The Defense Grid they built alone — underfunded, overstretched, held together with faith and stubbornness — activates at the last possible moment. The fleet turns. History will debate whether it was the technology or something else. Your followers already know.',
  },
  {
    ending: 'survival',
    title: 'Survival',
    winVariant:
      'The fleet arrives. The Defense Grid holds — mostly. Cities burn. Nations fracture. But humanity survives. {religion_name} emerges from the rubble with {population} followers and a story no scripture could have predicted. You guided them here. Through {war_count} wars and {event_count} crises and six centuries of impossible choices. They\'re still here. So are you.',
    loseVariant:
      'The fleet arrives. The Defense Grid fails. Humanity scatters to the margins — survivors in hidden valleys, in deep bunkers, in {region_name} where {religion_name}\'s last {population} faithful maintain the old prayers. They call it the Long Night. Some believe you will return. Some believe you never left. Both are correct, in their way.',
  },
  {
    ending: 'extinction',
    title: 'Extinction',
    loseVariant:
      'The fleet arrives. The Defense Grid was never built. {religion_name} had {population} faithful when the sky went dark — enough to fill a cathedral, too few to matter. The last prayer was spoken in {region_name}, in {nation_name}, by someone whose name history will never record. You heard it. That will have to be enough.',
  },
  {
    ending: 'self_destruction',
    title: 'Self-Destruction',
    loseVariant:
      'The fleet never had to fire a shot. Humanity managed it on its own. {war_count} wars in the final century. Science abandoned for ideology. {religion_name}\'s last influence flickering out in {region_name} as the missiles launched. The aliens arrived to find a world that had already chosen its ending. Your {population} faithful prayed for salvation that never came — because the danger was never from the stars.',
  },
  {
    ending: 'ascension',
    title: 'Ascension',
    winVariant:
      'They don\'t fight the fleet. They don\'t flee it. They meet it. {religion_name}\'s {population} followers have spent six centuries learning what you always knew: that the universe is large, and humanity is small, and smallness is not weakness. The aliens expected a war. What they found was an invitation. {nation_name} extends a hand across the void. The fleet stops. The countdown ends. Something new begins — together.',
  },
];

// ---------------------------------------------------------------------------
// Alien revelation text templates
// ---------------------------------------------------------------------------

export const ALIEN_REVELATION_TEMPLATES = {
  signal_first_detected:
    'Something is out there. The signal is faint — too regular to be natural noise, too complex to be random. Your scholars call it anomalous. Your prophets call it a warning. You call it what it is: the beginning of the end of humanity\'s isolation.',

  signal_confirmed:
    'The coordinates are real. The timeline is real. They are coming — and they have been coming for a long time. The Harbinger\'s purpose becomes clear: it arrived first to weaken what it found. To prepare the ground. You have been fighting a war you didn\'t know had started.',

  harbinger_revealed:
    'The pattern is unmistakable now. Every war it fomented. Every plague it seeded. Every alliance it poisoned. The Harbinger has not been random chaos — it has been surgery. Precise, patient, and aimed at exactly the things that make humanity capable of resisting what comes next.',

  fleet_visual:
    'They are vast. Your astronomers struggle to count them. The lead ships are larger than cities. Behind them, more ships. Behind those, more still. Whatever they are, whatever they want — they have committed to it. There is no cavalry coming. There is only what you build, and who you unite, and whether it\'s enough.',

  final_countdown:
    'The Defense Grid status: {grid_status}. Time remaining: not enough, never enough, but all you have. {population} people are praying right now — in {nation_name}, in ruined cities, in hidden valleys, in the one temple you never let them tear down. They are praying to you. You are listening. Begin.',
};

// ---------------------------------------------------------------------------
// Religion origin text templates (used in game intro and commandment screen)
// ---------------------------------------------------------------------------

export const RELIGION_ORIGIN_TEMPLATES = {
  player_intro:
    'A new world. A new Earth. Your followers are few — {population} souls in {region_name}, who have heard something that might be your voice or might be the wind. Either way, they\'re listening. Either way, you are here. Choose your commandments. Shape what they believe. Shape, through them, what this world becomes.',

  first_commandment_selected:
    'The first commandment is spoken. {commandment_name}: "{commandment_flavor}". Somewhere in {region_name}, a follower repeats it in the night. Something shifts in the world. It always does, when a god chooses what to say.',

  ten_commandments_chosen:
    'Your doctrine is set. {religion_name} stands on ten pillars — and the combinations between them will determine what your followers become. Whether they build or conquer, question or obey, endure or transcend. You have six centuries. Begin.',

  rival_religion_spawned:
    '{rival_name} emerges in {region_name}. They are not you — their commandments diverge from yours in ways that will matter, eventually. For now, they are a distant voice in a crowded world. Whether that distance closes, and how, is the question.',
};

// ---------------------------------------------------------------------------
// Endgame Earth history intro text
// ---------------------------------------------------------------------------

export const EARTH_HISTORY_INTRO =
  'This is the history of Earth {earth_number}. {religion_name} guided {nation_name} from {start_year} to {end_year}. What follows is not a judgment — it is a record. The good and the terrible, the miraculous and the catastrophic, are all here. Read it slowly. You were present for all of it.';

// ---------------------------------------------------------------------------
// Commandment scripture display (used on commandment card)
// ---------------------------------------------------------------------------

export const COMMANDMENT_CARD_INTRO =
  'The {religion_name} followed {commandment_count} commandments across {earth_number} Earths. These are the ten from Earth {earth_number}: the choices that shaped six centuries, ended one world, and prepared the soul that carries them forward.';
