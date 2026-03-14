// =============================================================================
// DIVINE DOMINION — Sharing System
// Commandment card generation (canvas image), Earth history text, Web Share API.
// Spec: docs/implementation/phase-6.md §6.2
// =============================================================================

import type { GameState, CommandmentCard, EndingType } from '../types/game.js';
import { ALL_COMMANDMENTS } from '../config/commandments.js';

// -----------------------------------------------------------------------------
// Card design constants
// -----------------------------------------------------------------------------

const CARD = {
  WIDTH: 1080,
  HEIGHT: 1920,
  PADDING: 64,
  BG_TOP: '#06061a',
  BG_BOTTOM: '#12102e',
  ACCENT: '#c9a84c',
  ACCENT_DIM: '#8a6d2f',
  TEXT_PRIMARY: '#e8e0c8',
  TEXT_SECONDARY: '#a09880',
  TEXT_COMMANDMENT: '#d4c89a',
  DIVIDER: '#2a2645',
  FONT_TITLE: 'bold 72px Cinzel, Georgia, serif',
  FONT_SUBTITLE: '44px Cinzel, Georgia, serif',
  FONT_BODY: '38px "Source Serif 4", Georgia, serif',
  FONT_SMALL: '32px "Source Serif 4", Georgia, serif',
  FONT_LABEL: 'bold 28px Cinzel, Georgia, serif',
  ENDING_COLORS: {
    united_front: '#4a9eff',
    lone_guardian: '#c9a84c',
    survival: '#7dce82',
    extinction: '#e05555',
    self_destruction: '#e05555',
    ascension: '#bf84ff',
  } as Record<EndingType, string>,
} as const;

// -----------------------------------------------------------------------------
// Commandment Card
// -----------------------------------------------------------------------------

/**
 * Builds a CommandmentCard data object from the current game state.
 * This is a pure data structure — rendering is done by the UI layer.
 */
export function buildCommandmentCard(
  state: GameState,
  earthNumber: number,
  religionName: string,
  ending: EndingType,
  endingNarrative: string,
): CommandmentCard {
  const commandmentNames = state.selectedCommandments
    .map(id => {
      const cmd = ALL_COMMANDMENTS.find(c => c.id === id);
      return cmd?.name ?? id;
    });

  let totalInfluence = 0;
  let playerInfluence = 0;
  for (const region of state.world.regions.values()) {
    for (const ri of region.religiousInfluence) {
      totalInfluence += ri.strength;
      if (ri.religionId === state.playerReligionId) {
        playerInfluence += ri.strength;
      }
    }
  }
  const worldInfluencePercent = totalInfluence > 0
    ? Math.round((playerInfluence / totalInfluence) * 100)
    : 0;

  return {
    earthNumber,
    religionName,
    commandments: commandmentNames,
    ending,
    endingNarrative,
    stats: {
      worldInfluencePercent,
      totalInterventions: state.divineState.totalInterventions,
      disastersUsed: state.divineState.disastersUsed,
      scienceLevel: state.world.scienceProgress.milestonesReached.length,
    },
  };
}

// -----------------------------------------------------------------------------
// Earth History Text
// -----------------------------------------------------------------------------

/**
 * Generates a shareable multi-line text summary of the Earth's history.
 */
