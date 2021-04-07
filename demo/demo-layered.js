cytoscape({
  container: document.getElementById('cy'),
  //elements: fetch('example-graphs/planar-chain.json').then((res) => res.json()),
  //elements: fetch('example-graphs/windows_cyto.json').then((res) => res.json()),
  //elements: fetch('example-graphs/windows_cyto6624.json').then((res) => res.json()),
  elements: fetch('example-graphs/windows_cyto25.json').then((res) => res.json()),
  layout: {
    name: 'elk',
    elk: {
      algorithm: 'layered',
    },
  },
  style: [
    {
      selector: 'node:selected',
      style: {
        // label: 'data(id)',
        // 'font-size': '0.5em',
        'background-color': '#eeff00',
        'background-opacity': '0.5',
        // 'background-blacken': '0.5',
        'border-width': '1',
        'border-style': 'solid',
        'border-color': 'red',
      },

    },
    {
      selector: 'node',
      style: {
        // label: 'data(name)',
        'font-size': '0.5em',
        'background-color': '#94aaf3',
        // 'background-opacity': '0.5',
        // 'background-blacken': '-0.5',
        'border-width': '1',
        'border-style': 'solid',
        'border-color': 'black'
      },

    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'rightward',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.66,
      },
    },
  ],
});
