cytoscape({
  container: document.getElementById('cy'),
  elements: fetch('example-graphs/planar-chain.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    elk: {
      algorithm: 'box',
    },
  },
  style: [
    {
      selector: 'node',
      style: {
        shape: 'rectangle',
        width: function (n) {
          return n.data('sbgnbbox').w;
        },
        height: function (n) {
          return n.data('sbgnbbox').h;
        },
      },
    },
    {
      selector: 'edge',
      style: {
        opacity: 0.5,
      },
    },
  ],
});
