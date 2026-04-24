# Multimodal QUD — Web Preview

A tiny static site showcasing 5 curated examples from the Multimodal QUD dataset. Designed to drop into
[`lingchensanwen.github.io`](https://lingchensanwen.github.io) as a subpage.

## Files

- `index.html` / `style.css` / `app.js` — the page (no build step, no framework, all paths relative)
- `data.json` — the 5 selected examples: title, abstract, figure, caption, question, answer, supporting passage, type, difficulty, evaluation metadata
- `images/` — local copies of the figures referenced by `data.json`
- `firebase.json` — optional, unused for GitHub Pages; kept in case you ever want to deploy to Firebase Hosting instead

## Preview locally

Because `app.js` uses `fetch()`, the page must be served over HTTP (not opened as a `file://`):

```bash
cd path/to/web
python3 -m http.server 8080     # then open http://localhost:8080
```

## Deploy to GitHub Pages (as a subpage of lingchensanwen.github.io)

Your user-site repo is `lingchensanwen/lingchensanwen.github.io`. Drop this folder in as a subdirectory and push:

```bash
# from your Mac, inside a clone of lingchensanwen.github.io:
git clone git@github.com:lingchensanwen/lingchensanwen.github.io.git
cd lingchensanwen.github.io

# copy the web folder in under any subpath you like (e.g. "astroqud")
scp -r yw23374@<compling-host>:~/astroqud/web ./astroqud

git add astroqud
git commit -m "Add Multimodal QUD example gallery subpage"
git push
```

The page will then be live at:

```
https://lingchensanwen.github.io/astroqud/
```

Link to it from your homepage with `<a href="/astroqud/">Multimodal QUD demo</a>`.

### Why this works as a subpage

Every asset reference in the site is relative (`style.css`, `app.js`, `data.json`, `images/...`),
so the page works unchanged at any subpath. If you rename the folder (e.g. `astroqud-demo/` instead
of `astroqud/`), nothing inside needs to change.

## Updating the examples

`data.json` is plain JSON — edit in place to swap examples, tweak text, or add more.

To regenerate from scratch, rerun the selector (reads `~/astroqud/data/gpt5_mini_evaluated_all.json`,
keeps only `gpt5_mini_evaluation.pass == true`, picks 2 caption-free + 3 captioned examples across
diverse papers and question types).
