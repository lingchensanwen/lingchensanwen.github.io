# GEO advice: website review, 2026-09-07

This review compares the six suggestions supplied by the author with the published website and selected public repository files. The suggestions are treated as proposals to evaluate, not evidence of a ranking or citation benefit.

## What is already online

The live HTTP check found all eight project pages available, with bibliographic metadata, ScholarlyArticle JSON-LD, homepage links, and sitemap entries. The two homepages, research index, robots.txt, sitemap, and combined bibliography also returned HTTP 200. See `geo-live-audit-2026-09-07.json`.

These results establish availability and static content, not search indexing or citations in AI answers. In particular, the previous 1/8 versus current 8/8 project-page count is a publishing change, not a retrieval uplift measurement.

## The six suggestions

| Suggestion | Assessment for this site |
| --- | --- |
| Descriptive titles alongside method names | The project pages already retain full paper titles and generally include explanatory subtitles. Keep the published titles and bibliographic metadata stable. Refine website subtitles only when they omit the actual task; do not invent alternate paper titles for keyword coverage. |
| Explain task, problem, and method early | The opening summaries already describe the work and usually its data or result. Use natural terminology from the paper. The exact three-sentence rule is a writing heuristic, not a documented indexing requirement. A website summary is not the original abstract. |
| Give readers a concrete object to cite | Use the actual contribution: MQUD's dataset, QSalience's annotations and salience predictor, QUDsim's metric, QUDeval's evaluation criteria, ElabQUD's annotations, the QUD parser, ContextWeaver's memory method, and the bilingual speech analysis. Do not rebrand every contribution as a benchmark or invent a named finding. |
| Connect scholarly records, pages, code, and data | The website links outward. Selected external READMEs still lack a link back to the project pages. Verify titles and author order against publication records, and link versions through their existing identifiers. Semantic Scholar and OpenAlex are external records whose corrections are separate work. |
| Provide BibTeX, CFF, and verifiable evidence | Every project page has BibTeX, and the examples and usage notes give sources and scope. CFF belongs in the root of the relevant software or dataset repository. A single CFF for this multi-project personal website would not establish citation records for all eight papers. |
| Run a retrieval audit | A new 20-question file is prepared, with every result explicitly unmeasured. It separates paper mentions, citations to a primary source, citations to the project page, and description accuracy. HTTP checks do not populate those fields. |

Google's [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) supports crawl access, internal links, textual content, and agreement between structured data and visible content. It does not prescribe additional AI markup or guarantee indexing or inclusion. This guidance concerns Google's AI search features, not every AI system.

[GitHub's citation documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files) describes root-level `CITATION.cff` and `preferred-citation`, which can direct the citation to the paper. That is citation tooling, not documented proof of higher AI retrieval rank.

[Google Scholar's inclusion guidance](https://scholar.google.com/intl/en/scholar/inclusion.html) requires access to the full text or complete author-written abstract. The shorter website summaries should not be described as satisfying that requirement by themselves.

## Specific gaps verified

On 2026-09-07, direct reads of these current public files found:

- [MQUD dataset README](https://huggingface.co/datasets/lingchensanwen/mqud/blob/main/README.md): BibTeX present; no `yatingwu.info/` project link.
- [QUDeval README](https://github.com/lingchensanwen/QUDeval): BibTeX present; no `yatingwu.info/` project link. A request for root-level `CITATION.cff` returned 404.
- [QUD parsing README](https://github.com/lingchensanwen/DCQA-QUD-parsing): BibTeX present; no `yatingwu.info/` project link. A request for root-level `CITATION.cff` returned 404.

These are file-level checks, not an audit of every file in those repositories or all external scholarly records. The URL and response records are in `geo-external-links-2026-09-07.json`.

## Local changes in this review

- The website repository's README now links to the eight project pages and their papers and identifies each contribution.
- The MQUD webpage README now uses the current project URL, describes the single displayed walkthrough, includes the existing BibTeX verbatim, and documents the actual static-page generator. The preserved five-example source file is distinguished from the released dataset.
- `geo-query-set-20-2026-09-07.csv` contains two natural-language questions per project plus four questions spanning related work. The earlier 16-query sheet and previous baseline are preserved.

These README changes are local. This review did not update external repositories, the dataset card, publication records, or the published website.

## Retrieval measurement protocol

The 20 questions are an author-defined relevance set, not evidence of search volume or a representative sample of all user queries. They avoid author names and project names. Keep them fixed before comparing runs.

Run each question in a fresh session with the selected system's external search enabled, without providing this conversation, the project list, or the expected papers. Record the engine, model where exposed, mode, timestamp, and complete returned answer with its source URLs. A separate exact-title lookup can test record availability, but should not be counted as discovery without the project name.

For each run, record whether a relevant work is mentioned, whether its paper or other primary resource is actually cited, whether this project website is cited, and whether the description is correct. Retain errors and missing citations. Do not count a known URL successfully opened by an audit script as a retrieval hit. Ordinary web search results can be recorded separately; they are not an AI answer citation audit.

Report raw counts and denominators for each engine and mode. Use repeated comparable runs to assess variability. A single post-release run cannot establish a causal increase over the old website, and academic paper citations require a different, longer-term measurement.
