export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deriveSeed(worldSeed: number, tickNumber: number, callIndex: number): number {
  return ((worldSeed ^ tickNumber) * 2654435761 + callIndex) >>> 0;
}

export interface PRNGInstance {
  next(): number;
  resetForTick(tickNumber: number): void;
  getCallIndex(): number;
}

export function createPRNG(worldSeed: number): PRNGInstance {
  let currentTick = 0;
  let callIndex = 0;
  let rng = mulberry32(deriveSeed(worldSeed, currentTick, callIndex));

  return {
    next(): number {
      const value = rng();
      callIndex += 1;
      return value;
    },
    resetForTick(tickNumber: number): void {
      currentTick = tickNumber;
      callIndex = 0;
      rng = mulberry32(deriveSeed(worldSeed, currentTick, callIndex));
    },
    getCallIndex(): number {
      return callIndex;
    },
  };
}

export function seededRandom(worldSeed: number, tickNumber: number, callIndex: number): number {
  const seed = deriveSeed(worldSeed, tickNumber, callIndex);
  const rng = mulberry32(seed);
  return rng();
}

