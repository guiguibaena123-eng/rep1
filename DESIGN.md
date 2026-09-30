---
name: Siwki
description: Treino de entrevista calmo e gentil para jovens em busca do primeiro (ou próximo) emprego.
colors:
  primary: "#0A5CF0"
  primary-pressed: "#0947D0"
  primary-soft: "#E8F0FE"
  primary-ink: "#0947D0"
  on-primary: "#FFFFFF"
  success: "#2FBF8F"
  success-soft: "#E3F7F0"
  success-ink: "#1A7A5A"
  warning: "#FFB84D"
  warning-soft: "#FFF3DE"
  warning-ink: "#8A5300"
  on-warning: "#4A2F00"
  error: "#E5484D"
  error-soft: "#FDECEC"
  error-ink: "#C4373C"
  score-low: "#A3C6FF"
  streak-icon: "#B86E00"
  background: "#F6F8FC"
  surface: "#FFFFFF"
  border: "#E5EAF2"
  segment-track: "#EBEFF6"
  text: "#1B1B1F"
  text-secondary: "#676E7B"
  text-disabled: "#A2A8B3"
  text-on-soft: "#56617A"
  dot-inactive: "#D3DBE8"
  skeleton-soft: "#EDF1F7"
  toast-success-text: "#14573F"
  toast-error-text: "#9E2A2E"
  verified-blue: "#0A5CF0"
  verified-gold: "#C28A0E"
  scrim: "rgba(27,27,31,0.4)"
  dark-primary: "#4D8DFF"
  dark-primary-soft: "#14264A"
  dark-primary-ink: "#8DB8FF"
  dark-on-primary: "#0F1117"
  dark-background: "#0F1117"
  dark-surface: "#181C24"
  dark-border: "#272C37"
  dark-text: "#F2F4F7"
  dark-text-secondary: "#9CA3B0"
  dark-text-on-soft: "#A9B6CC"
typography:
  brand-display:
    fontFamily: "Quicksand"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "38px"
  brand-title:
    fontFamily: "Quicksand"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: "34px"
  display:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: "34px"
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
  card-title:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "26px"
  title:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-small:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  button:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
rounded:
  button: "14px"
  input: "14px"
  nav-item: "16px"
  card: "20px"
  sheet: "28px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
  screen: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "52px"
    width: "100%"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-primary-disabled:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-disabled}"
  button-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    height: "48px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    height: "52px"
    width: "100%"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    padding: "0 16px"
    height: "48px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.input}"
    padding: "0 16px"
    height: "52px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-small}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "18px"
  card-highlight:
    backgroundColor: "{colors.primary-soft}"
    rounded: "{rounded.card}"
    padding: "18px"
  list-group:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  list-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "14px 16px"
    height: "56px"
  list-row-danger:
    textColor: "{colors.error-ink}"
  badge-premium:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  nav-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.nav-item}"
    height: "58px"
  toast-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.toast-success-text}"
    typography: "{typography.body-small}"
    rounded: "{rounded.button}"
    padding: "14px 16px"
  toast-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.toast-error-text}"
    typography: "{typography.body-small}"
    rounded: "{rounded.button}"
    padding: "14px 16px"
---

# Design System: Siwki

## Overview

**Creative North Star: "O Treino Tranquilo"**

Siwki is the calm room where a nervous young person rehearses before the real thing. Every screen should feel like a deep breath: generous white space, few elements, soft rounded forms, and one clear next step. The system lowers the stakes on purpose. Color draws the eye without shouting, feedback encourages, and nothing counts down, flashes, or scolds.

Density is low and the rhythm is relaxed: 20px side margins, 24–32px between sections, and a single full-width primary button in thumb reach. Personality lives in precise, gentle details: a confident brand blue that stays calm rather than corporate, rounded Quicksand titles that echo the stroke of the bag logo, a button that sinks slightly under the thumb, a score ring that fills in slowly and always comes with kind words. The look is young without being childish. There is no mascot, no stock photography, and no decorative noise. Shapes, icons and type do the work, which also keeps the app light on low-end phones.

The same Siwki look ships on iPhone and Android. It is one shared design language, not a per-OS restyle, while each OS keeps its expected behaviors: back gesture/button, keyboard, safe areas, and system pickers.

**Key Characteristics:**
- One main action per screen, full-width at the bottom half.
- Borders before shadows; surfaces are flat and quiet.
- Soft, generously rounded corners everywhere (14 / 20 / 28 / pill).
- Brand blue as the single brand voice, plus at most one accent per screen.
- The bag logo sits in the top-left corner of every tab; tab titles are rounded Quicksand.
- Kind feedback colors: low scores are never red.
- Full light and dark themes, with WCAG AA contrast in both.

