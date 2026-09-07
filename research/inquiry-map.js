(() => {
  'use strict';
  const map = document.querySelector('.inquiry-map');
  if (!map) return;
  const nodes = [...map.querySelectorAll('.inquiry-node')];
  const details = [...map.querySelectorAll('.inquiry-detail')];
  const filters = [...map.querySelectorAll('[data-filter]')];
  const routes = [...map.querySelectorAll('[data-route-branch]')];
  const edges = [...map.querySelectorAll('[data-from]')];
  const status = map.querySelector('.inquiry-status');
  const sheet = map.querySelector('.inquiry-sheet');
  const canvas = map.querySelector('.inquiry-canvas');
  const heading = map.querySelector('.inquiry-heading');
  const overlays = ['.inquiry-nodes', '.inquiry-routes', '.inquiry-filters', '.inquiry-map-caption', '.inquiry-details'].map(selector => map.querySelector(selector));
  let selected = 'mqud';
  let branch = 'all';
  let motion = null;
  let targetOpen = map.open;

  function unfold(open, animate = true) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canAnimate = animate && !reducedMotion && typeof canvas.animate === 'function';
    if (motion && canAnimate) {
      if (targetOpen !== open) {
        targetOpen = open;
        motion.forEach(animation => animation.reverse());
      }
      return;
    }
    if (motion) {
      motion.forEach(animation => animation.cancel());
      motion = null;
    }
    targetOpen = open;
    if (!canAnimate || map.open === open) {
      map.open = open;
      sheet.inert = false;
      map.classList.toggle('is-unrolling', false);
      return;
    }
    // Reveal a stationary painting sideways; never stretch its labels or river paths.
    map.open = true;
    sheet.inert = true;
    map.classList.add('is-unrolling');
    const timing = {duration: 1150, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both', direction: open ? 'normal' : 'reverse'};
    const painting = canvas.animate([
      {clipPath: 'inset(0 49.5% 0 49.5%)'},
      {clipPath: 'inset(0 0% 0 0%)'},
    ], timing);
    const fading = overlays.map(element => element.animate([
      {opacity: 0}, {opacity: 0, offset: .6}, {opacity: 1},
    ], timing));
    const current = [painting, ...fading];
    motion = current;
    painting.finished.then(() => {
      if (motion !== current) return;
      map.open = targetOpen;
      sheet.inert = false;
      map.classList.toggle('is-unrolling', false);
      motion = null;
      current.forEach(animation => animation.cancel());
    }, () => {});
  }

  // Native summary keyboard activation emits the same click as pointer activation.
  heading.addEventListener('click', event => {
    event.preventDefault();
    unfold(!(motion ? targetOpen : map.open));
  });

  function revealHashTarget() {
    if (window.location.hash === '#research-map') unfold(true);
  }

  // Keep direct links useful even though the map starts collapsed.
  // Opening before native anchor navigation also handles an unchanged URL hash.
  document.querySelectorAll('a[href="#research-map"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      unfold(true);
    });
  });
  window.addEventListener('hashchange', revealHashTarget);
  revealHashTarget();

  function belongsTo(node, value) {
    return (node.dataset.branches || node.dataset.branch).split(' ').includes(value);
  }

  function connectedProjects(id) {
    // A research line includes both sides of its forks and confluences.
    // These are existing connections, not additional direct paper relationships.
    const related = new Set([id]);
    const pending = [id];
    while (pending.length) {
      const current = pending.pop();
      edges.forEach(edge => {
        const { from, to } = edge.dataset;
        const other = from === current ? to : to === current ? from : null;
        if (other && !related.has(other)) {
          related.add(other);
          pending.push(other);
        }
      });
    }
    return related;
  }

  function updateRoutes() {
    const projects = connectedProjects(selected);
    routes.forEach(route => {
      const inBranch = branch === 'all' || (route.dataset.routeBranches || route.dataset.routeBranch).split(' ').includes(branch);
      const related = branch === 'all'
        ? (route.dataset.routeProjects || '').split(' ').some(id => projects.has(id))
        : inBranch;
      route.classList.toggle('is-related', related);
      route.classList.toggle('is-dimmed', !inBranch);
    });
    // River strokes are drawn once. Direct connections contribute arrowheads only;
    // shared destinations need one arrowhead even when several papers lead to them.
    const arrowTargets = new Set();
    edges.forEach(edge => {
      const direct = edge.dataset.from === selected || edge.dataset.to === selected;
      const visible = direct && !arrowTargets.has(edge.dataset.to);
      if (visible) arrowTargets.add(edge.dataset.to);
      edge.classList.toggle('is-dimmed', !visible);
    });
  }

  function select(id, announce = true) {
    selected = id;
    nodes.forEach(node => {
      const active = node.dataset.project === id;
      node.classList.toggle('is-selected', active);
      node.setAttribute('aria-pressed', String(active));
    });
    details.forEach(detail => {
      const active = detail.id === `inquiry-detail-${id}`;
      detail.classList.toggle('is-selected', active);
      detail.hidden = !active;
    });
    updateRoutes();
    if (announce) {
      const detail = map.querySelector(`#inquiry-detail-${id}`);
      status.textContent = `${detail.querySelector('h4').textContent}. ${detail.querySelector('.inquiry-detail-body > p').textContent} Details below the map.`;
    }
  }

  function filter(value) {
    branch = value;
    map.querySelector('.inquiry-root').hidden = value === 'speech' || value === 'agents';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    nodes.forEach(node => node.classList.toggle('is-dimmed', value !== 'all' && !belongsTo(node, value)));
    const current = nodes.find(node => node.dataset.project === selected);
    if (value !== 'all' && !belongsTo(current, value)) {
      select(nodes.find(node => belongsTo(node, value)).dataset.project);
    } else {
      updateRoutes();
    }
    const count = nodes.filter(node => belongsTo(node, value)).length;
    status.textContent = value === 'all' ? 'Showing all eight projects.' : `Showing ${count} ${count === 1 ? 'project' : 'projects'} in ${filters.find(button => button.dataset.filter === value).textContent.trim()}.`;
  }

  nodes.forEach(node => {
    node.setAttribute('role', 'button');
    node.setAttribute('aria-controls', `inquiry-detail-${node.dataset.project}`);
    node.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (branch !== 'all' && !belongsTo(node, branch)) filter('all');
      select(node.dataset.project);
      if (window.matchMedia('(max-width: 720px)').matches) {
        const panel = map.querySelector('.inquiry-details');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.focus({ preventScroll: true });
        panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    node.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); node.click(); }
      if (event.key === 'Escape') { filter('all'); filters[0].focus(); }
    });
  });
  filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  select(selected, false);
  map.classList.add('is-interactive');
  map.querySelector('.inquiry-filters').hidden = false;
})();
