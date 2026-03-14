import { describe, it, expect } from 'vitest';
import { createPRNG, seededRandom } from '../prng.js';

describe('PRNG utility', () => {
  it('produces deterministic sequence for same seed and tick', () => {
    const prngA = createPRNG(42);
    const prngB = createPRNG(42);

    prngA.resetForTick(0);
    prngB.resetForTick(0);

    const seqA = Array.from({ length: 10 }, () => prngA.next());
    const seqB = Array.from({ length: 10 }, () => prngB.next());

    expect(seqA).toEqual(seqB);
  });

  it('changes sequence when seed differs', () => {
    const prngA = createPRNG(42);
    const prngB = createPRNG(1337);

    prngA.resetForTick(0);
    prngB.resetForTick(0);

    const seqA = Array.from({ length: 10 }, () => prngA.next());
    const seqB = Array.from({ length: 10 }, () => prngB.next());

    expect(seqA).not.toEqual(seqB);
  });

  it('seededRandom is deterministic for seed+tick+callIndex', () => {
    const worldSeed = 1234;
    const tick = 7;

    const valuesA = Array.from({ length: 5 }, (_, i) => seededRandom(worldSeed, tick, i));
    const valuesB = Array.from({ length: 5 }, (_, i) => seededRandom(worldSeed, tick, i));

    expect(valuesA).toEqual(valuesB);
  });
});

