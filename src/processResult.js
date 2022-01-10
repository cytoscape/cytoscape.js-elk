/**
  This file includes functions to get node positions and
  process edge information to make use of bend points if available
*/

/** functions required to convert bend points to segment/control points **/

const getSrcTgtPointsAndTangents = function (srcPoint, tgtPoint) {
  let m1 = (tgtPoint.y - srcPoint.y) / (tgtPoint.x - srcPoint.x);
  let m2 = -1 / m1;

  return {
    m1: m1,
    m2: m2,
    srcPoint: srcPoint,
    tgtPoint: tgtPoint
  };
};

const getIntersection = function(anchor, srcTgtPointsAndTangents){
  let srcPoint = srcTgtPointsAndTangents.srcPoint;
  let tgtPoint = srcTgtPointsAndTangents.tgtPoint;
  let m1 = srcTgtPointsAndTangents.m1;
  let m2 = srcTgtPointsAndTangents.m2;

  let intersectX;
  let intersectY;

  if(m1 == Infinity || m1 == -Infinity){
    intersectX = srcPoint.x;
    intersectY = anchor.y;
  }
  else if(m1 == 0){
    intersectX = anchor.x;
    intersectY = srcPoint.y;
  }
  else {
    let a1 = srcPoint.y - m1 * srcPoint.x;
    let a2 = anchor.y - m2 * anchor.x;

    intersectX = (a2 - a1) / (m1 - m2);
    intersectY = m1 * intersectX + a1;
  }

  //Intersection point is the intersection of the lines passing through the nodes and
  //passing through the bend or control point and perpendicular to the other line
  let intersectionPoint = {
    x: intersectX,
    y: intersectY
  };
  
  return intersectionPoint;
};

const getLineDirection = function(srcPoint, tgtPoint){
  if(srcPoint.y == tgtPoint.y && srcPoint.x < tgtPoint.x){
    return 1;
  }
  if(srcPoint.y < tgtPoint.y && srcPoint.x < tgtPoint.x){
    return 2;
  }
  if(srcPoint.y < tgtPoint.y && srcPoint.x == tgtPoint.x){
    return 3;
  }
  if(srcPoint.y < tgtPoint.y && srcPoint.x > tgtPoint.x){
    return 4;
  }
  if(srcPoint.y == tgtPoint.y && srcPoint.x > tgtPoint.x){
    return 5;
  }
  if(srcPoint.y > tgtPoint.y && srcPoint.x > tgtPoint.x){
    return 6;
  }
  if(srcPoint.y > tgtPoint.y && srcPoint.x == tgtPoint.x){
    return 7;
  }
  return 8; //if srcPoint.y > tgtPoint.y and srcPoint.x < tgtPoint.x
};

const convertToRelativePosition = function (anchor, srcTgtPointsAndTangents) {
  let intersectionPoint = getIntersection(anchor, srcTgtPointsAndTangents);
  let intersectX = intersectionPoint.x;
  let intersectY = intersectionPoint.y;
  
  let srcPoint = srcTgtPointsAndTangents.srcPoint;
  let tgtPoint = srcTgtPointsAndTangents.tgtPoint;
  
  let weight;
  
  if( intersectX != srcPoint.x ) {
    weight = (intersectX - srcPoint.x) / (tgtPoint.x - srcPoint.x);
  }
  else if( intersectY != srcPoint.y ) {
    weight = (intersectY - srcPoint.y) / (tgtPoint.y - srcPoint.y);
  }
  else {
    weight = 0;
  }
  
  let distance = Math.sqrt(Math.pow((intersectY - anchor.y), 2)
      + Math.pow((intersectX - anchor.x), 2));
  
  //Get the direction of the line form source point to target point
  let direction1 = getLineDirection(srcPoint, tgtPoint);
  //Get the direction of the line from intesection point to the point
  let direction2 = getLineDirection(intersectionPoint, anchor);
  
  //If the difference is not -2 and not 6 then the direction of the distance is negative
  if(direction1 - direction2 != -2 && direction1 - direction2 != 6){
    if(distance != 0)
      distance = -1 * distance;
  }
  
  return {
    weight: weight,
    distance: distance
  };
};

