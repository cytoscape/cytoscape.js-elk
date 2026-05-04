import ELK from 'elkjs/lib/elk.bundled.js';
import assign from './assign';
import defaults from './defaults';

const elkOverrides = {};
const minSegmentWeight = 0.01;
const maxSegmentWeight = 0.99;

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

  // Apply nodeLayoutOptions per user-specified function
  // e.g. nodeLayoutOptions => n.scratch('layoutOptions')
  if (options.nodeLayoutOptions) {
    k.layoutOptions = options.nodeLayoutOptions(node);
  }

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

const getElkEdgePoints = function (elkEdge) {
  const sec = elkEdge.sections && elkEdge.sections[0];

  if (!sec || !sec.startPoint || !sec.endPoint) {
    return [];
  }

  const points = [sec.startPoint];
  const bends = sec.bendPoints || [];

  for (let i = 0; i < bends.length; i++) {
    points.push(bends[i]);
  }

  points.push(sec.endPoint);

  return points;
};

const fmtEndpoint = function (dx, dy) {
  return `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
};

const projectOntoLine = function (a, b, p) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;

  if (len2 < 0.001) {
    return {
      w: 0.5,
      d: 0,
    };
  }

  const w = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  const cross = dx * (p.y - a.y) - dy * (p.x - a.x);
  const d = cross / Math.sqrt(len2);

  return {
    w,
    d,
  };
};

const applyElkEdgeGeometry = function (edge, elkEdge, sourceCenter, targetCenter) {
  const points = getElkEdgePoints(elkEdge);

  if (points.length < 2) {
    return;
  }

  const [startPoint] = points;
  const endPoint = points[points.length - 1];
  const bends = points.slice(1, points.length - 1);

  const sourceEndpoint = fmtEndpoint(
    startPoint.x - sourceCenter.x,
    startPoint.y - sourceCenter.y
  );
  const targetEndpoint = fmtEndpoint(
    endPoint.x - targetCenter.x,
    endPoint.y - targetCenter.y
  );

  if (bends.length === 0) {
    edge.style({
      'curve-style': 'segments',
      'edge-distances': 'endpoints',
      'source-endpoint': sourceEndpoint,
      'target-endpoint': targetEndpoint,
      'segment-weights': '0.5',
      'segment-distances': '0',
    });

    return;
  }

  const segmentWeights = [];
  const segmentDistances = [];

  for (let i = 0; i < bends.length; i++) {
    const proj = projectOntoLine(startPoint, endPoint, bends[i]);
    const weight = Math.max(minSegmentWeight, Math.min(maxSegmentWeight, proj.w));

    segmentWeights.push(weight.toFixed(4));
    segmentDistances.push(proj.d.toFixed(2));
  }

  edge.style({
    'curve-style': 'segments',
    'edge-distances': 'endpoints',
    'source-endpoint': sourceEndpoint,
    'target-endpoint': targetEndpoint,
    'segment-weights': segmentWeights.join(' '),
    'segment-distances': segmentDistances.join(' '),
  });
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
    graph['layoutOptions'] = options.elk;

    elk
      .layout(graph)
      .then(() => {
        const nodePosLookup = {};

        nodes
          .filter((n) => !n.isParent())
          .forEach((n) => {
            nodePosLookup[n.id()] = getPos(n, options);
          });

        if (options.useElkEdgeGeometry) {
          const elkEdgeLookup = {};

          for (let i = 0; i < graph.edges.length; i++) {
            elkEdgeLookup[graph.edges[i].id] = graph.edges[i];
          }

          edges.forEach((edge) => {
            const elkEdge = elkEdgeLookup[edge.id()];
            const sourcePos = nodePosLookup[edge.source().id()];
            const targetPos = nodePosLookup[edge.target().id()];

            if (!elkEdge || !sourcePos || !targetPos) {
              return;
            }

            applyElkEdgeGeometry(edge, elkEdge, sourcePos, targetPos);
          });
        }

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
