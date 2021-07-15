import ELK from 'elkjs/lib/elk.bundled.js';
import assign from './assign';
import defaults from './defaults';

const elkOverrides = {};

const getPos = function (ele, options) {
  const dims = ele.layoutDimensions(options);
  let parent = ele.parent();
  const k = ele.scratch('elk');

  const p = {
    x: k.x,
    y: k.y,
  };

  while (parent.nonempty()) {
    const kp = parent.scratch('elk');
    p.x += kp.x;
    p.y += kp.y;
    parent = parent.parent();
  }

  // elk considers a node position to be its top-left corner, while cy is the centre
  p.x += dims.w / 2;
  p.y += dims.h / 2;

  return p;
};

const makeNode = function (node, options) {
  const k = {
    _cyEle: node,
    id: node.id(),
  };

  if (!node.isParent()) {
    const dims = node.layoutDimensions(options);
    const p = node.position();

    // the elk position is the top-left corner, cy is the centre
    k.x = p.x - dims.w / 2;
    k.y = p.y - dims.h / 2;

    k.width = dims.w;
    k.height = dims.h;
  }

  node.scratch('elk', k);

  return k;
};

const makeEdge = function (edge /*, options*/) {
  const k = {
    _cyEle: edge,
    id: edge.id(),
    source: edge.data('source'),
    target: edge.data('target'),
  };

  edge.scratch('elk', k);

  return k;
};

const makeGraph = function (nodes, edges, options) {
  const elkNodes = [];
  const elkEdges = [];
  const elkEleLookup = {};
  const graph = {
    id: 'root',
    children: [],
    edges: [],
  };

  // map all nodes
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const k = makeNode(n, options);

    elkNodes.push(k);

    elkEleLookup[n.id()] = k;
  }

  // map all edges
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const k = makeEdge(e, options);

    elkEdges.push(k);

    elkEleLookup[e.id()] = k;
  }

  // make hierarchy
  for (let i = 0; i < elkNodes.length; i++) {
    const k = elkNodes[i];
    const n = k._cyEle;

    if (!n.isChild()) {
      graph.children.push(k);
    } else {
      const parent = n.parent();
      const parentK = elkEleLookup[parent.id()];

      const children = (parentK.children = parentK.children || []);

      children.push(k);
    }
  }

  for (let i = 0; i < elkEdges.length; i++) {
    const k = elkEdges[i];

    // put all edges in the top level for now
    // TODO does this cause issues in certain edgecases?
    /*let e = k._cyEle;
    let parentSrc = e.source().parent();
    let parentTgt = e.target().parent();
    if ( false && parentSrc.nonempty() && parentTgt.nonempty() && parentSrc.same( parentTgt ) ){
      let kp = elkEleLookup[ parentSrc.id() ];

      kp.edges = kp.edges || [];

      kp.edges.push( k );
    } else {*/
    graph.edges.push(k);
    //}
  }

  return graph;
};

class Layout {
  constructor(options) {
    const elkOptions = options.elk;
    const {cy} = options;

    this.options = assign({}, defaults, options);

    this.options.elk = assign(
      {
        aspectRatio: cy.width() / cy.height(),
      },
      defaults.elk,
      elkOptions,
      elkOverrides
    );
  }

  run() {
    const layout = this;
    const {options} = this;

    const {eles} = options;
    const nodes = eles.nodes();
    const edges = eles.edges();

    const elk = new ELK();
    const graph = makeGraph(nodes, edges, options);
    graph['layoutOptions'] = options.elk
    elk
      .layout(graph)
      .then(() => {
        nodes
          .filter((n) => !n.isParent())
          .layoutPositions(layout, options, (n) => getPos(n, options));
      });

    return this;
  }

  stop() {
    return this; // chaining
  }

  destroy() {
    return this; // chaining
  }
}

export default Layout;
