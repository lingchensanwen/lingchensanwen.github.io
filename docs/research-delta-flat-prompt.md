# Flat landscape revision, 2026-09-07

The user asked for the restrained visual language of Untitled Goose Game instead of the earlier dense, painterly landscape. One built-in image_gen style-transfer edit was made, using `research/assets/research-delta-master.png` as its input. The new source is `research/assets/research-delta-flat-master.png`; the webpage uses the responsive JPEG exports `research-delta-flat.jpg` and `research-delta-flat-768.jpg`.

The image was inspected before integration. The project markers were subsequently moved onto the river channels, following the user's clarification. Their final positions and the river routes are separate from the artwork, in `inquiry-map.json` and `inquiry-rivers.json`. No screenshot pixels from the reference game were used. The [official presskit](https://goose.game/presskit/) was consulted as the reference source.

## Exact image prompt

```text
Use case: style-transfer
Asset type: scenery-only homepage landscape backdrop; interactive project markers and relation lines will be added separately in HTML/SVG.
Input image: the provided landscape is the edit target. Create exactly one targeted style-transfer revision.

Primary request: Radically simplify this existing painterly river landscape into a crisp, restrained, flat-shaded low-poly illustration in the visual language of Untitled Goose Game. The result should feel like a small calm landscape, with quiet open space and a clean graphic look.

Style and materials: Broad matte solid-color grass planes; smooth powder-blue river channels; rounded geometric deciduous trees using only 2–3 flat tones per tree; a few simple irregular rocks; tiny sparse reeds. Use a limited natural palette, off-white banks, and gentle green lawns. Clean, crisp shape boundaries and flat graphic color. Greatly reduce the number of trees and rocks.

Composition: Preserve the approximate overall river branching and wide 3:2 composition of the source image. High oblique orthographic view, no horizon; landscape fills the frame. Flatten all terrain into a gentle landscape, with no cliffs or raised stage-like islands. Unify the eight lawn clearings into larger continuous open meadow areas rather than eight repeated enclosed objects. Keep generous low-detail open space at normalized marker anchor positions (x%, y%): (21%,11%), (41%,12%), (66%,9%), (19%,41%), (50%,41%), (84%,40%), (45%,63%), (71%,79%). These are layout anchors only; draw no visible markers at them. Allow large unbroken lawn areas to dominate between the smooth branching rivers. River geography remains an illustrative backdrop.

Required change: Remove the original image's painterly detail, dense forest, craggy terrain, water highlights, and dramatic relief. Completely rebuild its visual treatment as simple flat graphic shapes while retaining its approximate river layout.

Avoid: No painterly texture, detailed foliage, photoreal lighting, grain, 3D render gloss, terrain relief, dramatic cliffs, waterfalls, dense forest, sparkles, or game-like stage islands. No markers, labels, project numbers, text, signs, paper cards, goose characters, other characters, people, logos, buildings, UI, borders, arrows, or diagram lines. Do not incorporate or quote third-party screenshot pixels. Scenery only.
```
