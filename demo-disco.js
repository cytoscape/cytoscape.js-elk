cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/two-planar-chains.json').then((res) =>
    res.json()
  ),
  layout: {
    name: 'elk',
    elk: {
      algorithm: 'disco',
      componentLayoutAlgorithm: 'stress',
    },
  },
  style: [
    {
      selector: 'edge',
      style: {},
    },
  ],
});
