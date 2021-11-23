cytoscape-elk
================================================================================

## Description

The [elk](https://github.com/OpenKieler/elkjs) layout algorithm adapter for Cytoscape.js

[ELK](https://www.eclipse.org/elk/) is a set of layout algorithms implemented by the Eclipse Foundation in Java.  The source code is compiled to JS by the [ELK.js](https://github.com/kieler/elkjs) project using GWT.  This Cytoscape extension adds support for the ELK layout aglorithms in Cytoscape.


## Dependencies

 * Cytoscape.js ^3.2.0
 * elkjs ^0.7.0


## Usage instructions

Download the library:
 * via npm or yarn: `npm install cytoscape-elk` or `yarn add cytoscape-elk`,
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';

cytoscape.use( elk );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let elk = require('cytoscape-elk');

cytoscape.use( elk ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-elk'], function( cytoscape, elk ){
  elk( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

```js
var options = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  elk: {
    // All options are available at http://www.eclipse.org/elk/reference.html
    //
    // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
    // E.g. for 'org.eclipse.elk.direction' use:
    // 'elk.direction'
    //
    // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
    // 'elk.direction': 'DOWN'
    //
    // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
    // Example (downwards layered layout):
    'algorithm': 'layered',
    'elk.direction': 'DOWN',
  },
  priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

cy.layout( options ).run();
```

The set of  `options.elk.algorithm` values that are supported by ELK.js follows:

- `box` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=box)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-box.html)) Pack the nodes like boxes.
- `disco` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=disco)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-disco.html)) Pack the (disconnected) components.  A secondary layout may be applied to each component via `options.elk.componentLayoutAlgorithm`.
- `force` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=force)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-force.html)) Apply a basic force-directed layout.
- `layered` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html)) Apply a hierarchical layout, appropriate for DAGs and trees.
- `mrtree` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=mrtree) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-mrtree.html)) Apply a traditional, hierarchical tree layout.
- `random` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=random)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-random.html)) Apply random positions to the nodes.
- `stress` : ([Demo](https://cytoscape.github.io/cytoscape.js-elk/?demo=stress)) ([Docs](https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-stress.html)) Apply a force-directed layout.

See the [ELK.js documentation](https://github.com/OpenKieler/elkjs) and the [ELK algorithm options documentation](https://www.eclipse.org/elk/reference/algorithms.html) for more information.

## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape.js-elk`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.


## Publishing instructions

This project is set up to automatically be published to npm.  To publish:

1. Build the extension : `npm run build`
2. Commit the build : `git commit -am "Build for release"`
3. Bump the version number and tag: `npm version major|minor|patch`
4. Push to origin: `git push && git push --tags`
5. Publish to npm: `npm publish .`
