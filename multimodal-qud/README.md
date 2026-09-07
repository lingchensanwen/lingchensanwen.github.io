# Multimodal QUD: Inquisitive Questions from Scientific Figures

[Project website](https://yatingwu.info/multimodal-qud/) · [Paper](https://arxiv.org/abs/2604.23733) · [Dataset](https://huggingface.co/datasets/lingchensanwen/mqud)

Yating Wu, William Rudman, Venkata S Govindarajan, Alexandros G. Dimakis, and Junyi Jessy Li. Preprint, 2026.

MQUD contains 1,250 questions evoked by scientific figures, including 708 annotated by the papers’ original authors. It studies questions about a figure’s role in its paper, with answers extracted from the paper. See the [dataset card](https://huggingface.co/datasets/lingchensanwen/mqud) for the released files and their format.

This directory contains the project website. The page presents one worked example based on IsoScore Figure 3, with the question, figure, interpretation, and supporting source. Its explanation is adapted from that paper and is labeled accordingly.

## Citation

The citation is also available as [citation.bib](citation.bib).

```bibtex
@misc{mqud2026,
  title={{Multimodal QUD: Inquisitive Questions from Scientific Figures}},
  author={Wu, Yating and Rudman, William and Govindarajan, Venkata S and Dimakis, Alexandros G. and Li, Junyi Jessy},
  year={2026},
  eprint={2604.23733},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2604.23733}
}
```

## Page sources

- `index.html` contains the rendered page, including the example and dataset usage notes. Its text is available without JavaScript.
- `gallery.json` contains the current walkthrough and its source attribution. `images/` contains the local figures.
- `data.json` preserves the five original example records; it is not the released 1,250-question dataset or the current gallery selection.
- `style.css`, `refinement.css`, and shared styles in `../research/` control the presentation.
- `../research/usage.json` supplies the dataset fields and loading example.

From the repository root, regenerate the marked example and usage sections with:

```sh
python3 scripts/build_mqud_gallery.py
python3 scripts/build_mqud_gallery.py --check
```

For a local preview, run `python3 -m http.server 8080` from the repository root and visit `http://localhost:8080/multimodal-qud/`.
