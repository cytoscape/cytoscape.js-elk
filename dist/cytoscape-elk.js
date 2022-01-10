(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("elkjs"));
	else if(typeof define === 'function' && define.amd)
		define(["elkjs"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeElk"] = factory(require("elkjs"));
	else
		root["cytoscapeElk"] = factory(root["ELK"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__245__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 245:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__245__;

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
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ src; }
});

// EXTERNAL MODULE: external {"commonjs":"elkjs","commonjs2":"elkjs","amd":"elkjs","root":"ELK"}
var external_commonjs_elkjs_commonjs2_elkjs_amd_elkjs_root_ELK_ = __webpack_require__(245);
var external_commonjs_elkjs_commonjs2_elkjs_amd_elkjs_root_ELK_default = /*#__PURE__*/__webpack_require__.n(external_commonjs_elkjs_commonjs2_elkjs_amd_elkjs_root_ELK_);
;// CONCATENATED MODULE: ./src/assign.js
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
;// CONCATENATED MODULE: ./src/defaults.js
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
  elk: {
    // Options to pass directly to ELK `layoutOptions`
    // the elk algorithm to use
    // one of 'box', 'disco', 'force', 'layered', 'mrtree', 'radial', 'random', 'stress'
    // (see https://www.eclipse.org/elk/reference/algorithms.html)
    algorithm: undefined
  },
  changeStyleAutomatically: false,
  // Whether to change edge styles automatically based on 'elk.edgeRouting' option supported in 'layered' algorithm
  priority: function priority() {
    return null;
  } // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled

};
/* harmony default export */ var src_defaults = (defaults);
;// CONCATENATED MODULE: ./src/processResult.js
/**
  This file includes functions to get node positions and
  process edge information to make use of bend points if available
*/

/** functions required to convert bend points to segment/control points **/
var getSrcTgtPointsAndTangents = function getSrcTgtPointsAndTangents(srcPoint, tgtPoint) {
  var m1 = (tgtPoint.y - srcPoint.y) / (tgtPoint.x - srcPoint.x);
  var m2 = -1 / m1;
  return {
    m1: m1,
    m2: m2,
    srcPoint: srcPoint,
    tgtPoint: tgtPoint
  };
};

var getIntersection = function getIntersection(anchor, srcTgtPointsAndTangents) {
  var srcPoint = srcTgtPointsAndTangents.srcPoint;
  var tgtPoint = srcTgtPointsAndTangents.tgtPoint;
  var m1 = srcTgtPointsAndTangents.m1;
  var m2 = srcTgtPointsAndTangents.m2;
  var intersectX;
  var intersectY;

  if (m1 == Infinity || m1 == -Infinity) {
    intersectX = srcPoint.x;
    intersectY = anchor.y;
  } else if (m1 == 0) {
    intersectX = anchor.x;
    intersectY = srcPoint.y;
  } else {
    var a1 = srcPoint.y - m1 * srcPoint.x;
    var a2 = anchor.y - m2 * anchor.x;
    intersectX = (a2 - a1) / (m1 - m2);
    intersectY = m1 * intersectX + a1;
  } //Intersection point is the intersection of the lines passing through the nodes and
  //passing through the bend or control point and perpendicular to the other line


  var intersectionPoint = {
    x: intersectX,
    y: intersectY
  };
  return intersectionPoint;
};

var getLineDirection = function getLineDirection(srcPoint, tgtPoint) {
  if (srcPoint.y == tgtPoint.y && srcPoint.x < tgtPoint.x) {
    return 1;
  }

  if (srcPoint.y < tgtPoint.y && srcPoint.x < tgtPoint.x) {
    return 2;
  }

  if (srcPoint.y < tgtPoint.y && srcPoint.x == tgtPoint.x) {
    return 3;
  }

  if (srcPoint.y < tgtPoint.y && srcPoint.x > tgtPoint.x) {
    return 4;
  }

  if (srcPoint.y == tgtPoint.y && srcPoint.x > tgtPoint.x) {
    return 5;
  }

  if (srcPoint.y > tgtPoint.y && srcPoint.x > tgtPoint.x) {
    return 6;
  }

  if (srcPoint.y > tgtPoint.y && srcPoint.x == tgtPoint.x) {
    return 7;
  }

  return 8; //if srcPoint.y > tgtPoint.y and srcPoint.x < tgtPoint.x
};

