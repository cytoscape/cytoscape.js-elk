import Tippy from 'tippy.js';
import { generateGetBoundingClientRect } from './assign';

// tooltip helper:
let tip, latestTooltipNodeDisplayed;

const removeTip = () => {
  if (tip) {
    // remove the older tooltip, so we can render the new one.
    tip.destroy();
  }
};

const createHtmlForTip = ({ _private: { data } }) => {
  latestTooltipNodeDisplayed = data; // always select the latest node, whose tooltip is being rendered
  const { rulePattern } = data;
  let rulePatterHtml = '';
  if (rulePattern) {
    // The root node doesn't have the rulePattern, therefore, we won't render anything there.
    for (const pattern of rulePattern) {
      rulePatterHtml += `<div class='menu-sub-content'><span class='pattern-value'>${pattern}</span></div>`;
    }
  }
  let baseHtml = `${'<div class="node-text wordwrap">'
  + '<div class="divider"></div>'
  + '<div data-type="contextMenu" class="menu-content"><b>Pattern:</b> <span>'}${data.pattern}</span></div>`;
  if (rulePatterHtml) {
    baseHtml += `<div class='menu-sub-content'><b>Rule Pattern</b></div>${rulePatterHtml}`;
  }
  return baseHtml;
};

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
      removeTip();
      const node = evt.target;
      const dummyDomEle = document.createElement('div');
      tip = new Tippy(dummyDomEle, { // tippy props:
        // getReferenceClientRect: generateGetBoundingClientRect(evt.renderedPosition.x, evt.renderedPosition.y), // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
        getReferenceClientRect: generateGetBoundingClientRect(evt.originalEvent.x, evt.originalEvent.y + 20), // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
        trigger: 'manual', // mandatory, we cause the tippy to show programmatically.
        // your own custom props
        // content prop can be used when the target is a single element https://atomiks.github.io/tippyjs/v6/constructor/#prop
        content: () => {
          const baseHtml = createHtmlForTip(node);
          const content = document.createElement('div');
          content.innerHTML = baseHtml;
          return content;
        },
        hideOnClick: true,
        allowHTML: true,
      });
      tip.show();
    });

    cy.on('tap', 'node', (evt) => {
      const nodeClicked = evt.target;
      console.log('nodeClicked ->', nodeClicked);
      console.log('latestTooltipNodeDisplayed ->', latestTooltipNodeDisplayed);
    });

    cy.on('zoom', () => {
      removeTip();
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
