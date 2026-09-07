# Research project pages

The public site is `https://yatingwu.info`. This directory contains the research index, shared assets, and the source records for eight projects.

Edit `projects.json`, then run from the repository root:

```sh
python3 scripts/build_research_pages.py
python3 scripts/build_mqud_gallery.py
```

The first command writes seven project pages, their citation downloads, and `research/index.html`. It reads citations from `publications.bib`. The second updates the marked static gallery in the existing MQUD page from `multimodal-qud/data.json`.

Use `--check` with either command to detect outdated generated files. The pages work as plain HTML; `project.js` only enhances citation copying. Authors, publication status, data counts, release links, and evidence statements must remain consistent with the primary sources recorded in `projects.json` and `docs/geo-project-pages-2026-09-06.md`.

Project introductions are concise adaptations of the papers’ abstracts and introductions. The `overview` paragraphs and `overview_source` link are stored in `projects.json`; they are not presented as verbatim abstracts. Describe each project in the authors’ voice, using its concrete research question, method, and findings. Avoid slogans, invented examples, and generic FAQ sections. MQUD retains its examples from the released dataset.

When adding a new work, also add the links to both homepage language versions and the canonical page URL to `sitemap.xml`. Do not regenerate or replace the independent research-map prototype.
