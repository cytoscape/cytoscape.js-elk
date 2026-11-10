(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("elkjs/lib/elk.bundled.js"));
	else if(typeof define === 'function' && define.amd)
		define(["elkjs"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeElk"] = factory(require("elkjs/lib/elk.bundled.js"));
	else
		root["cytoscapeElk"] = factory(root["ELK"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__883__) {
return /******/ (function() { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because 'output.globalObject' reads 'this'.
/******/ 	var __webpack_modules__ = ({

/***/ 883:
/***/ (function(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__883__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function() { return module['default']; } :
/******/ 			function() { return module; };
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = function(exports, definition) {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
!function() {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ src; }
});

// EXTERNAL MODULE: external {"commonjs":"elkjs/lib/elk.bundled.js","commonjs2":"elkjs/lib/elk.bundled.js","amd":"elkjs","root":"ELK"}
var elk_bundled_js_amd_elkjs_root_ELK_ = __webpack_require__(883);
var elk_bundled_js_amd_elkjs_root_ELK_default = /*#__PURE__*/__webpack_require__.n(elk_bundled_js_amd_elkjs_root_ELK_);
;// ./src/assign.js
// Simple, internal Object.assign() polyfill for options objects etc.

function assign_assign(tgt) {
  for (var _len = arguments.length, srcs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }
  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });
  return tgt;
}
/* harmony default export */ var src_assign = (Object.assign != null ? Object.assign.bind(Object) : assign_assign);
;// ./src/defaults.js
var defaults = {
  nodeDimensionsIncludeLabels: false,
  // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true,
  // Whether to fit
  padding: 20,
  // Padding on fit
  animate: false,
  // Whether to transition the node positions
  animateFilter: function animateFilter() {
    return true;
  },
  // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500,
  // Duration of animation in ms if enabled
  animationEasing: undefined,
  // Easing of animation if enabled
  transform: function transform(node, pos) {
    return pos;
  },
  // A function that applies a transform to the final node position
  ready: undefined,
  // Callback on layoutready
  stop: undefined,
  // Callback on layoutstop
  nodeLayoutOptions: undefined,
  // Special options for only the nodes
  useElkEdgeGeometry: false,
  // Whether to apply ELK edge routes (sections) to Cytoscape segment geometry
  elkEdgeRadius: 0,
  // Corner radius for ELK edge routes; above 0 uses round-segments (Cytoscape 3.29+, ignored on older versions)
  elk: {
    // Options to pass directly to ELK `layoutOptions`. The subsequent identifier has to be used as property key in quotes.
    // E.g. for 'org.eclipse.elk.direction' use:
    // 'elk.direction'
    // Primary/mandatory, the elk algorithm to use
    // one of 'box', 'disco', 'force', 'layered', 'mrtree', 'radial', 'random', 'stress'
    // (see https://www.eclipse.org/elk/reference/algorithms.html)
    algorithm: undefined
  },
  priority: function priority() {
    return null;
  } // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};
/* harmony default export */ var src_defaults = (defaults);
;// ./src/layout.js
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
;


var elkOverrides = {};
var getPos = function getPos(ele, options) {
  var dims = ele.layoutDimensions(options);
  var parent = ele.parent();
  var k = ele.scratch('elk');
  var p = {
    x: k.x,
    y: k.y
  };
  while (parent.nonempty()) {
    var kp = parent.scratch('elk');
    p.x += kp.x;
    p.y += kp.y;
    parent = parent.parent();
  }

  // elk considers a node position to be its top-left corner, while cy is the centre
  p.x += dims.w / 2;
  p.y += dims.h / 2;
  return p;
};
var makeNode = function makeNode(node, options) {
  var k = {
    _cyEle: node,
    id: node.id()
  };

  // Apply nodeLayoutOptions per user-specified function
  // e.g. nodeLayoutOptions => n.scratch('layoutOptions')
  if (options.nodeLayoutOptions) {
    k.layoutOptions = options.nodeLayoutOptions(node);
  }
  if (!node.isParent()) {
    var dims = node.layoutDimensions(options);
    var p = node.position();

    // the elk position is the top-left corner, cy is the centre
    k.x = p.x - dims.w / 2;
    k.y = p.y - dims.h / 2;
    k.width = dims.w;
    k.height = dims.h;
  }
  node.scratch('elk', k);
  return k;
};
var makeEdge = function makeEdge(edge /*, options*/) {
  var k = {
    _cyEle: edge,
    id: edge.id(),
    source: edge.data('source'),
    target: edge.data('target')
  };
  edge.scratch('elk', k);
  return k;
};

// Absolute top-left origin of every ELK node, keyed by id. ELK child
// coordinates are relative to the parent, so the walk sums them up.
var getElkOrigins = function getElkOrigins(graph) {
  var origins = _defineProperty({}, graph.id, {
    x: 0,
    y: 0
  });
  var _walk = function walk(container, ox, oy) {
    var children = container.children || [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var x = ox + (child.x || 0);
      var y = oy + (child.y || 0);
      origins[child.id] = {
        x: x,
        y: y
      };
      _walk(child, x, y);
    }
  };
  _walk(graph, 0, 0);
  return origins;
};

// ELK writes section coordinates relative to `elkEdge.container`, which is
// the root unless both ends sit inside the same compound node.
var getElkEdgePoints = function getElkEdgePoints(elkEdge, origins, rootId) {
  var sec = elkEdge.sections && elkEdge.sections[0];
  if (!sec || !sec.startPoint || !sec.endPoint) {
    return [];
  }
  var container = elkEdge.container === undefined ? rootId : elkEdge.container;
  var origin = origins[container] || {
    x: 0,
    y: 0
  };
  var raw = [sec.startPoint].concat(sec.bendPoints || [], [sec.endPoint]);
  var points = [];
  for (var i = 0; i < raw.length; i++) {
    var p = {
      x: raw[i].x + origin.x,
      y: raw[i].y + origin.y
    };
    var last = points[points.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) {
      points.push(p);
    }
  }
  return points;
};
var fmtEndpoint = function fmtEndpoint(dx, dy) {
  return "".concat(dx.toFixed(1), "px ").concat(dy.toFixed(1), "px");
};
var projectOntoLine = function projectOntoLine(a, b, p) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  var len2 = dx * dx + dy * dy;
  if (len2 < 0.001) {
    return {
      w: 0.5,
      d: 0
    };
  }
  var w = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  var cross = dx * (p.y - a.y) - dy * (p.x - a.x);
  var d = cross / Math.sqrt(len2);
  return {
    w: w,
    d: d
  };
};

// Keep the caller's inline styles so disabling routing exposes the stylesheet
// again, rather than leaving the last ELK route attached to the edge.
var clearElkEdgeStyle = function clearElkEdgeStyle(edge) {
  var saved = edge.scratch('_elkEdgeStyle');
  if (!saved) {
    return;
  }
  Object.keys(saved.applied).forEach(function (name) {
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
var setElkEdgeStyle = function setElkEdgeStyle(edge, style) {
  var previous = {};
  Object.keys(style).forEach(function (name) {
    var property = edge.pstyle(name);
    if (property && property.bypass) {
      previous[name] = property.strValue;
    }
  });
  edge.style(style);
  var applied = {};
  Object.keys(style).forEach(function (name) {
    applied[name] = edge.style(name);
  });
  edge.scratch('_elkEdgeStyle', {
    previous: previous,
    applied: applied
  });
};
var applyElkEdgeGeometry = function applyElkEdgeGeometry(edge, points, sourceCenter, targetCenter, radius) {
  if (points.length < 2) {
    return;
  }
  var _points = _slicedToArray(points, 1),
    startPoint = _points[0];
  var endPoint = points[points.length - 1];
  var bends = points.slice(1, points.length - 1);
  var sourceEndpoint = fmtEndpoint(startPoint.x - sourceCenter.x, startPoint.y - sourceCenter.y);
  var targetEndpoint = fmtEndpoint(endPoint.x - targetCenter.x, endPoint.y - targetCenter.y);
  var segmentWeights = [];
  var segmentDistances = [];
  for (var i = 0; i < bends.length; i++) {
    var proj = projectOntoLine(startPoint, endPoint, bends[i]);
    var weight = proj.w.toFixed(4);
    var distance = proj.d.toFixed(2);

    // Weights outside 0..1 are valid (placed beyond the start or end) and
    // Cytoscape renders them correctly. We remove weights that would place a
    // bend exactly at an endpoint, because shortenIntersection then fails and
    // the edge is not drawn at all.
    if ((Number(weight) === 0 || Number(weight) === 1) && Number(distance) === 0) {
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
      'target-endpoint': targetEndpoint
    });
    return;
  }
  var style = {
    'curve-style': radius > 0 ? 'round-segments' : 'segments',
    'edge-distances': 'endpoints',
    'source-endpoint': sourceEndpoint,
    'target-endpoint': targetEndpoint,
    'segment-weights': segmentWeights.join(' '),
    'segment-distances': segmentDistances.join(' ')
  };
  if (radius > 0) {
    style['segment-radii'] = String(radius);
    style['radius-type'] = 'arc-radius';
  }
  setElkEdgeStyle(edge, style);
};
var supportsRoundSegments = function supportsRoundSegments(cy) {
  var names = cy.style().propertyNames;
  return Array.isArray(names) && names.indexOf('segment-radii') >= 0;
};
var makeGraph = function makeGraph(nodes, edges, options) {
  var elkNodes = [];
  var elkEdges = [];
  var elkEleLookup = {};
  var graph = {
    id: 'root',
    children: [],
    edges: []
  };

  // map all nodes
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var k = makeNode(n, options);
    elkNodes.push(k);
    elkEleLookup[n.id()] = k;
  }

  // map all edges
  for (var _i = 0; _i < edges.length; _i++) {
    var e = edges[_i];
    var _k = makeEdge(e, options);
    elkEdges.push(_k);
    elkEleLookup[e.id()] = _k;
  }

  // make hierarchy
  for (var _i2 = 0; _i2 < elkNodes.length; _i2++) {
    var _k2 = elkNodes[_i2];
    var _n = _k2._cyEle;
    if (!_n.isChild()) {
      graph.children.push(_k2);
    } else {
      var parent = _n.parent();
      var parentK = elkEleLookup[parent.id()];
      var children = parentK.children = parentK.children || [];
      children.push(_k2);
    }
  }
  for (var _i3 = 0; _i3 < elkEdges.length; _i3++) {
    var _k3 = elkEdges[_i3];

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
    graph.edges.push(_k3);
    //}
  }
  return graph;
};
var Layout = /*#__PURE__*/function () {
  function Layout(options) {
    _classCallCheck(this, Layout);
    var elkOptions = options.elk;
    var cy = options.cy;
    this.options = src_assign({}, src_defaults, options);
    this.options.elk = src_assign({
      aspectRatio: cy.width() / cy.height()
    }, src_defaults.elk, elkOptions, elkOverrides);
  }
  return _createClass(Layout, [{
    key: "run",
    value: function run() {
      var layout = this;
      var options = this.options;
      var eles = options.eles;
      var nodes = eles.nodes();
      var edges = eles.edges();
      var elk = new (elk_bundled_js_amd_elkjs_root_ELK_default())();
      var graph = makeGraph(nodes, edges, options);
      graph['layoutOptions'] = options.elk;
      elk.layout(graph).then(function () {
        var nodePosLookup = {};
        nodes.filter(function (n) {
          return !n.isParent();
        }).forEach(function (n) {
          nodePosLookup[n.id()] = getPos(n, options);
        });
        var styleEnabled = options.cy.styleEnabled();
        if (styleEnabled) {
          edges.forEach(clearElkEdgeStyle);
        }
        if (options.useElkEdgeGeometry && styleEnabled) {
          var elkEdgeLookup = {};
          var origins = getElkOrigins(graph);
          // `round-segments` and `segment-radii` arrived together in Cytoscape
          // 3.29. Older versions reject `curve-style: round-segments` as an
          // invalid style, and the edge would then fall back to its stylesheet
          // curve style and lose the route. So on older versions the radius is
          // ignored and the route is drawn with `segments`.
          var radius = supportsRoundSegments(options.cy) ? options.elkEdgeRadius || 0 : 0;
          for (var i = 0; i < graph.edges.length; i++) {
            elkEdgeLookup[graph.edges[i].id] = graph.edges[i];
          }
          edges.forEach(function (edge) {
            var elkEdge = elkEdgeLookup[edge.id()];
            var sourcePos = nodePosLookup[edge.source().id()];
            var targetPos = nodePosLookup[edge.target().id()];
            if (edge.isLoop() || !elkEdge || !sourcePos || !targetPos) {
              return;
            }
            var rawPoints = getElkEdgePoints(elkEdge, origins, graph.id);
            // Interior points use the source node as the transform context;
            // the target endpoint uses the target node, like its center.
            var transform = function transform(node, point) {
              return options.transform ? options.transform(node, {
                x: point.x,
                y: point.y
              }) : point;
            };
            var points = rawPoints.map(function (point, i) {
              return transform(i === rawPoints.length - 1 ? edge.target() : edge.source(), point);
            });
            applyElkEdgeGeometry(edge, points, transform(edge.source(), sourcePos), transform(edge.target(), targetPos), radius);
          });
        }
        nodes.filter(function (n) {
          return !n.isParent();
        }).layoutPositions(layout, options, function (n) {
          return getPos(n, options);
        });
      });
      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      return this; // chaining
    }
  }, {
    key: "destroy",
    value: function destroy() {
      return this; // chaining
    }
  }]);
}();
/* harmony default export */ var layout = (Layout);
;// ./src/index.js


// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'elk', layout); // register with cytoscape.js
};
if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  // eslint-disable-next-line no-undef
  register(cytoscape);
}
/* harmony default export */ var src = (register);
}();
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});