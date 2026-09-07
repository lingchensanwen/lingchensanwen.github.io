"""Render the homepage research map from project metadata and curated relationships."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- BEGIN LINES OF INQUIRY -->'
END = '<!-- END LINES OF INQUIRY -->'
e = html.escape


def render():
    metadata = {p['id']: p for p in json.loads((ROOT / 'research/projects.json').read_text())}
    data = json.loads((ROOT / 'research/inquiry-map.json').read_text())
    rivers = json.loads((ROOT / 'research/inquiry-rivers.json').read_text())
    nodes, details = [], []
    for item in data['projects']:
        p = metadata[item['id']]
        selected = ' is-selected' if p['id'] == 'mqud' else ''
        venue = p.get('venue_short', 'Preprint' if p['id'] == 'mqud' else p['venue'])
        branches = ' '.join(item.get('branches', [item['branch']]))
        nodes.append(f'''<a class="inquiry-node inquiry-{item['branch']}{selected}" data-project="{p['id']}" data-branch="{item['branch']}" data-branches="{e(branches)}" data-label="{item['label_position']}" href="./{p['path']}/" style="--x:{item['x']}%;--y:{item['y']}%" aria-label="{e(item['name'])}, {p['year']}" title="{e(p['title'])}">
          <span class="inquiry-pin" aria-hidden="true"><span class="inquiry-dot"></span></span>
          <span class="inquiry-node-copy"><span class="inquiry-node-meta">{p['year']}</span><strong>{e(item['name'])}</strong><span class="inquiry-node-label">{e(item['label'])}</span></span>
        </a>''')
        connections = []
        for c in data['connections']:
            if p['id'] in (c['from'], c['to']):
                other = c['to'] if p['id'] == c['from'] else c['from']
                other_p = metadata[other]
                direction = 'Connection to'
                connections.append(f'''<p class="inquiry-connection"><span>{direction} <a href="./{other_p['path']}/">{e(other_p['short'])}</a></span> {e(c['description'])} <a class="inquiry-source" href="{e(c['source'])}">{e(c['section'])} ↗</a></p>''')
        award = '<span class="inquiry-award">Outstanding Paper Award</span>' if p.get('award') else ''
        details.append(f'''<article class="inquiry-detail inquiry-{item['branch']}{selected}" id="inquiry-detail-{p['id']}" aria-labelledby="inquiry-title-{p['id']}">
          <div class="inquiry-detail-heading"><p class="inquiry-detail-meta">{p['year']} · {e(venue)}</p><h4 id="inquiry-title-{p['id']}">{e(item['name'])}</h4>{award}<div class="inquiry-detail-links"><a href="./{p['path']}/">Project <span aria-hidden="true">↗</span></a><a href="{e(p['url'])}">paper <span aria-hidden="true">↗</span></a></div></div>
          <div class="inquiry-detail-body"><p>{e(item['note'])}</p>{''.join(connections)}</div>
        </article>''')
    colors = {'qud': '#256883', 'evaluation': '#256883', 'comparison': '#256883', 'elaboration': '#3b795b', 'questions': '#345f9b', 'speech': '#955565', 'agents': '#956231'}
    streams = ''.join(f'''<g class="inquiry-stream" data-route-branch="{r['branches'][0]}" data-route-branches="{' '.join(r['branches'])}" data-route-projects="{' '.join(r['projects'])}" data-route-name="{e(r['name'])}" style="--stream:{colors[r['id']]}"><path d="{r['path']}"/></g>''' for r in rivers['routes'])
    edges = ''.join(f'''<path data-from="{c['from']}" data-to="{c['to']}" d="{c['path']}"/>''' for c in rivers['connections'])
    return f'''{START}
        <details class="inquiry-map" id="research-map" aria-labelledby="inquiry-title">
          <summary class="inquiry-heading"><h3 id="inquiry-title"><span class="inquiry-eyebrow">RESEARCH</span><span class="inquiry-summary-line"><span>Research Delta</span><span class="inquiry-toggle" aria-hidden="true"><span class="inquiry-when-closed">Unroll ↔</span><span class="inquiry-when-open">Roll up ↔</span></span></span><span class="inquiry-preview" aria-hidden="true"><img src="./research/assets/research-delta-flat.jpg" srcset="./research/assets/research-delta-flat-768.jpg 768w, ./research/assets/research-delta-flat.jpg 1536w" sizes="(max-width: 720px) calc(100vw - 24px), 700px" width="1536" height="1024" alt="" loading="lazy" decoding="async"></span></h3></summary>
          <div class="inquiry-sheet">
          <div class="inquiry-filters" role="group" aria-label="Research branches" hidden>
            <button type="button" data-filter="all" aria-pressed="true">All work</button>
            <button type="button" data-filter="discourse" aria-pressed="false"><i class="inquiry-key inquiry-discourse" aria-hidden="true"></i>Discourse &amp; reasoning</button>
            <button type="button" data-filter="agents" aria-pressed="false"><i class="inquiry-key inquiry-agents" aria-hidden="true"></i>LLM agents</button>
            <button type="button" data-filter="science" aria-pressed="false"><i class="inquiry-key inquiry-science" aria-hidden="true"></i>AI4Science</button>
            <button type="button" data-filter="speech" aria-pressed="false"><i class="inquiry-key inquiry-speech" aria-hidden="true"></i>Language &amp; cognition</button>
          </div>
          <div class="inquiry-canvas">
            <img class="inquiry-scenery" src="./research/assets/research-delta-flat.jpg" srcset="./research/assets/research-delta-flat-768.jpg 768w, ./research/assets/research-delta-flat.jpg 1536w" sizes="(max-width: 720px) calc(100vw - 24px), (max-width: 1080px) calc(100vw - 40px), 1040px" width="1536" height="1024" alt="" loading="lazy" decoding="async">
            <svg class="inquiry-routes" viewBox="0 0 {rivers['width']} {rivers['height']}" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <defs><marker id="inquiry-arrow" markerWidth="18" markerHeight="16" refX="22" refY="8" orient="auto" markerUnits="userSpaceOnUse"><path d="M3 2 L14 8 L3 14" stroke="context-stroke" stroke-width="2" fill="none"/></marker></defs>
              {streams}
              <g class="inquiry-evidence" marker-end="url(#inquiry-arrow)">
                {edges}
              </g>
            </svg>
            <div class="inquiry-root">Questions under discussion</div>
            <div class="inquiry-nodes">{''.join(nodes)}</div>
          </div>
          <div class="inquiry-map-caption"><span>Rivers group research themes.</span><span><i class="inquiry-legend-arrow" aria-hidden="true">→</i>Arrows mark connections between papers.</span></div>
          <div class="inquiry-details" tabindex="-1" aria-label="Selected project">{''.join(details)}</div>
          <p class="inquiry-status" role="status" aria-live="polite"></p>
          </div>
        </details>
        {END}'''


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    path = ROOT / 'index.html'
    old = path.read_text()
    content = render()
    if START in old:
        a = old.index(START)
        b = old.index(END) + len(END)
        new = old[:a] + content + old[b:]
    else:
        anchor = '      <h3 id="link">Links</h3>'
        if old.count(anchor) != 1:
            raise SystemExit('Expected one Links heading near the bottom of the homepage.')
        new = old.replace(anchor, content + '\n\n' + anchor, 1)
    if args.check:
        if new != old:
            raise SystemExit('Homepage research map is stale; run scripts/build_inquiry_map.py')
        print('Homepage research map is current.')
    else:
        path.write_text(new)
        print('Updated homepage research map.')
