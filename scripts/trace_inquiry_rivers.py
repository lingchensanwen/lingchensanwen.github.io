"""Trace research routes through the blue water in the current landscape asset.

Uses Pillow for image analysis; does not edit or produce images.
Run only when changing the map geometry, then build_inquiry_map.py.
"""
from pathlib import Path
from PIL import Image
from collections import deque
from heapq import heappush, heappop
from math import hypot
import json
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'research/assets/research-delta-flat-master.png').convert('RGB')
step=3; W,H=im.size; w=(W-1)//step+1; h=(H-1)//step+1
water=set()
for y in range(h):
    for x in range(w):
        r,g,b=im.getpixel((x*step,y*step))
        if b-g>15 and g-r>22: water.add((x,y))
cardinal=[(1,0),(-1,0),(0,1),(0,-1)]
directions=cardinal+[(1,1),(-1,-1),(1,-1),(-1,1)]
shore={p:0 for p in water if any((p[0]+dx,p[1]+dy) not in water for dx,dy in cardinal)}
queue=deque(shore)
while queue:
    p=queue.popleft()
    for dx,dy in cardinal:
        q=(p[0]+dx,p[1]+dy)
        if q in water and q not in shore:shore[q]=shore[p]+1;queue.append(q)
def snap(point):
    x,y=point
    return min((p for p in water if shore[p]>=1),key=lambda p:(p[0]*step-x)**2+(p[1]*step-y)**2)
def trace(a,b):
    a,b=snap(a),snap(b)
    dist={a:0}; parent={}; heap=[(0,a)]
    while heap:
        cost,p=heappop(heap)
        if cost!=dist[p]:continue
        if p==b:break
        for dx,dy in directions:
            q=(p[0]+dx,p[1]+dy)
            if q not in water:continue
            nxt=cost+hypot(dx,dy)*(1+10/(shore[q]+1)**2)
            if nxt<dist.get(q,float('inf')):dist[q]=nxt;parent[q]=p;heappush(heap,(nxt,q))
    assert b in dist,(a,b)
    pts=[b]
    while pts[-1]!=a:pts.append(parent[pts[-1]])
    return [(x*step,y*step) for x,y in reversed(pts)]
def simplify(points,tolerance=2.5):
    if len(points)<=2:return points
    ax,ay=points[0];bx,by=points[-1];length=hypot(bx-ax,by-ay)
    distances=[abs((by-ay)*x-(bx-ax)*y+bx*ay-by*ax)/length if length else hypot(x-ax,y-ay) for x,y in points]
    far=max(range(len(points)),key=distances.__getitem__)
    if distances[far]<=tolerance:return [points[0],points[-1]]
    return simplify(points[:far+1],tolerance)[:-1]+simplify(points[far:],tolerance)
def path(points):
    pts=simplify(points)
    d=f'M {pts[0][0]} {pts[0][1]}'
    for i in range(1,len(pts)-1):
        a,b=pts[i],pts[i+1]
        d+=f' Q {a[0]} {a[1]} {(a[0]+b[0])/2:g} {(a[1]+b[1])/2:g}'
    return d+f' L {pts[-1][0]} {pts[-1][1]}'
anchors = {
    'qud-parsing': (150, 190), 'qudeval': (557, 260),
    'qudsim': (1095, 352), 'elabqud': (448, 349),
    'qsalience': (801, 363), 'mqud': (1117, 497),
    'bilingual-disfluencies': (153, 594), 'contextweaver': (1253, 891),
}
anchors = {key: tuple(v * step for v in snap(point)) for key, point in anchors.items()}

# Shared junctions make research ancestry visible in the river geometry.
# The northern inlet remains scenery; QSalience is downstream of the QUD work.
knots = {
    **anchors,
    'source': (0, 65), 'elaboration-fork': (335, 264),
    'comparison-fork': (660, 294), 'salience-merge': (705, 333),
    'upper-bend': (843, 219), 'upper-turn': (960, 285),
    'elaboration-bend': (561, 411),
    'lower-turn': (879, 411), 'lower-bend': (933, 468),
    'comparison-mouth': (1200, 336), 'science-mouth': (1210, 551),
    'speech-source': (1, 474), 'speech-end': (288, 631),
    'agents-source': (1002, 1020), 'agents-end': (1282, 772),
}


