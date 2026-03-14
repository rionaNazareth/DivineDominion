# DIVINE DOMINION — Audio & Sound Spec

> Cross-references: [Art Spec](art-spec.md) · [Eras](07-eras-and-endgame.md) · [Divine Powers](06-divine-powers.md) · [Events](08-events.md) · [Harbinger](14-harbinger.md) · [In-Game Interactions](09c-in-game-interactions.md) · [INDEX](../INDEX.md)

---

## 1. Audio Identity

**Theme:** Evolving ambient soundscape that mirrors 600 years of civilization. Early eras: acoustic, organic, sparse. Late eras: electronic, layered, tense. Divine actions always sound weighty and resonant.

**Principles:**
- Music is ambient, not melodic — players stare at the map for hours, music must not fatigue
- SFX are short and punchy — clear feedback without distraction
- Haptics complement SFX, never replace them
- All audio respects mobile constraints (battery, storage, speaker quality)

---

## 2. Ambient Music Per Era (12 tracks)

Each track: 60-120 second loop, seamless, instrumental only. FILE-BASED (OGG primary + MP3 fallback). Longer loops preferred to reduce fatigue over a 4-hour session.

| Era | Name | Mood | BPM | Key Instruments | Reference Track |
|-----|------|------|-----|----------------|----------------|
| 1 | Renaissance | Hopeful, curious, pastoral | 72 | Lute, recorder, soft strings | Civilization VI Renaissance ambient |
| 2 | Exploration | Adventurous, widening horizon | 80 | Acoustic guitar, flute, light percussion | Age of Empires II exploration theme |
| 3 | Enlightenment | Elegant, intellectual, measured | 76 | Harpsichord, chamber strings, soft bells | Baroque study music |
| 4 | Revolution | Urgent, dramatic, rising | 90 | Snare drum, strings, brass accent | Les Misérables underscore (orchestral) |
| 5 | Industry | Rhythmic, mechanical, determined | 96 | Piano, cello, industrial percussion | Peaky Blinders ambient (orchestral) |
| 6 | Empire | Grand, tense, imperial | 88 | Full orchestra, timpani, horn | Civilization V empire-era ambient |
| 7 | Atomic | Anxious, sparse, suspenseful | 68 | Tremolo strings, sine wave, vibraphone | Cold War thriller underscore |
| 8 | Digital | Pulsing, synthetic, evolving | 100 | Synth pad, glitch percussion, piano | Tron Legacy ambient (Daft Punk) |
| 9 | Signal | Unsettling, mysterious, alien undertone | 64 | Drone, reverse reverb, distant radio static | Arrival soundtrack (Jóhannsson) |
| 10 | Revelation | Dread, awe, overwhelming | 72 | Low brass, choir pad, sub-bass | Interstellar docking scene (Zimmer) |
| 11 | Preparation | Determined, urgent, rallying | 108 | Driving percussion, synth strings, brass | Pacific Rim preparation montage |
| 12 | Arrival | Epic, final, cosmic | 84 | Full synthetic orchestra, choir, sub-bass pulse | Mass Effect 3 final mission ambient |

**File paths:** `assets/music/era-{01..12}.ogg` and `assets/music/era-{01..12}.mp3`

**Production notes:**
- Generate with Suno paid tier ($10/mo for 1 month — commercial rights required for App Store)
- Prompt format: `"[mood], [BPM] BPM, [instruments], instrumental, seamless loop, game soundtrack, [era style]"`
- Generate 2-3 candidates per era, human selects best
- Verify loop seamlessness by listening

---

## 3. SFX List (49 effects)

All FILE-BASED. Format: WAV, max 200KB per file, normalized to -16 LUFS.

### 3a. Divine Powers (12)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/divine/harvest` | Warm chime ascending, grain-rustling tail | 800ms | Freesound CC0 |
| `sfx/divine/inspiration` | Crystalline sparkle, ascending | 600ms | Freesound CC0 |
| `sfx/divine/miracle` | Deep resonant gong + golden shimmer | 1200ms | Freesound CC0 |
| `sfx/divine/prophet` | Choir hit (single note) + echo | 1000ms | Freesound CC0 |
| `sfx/divine/shield` | Low hum rising to bright shield-lock | 800ms | jsfxr |
| `sfx/divine/golden-age` | Majestic horn + shimmer cascade | 1500ms | Freesound CC0 |
| `sfx/divine/earthquake` | Deep rumble + cracking | 1200ms | Freesound CC0 |
| `sfx/divine/flood` | Rushing water crescendo | 1000ms | Freesound CC0 |
| `sfx/divine/plague` | Sickly buzzing + low drone | 800ms | Freesound CC0 |
| `sfx/divine/storm` | Thunder crack + wind | 1000ms | Freesound CC0 |
| `sfx/divine/famine` | Dry crackling, hollow wind | 700ms | Freesound CC0 |
| `sfx/divine/wildfire` | Roaring fire burst | 1000ms | Freesound CC0 |

