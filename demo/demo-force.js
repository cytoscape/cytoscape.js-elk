cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/planar-chain.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    elk: {
      algorithm: 'force',
    },
  },
  style: [
    {
      selector: 'edge',
      style: {},
    },
  ],
});
