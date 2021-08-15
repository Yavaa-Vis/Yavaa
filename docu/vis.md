# Visualizations

## Required Files

Each supported visualization consists of the following files:
* `js/modules/viz/[vis].js` ... code to prepare the data; runs within Yavaa context
* `js/modules/viz/[vis].desc.js` ... visualization description
* `js/modules/viz/[vis].plot.js` ... code to render the visualization; runs within a DOM context
* `js/modules/viz/[vis].svg` ... preview image
* `template/viz/[vis].css` ... custom CSS styles

## Rendering Process

Rendering a visualization follows the same steps each time:
1. During recommendation, the description in `js/modules/viz/[vis].desc.js` is compared to the current dataset to determine its suitability for the task. If chosen, the visualization is represented by the image provided by `js/modules/viz/[vis].svg` in the frontend.
1. After being selected, users may either provide bindings between columns and visual artifacts manually or accept the ones from the recommendation.
1. The request is then triggered at `js/modules/viz/[vis].js`. Here, the data is fetched and transformed into a state needed by plotting. This may involve aggregations, assigning default values for parameters, or fetching labels for certain columns.
1. The enriched request is then submitted to `js/modules/viz/[vis].plot.js`. Here, the code has access to a virtual DOM and may use generic visualization libraries like [d3](https://d3js.org/) to create the SVG representation.
1. Once the SVG has been created, the CSS rules from `template/viz/[vis].css` are added, the result is serialized, and finally submitted to the frontend again.
