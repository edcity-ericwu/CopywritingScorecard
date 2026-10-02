# Plan: Standardise card padding

## Context

The user observed inconsistent padding values across card-like elements. AttributeCard (`p-[18px] sm:p-[36px]`) is the agreed reference. Other cards and row elements use fixed non-responsive values (`p-[32px]`, `px-[24px] py-[16px]`, `px-[32px] py-[28px]`, etc.), making the system fragile — any future tweak requires hunting across multiple elements.

## Two-tier system

Introduce a `p-card` utility in `index.css` for full cards, and use explicit responsive classes for the tighter row/banner tier. This keeps one authoritative source per tier.

### Tier 1 — Full cards: `p-card`

Add to `src/index.css`:
```css
@utility p-card { padding: clamp(1.125rem, 3.5vw, 2.25rem); }
```
`clamp(1.125rem, 3.5vw, 2.25rem)` → 18px at 320px, ~27px at 768px, 36px at 1280px. Matches AttributeCard exactly.

Apply `p-card` to:
- `AttributeCard` outer div — replace `p-[18px] sm:p-[36px]`
- Score Breakdown card — replace `p-[32px]`
- Recommendation Panel — replace `p-[32px]`

### Tier 2 — Row items / banners: `px-[16px] sm:px-[24px] py-[12px] sm:py-[16px]`

Apply to:
- `GateRow` outer div — replace `px-[24px] py-[16px]`
- Gate result banners (passed + blocked) — replace `px-[24px] py-[18px]`
- Score Bands table rows — replace `px-[24px] py-[20px]`
- Score Bands table header — replace `px-[24px] py-[18px]`

### How to use block

Replace `px-[32px] py-[28px]` with `p-card` — it's a standalone card-weight block.

## Files to modify

- `src/index.css` — add `p-card` utility
- `src/App.tsx` — 8 targeted replacements

## Verification

At 375px: all cards have ~18px padding, no overflow. At 1280px: full cards at ~36px, row items at 24px, consistent visual weight.

---

# Plan: Mobile layout repair

## Context

Fluid typography scaled the type, but the layout structure itself breaks at phone widths (375px). After reading the full `App.tsx`, eight hard failures were identified:

1. **Section padding `px-[64px]`** (lines 373, 414, 516, 561) — 128px consumed from 375px = only 247px for content
2. **`GateRow` horizontal row** (line 168) — Yes/No buttons (~170px) + `w-[180px]` label + divider + description minimum ~400px — always overflows
3. **Score rubric columns** (line 283) — three `flex-[1_0_0]` columns with no wrap in `AttributeCard`
4. **`AttributeCard` padding** (line 240) — `p-[36px]` = 72px horizontal inside already-padded sections
5. **Recommendation panel** (line 654) — fixed `w-[380px]` wider than 247px content area
6. **Section titles `whitespace-nowrap`** (lines 450, 529) — "Expressive Attribute Scales" overflows at small widths
7. **Polarity labels `whitespace-nowrap`** (lines 262, 263) — both face each other across ~175px card content
8. **Sticky panel** (line 775) — fixed `w-[340px] right-8` = 372px from edge, almost fills 375px viewport

## Approach: Tailwind responsive prefixes + fluid spacing utilities

Use `sm:` (640px) to restore the desktop layout above tablet. Below sm, all multi-column layouts stack. Two fluid CSS utilities control section and card spacing.

---

## Changes

### 1. `src/index.css` — add two spacing utilities

```css
@utility px-section { padding-left: clamp(1rem, 5vw, 4rem); padding-right: clamp(1rem, 5vw, 4rem); }
@utility py-section { padding-top: clamp(2rem, 5vw, 4rem); padding-bottom: clamp(2rem, 5vw, 4rem); }
```

`clamp(1rem, 5vw, 4rem)` gives 16px at 320px → 20px at 400px → 64px at 1280px.

### 2. Replace all section paddings in `App.tsx`

