const assert = require('node:assert/strict');
const { test } = require('node:test');
const cytoscape = require('cytoscape');
const elk = require('..');

cytoscape.use(elk);

function graph(t, options = {}) {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: [
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { id: 'ab', source: 'a', target: 'b' } },
      { data: { id: 'ab2', source: 'a', target: 'b' } },
      { data: { id: 'ac', source: 'a', target: 'c' } },
      { data: { id: 'bc', source: 'b', target: 'c' } },
    ],
    ...options,
  });
  t.after(() => cy.destroy());
  return cy;
}

async function run(cy, options = {}) {
  const layout = cy.layout({
    name: 'elk',
    fit: false,
    useElkEdgeGeometry: true,
    elk: { algorithm: 'layered', 'elk.direction': 'RIGHT' },
    ...options,
  });
  const stopped = layout.pon('layoutstop');
  layout.run();
  await stopped;
}

function near(actual, expected, tolerance = 0.06) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
}

function endpoint(edge, end) {
  const offset = edge.numericStyle(`${end}-endpoint`);
  const center = edge[end]().position();
  return { x: center.x + offset[0], y: center.y + offset[1] };
}

function assertRoute(edge, points) {
  const start = endpoint(edge, 'source');
  const end = endpoint(edge, 'target');
  near(start.x, points[0].x);
  near(start.y, points[0].y);
  near(end.x, points[points.length - 1].x);
  near(end.y, points[points.length - 1].y);
  if (edge.style('curve-style') === 'straight') {
    assert.equal(points.length, 2);
    return;
  }
  const weights = edge.numericStyle('segment-weights');
  const distances = edge.numericStyle('segment-distances');
  assert.equal(weights.length, points.length - 2);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  weights.forEach((weight, i) => {
    near(start.x + weight * dx - distances[i] * dy / length, points[i + 1].x);
    near(start.y + weight * dy + distances[i] * dx / length, points[i + 1].y);
  });
}

function routePoints(edge, transform = p => p) {
  const route = edge.scratch('elk');
  const section = route.sections[0];
  let origin = { x: 0, y: 0 };
  if (route.container && route.container !== 'root') {
    let parent = edge.cy().getElementById(route.container);
    while (parent.nonempty()) {
      const position = parent.scratch('elk');
      origin.x += position.x;
      origin.y += position.y;
      parent = parent.parent();
    }
  }
  return [section.startPoint, ...(section.bendPoints || []), section.endPoint]
    .map(p => transform({ x: p.x + origin.x, y: p.y + origin.y }));
}

test('routes straight and bent parallel edges', async t => {
  const cy = graph(t);
  await run(cy);
  cy.edges().forEach(edge => assertRoute(edge, routePoints(edge)));
});

for (const [name, transform] of [
  ['rotation', p => ({ x: -p.y + 100, y: p.x - 50 })],
  ['reflection', p => ({ x: -p.x, y: p.y })],
]) {
  test(`keeps routes aligned after ${name}`, async t => {
    const cy = graph(t);
    await run(cy, { transform: (node, p) => transform(p) });
    cy.edges().forEach(edge => assertRoute(edge, routePoints(edge, transform)));
  });
}

test('removes route overrides and restores existing inline styles when disabled', async t => {
  const cy = graph(t);
  const edge = cy.$id('ac');
  edge.style({ 'curve-style': 'unbundled-bezier', 'line-color': 'red' });
  await run(cy, { elkEdgeRadius: 6 });
  assert.equal(edge.style('curve-style'), 'round-segments');
  await run(cy, { useElkEdgeGeometry: false });
  assert.equal(edge.style('curve-style'), 'unbundled-bezier');
  assert.equal(edge.style('source-endpoint'), 'outside-to-node');
  assert.equal(edge.style('line-color'), 'rgb(255,0,0)');
  // Removing route overrides must expose subsequent stylesheet changes.
  cy.style().selector('edge').style('target-endpoint', 'inside-to-node').update();
  assert.equal(edge.style('target-endpoint'), 'inside-to-node');
});

test('clears routes when the next algorithm supplies no sections', async t => {
  const cy = graph(t);
  const originalCurve = cy.$id('ab2').style('curve-style');
  await run(cy);
  await run(cy, { elk: { algorithm: 'box' } });
  assert.equal(cy.$id('ab2').style('curve-style'), originalCurve);
  assert.equal(cy.$id('ab2').style('source-endpoint'), 'outside-to-node');
});

test('preserves styles changed by the caller after routing', async t => {
  const cy = graph(t);
  await run(cy);
  cy.$id('ac').style('curve-style', 'unbundled-bezier');
  await run(cy, { useElkEdgeGeometry: false });
  assert.equal(cy.$id('ac').style('curve-style'), 'unbundled-bezier');
});

test('removes rounded bend styles when switching back to square bends', async t => {
  const cy = graph(t);
  const edge = cy.$id('ac');
  const originalRadius = edge.style('segment-radii');
  await run(cy, { elkEdgeRadius: 6 });
  assert.equal(edge.style('curve-style'), 'round-segments');
  await run(cy);
  assert.equal(edge.style('curve-style'), 'segments');
  assert.equal(edge.style('segment-radii'), originalRadius);
});

test('ignores the radius when round segments are unavailable', async t => {
  const cy = graph(t);
  const style = cy.style();
  style.propertyNames = style.propertyNames.filter(name => name !== 'segment-radii');
  await run(cy, { elkEdgeRadius: 6 });
  assert.equal(cy.$id('ac').style('curve-style'), 'segments');
});

test('leaves edge styles untouched when routing is not enabled', async t => {
  const cy = graph(t);
  const edge = cy.$id('ac');
  edge.style('curve-style', 'unbundled-bezier');
  await run(cy, { useElkEdgeGeometry: false });
  assert.equal(edge.style('curve-style'), 'unbundled-bezier');
  assert.equal(edge.style('source-endpoint'), 'outside-to-node');
});

test('keeps self loops on a supported curve style', async t => {
  const cy = graph(t);
  const loop = cy.add({ data: { id: 'loop', source: 'a', target: 'a' } });
  await run(cy);
  assert.equal(loop.style('curve-style'), 'bezier');
});

test('supports layouts with styling disabled', async t => {
  const cy = graph(t, { styleEnabled: false });
  await run(cy);
  cy.nodes().forEach(node => assert.ok(Number.isFinite(node.position('x'))));
});

test('routes edges within nested compounds and across group borders', async t => {
  const cy = graph(t, {
    elements: [
      { data: { id: 'g' } },
      { data: { id: 'nested', parent: 'g' } },
      { data: { id: 'a', parent: 'nested' } },
      { data: { id: 'b', parent: 'nested' } },
      { data: { id: 'c' } },
      { data: { id: 'ab', source: 'a', target: 'b' } },
      { data: { id: 'ab2', source: 'a', target: 'b' } },
      { data: { id: 'bc', source: 'b', target: 'c' } },
    ],
  });
  await run(cy, {
    elk: { algorithm: 'layered', 'elk.hierarchyHandling': 'INCLUDE_CHILDREN' },
  });
  cy.edges().forEach(edge => assertRoute(edge, routePoints(edge)));
});