def via(names):
    # Preserve exact anchors and reuse curves where routes share a channel.
    parts = [path(trace(knots[a], knots[b])) for a, b in zip(names, names[1:])]
    return parts[0] + ''.join(' ' + part.split(maxsplit=3)[3] for part in parts[1:])


qud_projects = ['qud-parsing', 'qudeval', 'qudsim', 'elabqud', 'qsalience', 'mqud']
segments = [
    ('qud', 'Questions under discussion', qud_projects, ['discourse', 'science'],
     ['source', 'qud-parsing', 'elaboration-fork']),
    ('evaluation', 'Question generation and evaluation', ['qudeval', 'qudsim', 'qsalience', 'mqud'], ['discourse', 'science'],
     ['elaboration-fork', 'qudeval', 'comparison-fork']),
    ('comparison', 'Discourse similarity', ['qudsim'], ['discourse'],
     ['comparison-fork', 'upper-bend', 'upper-turn', 'qudsim', 'comparison-mouth']),
    ('elaboration', 'Elaboration and reader questions', ['elabqud', 'qsalience', 'mqud'], ['discourse', 'science'],
     ['elaboration-fork', 'elabqud', 'elaboration-bend', 'salience-merge']),
    ('questions', 'Question salience and scientific utility', ['qsalience', 'mqud'], ['discourse', 'science'],
     ['comparison-fork', 'salience-merge', 'qsalience', 'lower-turn', 'lower-bend', 'mqud', 'science-mouth']),
    ('speech', 'Language and cognition', ['bilingual-disfluencies'], ['speech'],
     ['speech-source', 'bilingual-disfluencies', 'speech-end']),
    ('agents', 'LLM agents', ['contextweaver'], ['agents'],
     ['agents-source', 'contextweaver', 'agents-end']),
]
routes = [
    {'id': id, 'name': label, 'projects': projects, 'branches': branches, 'path': via(waypoints)}
    for id, label, projects, branches, waypoints in segments
]
metadata=json.loads((root/'research/inquiry-map.json').read_text())
labels={'qud-parsing':'above','qudeval':'above','qudsim':'above','elabqud':'left','qsalience':'below','mqud':'below','bilingual-disfluencies':'below','contextweaver':'left'}
for item in metadata['projects']:
    x,y=anchors[item['id']];item['x']=round(x/W*100,4);item['y']=round(y/H*100,4);item['label_position']=labels[item['id']];item['river_point']=[x,y]
(root/'research/inquiry-map.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
connection_routes = {
    ('qud-parsing', 'qudeval'): ['qud-parsing', 'elaboration-fork', 'qudeval'],
    ('qudeval', 'qudsim'): ['qudeval', 'comparison-fork', 'upper-bend', 'upper-turn', 'qudsim'],
    ('qud-parsing', 'qsalience'): ['qud-parsing', 'elaboration-fork', 'qudeval', 'comparison-fork', 'salience-merge', 'qsalience'],
    ('qudeval', 'qsalience'): ['qudeval', 'comparison-fork', 'salience-merge', 'qsalience'],
    ('elabqud', 'qsalience'): ['elabqud', 'elaboration-bend', 'salience-merge', 'qsalience'],
    ('qsalience', 'mqud'): ['qsalience', 'lower-turn', 'lower-bend', 'mqud'],
}
assert set(connection_routes) == {(c['from'], c['to']) for c in metadata['connections']}
edges = [
    {'from': c['from'], 'to': c['to'], 'path': via(connection_routes[c['from'], c['to']])}
    for c in metadata['connections']
]
(root/'research/inquiry-rivers.json').write_text(json.dumps({'width':W,'height':H,'routes':routes,'connections':edges},ensure_ascii=False,indent=2)+'\n')
print('Placed',len(anchors),'projects on water; traced',len(routes),'research streams and',len(edges),'connections.')
for name,p in anchors.items():print(name,p,im.getpixel(p))