| Current | Replace with |
|---------|-------------|
| `pt-[64px] px-[64px]` (header, line 373) | `pt-section px-section` |
| `px-[64px] py-[64px]` (sections, lines 414, 516) | `px-section py-section` |
| `pb-[80px] pt-[64px] px-[64px]` (section 3, line 561) | `px-section py-section pb-[80px]` |

### 3. `GateRow` — stack vertically on mobile

**Current** (line 168): `flex gap-[20px] items-start`  
**New**: `flex flex-col sm:flex-row gap-[16px] sm:gap-[20px] items-start`

- Yes/No button group (line 175): `shrink-0 pt-[2px]` — keep as-is (full width on mobile is fine)
- Label+badge column (line 197): `w-auto sm:w-[180px]` — remove fixed `w-[180px]`
- Vertical divider (line 209): `hidden sm:block` — hide on mobile
- Description (line 212): no change needed

### 4. Score rubrics in `AttributeCard` — stack on mobile

**Current** (line 283): `flex gap-[2px] items-start w-full`  
**New**: `flex flex-col sm:flex-row gap-[2px] items-start w-full`

Also remove `rounded-bl-[6px] rounded-tl-[6px]` from the Score 1 panel and `rounded-br-[6px] rounded-tr-[6px]` from Score 5 — add responsive rounding:
- Score 1 (line 285): `rounded-tl-[6px] rounded-tr-[6px] sm:rounded-tr-none sm:rounded-bl-[6px]`  
- Score 5 (line 298): `rounded-bl-[6px] rounded-br-[6px] sm:rounded-bl-none sm:rounded-tr-[6px]`

### 5. `AttributeCard` — responsive padding and gap

**Line 240**: `p-[36px]` → `p-[18px] sm:p-[36px]`  
**Line 240**: `gap-[28px]` → `gap-[18px] sm:gap-[28px]`

### 6. Recommendation panel — full width on mobile

**Line 654**: `shrink-0 w-[380px]` → `w-full sm:w-[380px] sm:shrink-0`

### 7. Remove `whitespace-nowrap` from section titles

**Line 450**: `whitespace-nowrap` → remove  
**Line 529**: `whitespace-nowrap` → remove (this one will overflow on phone)

### 8. Polarity labels — allow wrapping

**Lines 262–263**: Remove `whitespace-nowrap` from both polarity labels. The `justify-between` row with `[word-break:break-word]` on the label text handles wrapping naturally.

### 9. Sticky panel — responsive width and position

**Line 775**: `fixed bottom-8 right-8 z-50 w-[340px]` → `fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-2rem)] max-w-[340px]`

This gives 16px margins on each side at phone width, stays at 340px max.

---

## Files to modify

- `src/index.css` — add 2 utilities
- `src/App.tsx` — 10 targeted edits (section paddings, GateRow structure, rubrics stacking, card padding, recommendation panel width, title wrapping, sticky panel)

## Verification

1. Browser devtools at 375px: no horizontal scroll, all content in bounds, GateRow stacks cleanly
2. Browser devtools at 430px: same
3. Browser devtools at 640px: transitions to row layout for GateRow and rubrics
4. Browser devtools at 1280px: matches current desktop appearance exactly

---

# Plan: Fluid typography system (completed)

## Context

The scorecard currently uses a fixed 7-stop pixel scale (13 / 16 / 18 / 20 / 28 / 40 / 64px + display numeral 72px). At laptop widths (~1280px) this is correct. But on tablet (~768px) and phone (~375px) the hero title, section headings, and card titles become too large for their containers, breaking the layout.

The fix is fluid typography: each type stop becomes a `clamp(min, preferred, max)` expression that interpolates smoothly between a phone minimum and a desktop maximum, with no breakpoint snap. This is done once in `src/index.css` as named `@utility` classes, then consumed in `src/App.tsx` by replacing fixed `text-[Xpx]` classes.

---

## Type scale: fixed → fluid mapping

