// =============================================================================
// DIVINE DOMINION — Commandment Selection Scene (Task 3.2)
// Pure logic for commandment selection UI.
// Rendering is HTML/DOM; this module provides the data model + helpers.
// =============================================================================

import type { Commandment, CommandmentId, CommandmentCategory } from '../types/game.js';
import { COMMANDMENTS } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Selection state
// ---------------------------------------------------------------------------

export interface CommandmentSelectionState {
  mode: 'grid' | 'list';
  activeCategory: CommandmentCategory | 'all';
  selectedIds: Set<CommandmentId>;
  searchQuery: string;
  showTensionsOnly: boolean;
  expandedCategories: Set<CommandmentCategory>;
  infoPopoverTarget: CommandmentId | null;
  isFirstEarth: boolean;
  /** When swapping: the commandment being replaced */
  swappingId: CommandmentId | null;
}

export function createSelectionState(isFirstEarth: boolean): CommandmentSelectionState {
  return {
    mode: 'grid',
    activeCategory: 'all',
    selectedIds: new Set(),
    searchQuery: '',
    showTensionsOnly: false,
    expandedCategories: new Set(),
    infoPopoverTarget: null,
    isFirstEarth,
    swappingId: null,
  };
}

export function createReviewState(preselectedIds: CommandmentId[]): CommandmentSelectionState {
  return {
    mode: 'grid',
    activeCategory: 'all',
    selectedIds: new Set(preselectedIds),
    searchQuery: '',
    showTensionsOnly: false,
    expandedCategories: new Set(),
    infoPopoverTarget: null,
    isFirstEarth: true,
    swappingId: null,
  };
}

// ---------------------------------------------------------------------------
// Selection logic
// ---------------------------------------------------------------------------

export const COMMANDMENT_PICK_TARGET = COMMANDMENTS.PLAYER_PICKS;

export function canSelect(state: CommandmentSelectionState, id: CommandmentId): boolean {
  if (state.selectedIds.has(id)) return false;
  return state.selectedIds.size < COMMANDMENT_PICK_TARGET;
}

export function toggleSelect(
  state: CommandmentSelectionState,
  id: CommandmentId,
): CommandmentSelectionState {
  const next = new Set(state.selectedIds);
  if (next.has(id)) {
    next.delete(id);
    // if swapping was pending, clear it
    return { ...state, selectedIds: next, swappingId: null };
  }
  if (next.size < COMMANDMENT_PICK_TARGET) {
    next.add(id);
    return { ...state, selectedIds: next };
  }
  return state; // already at cap
}

export function startSwap(
  state: CommandmentSelectionState,
  id: CommandmentId,
): CommandmentSelectionState {
  if (!state.selectedIds.has(id)) return state;
  const next = new Set(state.selectedIds);
  next.delete(id);
  return { ...state, selectedIds: next, swappingId: id };
}

export function isConfirmEnabled(state: CommandmentSelectionState): boolean {
  return state.selectedIds.size === COMMANDMENT_PICK_TARGET;
}

// ---------------------------------------------------------------------------
// Tension detection
// ---------------------------------------------------------------------------

export function detectTensionPairs(
  selectedIds: CommandmentId[],
  allCommandments: Commandment[],
): Array<[CommandmentId, CommandmentId]> {
  const pairs: Array<[CommandmentId, CommandmentId]> = [];
  const selected = new Set(selectedIds);
  for (const cmd of allCommandments) {
    if (!selected.has(cmd.id)) continue;
    for (const tensionId of cmd.tensionsWith) {
      if (selected.has(tensionId) && cmd.id < tensionId) {
        pairs.push([cmd.id, tensionId]);
      }
    }
  }
  return pairs;
}

export function hasTensionWith(
  id: CommandmentId,
  selectedIds: CommandmentId[],
  allCommandments: Commandment[],
): CommandmentId[] {
  const selected = new Set(selectedIds);
  const cmd = allCommandments.find(c => c.id === id);
  if (!cmd) return [];
  return cmd.tensionsWith.filter(t => selected.has(t));
}

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

export type CommandmentFilter = {
  category: CommandmentCategory | 'all';
  searchQuery: string;
  showTensionsOnly: boolean;
  selectedIds: CommandmentId[];
  swappingId: CommandmentId | null;
  isFirstEarth: boolean;
};

export function filterCommandments(
  commandments: Commandment[],
  filter: CommandmentFilter,
): Commandment[] {
  let list = commandments.filter(c => c.unlockCondition === undefined || filter.selectedIds.includes(c.id));

  // First-earth swap: show only same-category alternatives
  if (filter.isFirstEarth && filter.swappingId) {
    const swapping = commandments.find(c => c.id === filter.swappingId);
    if (swapping) {
      list = list.filter(c => c.category === swapping.category && c.id !== filter.swappingId);
    }
  }

  if (filter.category !== 'all') {
    list = list.filter(c => c.category === filter.category);
  }

  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.flavorText.toLowerCase().includes(q),
    );
  }

  if (filter.showTensionsOnly) {
    const selectedSet = new Set(filter.selectedIds);
    list = list.filter(c =>
      c.tensionsWith.some(t => selectedSet.has(t)) ||
      (selectedSet.has(c.id) && c.tensionsWith.some(t => selectedSet.has(t))),
    );
  }

  return list;
}

export function groupByCategory(commandments: Commandment[]): Map<CommandmentCategory, Commandment[]> {
  const map = new Map<CommandmentCategory, Commandment[]>();
  for (const c of commandments) {
    const existing = map.get(c.category) ?? [];
    existing.push(c);
    map.set(c.category, existing);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Category color tokens (consistent UI dot colors)
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<CommandmentCategory, string> = {
  expansion:  '#8aaa4a',
  conflict:   '#c93040',
  knowledge:  '#88aacc',
  society:    '#c9a84c',
  divine:     '#c9a84c',
  nature:     '#4a8a50',
  morality:   '#8a70c0',
};

// ---------------------------------------------------------------------------
// Popover data
// ---------------------------------------------------------------------------

export interface CommandmentPopoverData {
  commandment: Commandment;
  isSelected: boolean;
  isLocked: boolean;
  lockReason?: string;
  tensionNames: string[];
}

export function buildPopoverData(
  id: CommandmentId,
  allCommandments: Commandment[],
  selectedIds: CommandmentId[],
  unlockedIds: CommandmentId[],
): CommandmentPopoverData | null {
  const cmd = allCommandments.find(c => c.id === id);
  if (!cmd) return null;

  const selectedSet = new Set(selectedIds);
  const isLocked = cmd.unlockCondition !== undefined && !unlockedIds.includes(id);
  const tensions = cmd.tensionsWith
    .filter(t => selectedSet.has(t))
    .map(t => allCommandments.find(c => c.id === t)?.name ?? t);

  return {
    commandment: cmd,
    isSelected: selectedSet.has(id),
    isLocked,
    lockReason: isLocked ? buildLockReason(cmd.unlockCondition!) : undefined,
    tensionNames: tensions,
  };
}

function buildLockReason(condition: NonNullable<Commandment['unlockCondition']>): string {
  switch (condition.type) {
    case 'win':             return 'Win a run';
    case 'survive_past_year': return `Survive past ${condition.year}`;
    case 'lose_count':      return `Lose ${condition.count} runs`;
    case 'win_pure_peace':  return 'Win a run without using disasters';
    case 'win_pure_war':    return 'Win a run through military victory only';
    case 'visit_earths':    return `Visit ${condition.count} Earths`;
  }
}
