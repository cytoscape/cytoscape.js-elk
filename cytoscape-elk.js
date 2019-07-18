(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeElk"] = factory();
	else
		root["cytoscapeElk"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ELK = __webpack_require__(4);
var elk = new ELK({
  workerUrl: 'elkjs/lib/elk-worker'
});
var assign = __webpack_require__(1);
var defaults = __webpack_require__(2);

var mapToElkNS = function mapToElkNS(elkOpts) {
  var keys = Object.keys(elkOpts);
  var ret = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var nsKey = key;
    var val = elkOpts[key];
    ret[nsKey] = val;
  }

  return ret;
};

var elkOverrides = {};

var getPos = function getPos(ele) {
  var parent = ele.parent();
  var k = ele.scratch('elk');
  var p = {
    x: k.x,
    y: k.y
  };

  if (parent.nonempty()) {
    var kp = parent.scratch('elk');

    p.x += kp.x;
    p.y += kp.y;
  }

  return p;
};

var makeNode = function makeNode(node, options) {
  var dims = node.layoutDimensions(options);
  var padding = node.numericStyle('padding');

  var k = {
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

  if (!node.isParent()) {
    k.width = dims.w;
    k.height = dims.h;
  }

  node.scratch('elk', k);

  console.log('NODE: ', k);
  return k;
};

var makeEdge = function makeEdge(edge, options) {
  var k = {
    _cyEle: edge,
    id: edge.id(),
    source: edge.data('source'),
    target: edge.data('target')
  };

  var priority = options.priority && options.priority(edge);

  if (priority != null) {
    k.priority = priority;
  }

  edge.scratch('elk', k);

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

function Layout(options) {
  var elkOptions = options.elk;

  this.options = assign({}, defaults, options);

  this.options.elk = assign({}, defaults.elk, elkOptions, elkOverrides);
}

Layout.prototype.run = function () {
  var layout = this;
  var options = this.options;

  var eles = options.eles;
  var nodes = eles.nodes();
  var edges = eles.edges();

  var graph = makeGraph(nodes, edges, options);

  elk.layout(graph, {
    layoutOptions: mapToElkNS(options.elk)
  }).then(function () {
    nodes.filter(function (n) {
      return !n.isParent();
    }).layoutPositions(layout, options, getPos);
  });

  return this;
};

Layout.prototype.stop = function () {
  return this; // chaining
};

Layout.prototype.destroy = function () {
  return this; // chaining
};

module.exports = Layout;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: function animateFilter() {
    return true;
  }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function transform(node, pos) {
    return pos;
  }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  elk: {},
  priority: function priority() {
    return null;
  } // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'elk', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  // eslint-disable-next-line no-undef
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var require;var require;(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ELK = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*******************************************************************************
 * Copyright (c) 2017 Kiel University and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *******************************************************************************/
var ELK = function () {
  function ELK() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$defaultLayoutOpt = _ref.defaultLayoutOptions,
        defaultLayoutOptions = _ref$defaultLayoutOpt === undefined ? {} : _ref$defaultLayoutOpt,
        _ref$algorithms = _ref.algorithms,
        algorithms = _ref$algorithms === undefined ? ['layered', 'stress', 'mrtree', 'radial', 'force', 'disco'] : _ref$algorithms,
        workerFactory = _ref.workerFactory,
        workerUrl = _ref.workerUrl;

    _classCallCheck(this, ELK);

    this.defaultLayoutOptions = defaultLayoutOptions;
    this.initialized = false;

    // check valid worker construction possible
    if (typeof workerUrl === 'undefined' && typeof workerFactory === 'undefined') {
      throw new Error("Cannot construct an ELK without both 'workerUrl' and 'workerFactory'.");
    }
    var factory = workerFactory;
    if (typeof workerUrl !== 'undefined' && typeof workerFactory === 'undefined') {
      // use default Web Worker
      factory = function factory(url) {
        return new Worker(url);
      };
    }

    // create the worker
    var worker = factory(workerUrl);
    if (typeof worker.postMessage !== 'function') {
      throw new TypeError("Created worker does not provide" + " the required 'postMessage' function.");
    }

    // wrap the worker to return promises
    this.worker = new PromisedWorker(worker);

    // initially register algorithms
    this.worker.postMessage({
      cmd: 'register',
      algorithms: algorithms
    }).then(function (r) {
      return _this.initialized = true;
    }).catch(console.err);
  }

  _createClass(ELK, [{
    key: 'layout',
    value: function layout(graph) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$layoutOptions = _ref2.layoutOptions,
          layoutOptions = _ref2$layoutOptions === undefined ? this.defaultLayoutOptions : _ref2$layoutOptions;

      if (!graph) {
        return Promise.reject(new Error("Missing mandatory parameter 'graph'."));
      }
      return this.worker.postMessage({
        cmd: 'layout',
        graph: graph,
        options: layoutOptions
      });
    }
  }, {
    key: 'knownLayoutAlgorithms',
    value: function knownLayoutAlgorithms() {
      return this.worker.postMessage({ cmd: 'algorithms' });
    }
  }, {
    key: 'knownLayoutOptions',
    value: function knownLayoutOptions() {
      return this.worker.postMessage({ cmd: 'options' });
    }
  }, {
    key: 'knownLayoutCategories',
    value: function knownLayoutCategories() {
      return this.worker.postMessage({ cmd: 'categories' });
    }
  }, {
    key: 'terminateWorker',
    value: function terminateWorker() {
      this.worker.terminate();
    }
  }]);

  return ELK;
}();

exports.default = ELK;

var PromisedWorker = function () {
  function PromisedWorker(worker) {
    var _this2 = this;

    _classCallCheck(this, PromisedWorker);

    if (worker === undefined) {
      throw new Error("Missing mandatory parameter 'worker'.");
    }
    this.resolvers = {};
    this.worker = worker;
    this.worker.onmessage = function (answer) {
      // why is this necessary?
      setTimeout(function () {
        _this2.receive(_this2, answer);
      }, 0);
    };
  }

  _createClass(PromisedWorker, [{
    key: 'postMessage',
    value: function postMessage(msg) {
      var id = this.id || 0;
      this.id = id + 1;
      msg.id = id;
      var self = this;
      return new Promise(function (resolve, reject) {
        // prepare the resolver
        self.resolvers[id] = function (err, res) {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        };
        // post the message
        self.worker.postMessage(msg);
      });
    }
  }, {
    key: 'receive',
    value: function receive(self, answer) {
      var json = answer.data;
      var resolver = self.resolvers[json.id];
      if (resolver) {
        delete self.resolvers[json.id];
        if (json.error) {
          resolver(json.error);
        } else {
          resolver(null, json.data);
        }
      }
    }
  }, {
    key: 'terminate',
    value: function terminate() {
      if (this.worker.terminate) {
        this.worker.terminate();
      }
    }
  }]);

  return PromisedWorker;
}();
},{}],2:[function(require,module,exports){
"use strict";

var ELK = require('./elk-api.js').default;

Object.defineProperty(module.exports, "__esModule", {
  value: true
});
module.exports = ELK;
ELK.default = ELK;
},{"./elk-api.js":1}]},{},[2])(2)
});

/***/ })
/******/ ]);
});