const convertToRelativePositions = function (anchorPoints, srcPoint, tgtPoint) {
  let srcTgtPointsAndTangents = getSrcTgtPointsAndTangents(srcPoint, tgtPoint);

  let weights = [];
  let distances = [];

  for (let i = 0; anchorPoints && i < anchorPoints.length; i++) {
    let anchor = anchorPoints[i];
    let relativeAnchorPosition = convertToRelativePosition(anchor, srcTgtPointsAndTangents);

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

// layout sometimes returns edges in a tangled way
// this function reorders edges by adjusting their points to reduce edge-edge crossings
const reorderEdges = function (options) {
  const {eles} = options;
  const nodes = eles.nodes();
  const edges = eles.edges();
  const cy = options.cy;

  if (options.elk['elk.edgeRouting'] != 'UNDEFINED') {
    let axis = 'y';
    let antiAxis = 'x';
    if (options.elk['elk.direction'] == 'UP' || options.elk['elk.direction'] == 'DOWN') {
      axis = 'x';
      antiAxis = 'y';
    }

    // adjust edges
    nodes.forEach(function(node) {
      let connectedEdges = node.connectedEdges().intersection(edges);
      let firstSideEdges = cy.collection(); // edges incoming/outgoing from up/left
      let secondSideEdges = cy.collection();  // edges incoming/outgoing from down/right
      let incomingEdges = new Set();
      let outgoingEdges = new Set();
      connectedEdges.forEach(function(edge) {
        let edgeSection = edge.scratch('elk').sections[0];
        if (edgeSection.incomingShape == node.id()) {
          outgoingEdges.add(edge.id());
          if (getPos(node, options)[antiAxis] < edgeSection.startPoint[antiAxis]) {
            secondSideEdges.merge(edge);
          }
          else {
            firstSideEdges.merge(edge);
          }
        }
        else {
          incomingEdges.add(edge.id());
          if (getPos(node, options)[antiAxis] < edgeSection.endPoint[antiAxis]) {
            secondSideEdges.merge(edge);
          }
          else {
            firstSideEdges.merge(edge);
          }
        }
      });

      // sort appropriate bend points (or start point if bend doesn't exist) in the first side
      if(firstSideEdges.length > 0) {
        let edgeFirstSideBendPoints = [];
        firstSideEdges.forEach(function(edge){
          let edgeSection = edge.scratch('elk').sections[0];
          if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[1]);
            }
            else {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 2]);
            }
          }
          else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[0]);
            }
            else {
              edgeFirstSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 1]);
            }
          }
          else {
            if (outgoingEdges.has(edge.id())) {
              edgeFirstSideBendPoints.push(edgeSection.endPoint);
            }
            else {
              edgeFirstSideBendPoints.push(edgeSection.startPoint);
            }
          }
        });

        edgeFirstSideBendPoints.sort(function(a, b) {
          return a[axis] - b[axis];
        });
        let edgeFirstSideBendPointsOrdered = JSON.parse(JSON.stringify(edgeFirstSideBendPoints));

        // sort endpoints in the first side
        let edgeFirstSideEndpoints = [];

        firstSideEdges.forEach(function(edge){
          if (outgoingEdges.has(edge.id())) {
            edgeFirstSideEndpoints.push(edge.scratch('elk').sections[0].startPoint);
          }
          else {
            edgeFirstSideEndpoints.push(edge.scratch('elk').sections[0].endPoint);
          }
        });

        edgeFirstSideEndpoints.sort(function(a, b) {
          return a[axis] - b[axis];
        });
        let edgeFirstSideEndpointsOrdered = JSON.parse(JSON.stringify(edgeFirstSideEndpoints));

        // assign scratch data for the first side
        firstSideEdges.forEach(function(edge) {
          let edgeSection = edge.scratch('elk').sections[0];
          edgeFirstSideBendPointsOrdered.forEach(function(bend, i){
            let firstBend;
            if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[1];
              }
              else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 2];
              }
            }
            else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[0];
              }
              else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 1];
              }
            }
            else {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.endPoint;
              }
              else {
                firstBend = edgeSection.startPoint;
              }
            }
            if( JSON.stringify(firstBend) === JSON.stringify(bend) ) {
              if (outgoingEdges.has(edge.id())) {
                edgeSection.startPoint[axis] = edgeFirstSideEndpointsOrdered[i][axis];
                if ( options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints)
                  edgeSection.bendPoints[0][axis] = edgeFirstSideEndpointsOrdered[i][axis];
              }
              else {
                edgeSection.endPoint[axis] = edgeFirstSideEndpointsOrdered[i][axis];
                if ( options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints)
                  edgeSection.bendPoints[edgeSection.bendPoints.length - 1][axis] = edgeFirstSideEndpointsOrdered[i][axis];
              }
            }
          });
        });
      }

      // sort appropriate bend points (or start point if bend doesn't exist) in the second side
      if(secondSideEdges.length > 0) {
        let edgeSecondSideBendPoints = [];
        secondSideEdges.forEach(function(edge){
          let edgeSection = edge.scratch('elk').sections[0];
          if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[1]);
            }
            else {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 2]);
            }
          }
          else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[0]);
            }
            else {
              edgeSecondSideBendPoints.push(edgeSection.bendPoints[edgeSection.bendPoints.length - 1]);
            }
          }
          else {
            if (outgoingEdges.has(edge.id())) {
              edgeSecondSideBendPoints.push(edgeSection.endPoint);
            }
            else {
              edgeSecondSideBendPoints.push(edgeSection.startPoint);
            }
          }
        });

        edgeSecondSideBendPoints.sort(function(a, b) {
          return a[axis] - b[axis];
        });
        let edgeSecondSideBendPointsOrdered = JSON.parse(JSON.stringify(edgeSecondSideBendPoints));

        // sort endpoints in the first side
        let edgeSecondSideEndpoints = [];

        secondSideEdges.forEach(function(edge){
          if (outgoingEdges.has(edge.id())) {
            edgeSecondSideEndpoints.push(edge.scratch('elk').sections[0].startPoint);
          }
          else {
            edgeSecondSideEndpoints.push(edge.scratch('elk').sections[0].endPoint);
          }
        });

        edgeSecondSideEndpoints.sort(function(a, b) {
          return a[axis] - b[axis];
        });
        let edgeSecondSideEndpointsOrdered = JSON.parse(JSON.stringify(edgeSecondSideEndpoints));

        // assign scratch data for the first side
        secondSideEdges.forEach(function(edge) {
          let edgeSection = edge.scratch('elk').sections[0];
          edgeSecondSideBendPointsOrdered.forEach(function(bend, i){
            let firstBend;
            if (edgeSection.bendPoints && edgeSection.bendPoints.length > 1 && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[1];
              }
              else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 2];
              }
            }
            else if (edgeSection.bendPoints && edgeSection.bendPoints.length > 0 && options.elk['elk.edgeRouting'] == 'POLYLINE') {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.bendPoints[0];
              }
              else {
                firstBend = edgeSection.bendPoints[edgeSection.bendPoints.length - 1];
              }
            }
            else {
              if (outgoingEdges.has(edge.id())) {
                firstBend = edgeSection.endPoint;
              }
              else {
                firstBend = edgeSection.startPoint;
              }
            }
            if( JSON.stringify(firstBend) === JSON.stringify(bend) ) {
              if (outgoingEdges.has(edge.id())) {
                edgeSection.startPoint[axis] = edgeSecondSideEndpointsOrdered[i][axis];
                if ( options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints)
                  edgeSection.bendPoints[0][axis] = edgeSecondSideEndpointsOrdered[i][axis];
              }
              else {
                edgeSection.endPoint[axis] = edgeSecondSideEndpointsOrdered[i][axis];
                if ( options.elk['elk.edgeRouting'] == 'ORTHOGONAL' && edgeSection.bendPoints)
                  edgeSection.bendPoints[edgeSection.bendPoints.length - 1][axis] = edgeSecondSideEndpointsOrdered[i][axis];
              }
            }
          });
        });
      }
    });

    // add bends to straight (without bend point) edges if necessary in orthogonal case
    nodes.forEach(function(node) {
      let outgoers = node.outgoers();
      let outgoingEdges = outgoers.intersection(edges);

      outgoingEdges.forEach(function(edge) {
        let edgeSection = edge.scratch('elk').sections[0];
        if (!edgeSection.bendPoints && options.elk['elk.edgeRouting'] == 'ORTHOGONAL') {
          if (edgeSection.startPoint[axis] != edgeSection.endPoint[axis]) {
            let bendPoint1;
            let bendPoint2;
            if (axis == 'x') {
              bendPoint1 = {x: edgeSection.startPoint[axis], y: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2};
              bendPoint2 = {x: edgeSection.endPoint[axis], y: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2};
            }
            else {
              bendPoint1 = {x: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2, y: edgeSection.startPoint[axis]};
              bendPoint2 = {x: (edgeSection.startPoint[antiAxis] + edgeSection.endPoint[antiAxis]) / 2, y: edgeSection.endPoint[axis]};
            }
            edgeSection.bendPoints = [bendPoint1, bendPoint2];
          }
        }
      });
    });
  }
};