export function buildEarthHistoryText(
  card: CommandmentCard,
): string {
  const endingLabels: Record<EndingType, string> = {
    united_front: 'United Front — Earth Defended',
    lone_guardian: 'Lone Guardian — One Nation Stood',
    survival: 'Survival — Against All Odds',
    extinction: 'Extinction — The Aliens Won',
    self_destruction: 'Self-Destruction — Humanity Fell',
    ascension: 'Ascension — Beyond the Stars',
  };

  const lines: string[] = [
    `⚡ DIVINE DOMINION — Earth #${card.earthNumber}`,
    `🌍 Religion: ${card.religionName}`,
    `🏛️ Ending: ${endingLabels[card.ending]}`,
    ``,
    `📜 The Ten Commandments:`,
    ...card.commandments.map((c, i) => `  ${i + 1}. ${c}`),
    ``,
    `📊 Statistics:`,
    `  • World Influence: ${card.stats.worldInfluencePercent}%`,
    `  • Interventions: ${card.stats.totalInterventions}`,
    `  • Disasters Used: ${card.stats.disastersUsed}`,
    `  • Science Level: ${card.stats.scienceLevel}/11`,
    ``,
    `"${card.endingNarrative}"`,
    ``,
    `Play at: https://divine-dominion.app`,
  ];

  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// Canvas Image Generation
// -----------------------------------------------------------------------------

/**
 * Renders a CommandmentCard as a PNG data URL using HTML Canvas 2D.
 * Returns null in non-browser environments (Node/test).
 *
 * Layout:
 *   - Dark gradient background
 *   - Gold "DIVINE DOMINION" title + earth number
 *   - Religion name + ending badge
 *   - Divider
 *   - 10 commandments list
 *   - Divider
 *   - 4 stat columns
 *   - Ending narrative quote
 *   - URL footer
 */
export function renderCommandmentCardToPNG(card: CommandmentCard): string | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = CARD.WIDTH;
  canvas.height = CARD.HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const W = CARD.WIDTH;
  const P = CARD.PADDING;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, CARD.HEIGHT);
  bg.addColorStop(0, CARD.BG_TOP);
  bg.addColorStop(1, CARD.BG_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, CARD.HEIGHT);

  // Gold border frame
  ctx.strokeStyle = CARD.ACCENT_DIM;
  ctx.lineWidth = 3;
  ctx.strokeRect(P / 2, P / 2, W - P, CARD.HEIGHT - P);

  // Inner subtle glow lines
  ctx.strokeStyle = `${CARD.ACCENT}22`;
  ctx.lineWidth = 1;
  ctx.strokeRect(P / 2 + 8, P / 2 + 8, W - P - 16, CARD.HEIGHT - P - 16);

  let y = P + 40;

  // --- HEADER ---
  ctx.textAlign = 'center';

  // "DIVINE DOMINION" title
  ctx.font = CARD.FONT_TITLE;
  ctx.fillStyle = CARD.ACCENT;
  ctx.fillText('DIVINE DOMINION', W / 2, y);
  y += 80;

  // Earth number
  ctx.font = CARD.FONT_SUBTITLE;
  ctx.fillStyle = CARD.TEXT_SECONDARY;
  ctx.fillText(`Earth #${card.earthNumber}`, W / 2, y);
  y += 70;

  // Religion name
  ctx.font = `bold 52px Cinzel, Georgia, serif`;
  ctx.fillStyle = CARD.TEXT_PRIMARY;
  ctx.fillText(card.religionName, W / 2, y);
  y += 60;

  // Ending badge
  const endingColor = CARD.ENDING_COLORS[card.ending] ?? CARD.ACCENT;
  const endingLabel = getEndingLabel(card.ending);
  const badgeW = 560;
  const badgeH = 52;
  const badgeX = (W - badgeW) / 2;

  ctx.fillStyle = `${endingColor}22`;
  ctx.strokeStyle = endingColor;
  ctx.lineWidth = 2;
  roundRect(ctx, badgeX, y, badgeW, badgeH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = CARD.FONT_LABEL;
  ctx.fillStyle = endingColor;
  ctx.fillText(endingLabel, W / 2, y + 34);
  y += 80;

  // Divider
  drawDivider(ctx, P + 20, y, W - P * 2 - 40, CARD.ACCENT_DIM);
  y += 32;

  // --- COMMANDMENTS SECTION ---
  ctx.textAlign = 'left';
  ctx.font = CARD.FONT_LABEL;
  ctx.fillStyle = CARD.ACCENT;
  ctx.fillText('THE TEN COMMANDMENTS', P + 20, y);
  y += 48;

  ctx.font = CARD.FONT_BODY;
  for (let i = 0; i < card.commandments.length; i++) {
    const num = `${i + 1}.`;
    ctx.fillStyle = CARD.ACCENT_DIM;
    ctx.fillText(num, P + 20, y);
    ctx.fillStyle = CARD.TEXT_COMMANDMENT;
    ctx.fillText(card.commandments[i], P + 75, y);
    y += 52;
  }
  y += 16;

  // Divider
  drawDivider(ctx, P + 20, y, W - P * 2 - 40, CARD.ACCENT_DIM);
  y += 32;

  // --- STATS ROW ---
  ctx.font = CARD.FONT_LABEL;
  ctx.fillStyle = CARD.ACCENT;
  ctx.textAlign = 'left';
  ctx.fillText('STATISTICS', P + 20, y);
  y += 50;

  const stats = [
    { label: 'INFLUENCE', value: `${card.stats.worldInfluencePercent}%` },
    { label: 'INTERVENTIONS', value: String(card.stats.totalInterventions) },
    { label: 'DISASTERS', value: String(card.stats.disastersUsed) },
    { label: 'SCIENCE', value: `${card.stats.scienceLevel}/11` },
  ];

  const colW = (W - P * 2 - 40) / 4;
  for (let i = 0; i < stats.length; i++) {
    const sx = P + 20 + i * colW;
    ctx.font = `bold 52px Cinzel, Georgia, serif`;
    ctx.fillStyle = CARD.TEXT_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText(stats[i].value, sx + colW / 2, y);
    ctx.font = CARD.FONT_SMALL;
    ctx.fillStyle = CARD.TEXT_SECONDARY;
    ctx.fillText(stats[i].label, sx + colW / 2, y + 36);
  }
  y += 96;

  // Divider
  drawDivider(ctx, P + 20, y, W - P * 2 - 40, CARD.ACCENT_DIM);
  y += 40;

  // --- ENDING NARRATIVE QUOTE ---
  ctx.textAlign = 'center';
  ctx.font = `italic 36px "Source Serif 4", Georgia, serif`;
  ctx.fillStyle = CARD.TEXT_SECONDARY;
  const quote = `"${card.endingNarrative}"`;
  // Word-wrap to ~900px wide
  const wrappedLines = wrapText(ctx, quote, W - P * 2 - 80);
  for (const line of wrappedLines) {
    ctx.fillText(line, W / 2, y);
    y += 48;
  }
  y += 24;

  // --- FOOTER ---
  // Gold rule near bottom
  const footerY = CARD.HEIGHT - P - 40;
  drawDivider(ctx, P + 20, footerY - 20, W - P * 2 - 40, CARD.ACCENT_DIM);

  ctx.font = CARD.FONT_SMALL;
  ctx.fillStyle = CARD.ACCENT_DIM;
  ctx.textAlign = 'center';
  ctx.fillText('divine-dominion.app', W / 2, footerY + 20);

  return canvas.toDataURL('image/png');
}