var convertToRelativePosition = function convertToRelativePosition(anchor, srcTgtPointsAndTangents) {
  var intersectionPoint = getIntersection(anchor, srcTgtPointsAndTangents);
  var intersectX = intersectionPoint.x;
  var intersectY = intersectionPoint.y;
  var srcPoint = srcTgtPointsAndTangents.srcPoint;
  var tgtPoint = srcTgtPointsAndTangents.tgtPoint;
  var weight;

  if (intersectX != srcPoint.x) {
    weight = (intersectX - srcPoint.x) / (tgtPoint.x - srcPoint.x);
  } else if (intersectY != srcPoint.y) {
    weight = (intersectY - srcPoint.y) / (tgtPoint.y - srcPoint.y);
  } else {
    weight = 0;
  }

  var distance = Math.sqrt(Math.pow(intersectY - anchor.y, 2) + Math.pow(intersectX - anchor.x, 2)); //Get the direction of the line form source point to target point

  var direction1 = getLineDirection(srcPoint, tgtPoint); //Get the direction of the line from intesection point to the point

  var direction2 = getLineDirection(intersectionPoint, anchor); //If the difference is not -2 and not 6 then the direction of the distance is negative

  if (direction1 - direction2 != -2 && direction1 - direction2 != 6) {
    if (distance != 0) distance = -1 * distance;
  }

  return {
    weight: weight,
    distance: distance
  };
};

var convertToRelativePositions = function convertToRelativePositions(anchorPoints, srcPoint, tgtPoint) {
  var srcTgtPointsAndTangents = getSrcTgtPointsAndTangents(srcPoint, tgtPoint);
  var weights = [];
  var distances = [];

  for (var i = 0; anchorPoints && i < anchorPoints.length; i++) {
    var anchor = anchorPoints[i];
    var relativeAnchorPosition = convertToRelativePosition(anchor, srcTgtPointsAndTangents);
    weights.push(relativeAnchorPosition.weight);
    distances.push(relativeAnchorPosition.distance);
  }

  return {
    weights: weights,
    distances: distances
  };
};
/**  End of section **/
//  get node position


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
  } // elk considers a node position to be its top-left corner, while cy is the centre


  p.x += dims.w / 2;
  p.y += dims.h / 2;
  return p;
}; // layout sometimes returns edges in a tangled way
// this function reorders edges by adjusting their points to reduce edge-edge crossings