### 3b. Events & UI (8)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/ui/event-notify` | Distinct chime — event incoming | 500ms | jsfxr |
| `sfx/ui/choice-confirm` | Soft thud + light chime — choice made | 300ms | jsfxr |
| `sfx/ui/outcome-reveal` | Subtle whoosh + tone — result shown | 400ms | jsfxr |
| `sfx/ui/button-tap` | Light click | 100ms | jsfxr |
| `sfx/ui/menu-open` | Soft slide-up whoosh | 200ms | jsfxr |
| `sfx/ui/menu-close` | Soft slide-down whoosh | 200ms | jsfxr |
| `sfx/ui/fab-open` | Radial expand tone (ascending) | 300ms | jsfxr |
| `sfx/ui/toast` | Subtle milestone chime (distinct from event) | 400ms | jsfxr |

### 3c. Battle & War (5)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/battle/clash` | Metal clash + crowd murmur | 600ms | Freesound CC0 |
| `sfx/battle/victory` | Triumphant brass sting | 800ms | Freesound CC0 |
| `sfx/battle/defeat` | Low somber tone, falling | 600ms | Freesound CC0 |
| `sfx/battle/war-declared` | War horn blast | 1000ms | Freesound CC0 |
| `sfx/narrative/era-transition` | Ascending chime sequence (3 notes) | 1200ms | jsfxr or Freesound |

### 3d. Divine Interactions (6)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/divine/whisper-cast` | Soft breath + golden shimmer | 500ms | jsfxr |
| `sfx/divine/combo-trigger` | Cascading chime + rumble chain | 1000ms | jsfxr + Freesound |
| `sfx/divine/voice-emerge` | Ethereal voice rising + wind chime | 800ms | Freesound CC0 |
| `sfx/divine/voice-death` | Somber single bell + fade | 600ms | Freesound CC0 |
| `sfx/divine/petition` | Gentle prayer hum + golden chime | 500ms | jsfxr |
| `sfx/divine/heretic` | Dissonant chord + crack | 700ms | Freesound CC0 |

### 3e. UI Extended (6)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/ui/fab-close` | Radial collapse tone (descending) | 200ms | jsfxr |
| `sfx/ui/region-tap` | Subtle map thud | 150ms | jsfxr |
| `sfx/ui/overlay-toggle` | Soft filter sweep | 300ms | jsfxr |
| `sfx/ui/pause` | Time-stop whoosh | 300ms | jsfxr |
| `sfx/ui/unpause` | Reverse time-stop whoosh | 300ms | jsfxr |
| `sfx/ui/power-unlock` | Ascending chime + glow tone | 800ms | jsfxr |

### 3f. Harbinger & Alien (9)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/harbinger/presence` | Low alien hum, subliminal unease | 12000ms loop (seamless) | AI-generated (ElevenLabs/Bardus) |
| `sfx/harbinger/corruption` | Distorted crackle spreading | 800ms | AI-generated |
| `sfx/harbinger/purge` | Bright golden burst, cleansing | 1000ms | Freesound CC0 + processing |
| `sfx/harbinger/signal` | Radio static → alien tone pattern | 1500ms | AI-generated |
| `sfx/alien/reveal-1` | Faint radio static + eerie tone (Era 7-8) | 1500ms | AI-generated |
| `sfx/alien/reveal-2` | Stronger signal pulse + unease drone (Era 9) | 2000ms | AI-generated |
| `sfx/alien/reveal-3` | Confirmed alien broadcast + alarm undertone (Era 10) | 2500ms | AI-generated |
| `sfx/alien/reveal-4` | Deep bass rumble + full alarm (Era 11) | 3000ms | AI-generated |
| `sfx/alien/reveal-5` | Overwhelming arrival horn + cosmic bass (Era 12) | 4000ms | AI-generated |

### 3g. Game End (2)

| SFX ID | Description | Duration | Source Strategy |
|--------|------------|----------|----------------|
| `sfx/narrative/game-won` | Full triumphant fanfare, brass + choir swell | 5000ms | Suno paid tier |
| `sfx/narrative/game-lost` | Somber descent, strings fade to silence | 4000ms | Suno paid tier |

**File paths:** `assets/sfx/{category}/{name}.wav`

---

## 4. Audio State Machine

### 4a. Music Transitions

| Trigger | Behavior | Crossfade |
|---------|----------|-----------|
| Era transition | Current track fades out → new era track fades in | 3000ms crossfade |
| Event card opens | Music volume ducks to 30% | 500ms duck |
| Event card closes | Music volume restores to 100% | 800ms restore |
| Battle in progress | Music ducks to 50%, battle SFX layer plays | 400ms duck |
| Battle ends | Restore music volume | 1000ms restore |
| Overlay mode (map overlays open) | Music ducks to 60% | 300ms duck |
| Harbinger active (Era 7+) | Harbinger presence hum layers under music at 15% volume | Continuous |
| Event card + battle overlap | Music ducks to lowest level (30%) — event takes priority | 500ms duck |
| Harbinger hum + event card | Hum stays at 15%, music ducks to 30% of remaining volume | — |
| Game speed 4× | Music tempo unchanged (stays atmospheric) | — |

