let cyLayout;

function addOrphans() {
  let count = 1;
  setInterval(() => {
    const newNode = createNode(`${1000 + count}`, `orphan${count}`, 3);
    if (!newNode.group) {
      newNode.group = 'nodes';
    }
    nodes.push(newNode);
    cy.add(newNode);
    refreshLayout();

    count++;
  }, 2000);
}

function createNode(id, name, age, childIds) {
  childIds = childIds || [];
  return {
    data: {
      id: id,
      name: name,
      age: age,
      childIds: childIds,
      parentIds: [],
    },
  };
}

function generateLinks(nodes) {
  const links = [];
  nodes.forEach((parentNode) => {
    parentNode.data.childIds.forEach((childNodeId) => {
      links.push({
        data: {
          source: parentNode.data.id,
          target: childNodeId,
          bendPoints: [],
        },
        bendPoints: [],
      });
    });
  });
  return links;
}

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

const nodes = [
  createNode('1', 'child1-1-1', 12),
  createNode('2', 'child1-2-1', 13),
  createNode('3', 'child1-2-2', 14),
  createNode('4', 'child1-2-3', 15),
  createNode('11', 'child1-1-1', 12),
  createNode('12', 'child1-2-1', 13),
  createNode('13', 'child1-2-2', 14),
  createNode('14', 'child1-2-3', 15),
  createNode('15', 'child2-1-1', 9),
  createNode('16', 'parent1-1', 45, ['11']),
  createNode('17', 'parent1-2', 20, ['12', '13', '14']),
  createNode('19', 'grandparent1', 74, ['16', '17']),
  createNode('6', 'parent1-1', 45, ['1', '11']),
  createNode('7', 'parent1-2', 20, ['2', '3', '4']),
  createNode('9', 'grandparent1', 74, ['6', '7']),
  createNode('18', 'parent2-1', 33, ['15']),
  createNode('110', 'grandparent2', 66, ['18']),
  createNode('21', 'child1-1-1', 12),
  createNode('22', 'child1-2-1', 13),
  createNode('23', 'child1-2-2', 14),
  createNode('24', 'child1-2-3', 15),
  createNode('25', 'child2-1-1', 9),
  createNode('26', 'parent1-1', 45, ['21']),
  createNode('27', 'parent1-2', 20, ['22', '23', '24']),
  createNode('28', 'parent2-1', 33, ['25']),
  createNode('29', 'grandparent1', 74, ['26', '27']),
  createNode('210', 'grandparent2', 66, ['28']),
];

const links = generateLinks(nodes);

//const elements = fetch('example-graphs/windows_cyto6624.json').then((res) => res.json());
const elements = fetch('example-graphs/windows_cyto25.json').then((res) => res.json());

const layoutOptions = {
  name: 'elk',
  fit: false,
  //ranker: 'longest-path',
  animate: true,
  //animationDuration: 300,
  //animationEasing: 'ease-in-out-cubic',
  elk: {
    //zoomToFit: true,
    algorithm: 'layered',
    //separateConnectedComponents: false,
  },
};

const cy = (window.cy = cytoscape({
  container: document.getElementById('cy'),
  layout: undefined,
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
