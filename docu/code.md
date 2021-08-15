# Code Structure

The code in this repository is structured as follows:

* `/debug` ... helper scripts to ease debugging of runtime exceptions.
* `/docu` ... contains some basic hints on different aspects of the code base.
* `/js` ... main codebase.
    * `.` ... workers for server-based or purely browser-based communications
    * `/modules` ... Yavaa core
        * `basic` ... generic classes, objects, and definitions
        * `client` ... communication wrappers between frontend and backend
        * `comm` ... server side interface for incoming messages
        * `comp` ... modules for actual computations; e.g., aggregation, joins, or applying functions
        * `compEngine` ... computation engine
        * `config` ... configuration files
        * `export` ... wrappers for supported dataset export formats
        * `grammar` ... formula parsing grammar as JS code; will automatically be created by [PEG.js](https://pegjs.org/) on server start
        * `helper` ... backend code for some frontend assistants
        * `load` ... wrapper code for loading different file formats
        * `search` ... search related code
        * `serializer` ... internal serializers front frontend-backend-communication
        * `server` ... server startup code
        * `shared` ... code fragments shared between frontend and backend; mostly classes similar to the ones in `basic`
        * `store` ... Yavaa-internal stores; e.g., Metadata Store or Unit Store
        * `testing` ... mock creators for testing
        * `ui` ...  frontend components
        * `util` ... utility modules
        * `viz` ... visualization related code
        * `workflow` ... workflow related code; includes tracking as well as exporting (e.g., visualize workflow graph)
* `/lib` ... third party dependencies; will be completed once the server is run.
* `/ontology` ... RDF fragments to provide common types; needed to set up the metadata triple store.
* `/template` ... dynamic non-js-files
    * `/grammar` ... [PEG.js](https://pegjs.org/) grammar used to parse formulae
    * `/query` ... SPARQL queries
    * `/ui` ... different elements for frontend rendering; e.g., dialogs and common elements
    * `/viz` ... custom CSS styles for visualizations
    * `/webRoot` ... frontend landing page; will overwrite contents of the top-level `/webRoot`
    * `/workflow` ... elements to render the workflow graph
* `/test_customAsserts` ... additional assertions not provided by [QUnit](https://qunitjs.com/)
* `/tests/` ... test cases covering parts of the code base
* `/webRoot` ... static files delivered as (part of) the frontend
