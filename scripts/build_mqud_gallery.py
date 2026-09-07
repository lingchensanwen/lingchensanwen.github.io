#!/usr/bin/env python3
"""Render source-checked website walkthroughs; preserve the original data.json."""
import argparse
import html
import json
import re
from pathlib import Path
from research_usage import render_usage
ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'multimodal-qud/index.html'
START = '<!-- MQUD_STATIC_GALLERY_START -->'
END = '<!-- MQUD_STATIC_GALLERY_END -->'

def clean(value):
    text=str(value or '')
    text=re.sub(r'\\renewcommand\s*\{\\thefootnote\}\s*\{\\fnsymbol\{footnote\}\}', ' ', text)
    for _ in range(3):
        text=re.sub(r'\\(?:textbf|textit|textsc|texttt|emph)\{([^{}]*)\}',r'\1',text)
    text=text.replace('\\\\',' ').replace('\\%','%').replace('\\&','&').replace('\\_','_')
    return re.sub(r'\s+',' ',text).strip()

def esc(value): return html.escape(clean(value))

def render():
    examples=json.loads((ROOT/'multimodal-qud/gallery.json').read_text())
    cards=[]
    for i,ex in enumerate(examples):
        paper=ex['paper']
        assert re.fullmatch(r'\d{4}\.\d{4,5}(v\d+)?',paper)
        image=ex['image']
        assert (ROOT/'multimodal-qud'/image).is_file()
        rows=''.join('<tr><th scope="row">'+esc(row['panel'])+'</th><td>'+esc(row['x'])+'</td><td>'+esc(row['dimensions'])+'</td></tr>' for row in ex.get('dimension_rows',[]))
        table=('<div class="dimension-table"><table><caption>Dimension-use estimates reported in the paper</caption><thead><tr><th scope="col">Panel</th><th scope="col">x</th><th scope="col">Dimensions used</th></tr></thead><tbody>'+rows+'</tbody></table></div>') if rows else ''
        cards.append(f'''<details class="card" id="example-{ex['id']}" open>
<summary class="card-summary"><div class="summary-meta"><span class="example-num">Example {i+1}</span><span class="paper-id">{esc(paper)}</span></div><h2 class="summary-title">{esc(ex['title'])}</h2><p class="summary-q">{esc(ex['question'])}</p><span class="expand-hint" aria-hidden="true">⌄</span></summary>
<div class="card-body"><section class="panel panel-trigger"><h3 class="panel-title">Figure and context</h3><p>{esc(ex['context'])}</p><div class="figure"><img src="{esc(image)}" alt="{esc(ex['alt'])}" loading="lazy"><p class="caption">{esc(ex['caption'])}</p></div></section>
<section class="panel panel-question"><h3 class="panel-title">Question</h3><blockquote class="question-box">{esc(ex['question'])}</blockquote></section>
<section class="panel panel-answer"><h3 class="panel-title">Interpretation</h3><div class="answer-box">{esc(ex['answer'])}</div>{table}<div class="subsection"><p>{esc(ex['evidence_summary'])}</p><p><a href="{esc(ex['source_url'])}">{esc(ex['source_label'])}</a></p></div><p class="panel-sub">{esc(ex['provenance'])}</p></section></div></details>''')
    return START+'\n'+'\n'.join(cards)+'\n'+END

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    text=PAGE.read_text();block=render()
    if START in text:
        before,tail=text.split(START,1);old,after=tail.split(END,1)
        result=before+block+after
    else:
        original='<section id="gallery"></section>'
        assert original in text
        result=text.replace(original,'<section id="gallery">\n'+block+'\n</section>',1)
    usage_start = '<!-- MQUD_USAGE_START -->'
    usage_end = '<!-- MQUD_USAGE_END -->'
    before, tail = result.split(usage_start, 1)
    old, after = tail.split(usage_end, 1)
    result = before + usage_start + '\n' + render_usage('mqud') + '\n' + usage_end + after
    if args.check:
        if text!=result:raise SystemExit('MQUD gallery or usage notes are out of date.')
        print('Verified static MQUD gallery and usage notes.')
    else:PAGE.write_text(result);print('Rendered source-checked MQUD gallery and usage notes.')
