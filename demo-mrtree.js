cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/tree.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    elk: {
      algorithm: 'mrtree',
    },
  },
  style: [
    {
      selector: 'edge',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'downward',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.66,
      },
    },
  ],
});
