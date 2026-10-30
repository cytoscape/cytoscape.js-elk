// Compound nodes with ELK edge routes. ELK writes the route of an edge whose
// ends share a compound node relative to that compound node. Every edge here
// should start and end on the border of its own nodes, whether it lies in the
// root, in a group, in a nested group, or across groups.
const nodes = [
  { data: { id: 'g1', label: 'group 1' } },
  { data: { id: 'g2', label: 'group 2' } },
  { data: { id: 'g2a', label: 'group 2a', parent: 'g2' } },
  { data: { id: 'a', parent: 'g1' } },
  { data: { id: 'b', parent: 'g1' } },
  { data: { id: 'c', parent: 'g1' } },
  { data: { id: 'd', parent: 'g2' } },
  { data: { id: 'e', parent: 'g2a' } },
  { data: { id: 'f', parent: 'g2a' } },
  { data: { id: 'x' } },
  { data: { id: 'y' } },
];

const edges = [
  ['a', 'b'], // inside group 1
  ['a', 'c'],
  ['b', 'c'],
  ['d', 'e'], // across group 2 and group 2a
  ['e', 'f'], // inside the nested group 2a
  ['c', 'd'], // across group 1 and group 2
  ['x', 'a'], // root to group
  ['x', 'd'],
  ['f', 'y'], // nested group to root
  ['f', 'a'], // back edge
].map(([source, target]) => ({
  data: { id: `${source}-${target}`, source, target },
}));

cytoscape({
  container: document.getElementById('cy'),
  elements: { nodes, edges },
  layout: {
    name: 'elk',
    useElkEdgeGeometry: true,
    elkEdgeRadius: 6,
    // ELK does not know about labels, so leave room above each group's
    // children for the label that Cytoscape draws above the group.
    nodeLayoutOptions: (node) =>
      node.isParent()
        ? { 'elk.padding': '[top=32,left=12,bottom=12,right=12]' }
        : {},
    elk: {
      algorithm: 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    },
  },
  style: [
    {
      selector: 'node',
      style: {
        label: 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
      },
    },
    {
      selector: ':parent',
      style: {
        label: 'data(label)',
        'text-valign': 'top',
        'background-opacity': 0.1,
        padding: 12,
      },
    },
    {
      selector: 'edge',
      style: {
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.66,
      },
    },
  ],
});
