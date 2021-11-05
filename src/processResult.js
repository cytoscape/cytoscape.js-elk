/**
  This file includes functions to get node positions and
  process edge information to make use of bend points if available
*/

/** functions required to convert bend points to segment/control points **/

const getSrcTgtPointsAndTangents = function (edge, options) {
  let e = edge.scratch('elk');
  let sourceNode = options.cy.getElementById(e.source);
  let targetNode = options.cy.getElementById(e.target);

  let srcDims = sourceNode.layoutDimensions(options);
  let tgtDims = targetNode.layoutDimensions(options);
  
  let tgtPosition = targetNode.position();
  let srcPosition = sourceNode.position();
  
  let srcPoint = {x: sourceNode.scratch('elk').x + srcDims.w / 2, y: sourceNode.scratch('elk').y + srcDims.h / 2};
  let tgtPoint = {x: targetNode.scratch('elk').x + tgtDims.w / 2, y: targetNode.scratch('elk').y + tgtDims.h / 2};

  let m1 = (tgtPoint.y - srcPoint.y) / (tgtPoint.x - srcPoint.x);
  let m2 = -1 / m1;

  return {
    m1: m1,
    m2: m2,
    srcPoint: srcPoint,
    tgtPoint: tgtPoint
  };
};

const getIntersection = function(edge, point, srcTgtPointsAndTangents){
  if (srcTgtPointsAndTangents === undefined) {
    srcTgtPointsAndTangents = getSrcTgtPointsAndTangents(edge);
  }

  let srcPoint = srcTgtPointsAndTangents.srcPoint;
  let tgtPoint = srcTgtPointsAndTangents.tgtPoint;
  let m1 = srcTgtPointsAndTangents.m1;
  let m2 = srcTgtPointsAndTangents.m2;

  let intersectX;
  let intersectY;

  if(m1 == Infinity || m1 == -Infinity){
    intersectX = srcPoint.x;
    intersectY = point.y;
  }
  else if(m1 == 0){
    intersectX = point.x;
    intersectY = srcPoint.y;
  }
  else {
    let a1 = srcPoint.y - m1 * srcPoint.x;
    let a2 = point.y - m2 * point.x;

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

const convertToRelativePosition = function (edge, point, srcTgtPointsAndTangents) {
  if (srcTgtPointsAndTangents === undefined) {
    srcTgtPointsAndTangents = getSrcTgtPointsAndTangents(edge);
  }
  
  let intersectionPoint = getIntersection(edge, point, srcTgtPointsAndTangents);
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
  
  let distance = Math.sqrt(Math.pow((intersectY - point.y), 2)
      + Math.pow((intersectX - point.x), 2));
  
  //Get the direction of the line form source point to target point
  let direction1 = getLineDirection(srcPoint, tgtPoint);
  //Get the direction of the line from intesection point to the point
  let direction2 = getLineDirection(intersectionPoint, point);
  
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

const convertToRelativePositions = function (edge, anchorPoints, options) {
  let srcTgtPointsAndTangents = getSrcTgtPointsAndTangents(edge, options);

  let weights = [];
  let distances = [];

  for (let i = 0; anchorPoints && i < anchorPoints.length; i++) {
    let anchor = anchorPoints[i];
    let relativeAnchorPosition = convertToRelativePosition(edge, anchor, srcTgtPointsAndTangents);

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

//  process edge to add required information for its new style
const processEdge = function (edge, options) {
  let e = edge.scratch('elk');
  let eInfo = e.sections[0];

  if (options.elk['elk.edgeRouting'] == 'ORTHOGONAL' || options.elk['elk.edgeRouting'] == 'POLYLINE') {
    if (eInfo.bendPoints) {
      edge.data('elkCurveStyle', 'segments');
      edge.data('elkEdgeDistances', 'node-position');
      let relativePositions = convertToRelativePositions(edge, eInfo.bendPoints, options);
      edge.data('elkBendPointDistances', relativePositions.distances);
      edge.data('elkBendPointWeights', relativePositions.weights);
    }
    else {
      edge.data('elkCurveStyle', 'straight');
      edge.data('elkEdgeDistances', 'node-position');
      edge.data('elkBendPointDistances', []);
      edge.data('elkBendPointWeights', []);                   
    }
    let sourcePos = getPos(options.cy.getElementById(e.source), options);
    let targetPos = getPos(options.cy.getElementById(e.target), options);
    edge.data('elkSourceEndpoint', [eInfo.startPoint.x - sourcePos.x, eInfo.startPoint.y - sourcePos.y]);
    edge.data('elkTargetEndpoint', [eInfo.endPoint.x - targetPos.x, eInfo.endPoint.y - targetPos.y]);
    if (!edge.hasClass('elk-edge')) {
      edge.addClass('elk-edge');
    }     
  }
  else if (options.elk['elk.edgeRouting'] == 'SPLINES') {
    if (eInfo.bendPoints) {
      edge.data('elkCurveStyle', 'unbundled-bezier');
      edge.data('elkEdgeDistances', 'node-position');
      eInfo.bendPoints.shift();
      let relativePositions = convertToRelativePositions(edge, eInfo.bendPoints, options);
      edge.data('elkBendPointDistances', relativePositions.distances);
      edge.data('elkBendPointWeights', relativePositions.weights);
    }
    else {
      edge.data('elkCurveStyle', 'straight');
      edge.data('elkEdgeDistances', 'node-position');
      edge.data('elkBendPointDistances', []);
      edge.data('elkBendPointWeights', []);                         
    }
    let sourcePos = getPos(options.cy.getElementById(e.source), options);
    let targetPos = getPos(options.cy.getElementById(e.target), options);
    edge.data('elkSourceEndpoint', [eInfo.startPoint.x - sourcePos.x, eInfo.startPoint.y - sourcePos.y]);
    edge.data('elkTargetEndpoint', [eInfo.endPoint.x - targetPos.x, eInfo.endPoint.y - targetPos.y]);
    if (!edge.hasClass('elk-edge')) {
      edge.addClass('elk-edge');
    }      
  }
  else {
    edge.removeClass('elk-edge');
    edge.removeData("elkCurveStyle elkEdgeDistances elkSourceEndpoint elkTargetEndpoint elkBendPointDistances elkBendPointWeights")
  }
};

export { getPos, processEdge }
