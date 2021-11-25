# Change Log
All notable changes to this project will be documented in this file.

## [Unreleased] - 2021-11-15

### Added
- Development of the overall architecture of the project;
- Import configuration from JSON;
- Basic validation and recovery of missing configuration data;
- Creating a universal state object to interact with the configuration;
- Drawing primitive objects by object-state;

## [0.0.1] - 2021-11-25

### Modified
- Configuration files are now in jsonc format - with annotations;
- Improved support for minimal configuration, added an example;
- The 'size' property has been replaced with 'rotate' for transitions;
- Reworked structure for arcs;
- The default values are placed in a separate class;

### Added
- Added processing of the inhibitory matrix;
- Debug mode, which accepts a JSON configuration, with an update function;
- Export configuration to JSON file;
- An algorithm for optimal determination of the location of objects has been created;
- Rendering objects via d3.js;
- Implementation of moving positions and transitions;