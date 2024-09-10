# codegen-kestra

> Converts Postman-SDK Request into code snipped for kestra

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to golang code snippet and  `getOptions` function which returns an array of supported options.
