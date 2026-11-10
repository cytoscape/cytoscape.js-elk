cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/planar-chain.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    useElkEdgeGeometry: true,
    elk: {
      algorithm: 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
  },
  style: [
    {
      selector: 'edge',
      style: {
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.66,
      },
    },
  ],
});