var reorderEdges = function reorderEdges(options) {
  var eles = options.eles;
  var nodes = eles.nodes();
  var edges = eles.edges();
  var cy = options.cy;

  if (options.elk['elk.edgeRouting'] != 'UNDEFINED') {
    var axis = 'y';
    var antiAxis = 'x';

    if (options.elk['elk.direction'] == 'UP' || options.elk['elk.direction'] == 'DOWN') {
      axis = 'x';
      antiAxis = 'y';
    } // adjust edges


    nodes.forEach(function (node) {
      var connectedEdges = node.connectedEdges().intersection(edges);
      var firstSideEdges = cy.collection(); // edges incoming/outgoing from up/left

      var secondSideEdges = cy.collection(); // edges incoming/outgoing from down/right

      var incomingEdges = new Set();
      var outgoingEdges = new Set();
      connectedEdges.forEach(function (edge) {
        var edgeSection = edge.scratch('elk').sections[0];

        if (edgeSection.incomingShape == node.id()) {
          outgoingEdges.add(edge.id());

          if (getPos(node, options)[antiAxis] < edgeSection.startPoint[antiAxis]) {
            secondSideEdges.merge(edge);
          } else {
            firstSideEdges.merge(edge);
          }
        } else {
          incomingEdges.add(edge.id());

          if (getPos(node, options)[antiAxis] < edgeSection.endPoint[antiAxis]) {
            secondSideEdges.merge(edge);
          } else {
            firstSideEdges.merge(edge);
          }
        }
      }); // sort appropriate bend points (or start point if bend doesn't exist) in the first side

      if (firstSideEdges.length > 0) {
        var edgeFirstSideBendPoints = [];
        firstSideEdges.forEach(function (edge) {
          var edgeSection = edge.scratch('elk').sections[0];

          if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[1]);
            } else {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 2]);
            }
          } else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[0]);
            } else {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 1]);
            }
          } else {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.endPoint);
            } else {
              edgeFirstSideBendPoints.push(edgeSection.startPoint);
            }
          }
        });
        edgeFirstSideBendPoints.sort(function (a, b) {
          return a[axis] - b[axis];
        });
        var edgeFirstSideBendPointsOrdered = JSON.parse(JSON.stringify(edgeFirstSideBendPoints)); // sort endpoints in the first side

        var edgeFirstSideEndpoints = [];
        firstSideEdges.forEach(function (edge) {
          if (outgoingEdges.has(edge.id())) {
            edgeFirstSideEndpoints.push(edge.scratch('elk').sections[0].startPoint);
          } else {
            edgeFirstSideEndpoints.push(edge.scratch('elk').sections[0].endPoint);
          }
        });
        edgeFirstSideEndpoints.sort(function (a, b) {
          return a[axis] - b[axis];
        });
        var edgeFirstSideEndpointsOrdered = JSON.parse(JSON.stringify(edgeFirstSideEndpoints)); // assign scratch data for the first side

        firstSideEdges.forEach(function (edge) {
          var edgeSection = edge.scratch('elk').sections[0];
          edgeFirstSideBendPointsOrdered.forEach(function (bend, i) {
            var firstBend;

            if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[1];
              } else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 2];
              }
            } else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[0];
              } else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 1];
              }
            } else {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.endPoint;
              } else {
                firstBend = edgeSection.startPoint;
              }
            }

            if (JSON.stringify(firstBend) === JSON.stringify(bend)) {
              if (outgoingEdges.has(edge.id())) {
                edgeSection.startPoint[axis] = edgeFirstSideEndpointsOrdered[i][axis];
                if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints) edgeSection.bendPoints[0][axis] = edgeFirstSideEndpointsOrdered[i][axis];
              } else {
                edgeSection.endPoint[axis] = edgeFirstSideEndpointsOrdered[i][axis];
                if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints) edgeSection.bendPoints[edgeSection.bendPoints.length - 1][axis] = edgeFirstSideEndpointsOrdered[i][axis];
              }
            }
          });
        });
      } // sort appropriate bend points (or start point if bend doesn't exist) in the second side


      if (secondSideEdges.length > 0) {
        var edgeSecondSideBendPoints = [];
        secondSideEdges.forEach(function (edge) {
          var edgeSection = edge.scratch('elk').sections[0];

          if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[1]);
            } else {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 2]);
            }
          } else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[0]);
            } else {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 1]);
            }
          } else {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.endPoint);
            } else {
              edgeSecondSideBendPoints.push(edgeSection.startPoint);
            }
          }
        });
        edgeSecondSideBendPoints.sort(function (a, b) {
          return a[axis] - b[axis];
        });
        var edgeSecondSideBendPointsOrdered = JSON.parse(JSON.stringify(edgeSecondSideBendPoints)); // sort endpoints in the first side

        var edgeSecondSideEndpoints = [];
        secondSideEdges.forEach(function (edge) {
          if (outgoingEdges.has(edge.id())) {
            edgeSecondSideEndpoints.push(edge.scratch('elk').sections[0].startPoint);
          } else {
            edgeSecondSideEndpoints.push(edge.scratch('elk').sections[0].endPoint);
          }
        });
        edgeSecondSideEndpoints.sort(function (a, b) {
          return a[axis] - b[axis];
        });
        var edgeSecondSideEndpointsOrdered = JSON.parse(JSON.stringify(edgeSecondSideEndpoints)); // assign scratch data for the first side

        secondSideEdges.forEach(function (edge) {
          var edgeSection = edge.scratch('elk').sections[0];
          edgeSecondSideBendPointsOrdered.forEach(function (bend, i) {
            var firstBend;

            if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[1];
              } else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 2];
              }
            } else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[0];
              } else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 1];
              }
            } else {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.endPoint;
              } else {
                firstBend = edgeSection.startPoint;
              }
            }

            if (JSON.stringify(firstBend) === JSON.stringify(bend)) {
              if (outgoingEdges.has(edge.id())) {
                edgeSection.startPoint[axis] = edgeSecondSideEndpointsOrdered[i][axis];
                if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints) edgeSection.bendPoints[0][axis] = edgeSecondSideEndpointsOrdered[i][axis];
              } else {
                edgeSection.endPoint[axis] = edgeSecondSideEndpointsOrdered[i][axis];
                if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints) edgeSection.bendPoints[edgeSection.bendPoints.length - 1][axis] = edgeSecondSideEndpointsOrdered[i][axis];
              }
            }
          });
        });
      }
    }); // add bends to straight (without bend point) edges if necessary in orthogonal case

    nodes.forEach(function (node) {
      var outgoers = node.outgoers();
      var outgoingEdges = outgoers.intersection(edges);
      outgoingEdges.forEach(function (edge) {
        var edgeSection = edge.scratch('elk').sections[0];

        if (!edgeSection.bendPoints && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
          if (edgeSection.startPoint[axis] != edgeSection.endPoint[axis]) {
            var bendPoint1;
            var bendPoint2;

            if (axis == 'x') {
              bendPoint1 = {
                x: edgeSection.startPoint[axis],
                y: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2
              };
              bendPoint2 = {
                x: edgeSection.endPoint[axis],
                y: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2
              };
            } else {
              bendPoint1 = {
                x: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2,
                y: edgeSection.startPoint[axis]
              };
              bendPoint2 = {
                x: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2,
                y: edgeSection.endPoint[axis]
              };
            }

            edgeSection.bendPoints = [bendPoint1, bendPoint2];
          }
        }
      });
    });
  }
}; //  process edge to add required information for its new style


