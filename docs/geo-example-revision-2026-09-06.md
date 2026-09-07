# Research-page examples: source review and revision

This revision adds one source-based example section to each of the seven generated project pages and narrows the MQUD gallery to an IsoScore walkthrough. It changes the local preview; it does not publish the site.

## Source records

| Project | Source location | Content checked | Presentation |
| --- | --- | --- | --- |
| MQUD | [IsoScore, Figure 3 and Section 4.2](https://arxiv.org/html/2108.07344v2#S4.SS2) | Complete three-panel local image; estimates 1.9996, 1.6105, 1.0281; meaning of dimension use | Question preserved from local example 34; caption, context, answer, and evidence explanation paraphrased and labeled |
| ContextWeaver | [Section 4.3](https://arxiv.org/html/2604.23069v1#S4.SS3) | Django and pytest instance IDs; four of five paired comparisons won by opposite methods | Two case summaries, including the case favoring the baseline |
| QUDsim | [Figure 1, page 2](https://arxiv.org/pdf/2504.09373v2#page=2) | The shared question, model names, and the different story explanations | One quoted question and paraphrased story passages |
| QSalience | [Figure 1, page 2](https://aclanthology.org/2024.emnlp-main.1114.pdf#page=2) | Q3 wording, rating 5, Q4 rating 3, rationales, later answer location, GPT-4 provenance | Human ratings distinguished from model predictions; Q4 paraphrased |
| QUDeval | [Figure 3, page 6](https://aclanthology.org/2023.emnlp-main.325.pdf#page=6) | ChatGPT and human questions, anchor numbers, answer leakage and anchor error | Original questions with paraphrased context and explanations |
| ElabQUD | [Figure 1, page 1](https://aclanthology.org/2023.emnlp-main.336.pdf#page=1) | The implicit question and editor’s added sentence | Short quotations with paraphrased context; original example attribution retained |
| QUD parsing | [Figure 1(a), page 2](https://aclanthology.org/2023.findings-acl.710.pdf#page=2) | Edge 3 to 4, question, and the reported $2–4 billion funding gap | Annotated structure explicitly distinguished from model output |
| Bilingual disfluencies | [Appendix A.0.1, page 7](https://openreview.net/pdf/0673ae1419de15594db575e96264285f32142489.pdf#page=7) | Two stethoscope utterances and the preceding/following word interpretation | Paper illustrations explicitly distinguished from participant transcripts |

Five downloaded paper figures were visually inspected: QUDsim, QSalience, QUDeval, ElabQUD, and QUD parsing. ContextWeaver and IsoScore were checked against arXiv HTML; the existing IsoScore figure was inspected in the preceding review. Bilingual examples were checked against the publicly indexed PDF text; direct PDF download returned HTTP 403.

## MQUD curation

- Preserve `multimodal-qud/data.json` byte for byte. This revision does not correct or relabel original dataset records.
- Use `multimodal-qud/gallery.json` for the website walkthrough. The question comes from the existing local record, not a newly verified match to the current Hugging Face release.
- Remove the other four examples from the visible gallery and remove attention and Cross-Care examples from the hero. The prior review found incomplete comparison panels, unsupported causal explanations, context/version problems, and a reversed-axis caption.
- Replace the question in the task-comparison band with the retained IsoScore question.
- Remove lexical-overlap evidence highlighting and client-side replacement of the static gallery. The same complete content is available in the initial HTML and with JavaScript enabled.
- Retain native expand/collapse interaction, with the worked example open initially.

The change establishes source provenance and improves explanatory accuracy. It does not measure a gain in search ranking or citation probability, or establish the quality of the full MQUD benchmark.

## Files to edit

- `research/examples.json` holds the seven project examples.
- `scripts/build_research_pages.py` renders their complete HTML and source links.
- `multimodal-qud/gallery.json` and `scripts/build_mqud_gallery.py` define the walkthrough.

Regenerate with the two build scripts and verify with their `--check` flags. Publication metadata, the protected prototype, and original MQUD data are outside this edit.

## Validation completed

- All 11 canonical pages retain valid local links and publication metadata.
- All eight projects remain reachable through static links from the homepage.
- All seven new example sections contain their complete text and source links in the initial HTML.
- The retained MQUD question matches original local record 34 exactly; the original data file and protected pages/assets retain their prior hashes.
- Both generators pass their freshness checks; the diff has no whitespace errors.
- All eight local preview responses exactly match the updated files.

## Editorial and layout revision

The seven generated project introductions now use two focused paragraphs and a short description beneath the paper title. QUDeval’s corpus description distinguishes 2,040 system questions from 150 crowdsourced questions.

Examples use task-specific layouts: human salience ratings with rationales, two passages aligned by a question, annotated answer leakage, an inserted explanation, a sentence dependency, paired debugging cases, and pause positions. Quotations and paraphrases remain explicitly distinguished. The MQUD walkthrough includes a table of the three dimension-use estimates from the source paper.

The project pages share reading typography, spacing, and navigation. MQUD retains its existing layout and assets with an additional stylesheet. Citation text is available in native expandable sections, and all example content remains in the initial HTML. The previously removed ContextWeaver associations remain absent.

Validation checked quotation boundaries after inline highlighting, annotated ratings, source links, publication metadata, citation markup, generator freshness, protected file hashes, and contrast of project accent colors against white.
