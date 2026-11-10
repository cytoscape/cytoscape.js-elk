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

// Absolute top-left origin of every ELK node, keyed by id. ELK child
// coordinates are relative to the parent, so the walk sums them up.
const getElkOrigins = function (graph) {
  const origins = { [graph.id]: { x: 0, y: 0 } };

  const walk = function (container, ox, oy) {
    const children = container.children || [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const x = ox + (child.x || 0);
      const y = oy + (child.y || 0);

      origins[child.id] = { x, y };

      walk(child, x, y);
    }
  };

  walk(graph, 0, 0);

  return origins;
};

// ELK writes section coordinates relative to `elkEdge.container`, which is
// the root unless both ends sit inside the same compound node.
const getElkEdgePoints = function (elkEdge, origins, rootId) {
  const sec = elkEdge.sections && elkEdge.sections[0];

  if (!sec || !sec.startPoint || !sec.endPoint) {
    return [];
  }

  const container = elkEdge.container === undefined ? rootId : elkEdge.container;
  const origin = origins[container] || { x: 0, y: 0 };
  const raw = [sec.startPoint].concat(sec.bendPoints || [], [sec.endPoint]);
  const points = [];

  for (let i = 0; i < raw.length; i++) {
    const p = { x: raw[i].x + origin.x, y: raw[i].y + origin.y };
    const last = points[points.length - 1];

    if (!last || last.x !== p.x || last.y !== p.y) {
      points.push(p);
    }
  }

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

// Keep the caller's inline styles so disabling routing exposes the stylesheet
// again, rather than leaving the last ELK route attached to the edge.
const clearElkEdgeStyle = function (edge) {
  const saved = edge.scratch('_elkEdgeStyle');

  if (!saved) {
    return;
  }

  Object.keys(saved.applied).forEach((name) => {
    // Preserve styles the caller has changed since this layout ran.
    if (edge.style(name) === saved.applied[name]) {
      edge.removeStyle(name);

      if (saved.previous[name] !== undefined) {
        edge.style(name, saved.previous[name]);
      }
    }
  });
  edge.removeScratch('_elkEdgeStyle');
};

const setElkEdgeStyle = function (edge, style) {
  const previous = {};

  Object.keys(style).forEach((name) => {
    const property = edge.pstyle(name);

    if (property && property.bypass) {
      previous[name] = property.strValue;
    }
  });

  edge.style(style);

  const applied = {};
  Object.keys(style).forEach((name) => {
    applied[name] = edge.style(name);
  });

  edge.scratch('_elkEdgeStyle', { previous, applied });
};

const applyElkEdgeGeometry = function (edge, points, sourceCenter, targetCenter, radius) {
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

  const segmentWeights = [];
  const segmentDistances = [];

  for (let i = 0; i < bends.length; i++) {
    const proj = projectOntoLine(startPoint, endPoint, bends[i]);
    const weight = proj.w.toFixed(4);
    const distance = proj.d.toFixed(2);

    // Weights outside 0..1 are valid (placed beyond the start or end) and
    // Cytoscape renders them correctly. We remove weights that would place a
    // bend exactly at an endpoint, because shortenIntersection then fails and
    // the edge is not drawn at all.
    if (
      (Number(weight) === 0 || Number(weight) === 1) &&
      Number(distance) === 0
    ) {
      continue;
    }

    segmentWeights.push(weight);
    segmentDistances.push(distance);
  }

  if (segmentWeights.length === 0) {
    setElkEdgeStyle(edge, {
      'curve-style': 'straight',
      'edge-distances': 'endpoints',
      'source-endpoint': sourceEndpoint,
      'target-endpoint': targetEndpoint,
    });

    return;
  }

  const style = {
    'curve-style': radius > 0 ? 'round-segments' : 'segments',
    'edge-distances': 'endpoints',
    'source-endpoint': sourceEndpoint,
    'target-endpoint': targetEndpoint,
    'segment-weights': segmentWeights.join(' '),
    'segment-distances': segmentDistances.join(' '),
  };

  if (radius > 0) {
    style['segment-radii'] = String(radius);
    style['radius-type'] = 'arc-radius';
  }

  setElkEdgeStyle(edge, style);
};

const supportsRoundSegments = function (cy) {
  const names = cy.style().propertyNames;

  return Array.isArray(names) && names.indexOf('segment-radii') >= 0;
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

        const styleEnabled = options.cy.styleEnabled();

        if (styleEnabled) {
          edges.forEach(clearElkEdgeStyle);
        }

        if (options.useElkEdgeGeometry && styleEnabled) {
          const elkEdgeLookup = {};
          const origins = getElkOrigins(graph);
          // `round-segments` and `segment-radii` arrived together in Cytoscape
          // 3.29. Older versions reject `curve-style: round-segments` as an
          // invalid style, and the edge would then fall back to its stylesheet
          // curve style and lose the route. So on older versions the radius is
          // ignored and the route is drawn with `segments`.
          const radius = supportsRoundSegments(options.cy)
            ? options.elkEdgeRadius || 0
            : 0;

          for (let i = 0; i < graph.edges.length; i++) {
            elkEdgeLookup[graph.edges[i].id] = graph.edges[i];
          }

          edges.forEach((edge) => {
            const elkEdge = elkEdgeLookup[edge.id()];
            const sourcePos = nodePosLookup[edge.source().id()];
            const targetPos = nodePosLookup[edge.target().id()];

            if (edge.isLoop() || !elkEdge || !sourcePos || !targetPos) {
              return;
            }

            const rawPoints = getElkEdgePoints(elkEdge, origins, graph.id);
            // Interior points use the source node as the transform context;
            // the target endpoint uses the target node, like its center.
            const transform = (node, point) => options.transform
              ? options.transform(node, { x: point.x, y: point.y })
              : point;
            const points = rawPoints.map((point, i) => transform(
              i === rawPoints.length - 1 ? edge.target() : edge.source(),
              point
            ));

            applyElkEdgeGeometry(
              edge,
              points,
              transform(edge.source(), sourcePos),
              transform(edge.target(), targetPos),
              radius
            );
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