var processEdge = function processEdge(edge, options) {
  var e = edge.scratch('elk');
  var eInfo = e.sections[0];
  var sourcePos = getPos(options.cy.getElementById(e.source), options);
  var targetPos = getPos(options.cy.getElementById(e.target), options);
  var axis = 'y';
  var antiAxis = 'x';

  if (options.elk['elk.direction'] == 'UP' || options.elk['elk.direction'] == 'DOWN') {
    axis = 'x';
    antiAxis = 'y';
  }

  if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' || options.elk['elk.edgeRouting'] == 'POLYLINE') {
    if (eInfo.bendPoints) {
      e['elkCurveStyle'] = 'segments';
      e['elkEdgeDistances'] = 'node-position';
      var relativePositions = convertToRelativePositions(eInfo.bendPoints, sourcePos, targetPos);
      e['elkBendPointDistances'] = relativePositions.distances;
      e['elkBendPointWeights'] = relativePositions.weights;
    } else {
      e['elkCurveStyle'] = 'straight';
      e['elkEdgeDistances'] = 'node-position';
      e['elkBendPointDistances'] = [];
      e['elkBendPointWeights'] = [];
    }

    e['elkSourceEndpoint'] = [eInfo.startPoint.x - sourcePos.x, eInfo.startPoint.y - sourcePos.y];
    e['elkTargetEndpoint'] = [eInfo.endPoint.x - targetPos.x, eInfo.endPoint.y - targetPos.y];

    if (!edge.hasClass('elk-edge')) {
      edge.addClass('elk-edge');
    }
  } else if (options.elk['elk.edgeRouting'] == 'SPLINES') {
    if (eInfo.bendPoints && eInfo.bendPoints[eInfo.bendPoints.length - 1][antiAxis] !== eInfo.endPoint[antiAxis]) {
      e['elkCurveStyle'] = 'unbundled-bezier';
      e['elkEdgeDistances'] = 'node-position';
      eInfo.bendPoints.shift();

      var _relativePositions = convertToRelativePositions(eInfo.bendPoints, sourcePos, targetPos);

      e['elkBendPointDistances'] = _relativePositions.distances;
      e['elkBendPointWeights'] = _relativePositions.weights;
    } else {
      e['elkCurveStyle'] = 'straight';
      e['elkEdgeDistances'] = 'node-position';
      e['elkBendPointDistances'] = [];
      e['elkBendPointWeights'] = [];
    }

    e['elkSourceEndpoint'] = [eInfo.startPoint.x - sourcePos.x, eInfo.startPoint.y - sourcePos.y];
    e['elkTargetEndpoint'] = [eInfo.endPoint.x - targetPos.x, eInfo.endPoint.y - targetPos.y];

    if (!edge.hasClass('elk-edge')) {
      edge.addClass('elk-edge');
    }
  } else {
    edge.removeClass('elk-edge');
    edge.removeScratch('elk');
  }
}; // relocates graph to its original center because elk moves graph's top-left to (0,0)


