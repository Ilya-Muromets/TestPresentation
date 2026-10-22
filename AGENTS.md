# Instructions for AI agents editing this deck

This folder is an **IlyaPoint** presentation. `index.html` is the entire deck and is meant to be edited directly.
Full spec: https://github.com/Ilya-Muromets/IlyaPoint/blob/main/docs/FORMAT.md
`CLAUDE.md` is this deck's memory (audience, style preferences, outline, decisions): read it first, and keep it up to
date when the author states lasting preferences or decisions. It is published with the deck.

## Rules
- Slides are `<section class="ip-slide">` inside `<main class="ip-deck">`, 1920×1080 px, in order.
- Elements are direct children with `class="ip-el ip-text|ip-media|ip-shape|ip-group|ip-embed"`, absolutely positioned via inline
  `left/top/width/height` (px), optional `rotate: Ndeg`, `opacity`.
- Every element needs a `data-id` unique within its slide. Same id on consecutive slides ⇒ morph animates between them.
  Use new unique ids for unrelated elements.
- Font is Arial only. Text markup: `<b>`, `<i>`, `<br>`, `<ul><li>`; math `$…$` / `$$…$$` (KaTeX).
- Colors: `var(--ip-fg|bg|gray|red|orange|yellow|green|blue|purple)` (theme-adaptive) or any CSS color.
- Transitions: `data-transition="none|dissolve|morph"` and `data-duration` (s) on the slide being entered.
- Media go in `media/` (≤ 75 MB each, deck ≤ 500 MB). `data-view="cx cy s"` = saved crop/zoom; `data-sync` groups
  synchronized zoom/playback (default: all media on the slide).
- Shapes: `data-shape="rect|ellipse|triangle"` with a box, or `line|arrow` with `data-points="x1 y1 x2 y2"`;
  `data-fill`, `data-stroke`, `data-stroke-width`, `data-radius`, `data-heads`, `data-dash`.
  Free-form: `data-shape="path"` with a box and `data-path="M… C… Z"` (SVG path data, box-local px; add
  `data-viewbox="w h"` to write it in another frame, e.g. a 24×24 icon).
- Reusable library items: `<template class="ip-symbol" data-name="…">…elements…</template>` inside `<main>` (before the
  slides). The editor's Library panel lists them; they are not shown in the talk.
- Speaker notes: `<aside class="ip-notes">…</aside>` at the end of a slide.
- Do not edit files in `ilyapoint/` (vendored player). Run `node ilyapoint/check.mjs` to validate.

## Live apps
Interactive visualizations/demos run as HTML pages inside a slide:
```html
<div class="ip-el ip-embed" data-id="viz" style="left: 120px; top: 200px; width: 1680px; height: 800px;"><iframe src="apps/viz/index.html" title="Viz"></iframe></div>
```
- One folder per app: `apps/<name>/index.html` plus its own files. It must work offline from a static host (GitHub
  Pages): relative paths only, libraries copied into the app folder (no CDNs, no build step, no server).
- Size the page to the element box (100vw × 100vh, no scrollbars), use Arial, and include the kit
  `<script src="../../ilyapoint/app.js"></script>`: it applies the deck theme (`--ip-fg`, `--ip-bg`, … CSS variables,
  `html[data-theme]`) and passes slide-navigation keys to the player. Use `ilyapoint.on('active', on => …)` to run
  animations only while the slide is showing, and `ilyapoint.on('theme', t => …)` for canvas/WebGL colors.
- Apps load with the deck and keep their state across slides. While the slide is hidden the page is 0×0: lay out with
  CSS or on `resize`, not once at load.
- Same limits as media (≤ 75 MB per file). In the editor, thumbnails show a placeholder; on the canvas the app runs
  and is used after a double-click. deck_render_slide shows a placeholder too, so check the page itself separately.

## Example slide
```html
<section class="ip-slide" data-transition="morph">
  <div class="ip-el ip-text" data-id="title" style="left: 120px; top: 70px; width: 1680px; height: 90px; font-size: 64px; color: var(--ip-fg); font-weight: bold;">Results</div>
  <div class="ip-el ip-media" data-id="ours" style="left: 120px; top: 220px; width: 820px; height: 760px;"><img src="media/abc123.png" alt="Ours"></div>
  <div class="ip-el ip-media" data-id="gt" style="left: 980px; top: 220px; width: 820px; height: 760px;"><img src="media/def456.png" alt="GT"></div>
  <aside class="ip-notes">Zoom into the texture on the left.</aside>
</section>
```
