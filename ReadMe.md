# Yavaa

*Supporting Data Workflows from Discovery to Visualization.*

A tool that allowing non-expert users to access, transform, combine, and visualize the data holdings of common statistical portals.

## Setup

**Prerequisites**

* Triple store holding Yavaa-compatible dataset descriptions.
  The overall structure and an example is documented in [`docu/datasetDescription.md`](docu/datasetDescription.md).
  To create examples for Eurostat see [Yavaa_Eurostat_Crawler](https://github.com/Yavaa-Vis/Yavaa_Eurostat_Crawler).
* Working instance of [Node.js](https://nodejs.org/).
  Yavaa has been tested with version 14 and 16.

**Run the server**

* Install dependencies: `npm i`
* Configure triple store in `js/modules/config/metadata.sparql.js` and `js/modules/config/unit.sparql.js`
* Start the server: `npm run start`
* By default, the web interface is then accessible from [`localhost:8080`](http://localhost:8080)

## Dependencies

Besides the dependencies defined in `package.json` this repository includes the source code from the following projects:
* [Codemirror Simple Mode](https://codemirror.net/demo/simplemode.html) - MIT-License
* [DataTables](https://datatables.net/)
* [DataTables: Scroller](https://datatables.net/extensions/scroller/) - MIT-License
* [jQuery UI](https://jqueryui.com/) - custom license
* [jQuery UI: DateTimePicker](http://xdsoft.net/jqplugins/datetimepicker/) - MIT-License
* [jQuery UI: context menu](https://github.com/mar10/jquery-ui-contextmenu) - MIT-License
* [PEG.js](http://pegjs.org/) - MIT-License

## Debugging

By default, Yavaa will log all user activities into logfiles residing in `/logs` with a filename using to the session ID visible in the upper right corner of the web interface.
There are two scripts in `/debug` that can help during debugging:

1. `purge.js` will remove superfluous actions from the log. In particular, this includes any requests for segments of the dataset. This will substantially speed up the reenactment later on.
1. `replay.js` allows to reenact a workflow given in a log up until an error or the workflow has been finished.

To use any of these utilities, copy the respective log file into `/debug/log` and adjust the log-filenames in the head of each script.
Afterwards, the scripts can be executed via `node purge.js` and `node replay.js` respectively.

`replay.js` assumes that there is a local Yavaa server running to send requests to.