## Colors

A calm, cool palette: a confident brand blue over misty, faintly blue near-white neutrals, with mint, amber and coral used sparingly and only for meaning.

> **2026-09-30 — primary moved from indigo (#5B5BD6) to the brand blue** of the visual identity (`design/identidade/`: solid #0A5CF0, gradient #5AAEFF → #0553E6), at the owner's request. Neutrals lost their lilac cast. The color *names* below (Índigo Sereno, Índigo Profundo, Névoa Índigo) are kept as role names and now refer to the blue values. Wherever this document says "indigo", read "brand blue".

### Primary
- **Índigo Sereno** (`primary`, now #0A5CF0): the brand voice. Primary buttons, the active tab icon, focus borders, selected chips, links, and the full-bleed splash background (T1). In dark mode it lightens to `dark-primary`.
- **Índigo Profundo** (`primary-pressed` / `primary-ink`): the pressed state of primary buttons, and indigo text on soft indigo surfaces (secondary buttons, highlight cards).
- **Névoa Índigo** (`primary-soft`): gentle highlight surfaces: highlight cards, secondary buttons, the active tab's pill background.

### Secondary
- **Menta Conquista** (`success`, `success-soft`, `success-ink`): progress and achievement. Completed progress bars, high scores (75+), success toasts.

### Tertiary
- **Âmbar Sequência** (`warning`, `warning-soft`, `warning-ink`, `streak-icon`): warm positive emphasis. The day streak, mid scores (50–74), and the Premium badge (with `on-warning` text).
- **Coral Aviso** (`error`, `error-soft`, `error-ink`): real errors only. Field validation, failed actions, error toasts.

### Neutral
- **Névoa** (`background`): the app canvas behind every screen.
- **Branco Papel** (`surface`): cards, inputs, sheets, and the tab bar.
- **Linha Suave** (`border`): hairline card and input borders, dividers, the score ring track, and disabled button fill.
- **Trilho** (`segment-track`): the segmented tabs track and inactive carousel dots.
- **Grafite** (`text`), **Cinza Médio** (`text-secondary`), **Cinza Claro** (`text-disabled`): text hierarchy.
- **Cinza Azulado** (`text-on-soft`; dark `dark-text-on-soft`): secondary text on Névoa Índigo highlight cards, where Cinza Médio falls to 4.47:1 (below AA). This one reaches 5.4:1.
- **Ponto Apagado** (`dot-inactive`): the off track of switches and inactive dots. **Sombra de Carga** (`skeleton-soft`): the secondary lines of loading skeletons.
- **Véu** (`scrim`): the dimmed backdrop behind bottom sheets.
- Dark theme: `dark-background` / `dark-surface` / `dark-border` / `dark-text` / `dark-text-secondary`, with every soft and ink tone re-derived for dark (see `src/theme/tokens.ts`).

### Named Rules
**The One Accent Rule.** Besides indigo, a screen uses at most one accent color (mint, amber, or coral). If two compete, one of them is wrong.

**The Gentle Score Rule.** Scores use mint (75+), amber (50–74), or soft indigo `score-low` (below 50), always with a kind label next to them. Coral never marks a low score; it is reserved for real errors.

**The Ink Rule.** Text on mint, amber, or soft surfaces uses the matching `*-ink` tone, never the fill color. Secondary text on Névoa Índigo uses Cinza Azulado (`text-on-soft`), never Cinza Médio. Toast text uses its own deeper tone (`toast-success-text`, `toast-error-text`) to stay AA on the soft fill. In dark mode, text on the primary button is `dark-on-primary`, because white fails AA on the lighter blue.

## Typography

**Brand Font:** Quicksand (700), for tab titles only
**Display Font:** Plus Jakarta Sans (700/800)
**Body Font:** Inter (400/500/600)

**Character:** Quicksand's round terminals echo the hand-drawn stroke of the Siwki logo and announce each tab in the brand's voice. Plus Jakarta Sans gives the headings inside screens a friendly, rounded confidence. Inter keeps everything else calm, neutral and highly legible on small screens. Together they read young and warm without looking playful or childish.

### Hierarchy
- **Brand Display** (Quicksand 700, 30/38): the Home greeting. One per app, not per screen.
- **Brand Title** (Quicksand 700, 26/34): the titles of the Treinar, LinkedIn and Dicas tabs, and the person's name on Perfil (24/30 there).
- **Display** (800, 28/34, -0.3 tracking): hero titles inside flows. At most one per screen.
- **Headline** (700, 24/30): screen titles.
- **Card Title** (700, 20/26): the title of highlight cards (Treino de hoje, the pending simulation) and of bottom sheets.
- **Title** (700, 18/24): section titles inside a screen.
- **Body** (400, 16/24): default reading and interface text. Never smaller for paragraphs.
- **Body Small** (400–600, 14/20): field labels (semibold), secondary lines, chips, toasts.
- **Label** (500–600, 12/16): tab labels, badges, captions, counters. The floor: nothing below 12px.
- **Button** (600, 16/24): all button labels.

### Named Rules
**The Two Weights Rule.** A screen uses at most two weights of body type. Headings take their weight from the font file (700 or 800); never add `fontWeight` on top of a custom font.

**The 130% Rule.** Layouts must survive system text at 130% without clipping or overlap: let text wrap (buttons allow two lines) instead of fixing heights around it.

## Layout

A single-column mobile layout on a strict 4px grid (steps 4, 8, 12, 16, 20, 24, 32, 40, 56). Screens use 20px side margins and 24–32px between sections; items inside a section sit 8–16px apart. Content scrolls vertically; the primary action sits at the bottom, within thumb reach. Horizontal scrollers (chip rows, tracks) are used only for filters and never hold the main task.

The tab bar has 5 fixed items (Início, Treinar, LinkedIn, Dicas, Perfil) and sits above the bottom safe area. Flow screens (simulation, result, paywall, payment) open over the tabs without the bar and with a clear close/back. Every touch target is at least 48×48; visually smaller controls (40px chips) extend their hit area with invisible slop.

## Elevation & Depth

Flat by default. Depth comes from tonal layering: the misty `background` sits behind white `surface` cards outlined by a 1px `border`. There is a single, very soft shadow, `elevated`: offset 0/4, blur 16, 6% Grafite (Android elevation 3). It is used only on bottom sheets, toasts, and the rare card that must float. Dimmed layers use the `scrim`.

### Shadow Vocabulary
- **Elevated** (`0 4px 16px rgba(27,27,31,0.06)`): bottom sheets, center dialogs, toasts, explicitly elevated cards.

### Named Rules
**The Border-First Rule.** Separate with a hairline border or a tonal step before reaching for a shadow. If a card has both a border and a shadow, one should go.

## Shapes

Soft and generous, never sharp. Buttons and inputs use 14px corners, tab-bar pills 16px, cards 20px, and bottom sheets 28px on the top corners only (center dialogs round all four). Chips, badges, the sheet handle and progress bars are full pills. Borders are always 1px hairlines, thickening to 2px only for focus or error on inputs. Icons are Lucide at a 1.75 stroke with rounded caps, in one style across the whole app. The logo is a shopping bag drawn in a single rounded stroke, with the hand-lettered "siwki" whose last dot is a check. On tabs only the bag appears, widened and 28px tall: brand gradient (#5AAEFF → #0553E6) in light mode, white in dark mode. The older speech-bubble LogoMark survives only on the sign-in screen.

## Components

### Buttons
Soft and welcoming: they sink slightly under the thumb (scale 0.97, 150ms) and never feel harsh.
- **Shape:** gently rounded (14px), full width by default, min height 52px (48px `compact` inside cards and empty states).
- **Primary:** Índigo Sereno fill, white label (dark: `dark-on-primary` label on the lighter blue). Pressed: Índigo Profundo plus the press scale. Only one primary per screen.
- **Secondary:** Névoa Índigo fill with indigo-ink label, for the second-most-important action (e.g. "Continuar com Google").
- **Text:** no fill, indigo label, 48px tall, for light actions ("Pular", "Agora não").
- **Disabled:** Linha Suave fill with Cinza Claro label. **Loading:** a spinner replaces the label and further taps are blocked.

### Chips
- **Style:** pill, 1px border on white; label 14px medium (15px for the 44px size, 16px semibold for the 56px block style).
- **State:** selected is filled Índigo Sereno with a white label and an optional check. Single choice uses radio semantics, multiple choice uses checkbox semantics. Heights are 40 / 44 / 48 / 56; `block` chips span the full width with left-aligned text (goal list in onboarding).

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** white surface with a 1px border (default), or Névoa Índigo without a border (highlight). A highlight card holds the screen's main action: Card Title, one line of Cinza Azulado text, and the primary button.
- **Shadow Strategy:** none by default; `elevated` only when the card floats (see Elevation).
- **Internal Padding:** 18px.
- **Pressable cards** dim to 85% opacity on press.

### Inputs / Fields
- **Style:** white fill, 1px border, 14px corners, 52px tall, 16px Inter; the label sits above in 14px semibold.
- **Focus:** the border becomes 2px Índigo Sereno, and padding compensates so text doesn't jump.
- **Error:** 2px coral border plus a coral-ink message with an alert icon below, announced politely to screen readers.
- **Password:** a 48px eye toggle on the right. **Long answer:** 6+ lines with a discreet character counter in the bottom-right corner.

### Navigation
Five items with an icon (24px) and a 12px label. The active item gets an indigo icon and label (primary-ink in dark mode), a semibold label, and a Névoa Índigo pill (16px corners, 58px tall) behind it. Inactive items are Cinza Médio. The bar is white with a hairline top border.

### Grouped Lists
The settings-shaped pattern used on Perfil and Configurações. A group is one white card (20px corners, 1px border) holding rows split by hairline dividers. A row is at least 56px tall, with a 22px Lucide icon, a semibold label, an optional Cinza Médio subtitle, and a 20px chevron when it navigates. A switch row puts a native Switch on the right (brand blue when on, `dot-inactive` when off), and the whole row is the control for screen readers. The destructive row ("Apagar minha conta") uses coral ink for both the icon and the label and has no chevron. On Configurações each group carries a small semibold Cinza Médio section title above it, following the iOS and Android settings convention.

### Bottom Sheet
The home for confirmations and choices. It slides up in 220ms ease-out over the scrim, with a 40×4 pill handle, 28px top corners, and the title in Plus Jakarta Sans 20/26. The main button comes first, then the text button. With a text field it becomes a centered dialog that rises with the keyboard. Tapping outside or Android back closes it.

### Score Ring (signature)
A circular 0–100 score: 96px in lists and for the average score on Perfil and Meu perfil, 150px at the top of results. With no score yet it becomes an empty ring with "–", never a misleading 0. The track is Linha Suave and the arc takes its band color (see The Gentle Score Rule). The number is in Plus Jakarta Sans 800, and the ring fills over 700ms ease-out. It is always paired with a kind band label ("Mandou bem"…) so color is never the only cue.

### Premium Badge
A small amber pill (24px) with a lock icon and "Premium" in dark on-warning text, used to mark locked features. It is never used as a nagging banner.

### Verified Seal
A filled badge-check seal with a white check, placed right after the person's name (Perfil 20px, Meu perfil 24px). Blue (`verifiedBlue` #1A8CD8, dark #3AA6F0) marks Premium profiles; gold (`verifiedGold` #C28A0E, dark #F2B530) is reserved for the app creator's account (`src/features/profile/verified.ts`). Owner-requested exception to One Accent: the seal is identity, not an accent, and appears nowhere else. It has a screen-reader label.

### Toast
Appears at the top for 3s, fading in over 200ms. Success uses Menta soft with a check; error uses Coral soft with an alert. Corners are 14px, with the elevated shadow. Errors are announced assertively, successes politely.

## Do's and Don'ts

### Do:
- **Do** keep exactly one primary button per screen, full width, 52px, in the bottom half.
- **Do** use `src/theme/tokens.ts` values (`space[n]`, `radius.*`, color tokens) instead of loose numbers or hex codes.
- **Do** pair every score color with a gentle text label, and use mint / amber / soft indigo for scores.
- **Do** keep animations at 150–250ms ease-out and skip them when "reduce motion" is on.
- **Do** show skeletons while loading; never a blank screen.
- **Do** check both light and dark themes for AA contrast, and text at 130%.
- **Do** keep Lucide icons at stroke 1.75, one style everywhere.
- **Do** open every tab with `Screen brand` (bag logo in the corner) and a Quicksand Brand Title.
- **Do** put settings-shaped content in Grouped Lists, not in stacks of loose cards.

### Don't:
- **Don't** use coral for low scores, streak loss, or limits; coral is for real errors only.
- **Don't** add more than one accent color (mint, amber, coral) to a screen besides indigo.
- **Don't** use stock photos, mascots, or heavy imagery; shapes, icons and type carry the look.
- **Don't** use more than one emoji per screen, and only in achievements and greetings.
- **Don't** add aggressive counters, countdowns, or pushy "you're missing out" styling; Premium is marked by the quiet amber badge.
- **Don't** stack shadows on bordered cards, or use shadows outside sheets, toasts and floating cards.
- **Don't** set text below 12px or body text below 16px.