var relocateGraph = function relocateGraph(options) {
  var minXCoord = Number.POSITIVE_INFINITY;
  var maxXCoord = Number.NEGATIVE_INFINITY;
  var minYCoord = Number.POSITIVE_INFINITY;
  var maxYCoord = Number.NEGATIVE_INFINITY; // calculate current bounding box

  options.eles.nodes().forEach(function (node) {
    var dims = node.layoutDimensions(options);
    var leftX = getPos(node, options).x - dims.w / 2;
    var rightX = getPos(node, options).x + dims.w / 2;
    var topY = getPos(node, options).y - dims.h / 2;
    var bottomY = getPos(node, options).y + dims.h / 2;
    if (leftX < minXCoord) minXCoord = leftX;
    if (rightX > maxXCoord) maxXCoord = rightX;
    if (topY < minYCoord) minYCoord = topY;
    if (bottomY > maxYCoord) maxYCoord = bottomY;
  }); // original center

  var oldBoundingBox = options.eles.boundingBox();
  var originalCenter = {
    x: oldBoundingBox.x1 + oldBoundingBox.w / 2,
    y: oldBoundingBox.y1 + oldBoundingBox.h / 2
  }; // find difference between current and original center

  var diffOnX = originalCenter.x - (maxXCoord + minXCoord) / 2;
  var diffOnY = originalCenter.y - (maxYCoord + minYCoord) / 2; // move graph to its original center

  options.eles.nodes().forEach(function (node) {
    var k = node.scratch('elk');
    k.x += diffOnX;
    k.y += diffOnY;
  });
};


;// CONCATENATED MODULE: ./src/layout.js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var elkOverrides = {};

var makeNode = function makeNode(node, options) {
  var k = {
    _cyEle: node,
    id: node.id()
  };

  if (!node.isParent()) {
    var dims = node.layoutDimensions(options);
    var p = node.position(); // the elk position is the top-left corner, cy is the centre

    k.x = p.x - dims.w / 2;
    k.y = p.y - dims.h / 2;
    k.width = dims.w;
    k.height = dims.h;
  }

  node.scratch('elk', k);
  return k;
};

var makeEdge = function makeEdge(edge
/*, options*/
) {
  var k = {
    _cyEle: edge,
    id: edge.id(),
    source: edge.data('source'),
    target: edge.data('target')
  };

  if (!edge.scratch('elk')) {
    edge.scratch('elk', k);
  } else {
    var e = edge.scratch('elk');
    e._cyEle = edge;
    e.id = edge.id();
    e.source = edge.data('source');
    e.target = edge.data('target');
    return e;
  }

  return k;
};

