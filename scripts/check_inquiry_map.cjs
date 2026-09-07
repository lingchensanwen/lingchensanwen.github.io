const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const data = JSON.parse(fs.readFileSync('research/inquiry-map.json', 'utf8'));
const rivers = JSON.parse(fs.readFileSync('research/inquiry-rivers.json', 'utf8'));
class Element {
  constructor(dataset = {}, textContent = '') {
    this.dataset = dataset; this.textContent = textContent; this.attrs = {}; this.hidden = false; this.handlers = {};
    this.classes = new Set();
    this.classList = { add: v => this.classes.add(v), toggle: (v, on) => on ? this.classes.add(v) : this.classes.delete(v) };
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(k, fn) { this.handlers[k] = fn; }
  focus() { this.focused = true; }
  scrollIntoView(options) { this.scroll = options; }
  click() { this.handlers.click({ preventDefault() {} }); }
}
function setup({mobile = false, reduce = false, hash = '', animate = false} = {}) {
  const nodes = data.projects.map(p => new Element({project:p.id, branch:p.branch, branches:(p.branches || [p.branch]).join(' ')}, p.name));
  const details = data.projects.map(p => { const el = new Element(); el.id = `inquiry-detail-${p.id}`; el.querySelector = selector => ({textContent: selector === 'h4' ? p.name : p.note}); return el; });
  const filters = ['all', 'discourse', 'agents', 'science', 'speech'].map(value => new Element({filter:value}, value));
  const routes = rivers.routes.map(route => new Element({routeId:route.id,routeBranch:route.branches[0],routeBranches:route.branches.join(' '),routeProjects:route.projects.join(' ')}));
  const edges = data.connections.map(c => new Element({from:c.from, to:c.to}));
  const status = new Element(), panel = new Element(), filterGroup = new Element(), root = new Element(), map = new Element();
  const sheet = new Element(), canvas = new Element(), heading = new Element();
  const nodeLayer = new Element(), routeLayer = new Element(), caption = new Element();
  const animations = [];
  sheet.inert = false;
  if (animate) {
    [canvas, nodeLayer, routeLayer, filterGroup, caption, panel].forEach(element => {
      element.animate = (frames, timing) => {
        let complete, reject;
        const animation = {
          frames, timing, reversals: 0, cancelled: false,
          finished: new Promise((resolve, fail) => { complete = resolve; reject = fail; }),
          reverse() { this.reversals++; },
          finish() { complete(); },
          cancel() { this.cancelled = true; reject(new Error('Cancelled')); },
        };
        animation.finished.catch(() => {});
        animations.push(animation);
        return animation;
      };
    });
  }
  map.open = false;
  const jump = new Element();
  const windowState = {
    location: {hash}, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    matchMedia: query => ({matches:query.includes('reduced-motion') ? reduce : mobile}),
  };
  map.querySelectorAll = selector => ({'.inquiry-node':nodes,'.inquiry-detail':details,'[data-filter]':filters,'[data-route-branch]':routes,'[data-from]':edges})[selector];
  map.querySelector = selector => ({'.inquiry-status':status,'.inquiry-details':panel,'.inquiry-filters':filterGroup,'.inquiry-root':root,'.inquiry-sheet':sheet,'.inquiry-canvas':canvas,'.inquiry-heading':heading,'.inquiry-nodes':nodeLayer,'.inquiry-routes':routeLayer,'.inquiry-map-caption':caption})[selector] || details.find(el => `#${el.id}` === selector);
  vm.runInNewContext(fs.readFileSync('research/inquiry-map.js','utf8'), {document:{querySelector:() => map, querySelectorAll:() => [jump]}, window:windowState});
  return {nodes, details, filters, routes, edges, status, panel, root, map, jump, windowState, sheet, canvas, heading, animations};
}
const visible = env => env.details.filter(el => !el.hidden).map(el => el.id);
let env = setup();
assert.deepEqual(visible(env), ['inquiry-detail-mqud']);
assert.deepEqual(env.routes.filter(r => r.classes.has('is-related')).map(r => r.dataset.routeId), ['qud', 'evaluation', 'comparison', 'elaboration', 'questions']);
const qudLine = ['qud', 'evaluation', 'comparison', 'elaboration', 'questions'];
const expectedRoutes = { 'qud-parsing': qudLine, qudeval: qudLine, qudsim: qudLine, elabqud: qudLine, qsalience: qudLine, mqud: qudLine, 'bilingual-disfluencies': ['speech'], contextweaver: ['agents'] };
const expectedArrowTargets = { 'qud-parsing':['qudeval','qsalience'], qudeval:['qudeval','qudsim','qsalience'], qudsim:['qudsim'], elabqud:['qsalience'], qsalience:['qsalience','mqud'], mqud:['mqud'], 'bilingual-disfluencies':[], contextweaver:[] };
assert.equal(env.nodes.find(n => n.dataset.project === 'mqud').attrs['aria-pressed'], 'true');
for (const node of env.nodes) {
  node.click();
  assert.deepEqual(visible(env), [`inquiry-detail-${node.dataset.project}`]);
  assert.equal(node.attrs['aria-pressed'], 'true');
  assert.deepEqual(env.routes.filter(r => r.classes.has('is-related')).map(r => r.dataset.routeId), expectedRoutes[node.dataset.project]);
  assert.deepEqual(env.edges.filter(e => !e.classes.has('is-dimmed')).map(e => e.dataset.to), expectedArrowTargets[node.dataset.project]);
  assert.ok(env.status.textContent.includes('Details below'));
  assert.equal(env.nodes.filter(n => n.attrs['aria-pressed'] === 'true').length, 1);
}
for (const filter of env.filters) {
  filter.click();
  assert.equal(filter.attrs['aria-pressed'], 'true');
  assert.equal(env.filters.filter(f => f.attrs['aria-pressed'] === 'true').length, 1);
  if (filter.dataset.filter !== 'all') {
    assert.ok(env.nodes.filter(n => !n.classes.has('is-dimmed')).every(n => n.dataset.branches.split(' ').includes(filter.dataset.filter)));
    assert.ok(env.nodes.find(n => n.attrs['aria-pressed'] === 'true').dataset.branches.split(' ').includes(filter.dataset.filter));
  }
}
assert.equal(env.root.hidden, true);
env.nodes.find(n => n.dataset.project === 'qudeval').click();
assert.equal(env.filters[0].attrs['aria-pressed'], 'true');
assert.equal(env.root.hidden, false);
assert.deepEqual(visible(env), ['inquiry-detail-qudeval']);
let prevented = false;
env.nodes[0].handlers.click({ctrlKey:true, preventDefault(){ prevented = true; }});
assert.equal(prevented, false);
assert.deepEqual(visible(env), ['inquiry-detail-qudeval']);
env.nodes[0].handlers.keydown({key:' ',preventDefault(){}});
assert.deepEqual(visible(env), ['inquiry-detail-qud-parsing']);
env.nodes[0].handlers.keydown({key:'Escape'});
assert.equal(env.filters[0].focused, true);
// A cross-area project stays selected, and area filters show the whole research line.
env = setup();
const getFilter = id => env.filters.find(f => f.dataset.filter === id);
const getNode = id => env.nodes.find(n => n.dataset.project === id);
const highlighted = () => env.routes.filter(r => r.classes.has('is-related') && !r.classes.has('is-dimmed')).map(r => r.dataset.routeId);
getFilter('discourse').click();
assert.deepEqual(visible(env), ['inquiry-detail-mqud']);
assert.deepEqual(env.nodes.filter(n => !n.classes.has('is-dimmed')).map(n => n.dataset.project), ['qud-parsing','qudeval','qudsim','elabqud','qsalience','mqud']);
assert.deepEqual(highlighted(), ['qud','evaluation','comparison','elaboration','questions']);
assert.ok(env.status.textContent.startsWith('Showing 6 projects'));
for (const id of ['qudsim','qsalience','mqud']) {
  getNode(id).click();
  assert.equal(getFilter('discourse').attrs['aria-pressed'], 'true');
  assert.deepEqual(visible(env), [`inquiry-detail-${id}`]);
  assert.deepEqual(highlighted(), ['qud','evaluation','comparison','elaboration','questions']);
}
getFilter('science').click();
assert.deepEqual(visible(env), ['inquiry-detail-mqud']);
assert.deepEqual(env.nodes.filter(n => !n.classes.has('is-dimmed')).map(n => n.dataset.project), ['mqud']);
assert.ok(env.status.textContent.startsWith('Showing 1 project'));
getFilter('discourse').click(); getNode('qudsim').click(); getFilter('science').click();
assert.deepEqual(visible(env), ['inquiry-detail-mqud']);
getFilter('discourse').click(); getNode('contextweaver').click();
assert.equal(getFilter('all').attrs['aria-pressed'], 'true');
assert.deepEqual(highlighted(), ['agents']);
getFilter('discourse').click(); getFilter('all').click();
assert.deepEqual(highlighted(), qudLine);
assert.equal(env.nodes.filter(n => !n.classes.has('is-dimmed')).length, 8);
console.log('PASS: six discourse projects, MQUD in both research areas, full-branch routes, counts, filter persistence, and reset to connected research lines.');

for (const reduce of [true, false]) {
  env = setup({mobile:true, reduce}); env.nodes[0].click();
  assert.equal(env.panel.focused, true);
  assert.equal(env.panel.scroll.behavior, reduce ? 'auto' : 'smooth');
}
vm.runInNewContext(fs.readFileSync('research/inquiry-map.js','utf8'), {document:{querySelector:() => null}});
console.log('PASS: 8 project selections, 5 branch controls, context switching, modifier-click links, keyboard activation, mobile detail focus, reduced motion, and absent-map guard.');

// Exercise every category/project pair, including transitions across categories.
const categoryProjects = {
  discourse:['qud-parsing','qudeval','qudsim','elabqud','qsalience','mqud'],
  science:['mqud'], agents:['contextweaver'], speech:['bilingual-disfluencies'],
};
const categoryRoutes = {
  discourse:qudLine, science:['qud','evaluation','elaboration','questions'],
  agents:['agents'], speech:['speech'],
};
for (const area of ['all','discourse','agents','science','speech']) {
  for (const project of data.projects) {
    const state = setup();
    state.filters.find(f => f.dataset.filter === area).click();
    state.nodes.find(n => n.dataset.project === project.id).click();
    const activeArea = area === 'all' || !categoryProjects[area].includes(project.id) ? 'all' : area;
    const actualRoutes = state.routes.filter(r => r.classes.has('is-related') && !r.classes.has('is-dimmed')).map(r => r.dataset.routeId);
    assert.deepEqual(actualRoutes, activeArea === 'all' ? expectedRoutes[project.id] : categoryRoutes[activeArea], `${area} → ${project.id}`);
    assert.equal(state.filters.find(f => f.attrs['aria-pressed']==='true').dataset.filter, activeArea);
    assert.deepEqual(visible(state), [`inquiry-detail-${project.id}`]);
    const heads = state.edges.filter(e => !e.classes.has('is-dimmed')).map(e => e.dataset.to);
    assert.deepEqual(heads, expectedArrowTargets[project.id]);
    assert.equal(new Set(heads).size, heads.length, 'Duplicate arrowhead at a confluence');
  }
}

// The bug was visible: verify the generated SVG/CSS use one river stroke layer.
const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('research/inquiry-landscape.css','utf8');
assert.match(css, /\.inquiry-stream\.is-related path\s*\{[^}]*stroke:\s*var\(--river\);[^}]*stroke-width:\s*2px;[^}]*opacity:\s*1;/);
assert.match(css, /\.inquiry-evidence path\s*\{[^}]*stroke-width:\s*0;/);
assert.match(html, /<marker id="inquiry-arrow"[^>]*markerUnits="userSpaceOnUse"/);
assert.match(html, /<marker id="inquiry-arrow"[^>]*><path[^>]*stroke-width="2"/);
const generatedNodes = [...html.matchAll(/<a class="inquiry-node [^>]+>/g)].map(match => match[0]);
assert.equal(generatedNodes.length, 8);
assert.match(generatedNodes.find(tag => tag.includes('data-project="mqud"')), /data-branches="discourse science"/);
assert.equal((html.match(/<g class="inquiry-stream"/g) || []).length, 7);
console.log('PASS: 40 area/project transitions, complete connected lines, isolated speech/agents, deduplicated arrowheads, and SVG/CSS stroke separation.');

// Navigation must open the handscroll before the anchor jump, with or without animation.
let disclosure = setup();
assert.equal(disclosure.map.open, false, 'Ordinary homepage load should start collapsed');
let jumpPrevented = false;
disclosure.jump.handlers.click({preventDefault(){jumpPrevented = true;}});
assert.equal(disclosure.map.open, true);
assert.equal(jumpPrevented, false, 'Preserve native anchor scrolling and history');
disclosure = setup({hash:'#research-map'});
assert.equal(disclosure.map.open, true, 'A direct map link must expand the map');
disclosure.map.open = false;
disclosure.jump.click();
assert.equal(disclosure.map.open, true, 'Reopen even when the URL hash has not changed');
disclosure = setup({hash:'#link'});
assert.equal(disclosure.map.open, false);
disclosure.windowState.location.hash = '#research-map';
disclosure.windowState.handlers.hashchange();
assert.equal(disclosure.map.open, true);
disclosure.map.open = false;
disclosure.windowState.location.hash = '#link';
disclosure.windowState.handlers.hashchange();
assert.equal(disclosure.map.open, false, 'Other hash navigation must not reopen the map');
disclosure.jump.handlers.click({ctrlKey:true});
assert.equal(disclosure.map.open, false, 'Modifier clicks should leave the current tab alone');
assert.match(html, /<details class="inquiry-map" id="research-map" aria-labelledby="inquiry-title">\s*<summary class="inquiry-heading"><h3 id="inquiry-title">/);
assert.ok(html.indexOf('id="research-map"') < html.indexOf('id="link"'));
assert.ok(html.indexOf('id="research-map"') > html.indexOf('<h3>Awards</h3>'));
console.log('PASS: collapsed homepage, overview jump, direct hash, same-hash reopening, modifier clicks, and placement above Links.');

// Exercise animation completion and interruption, not just the initial open flag.
(async () => {
  let scroll = setup({animate:true});
  scroll.heading.click();
  assert.equal(scroll.map.open, true);
  assert.equal(scroll.sheet.inert, true, 'Unrevealed controls must not be focusable');
  assert.equal(scroll.animations.length, 6);
  const painting = scroll.animations[0];
  assert.equal(painting.frames[0].clipPath, 'inset(0 49.5% 0 49.5%)');
  assert.equal(painting.frames[1].clipPath, 'inset(0 0% 0 0%)');
  assert.equal(painting.timing.direction, 'normal');
  assert.ok(scroll.animations.every(animation => animation.frames.every(frame => !('transform' in frame))), 'Keep river geometry and labels unscaled');
  scroll.animations.forEach(animation => animation.finish());
  await Promise.resolve();
  assert.equal(scroll.map.open, true);
  assert.equal(scroll.sheet.inert, false);
  assert.equal(scroll.map.classes.has('is-unrolling'), false);

  scroll.heading.click();
  const closing = scroll.animations.slice(6);
  assert.equal(closing[0].timing.direction, 'reverse');
  assert.equal(scroll.map.open, true, 'Keep the painting mounted until it finishes rolling up');
  scroll.jump.click();
  assert.equal(scroll.animations.length, 12, 'Reverse in place when navigation interrupts closing');
  assert.ok(closing.every(animation => animation.reversals === 1));
  closing.forEach(animation => animation.finish());
  await Promise.resolve();
  assert.equal(scroll.map.open, true);
  assert.equal(scroll.sheet.inert, false);

  scroll.heading.click();
  scroll.animations.slice(12).forEach(animation => animation.finish());
  await Promise.resolve();
  assert.equal(scroll.map.open, false);
  assert.equal(scroll.sheet.inert, false);

  scroll = setup({animate:true});
  scroll.heading.click(); scroll.heading.click();
  assert.ok(scroll.animations.every(animation => animation.reversals === 1));
  scroll.animations.forEach(animation => animation.finish());
  await Promise.resolve();
  assert.equal(scroll.map.open, false, 'A second click during opening should reverse and finish closed');

  scroll = setup({animate:true,reduce:true});
  scroll.heading.click();
  assert.equal(scroll.map.open, true);
  assert.equal(scroll.animations.length, 0);
  scroll.heading.click();
  assert.equal(scroll.map.open, false);
  assert.equal(scroll.sheet.inert, false);

  assert.match(css, /--accent:\s*#0088cc/);
  assert.match(css, /\.inquiry-map h3\s*\{[^}]*24\.5px\/40px "Helvetica Neue", Helvetica, Arial, sans-serif/);
  assert.match(html, /class="inquiry-preview" aria-hidden="true"/);
  assert.match(html, /class="inquiry-sheet"/);
  console.log('PASS: horizontal unroll, reverse close, rapid toggles, interrupted navigation, reduced motion, inert controls, and homepage typography/blue.');
})().catch(error => { console.error(error); process.exitCode = 1; });
