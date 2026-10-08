// Pure presentation interpolation. Algorithm snapshots remain exact and immutable.
export function interpolateVisual(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  if (typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b)) return a + (b - a) * t;
  if (typeof a === 'string' && typeof b === 'string' && /^#[\da-f]{6}$/i.test(a) && /^#[\da-f]{6}$/i.test(b)) {
    return '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
  }
  if (Array.isArray(a) && Array.isArray(b)) return b.map((v, i) => interpolateVisual(a[i] ?? v, v, t));
  if (a && b && typeof a === 'object' && typeof b === 'object') return Object.fromEntries(Object.keys(b).map(k => [k, interpolateVisual(a[k] ?? b[k], b[k], t)]));
  return b;
}

// GraphCanvas keeps stable edge IDs; zero width is an invisible edge, not deletion.
export function graphVisual(graph) {
  return { ...graph, edges: graph.edges.map(e => ({ ...e, style: { ...e.style,
    arrowSize: e.style.directional && e.style.lineWidth > 0 ? e.style.arrowSize ?? 10 : 0,
    arrowWidth: e.style.directional && e.style.lineWidth > 0 ? e.style.arrowWidth ?? 2 : 0,
    // Keep direction available throughout a fade-out; size and width fade to zero.
    directional: Boolean(e.style.directional || e.id.startsWith('a') || e.id.startsWith('path-') || 'cap' in e),
  } })) };
}

// Follow the actual directed arcs. In particular, undoing an eastward road uses
// east*-true, NOT the separate westward positive-cost road.
export function mouseHoleTravelRoute(c, graph, cue, view) {
  if (!cue?.edge) return [];
  const { u, v } = cue.edge, byId = new Map(graph.edges.map(e => [e.id, e]));
  if (view !== 'line') {
    const candidates = graph.edges.filter(e => e.source === u && e.target === v);
    const e = candidates.find(e => e.style.lineWidth > 0) ?? candidates[0];
    return e ? [e] : [];
  }
  let ids = [];
  if (u === 'S' && v.startsWith('m')) ids = [`sm${v.slice(1)}-false`];
  else if (v === 'S' && u.startsWith('m')) ids = [`sm${u.slice(1)}-true`];
  else if (v === 'T' && u.startsWith('h')) ids = [`ht${u.slice(1)}-false`];
  else if (u === 'T' && v.startsWith('h')) ids = [`ht${v.slice(1)}-true`];
  else if ((u.startsWith('m') && v.startsWith('h')) || (u.startsWith('h') && v.startsWith('m'))) {
    const reverse = u.startsWith('h'), i = Number((reverse ? v : u).slice(1)), j = Number((reverse ? u : v).slice(1));
    const zs = [...new Set([...c.mice, ...c.holes])].sort((a, b) => a - b);
    const a = zs.indexOf(c.mice[i]), b = zs.indexOf(c.holes[j]), roads = [];
    if (a < b) for (let k = a + 1; k <= b; k++) roads.push(`east${k}`);
    else for (let k = a; k > b; k--) roads.push(`west${k}`);
    const path = [`mz${i}`, ...roads, `zh${j}`];
    ids = (reverse ? path.reverse() : path).map(id => `${id}-${reverse}`);
  }
  return ids.map(id => byId.get(id)).filter(Boolean);
}

// PixiGraphRenderer.drawCurvedLine uses a cubic with both controls at the same
// perpendicular offset. Use that exact geometry, not an approximate straight hop.
export function travelGeometry(graph, route, progress) {
  const nodes = new Map(graph.nodes.map(n => [n.id, n]));
  const segments = route.map(e => {
    const a = nodes.get(e.source), b = nodes.get(e.target), curve = e.style.curvature ?? 0;
    const cx = (a.x + b.x) / 2 - (b.y - a.y) * curve, cy = (a.y + b.y) / 2 + (b.x - a.x) * curve;
    const at = t => curve ? { x: (1 - t) ** 3 * a.x + 3 * (1 - t) * t * cx + t ** 3 * b.x, y: (1 - t) ** 3 * a.y + 3 * (1 - t) * t * cy + t ** 3 * b.y } : { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    let length = 0, previous = at(0);
    const samples = [{ t: 0, length: 0 }];
    for (let k = 1; k <= 32; k++) { const p = at(k / 32); length += Math.hypot(p.x - previous.x, p.y - previous.y); samples.push({ t: k / 32, length }); previous = p; }
    return { id: e.id, d: curve ? `M${a.x},${a.y} C${cx},${cy} ${cx},${cy} ${b.x},${b.y}` : `M${a.x},${a.y} L${b.x},${b.y}`, at, length, samples };
  });
  const total = segments.reduce((s, e) => s + e.length, 0);
  let remaining = Math.max(0, Math.min(1, progress)) * total, point = null;
  const paths = segments.map(s => {
    const fraction = s.length ? Math.min(1, remaining / s.length) : 1;
    if (!point && remaining <= s.length) {
      const high = s.samples.find(p => p.length >= remaining) ?? s.samples.at(-1), k = s.samples.indexOf(high), low = s.samples[Math.max(0, k - 1)];
      point = s.at(low.t + (high.t - low.t) * (high.length === low.length ? 0 : (remaining - low.length) / (high.length - low.length)));
    }
    remaining = Math.max(0, remaining - s.length);
    return { id: s.id, d: s.d, fraction };
  });
  return { paths, point: point ?? segments.at(-1)?.at(1) };
}
