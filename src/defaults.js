import Tippy from 'tippy.js';
import { generateGetBoundingClientRect } from './assign';

// tooltip helper:
let tip = undefined;

const defaults = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: function () {
    return false;
  }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function (node, pos) {
    return pos;
  }, // A function that applies a transform to the final node position
  ready: ({ cy }) => {
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const dummyDomEle = document.createElement('div');
      tip = new Tippy(dummyDomEle, { // tippy props:
        // getReferenceClientRect: generateGetBoundingClientRect(evt.renderedPosition.x, evt.renderedPosition.y), // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
        getReferenceClientRect: generateGetBoundingClientRect(evt.originalEvent.x, evt.originalEvent.y), // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
        trigger: 'manual', // mandatory, we cause the tippy to show programmatically.
        // offset: [50, 50],
        // your own custom props
        // content prop can be used when the target is a single element https://atomiks.github.io/tippyjs/v6/constructor/#prop
        content: () => {
          const content = document.createElement('div');
          content.innerHTML = node._private.data.pattern || node._private.data.id;

          return content;
        },
        // interactive: true,
        // offset: ({ placement, popper }) => {
        //
        //   if (placement === 'bottom') {
        //   return [ 0, popper.height / 2 ];
        //   } else {
        //     return [10, 10];
        //   }
        // },
      });
      tip.show();
    });
    cy.on('mouseout', 'node', () => {
      if (tip) {
        tip.destroy();
      }
    });
    cy.on('tap', 'node', (evt) => {
      const nodeClicked = evt.target;
      console.log('nodeClicked ->', nodeClicked);
    });
  }, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  elk: {
    // Options to pass directly to ELK `layoutOptions`
    // the elk algorithm to use
    // one of 'box', 'disco', 'force', 'layered', 'mrtree', 'radial', 'random', 'stress'
    // (see https://www.eclipse.org/elk/reference/algorithms.html)
    algorithm: undefined,
  },
  priority: function () {
    return null;
  }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

export default defaults;