| Role | Min (≤375px) | Max (≥1280px) | CSS utility |
|------|-------------|--------------|-------------|
| Hero title | 32px | 64px | `text-fluid-hero` |
| Section title / display numeral | 22px | 40px | `text-fluid-title` |
| Card/component title | 18px | 28px | `text-fluid-card` |
| Panel header | 15px | 20px | `text-fluid-panel` |
| Body | 14px | 18px | `text-fluid-body` |
| UI label | 12px | 16px | `text-fluid-label` |
| Micro / badge | 11px | 13px | `text-fluid-micro` |
| Result display numeral | 40px | 72px | `text-fluid-display` |

Each clamp is derived from the formula:
`clamp(min, calc(intercept + slope * 100vw), max)`
where `slope = (max - min) / (1280 - 375)` and `intercept = min - slope * 375`.

---

## CSS to add — `src/index.css`

Add after the `body` block. Tailwind v4 supports `@utility` for custom single-property utilities.

```css
@utility text-fluid-hero    { font-size: clamp(2rem,    calc(0.978rem + 4.364vw), 4rem);    }
@utility text-fluid-title   { font-size: clamp(1.375rem, calc(0.743rem + 1.988vw), 2.5rem);  }
@utility text-fluid-card    { font-size: clamp(1.125rem, calc(0.766rem + 1.105vw), 1.75rem); }
@utility text-fluid-panel   { font-size: clamp(0.9375rem,calc(0.757rem + 0.552vw), 1.25rem); }
@utility text-fluid-body    { font-size: clamp(0.875rem, calc(0.73rem  + 0.442vw), 1.125rem);}
@utility text-fluid-label   { font-size: clamp(0.75rem,  calc(0.627rem + 0.442vw), 1rem);    }
@utility text-fluid-micro   { font-size: clamp(0.6875rem,calc(0.614rem + 0.221vw), 0.8125rem);}
@utility text-fluid-display { font-size: clamp(2.5rem,  calc(1.164rem + 3.536vw), 4.5rem);   }
```

---

## App.tsx replacements

All `text-[Xpx]` classes replaced with the matching fluid utility. Pattern:

| Current class | Fluid class |
|--------------|-------------|
| `text-[64px]` | `text-fluid-hero` |
| `text-[40px]` (headings + gate count + total score) | `text-fluid-title` |
| `text-[28px]` (attr name, band label) | `text-fluid-card` |
| `text-[20px]` ("Total Expressive Score" label, "/25" in dark panel) | `text-fluid-panel` |
| `text-[18px]` (all body) | `text-fluid-body` |
| `text-[16px]` (labels, button text, rubric headers) | `text-fluid-label` |
| `text-[13px]` (badges, micro, footer, captions) | `text-fluid-micro` |
| `text-[72px]` (result number) | `text-fluid-display` |

---

## Files to modify

- `src/index.css` — add 8 `@utility` definitions
- `src/App.tsx` — replace all fixed `text-[Xpx]` with fluid utility classes

---

## Verification