// --- Canvas helpers ---

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
): void {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.2, color);
  grad.addColorStop(0.8, color);
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const { width } = ctx.measureText(test);
    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function getEndingLabel(ending: EndingType): string {
  const labels: Record<EndingType, string> = {
    united_front: 'UNITED FRONT — EARTH DEFENDED',
    lone_guardian: 'LONE GUARDIAN — ONE NATION STOOD',
    survival: 'SURVIVAL — AGAINST ALL ODDS',
    extinction: 'EXTINCTION — THE ALIENS WON',
    self_destruction: 'SELF-DESTRUCTION — HUMANITY FELL',
    ascension: 'ASCENSION — BEYOND THE STARS',
  };
  return labels[ending] ?? ending.toUpperCase();
}

/**
 * Renders a CommandmentCard as a Blob (PNG) for use with Web Share API files[].
 * Returns null in non-browser environments.
 */
export async function renderCommandmentCardToBlob(card: CommandmentCard): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = CARD.WIDTH;
  canvas.height = CARD.HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Re-use the same rendering logic via data URL → blob conversion
  const dataUrl = renderCommandmentCardToPNG(card);
  if (!dataUrl) return null;

  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
  });
}

/**
 * Shares the CommandmentCard as an image file via Web Share API,
 * falling back to text-only share if image sharing is not supported.
 */
export async function shareCardAsImage(card: CommandmentCard): Promise<boolean> {
  const title = `Divine Dominion — Earth #${card.earthNumber}`;
  const text = buildEarthHistoryText(card);

  // Try image share first (requires navigator.canShare({ files: [] }))
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.share
  ) {
    const blob = await renderCommandmentCardToBlob(card);
    if (blob) {
      const file = new File([blob], `earth-${card.earthNumber}.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title, text });
          return true;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return false;
          // Fall through to text share
        }
      }
    }
  }

  // Fallback: text-only share
  return shareContent({ title, text, url: 'https://divine-dominion.app' });
}

// -----------------------------------------------------------------------------
// Web Share API
// -----------------------------------------------------------------------------

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Shares content using the Web Share API (mobile) or falls back to clipboard copy.
 * Returns true if the share succeeded.
 */
export async function shareContent(payload: SharePayload): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url ?? 'https://divine-dominion.app',
      });
      return true;
    } catch (err) {
      // User cancelled or share failed — fall through to clipboard
      if ((err as Error).name === 'AbortError') return false;
    }
  }

  // Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(payload.text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Checks if the Web Share API is available on this device.
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Builds and shares an Earth history card.
 * Returns true if sharing succeeded.
 */
export async function shareEarthHistory(
  state: GameState,
  earthNumber: number,
  religionName: string,
  ending: EndingType,
  endingNarrative: string,
): Promise<boolean> {
  const card = buildCommandmentCard(state, earthNumber, religionName, ending, endingNarrative);
  const text = buildEarthHistoryText(card);

  return shareContent({
    title: `Divine Dominion — Earth #${earthNumber}`,
    text,
    url: 'https://divine-dominion.app',
  });
}
