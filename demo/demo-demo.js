let cyLayout;

function refreshLayout(initial) {
  if (cyLayout) {
    cyLayout.stop();
  }

  if (initial) {
    cy.json(elements);
    cyLayout = cy.layout(layoutOptions);
  } else {
    layoutOptions.fit = false;
    cyLayout = cy.elements().makeLayout(layoutOptions);
  }

  cyLayout.run();
}


//const elements = fetch('example-graphs/windows_cyto6624.json').then((res) => res.json());
const elements = fetch('example-graphs/windows_cyto50.json').then((res) => res.json());

const layoutOptions = {
  name: 'elk',
  fit: true,
  //ranker: 'longest-path',
  animate: true,
  //animationDuration: 300,
  //animationEasing: 'ease-in-out-cubic',
  elk: {
    // zoomToFit: true,
    algorithm: 'layered',
    //separateConnectedComponents: false,
  },
};

const cy = (window.cy = cytoscape({
  container: document.getElementById('cy'),
  layout: layoutOptions,
  autoungrabify: true,
  autounselectify: true,
  style: [
    {
      selector: 'node:selected',
      style: {
        // label: 'data(id)',
        // 'font-size': '0.5em',
        'background-color': '#eeff00',
        'background-opacity': '0.5',
        // 'background-blacken': '0.5',
        'border-width': '3',
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

  elements: elements,
}));
refreshLayout(true);
//addOrphans();
