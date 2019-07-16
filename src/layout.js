const ELK = require('elkjs/lib/elk-api');
const elk = new ELK({
  workerUrl: false,
});
const assign = require('./assign');
const defaults = require('./defaults');

const mapToElkNS = function( elkOpts ){
  let keys = Object.keys( elkOpts );
  let ret = {};

  for( let i = 0; i < keys.length; i++ ){
    let key = keys[i];
    let nsKey = key;
    let val = elkOpts[key];
    ret[ nsKey ] = val;
  }

  return ret;
};

const elkOverrides = {
};

const getPos = function( ele ){
  let parent = ele.parent();
  let k = ele.scratch('elk');
  let p = {
    x: k.x,
    y: k.y
  };

  if( parent.nonempty() ){
    let kp = parent.scratch('elk');

    p.x += kp.x;
    p.y += kp.y;
  }

  return p;
};

const makeNode = function( node, options ){
  let dims = node.layoutDimensions( options );
  let padding = node.numericStyle('padding');

  let k = {
    _cyEle: node,
    id: node.id(),
    ports: node.data().ports,
    properties: node.data().properties,
    padding: {
      top: padding,
      left: padding,
      bottom: padding,
      right: padding
    }
  };

  if( !node.isParent() ){
    k.width = dims.w;
    k.height = dims.h;
  }

  node.scratch('elk', k);

  console.log('NODE: ', k);
  return k;
};

const makeEdge = function( edge, options ){
  let k = {
    _cyEle: edge,
    id: edge.id(),
    source: edge.data('source'),
    target: edge.data('target')
  };

  let priority = options.priority && options.priority( edge );

  if( priority != null ){
    k.priority = priority;
  }

  edge.scratch('elk', k);

  return k;
};

const makeGraph = function( nodes, edges, options ){
  let elkNodes = [];
  let elkEdges = [];
  let elkEleLookup = {};
  let graph = {
    id: 'root',
    children: [],
    edges: []
  };

  // map all nodes
  for( let i = 0; i < nodes.length; i++ ){
    let n = nodes[i];
    let k = makeNode( n, options );

    elkNodes.push( k );

    elkEleLookup[ n.id() ] = k;
  }

  // map all edges
  for( let i = 0; i < edges.length; i++ ){
    let e = edges[i];
    let k = makeEdge( e, options );

    elkEdges.push( k );

    elkEleLookup[ e.id() ] = k;
  }

  // make hierarchy
  for( let i = 0; i < elkNodes.length; i++ ){
    let k = elkNodes[i];
    let n = k._cyEle;

    if( !n.isChild() ){
      graph.children.push( k );
    } else {
      let parent = n.parent();
      let parentK = elkEleLookup[ parent.id() ];

      let children = parentK.children = parentK.children || [];

      children.push( k );
    }
  }

  for( let i = 0; i < elkEdges.length; i++ ){
    let k = elkEdges[i];

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
    graph.edges.push( k );
    //}
  }

  return graph;
};

function Layout( options ){
  let elkOptions = options.elk;

  this.options = assign( {}, defaults, options );

  this.options.elk = assign( {}, defaults.elk, elkOptions, elkOverrides );
}

Layout.prototype.run = function() {
  let layout = this;
  let options = this.options;

  let eles = options.eles;
  let nodes = eles.nodes();
  let edges = eles.edges();

  let graph = makeGraph( nodes, edges, options );

  elk.layout(graph, {
      layoutOptions: mapToElkNS( options.elk )
    }).then(() => {
    nodes.filter(function(n){
      return !n.isParent();
    }).layoutPositions( layout, options, getPos );
  });

  return this;
};

Layout.prototype.stop = function(){
  return this; // chaining
};

Layout.prototype.destroy = function(){
  return this; // chaining
};

module.exports = Layout;
