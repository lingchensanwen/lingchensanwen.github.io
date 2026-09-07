# Project usage notes — 2026-09-06

Scope: extend the existing eight project pages with source-backed usage information. Both homepages, the MQUD source data and gallery records, images, and unrelated prototypes are unchanged. All changes remain local.

## Source revisions

- [AlliteraryAlligator/QUDsim](https://github.com/AlliteraryAlligator/QUDsim/tree/f146127b870e866c661ab67a04da5122f9b6805a)
- [ritikamangla/QSalience](https://github.com/ritikamangla/QSalience/tree/0e72fbd0f69859ecee32cfd80e4c6ed9f6c0a5a9)
- [lingchensanwen/QUDeval](https://github.com/lingchensanwen/QUDeval/tree/62eeb3df2ee3e382c878eb0eb92fecd2c1fe6d04)
- [sheffwb/elabQUD](https://github.com/sheffwb/elabQUD/tree/8a253a8f014c642d5156333313f9d1573a031767)
- [lingchensanwen/DCQA-QUD-parsing](https://github.com/lingchensanwen/DCQA-QUD-parsing/tree/9640795b27d7dff706e6efa5c98e5c6fcfddfe7b)
- [MQUD release](https://huggingface.co/datasets/lingchensanwen/mqud/tree/295b4efc36226ad19429edcd4bccc151b72971d0)
- [ContextWeaver, Algorithm 1](https://arxiv.org/html/2604.23069v1#S3.SS1)
- [Bilingual disfluencies, Sections 2.3–2.5](https://openreview.net/pdf/0673ae1419de15594db575e96264285f32142489.pdf#page=2)

## Verified details

- MQUD: Viewer API reports config `default`, one split `train`, and 1,250 rows. JSONL fields are flat; viewer rows group metadata, figure context, and supporting evidence. A first-row read from the pinned JSONL release succeeded. No images were downloaded.
- QSalience: executed the released preprocessing script on its two-question example. Both questions retained the expected article prefix through `sentence_id`. Read the predictor source to confirm the T5 output is `T5_predictions.csv`, with a `prediction` column. Full model inference was not run.
- QUDsim: executed the page’s pandas snippet on the pinned released score file (650 rows). Verified `Source ID`, `Target ID`, `Similarity`, and segment-score fields. Checked the demo notebook and input schema. The CLI defines `--unique` but accesses `args.with_replacement`, so the page recommends the notebook for new pairs and reports the source-specific CLI issue. No paid inference was run.
- QUDeval: read the released CSV (2,190 rows). Verified article/anchor/answer identifiers and all four judgment columns. Included the source README’s note about annotation revisions after submission. Removed the inaccurate implication that all 2,190 questions were system-generated from the page description.
- ElabQUD: read 2,878 annotation rows and verified 1,299 unique `(file_num, elab_line)` pairs. The data README documents separate access for full Newsela articles; the page does not suggest they are included in the TSV.
- QUD parsing: documented the numbered-sentence input and staged pipeline from its README; retained the Colab/setup links. The full model pipeline was not run.
- ContextWeaver: described warmup, parent selection, ancestry collection, and full-versus-compressed history entries from Algorithm 1. No execution traces or code-release claims were invented.
- Bilingual disfluencies: documented the three prediction tasks, separate speaker-group classifiers, GPT-2 surprisal feature, and participant-separated evaluation from the paper. No clinical or live-inference claims added.

## Validation

- `python3 scripts/build_research_pages.py --check`: 15 generated files current.
- `python3 scripts/build_mqud_gallery.py --check`: gallery and usage block current.
- Four displayed data-reading snippets executed successfully against the public releases.
- QSalience preprocessing executed successfully and its output context checked against each supplied sentence boundary.
- All eight usage sections present in initial HTML, including collapsed code examples. Rendered code text matched the executed snippets.
- Eleven canonical pages passed local-link, fragment, citation-metadata, and homepage-reachability checks.
- Eighteen protected files matched their pre-edit SHA-256 hashes, including both homepages and original MQUD data/gallery.
- `git diff --check` passed.
- No browser visual/interaction QA or full model execution was performed.
- No commit, push, site deployment, external README edit, or community post was performed.

These checks establish usable content and working data reads, not a measured gain in search ranking or AI citations.

## Editorial and layout revision

The next pass shortened introductions, merged repeated setup explanations, and used inline code formatting for fields and filenames. The seven generated page headers now feature the project name with the full paper title beneath it; duplicate paper buttons and decorative section numbering were removed. Citation metadata and all homepage links are preserved.

Usage sections use three layouts: input/data descriptions beside an open code panel, ordered steps for the two parsing/memory procedures, and short definitions for the speech tasks. Python syntax coloring is generated in the initial HTML. The MQUD page shares the usage styling while retaining its gallery and existing layout.

Validation: all executable snippet text matched the previously run snippets exactly, including after HTML syntax coloring. Original example questions, ratings, marked spans, case outcomes, and source provenance were unchanged. Both generators passed freshness checks; eleven canonical pages passed link/fragment and citation checks; markup was balanced on all eight project pages. Code text colors passed a 4.5:1 contrast check. Both homepages and the protected data, gallery records, images, and prototype files matched their pre-edit hashes. No browser visual or interaction QA was performed.