//  process edge to add required information for its new style
const processEdge = function (edge, options) {
  let e = edge.scratch('elk');
  let eInfo = e.sections[0];

  let sourcePos = getPos(options.cy.getElementById(e.source), options);
  let targetPos = getPos(options.cy.getElementById(e.target), options);

  let axis = 'y';
  let antiAxis = 'x';
  if (options.elk['elk.direction'] == 'UP' || options.elk['elk.direction'] == 'DOWN') {
    axis = 'x';
    antiAxis = 'y';
  }

  if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' || options.elk['elk.edgeRouting'] == 'POLYLINE') {
    if (eInfo.bendPoints) {
      e['elkCurveStyle'] = 'segments';
      e['elkEdgeDistances'] = 'node-position';
      let relativePositions = convertToRelativePositions(eInfo.bendPoints, sourcePos, targetPos);
      e['elkBendPointDistances'] = relativePositions.distances;
      e['elkBendPointWeights'] = relativePositions.weights;
    }
    else {
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
  }
  else if (options.elk['elk.edgeRouting'] == 'SPLINES') {
    if (eInfo.bendPoints && eInfo.bendPoints[eInfo.bendPoints.length - 1][antiAxis] !== eInfo.endPoint[antiAxis]) {
      e['elkCurveStyle'] = 'unbundled-bezier';
      e['elkEdgeDistances'] = 'node-position';
      eInfo.bendPoints.shift();
      let relativePositions = convertToRelativePositions(eInfo.bendPoints, sourcePos, targetPos);
      e['elkBendPointDistances'] = relativePositions.distances;
      e['elkBendPointWeights'] = relativePositions.weights;
    }
    else {
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
  }
  else {
    edge.removeClass('elk-edge');
    edge.removeScratch('elk');
  }
};

// relocates graph to its original center because elk moves graph's top-left to (0,0)
const relocateGraph = function(options) {
  let minXCoord = Number.POSITIVE_INFINITY;
  let maxXCoord = Number.NEGATIVE_INFINITY;
  let minYCoord = Number.POSITIVE_INFINITY;
  let maxYCoord = Number.NEGATIVE_INFINITY;

  // calculate current bounding box
  options.eles.nodes().forEach(function(node) {
    let dims = node.layoutDimensions(options);
    let leftX = getPos(node, options).x - dims.w / 2;
    let rightX = getPos(node, options).x + dims.w / 2;
    let topY = getPos(node, options).y - dims.h / 2;
    let bottomY = getPos(node, options).y + dims.h / 2;

    if (leftX < minXCoord)
      minXCoord = leftX;
    if (rightX > maxXCoord)
      maxXCoord = rightX;
    if (topY < minYCoord)
      minYCoord = topY;
    if (bottomY > maxYCoord)
      maxYCoord = bottomY;
  });

  // original center
  let oldBoundingBox = options.eles.boundingBox();
  let originalCenter = {x: oldBoundingBox.x1 + oldBoundingBox.w / 2, y: oldBoundingBox.y1 + oldBoundingBox.h / 2};

  // find difference between current and original center
  let diffOnX = originalCenter.x - (maxXCoord + minXCoord) / 2;
  let diffOnY = originalCenter.y - (maxYCoord + minYCoord) / 2;

  // move graph to its original center
  options.eles.nodes().forEach(function(node) {
    let k = node.scratch('elk');
    k.x += diffOnX;
    k.y += diffOnY;
  });
};

export { getPos, reorderEdges, processEdge, relocateGraph }