### 4b. Concurrent SFX Limit

| Property | Value |
|----------|-------|
| Max simultaneous SFX | 10 |
| Voice-stealing policy | Lowest priority SFX is stopped when limit is reached |
| Same-ID behavior | If the same SFX ID fires while already playing, restart it (don't layer) |

### 4c. SFX Priority

| Priority | Category | Notes |
|----------|----------|-------|
| 1 (highest) | Divine power cast | Always plays, interrupts nothing |
| 2 | Event notification | Plays over music |
| 3 | Battle sounds | Concurrent with music duck |
| 4 | UI sounds | Plays unless higher priority active |
| 5 (lowest) | Ambient/toast | Skipped if higher priority playing |

### 4d. Mute Behavior

| Setting | Effect |
|---------|--------|
| Music OFF | Music stops, SFX still play |
| SFX OFF | SFX stop, music still plays |
| All OFF | Everything silent, haptics still work |
| App backgrounded | Music pauses immediately, resumes on foreground |

---

## 5. Haptic Feedback Spec

**Scope:** Moderate — powers, events, battles, petitions, era transitions. ~10 distinct patterns.

| Interaction | Pattern | Intensity | iOS API |
|------------|---------|-----------|---------|
| Cast blessing | Single tap | Medium | `UIImpactFeedbackGenerator(.medium)` |
| Cast disaster | Double tap + rumble | Heavy | `.heavy` × 2 + `UINotificationFeedbackGenerator(.error)` |
| Event card appears | Single tap | Light | `.light` |
| Choice selected | Single tap | Medium | `.medium` |
| Era transition | Three ascending taps | Light→Medium→Heavy | `.light`, `.medium`, `.heavy` at 200ms intervals |
| Battle clash | Double tap | Heavy | `.heavy` × 2 |
| Combo discovered | Rumble | Heavy | `.error` notification |
| Prayer received | Single tap | Light | `.light` |
| Harbinger action | Low rumble | Heavy | `.error` notification |
| Power unlock | Single tap | Medium | `.success` notification |

**User toggle:** Settings → Haptics ON/OFF. Default: ON.

---

## 6. Audio Budget

| Category | Count | Format | Size Per | Total |
|----------|-------|--------|---------|-------|
| Music tracks | 12 × 2 (OGG+MP3) | OGG/MP3 | ~500KB | ~12MB |
| SFX | 49 | WAV | ~100KB avg | ~4.9MB |
| Game end stings | 2 | WAV | ~300KB | ~0.6MB |
| **Total** | | | | **~17.5MB** |

**Target:** Under 20MB total audio. Within mobile constraints.

**Format rationale:**
- OGG: Primary format (better compression, lower size, supported by Phaser/Web Audio)
- MP3: Fallback for Safari/iOS compatibility
- WAV: SFX only (short duration, no compression artifacts)

---

## 7. Asset Manifest Paths

| Asset Type | Path Pattern | Count |
|-----------|-------------|-------|
| Era music (OGG) | `assets/music/era-{01..12}.ogg` | 12 |
| Era music (MP3) | `assets/music/era-{01..12}.mp3` | 12 |
| Divine power SFX | `assets/sfx/divine/{name}.wav` | 18 |
| UI SFX | `assets/sfx/ui/{name}.wav` | 14 |
| Battle SFX | `assets/sfx/battle/{name}.wav` | 4 |
| Narrative SFX | `assets/sfx/narrative/{name}.wav` | 3 |
| Harbinger SFX | `assets/sfx/harbinger/{name}.wav` | 4 |
| Alien reveal SFX | `assets/sfx/alien/{name}.wav` | 5 |

---

## 8. Sourcing & Licensing Summary

| Source | Used For | License | Attribution Required |
|--------|---------|---------|---------------------|
| Freesound.org (CC0) | ~20 SFX (powers, battle, voices) | CC0 Public Domain | No |
| jsfxr (sfxr.me) | ~14 SFX (UI, simple tones) | Generated, no license | No |
| AI (ElevenLabs/Bardus) | ~9 SFX (Harbinger, alien reveal) | Commercial use with paid tier | No |
| Suno (paid tier, 1 month) | 12 music tracks + 2 game-end stings | Commercial rights included | No |
| Google Fonts | Font files | SIL Open Font License | No (OFL does not require attribution) |

**All sources documented in:** `assets/LICENSES.md`

---

## 9. Assumptions & Notes

- Music tracks generated with Suno paid tier ($10/mo) — subscribe for 1 month, generate all tracks, cancel
- Harbinger SFX may use AI generation free tiers first; if quality insufficient, use paid tier
- All SFX normalized to -16 LUFS using ffmpeg: `ffmpeg -i input.wav -af loudnorm=I=-16 output.wav`
- Music loop verification: play each track 3× consecutively, check for audible seam
- Haptic patterns may need tuning on actual hardware — spec provides starting values