var makeGraph = function makeGraph(nodes, edges, options) {
  var elkNodes = [];
  var elkEdges = [];
  var elkEleLookup = {};
  var graph = {
    id: 'root',
    children: [],
    edges: []
  }; // map all nodes

  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var k = makeNode(n, options);
    elkNodes.push(k);
    elkEleLookup[n.id()] = k;
  } // map all edges


  for (var _i = 0; _i < edges.length; _i++) {
    var e = edges[_i];

    var _k = makeEdge(e, options);

    elkEdges.push(_k);
    elkEleLookup[e.id()] = _k;
  } // make hierarchy


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
    var _k3 = elkEdges[_i3]; // put all edges in the top level for now
    // TODO does this cause issues in certain edgecases?

    /*let e = k._cyEle;
    let parentSrc = e.source().parent();
    let parentTgt = e.target().parent();
    if ( false && parentSrc.nonempty() && parentTgt.nonempty() && parentSrc.same( parentTgt ) ){
      let kp = elkEleLookup[ parentSrc.id() ];
       kp.edges = kp.edges || [];
       kp.edges.push( k );
    } else {*/

    graph.edges.push(_k3); //}
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

  _createClass(Layout, [{
    key: "style",
    value: function style() {
      return [{
        selector: 'edge.elk-edge',
        style: {
          'curve-style': function curveStyle(edge) {
            return edge.scratch('elk')['elkCurveStyle'];
          },
          'edge-distances': function edgeDistances(edge) {
            return edge.scratch('elk')['elkEdgeDistances'];
          },
          'source-endpoint': function sourceEndpoint(edge) {
            return edge.scratch('elk')['elkSourceEndpoint'];
          },
          'target-endpoint': function targetEndpoint(edge) {
            return edge.scratch('elk')['elkTargetEndpoint'];
          },
          'segment-distances': function segmentDistances(edge) {
            return edge.scratch('elk')['elkBendPointDistances'];
          },
          'segment-weights': function segmentWeights(edge) {
            return edge.scratch('elk')['elkBendPointWeights'];
          },
          'control-point-distances': function controlPointDistances(edge) {
            return edge.scratch('elk')['elkBendPointDistances'];
          },
          'control-point-weights': function controlPointWeights(edge) {
            return edge.scratch('elk')['elkBendPointWeights'];
          }
        }
      }];
    }
  }, {
    key: "run",
    value: function run() {
      var _this = this;

      var layout = this;
      var options = this.options;
      var eles = options.eles;
      var nodes = eles.nodes();
      var edges = eles.edges();
      var elk = new (external_commonjs_elkjs_commonjs2_elkjs_amd_elkjs_root_ELK_default())();
      var graph = makeGraph(nodes, edges, options);
      graph['layoutOptions'] = options.elk;
      elk.layout(graph).then(function () {
        if (options.elk.algorithm == "layered") {
          reorderEdges(options);
          edges.forEach(function (e) {
            processEdge(e, options);
          });

          if (options.changeStyleAutomatically) {
            // check whether edge.elk-edge selector exists or not
            var isElkEdgeStyleExist = false;
            options.cy.json().style.forEach(function (style) {
              if (style.selector == 'edge.elk-edge') {
                isElkEdgeStyleExist = true;
              }
            });

            if (!isElkEdgeStyleExist) {
              var elkEdgeStyle = _this.style()[0];

              options.cy.style().selector(elkEdgeStyle.selector).style(elkEdgeStyle.style).update();
            } else {
              options.cy.style().update();
            }
          }
        } // move graph to its original center because elk moves its top-left to (0,0)


        relocateGraph(options);
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

  return Layout;
}();

/* harmony default export */ var layout = (Layout);
;// CONCATENATED MODULE: ./src/index.js
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