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

//  process edge to add required information for its new style
const processEdge = function (edge, options) {
  let e = edge.scratch('elk');
  let eInfo = e.sections[0];

  let sourcePos = getPos(options.cy.getElementById(e.source), options);
  let targetPos = getPos(options.cy.getElementById(e.target), options);

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
    if (eInfo.bendPoints) {
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

export { getPos, processEdge }