1. Open the preview and use browser devtools device toolbar.
2. Check at 375px (iPhone SE): hero, section titles, and body text should all be readable and in-boundary.
3. Check at 768px (iPad): intermediate — no cramping or overflow.
4. Check at 1280px (MacBook 13"): identical to the current design.
5. Resize the window continuously — no jumps, smooth interpolation throughout.

## Findings

### Functional Gate

**Issue 1 — "Credible" description is too institutional**
Current: "Tone and content inspire confidence in HKEdCity as a credible education body."
This is a brand-trust framing that only makes sense for public-facing content. For internal tools, "credible" means accurate and reliable — not institutional authority. Needs a more universal phrasing.

**Issue 2 — "Inclusive" description may mislead in audience-specific contexts**
Current: "Language should welcome every background, ability level, and learning context."
Even though Inclusive is recommended-only for the Audience-specific preset, an evaluator reading this on a teacher portal might conclude the copy fails because a child wouldn't understand it. A parenthetical clarification helps.

### Expressive Attributes

**Issue 3 — "Connected" doesn't apply to Internal/Admin**
The entire Connected scale (Siloed service ↔ Shared community ecosystem) describes a public community-building dimension. An admin tool is correctly task-focused and doesn't aim to evoke "learners, families, schools, connected." Scoring it low is not a failure — it's appropriate restraint.

**Issue 4 — "Vibrant" sets an unfair bar for internal contexts**
Score 3 on Vibrant ("Clean but unmemorable") is actually the right register for admin copy. Restrained, clear, functional language should not score in the "needs attention" territory.

**Issue 5 — getRecommendation() doesn't flag low attributes at total ≥ 20**
A score of 5+5+5+4+1=20 produces "Copy fully embodies HKEdCity's expressive identity. Ready to publish" — with no mention of the attribute scored at 1. The `low` variable is computed but never used in the ≥20 branch.

**Issue 6 — Score bands are one-size-fits-all; no context calibration**
The 14/25 "Good Core Copy" floor and 20/25 "Premium Brand Fit" floor were calibrated assuming all 5 attributes matter equally. For Internal/Admin contexts, scoring below 3 on Vibrant and Connected is expected and correct — not a gap to fix. The band labels can mislead evaluators using this tool for internal copy.

---

## What changes

### 1. Fix "Credible" gate description (GATE_ITEMS)
```
Old: "Professional, trustworthy, and authoritative. Tone and content inspire confidence in HKEdCity as a credible education body."
New: "Accurate, trustworthy, and authoritative. Content can be relied upon; the tone and claims reflect well on HKEdCity."
```

### 2. Fix "Inclusive" gate description (GATE_ITEMS)
```
Old: "Accessible, respectful, and friendly to all users. Language should welcome every background, ability level, and learning context."
New: "Accessible, respectful, and friendly to the intended audience. Language should not exclude or alienate any person it is reasonably expected to reach."
```
This reframes "all users" to "intended audience," which correctly covers both public-facing (everyone) and audience-specific (teacher, student, parent) contexts without contradiction.

### 3. Add context note to "Connected" and "Vibrant" ATTR_ITEMS descriptions
For Connected, add a parenthetical to the main `desc`:
```
Old: "Shared community ecosystem. Connects learners, families, teachers, schools, resources, and opportunities."
New: "Shared community ecosystem. Connects learners, families, teachers, schools, resources, and opportunities. Less applicable to internal tools, where task focus is correct."
```
Same pattern for Vibrant:
```
Old: "Warm, delightful, and memorable. Energy and warmth without compromising clarity or calm."
New: "Warm, delightful, and memorable. Energy and warmth without compromising clarity or calm. For internal tools, score 3 (clean and functional) is a valid target."
```

### 4. Fix getRecommendation — flag low attrs at ≥ 20
```ts
if (total >= 20) {
  const note = low.length ? ` Note: ${low.join(", ")} scored below 3 — review before flagship placements.` : "";
  return `Copy fully embodies HKEdCity's expressive identity. Ready to publish across all surfaces.${note}`;
}
```

### 5. Add a context calibration note in the Final Evaluation score area
Below the "Total Expressive Score" in the score breakdown panel, add a small conditional note when preset is "internal":
```
"Score bands are calibrated for public-facing content. For internal tools, scores on Vibrant and Connected will naturally be lower — this is expected."
```
This appears as a small grey informational line, not a warning. Only shown when `preset === "internal"`.

---

## Files to modify
- `src/App.tsx` only

## Verification
1. Credible: new description reads correctly across all presets (no institutional framing).
2. Inclusive: passes the "teacher guide" test — evaluator should understand it means appropriate for the intended readership.
3. Connected/Vibrant: context note visible in attribute cards.
4. Total = 20 with one attribute < 3: recommendation includes the low-attribute note.
5. Internal preset active: calibration note visible below total expressive score.
