const PostmanSDK = require('postman-collection');
const yaml = require('js-yaml');

var BodyParser = require('./body');
var _ = require('./lodash'),
  sanitize = require('./util').sanitize,
  sanitizeMultiline = require('./util').sanitizeMultiline,
  sanitizeOptions = require('./util').sanitizeOptions,
  addFormParam = require('./util').addFormParam,
  getUrlStringfromUrlObject = require('./util').getUrlStringfromUrlObject,
  isFile = false,
  self;


self = module.exports = {
    convert: function (request, options, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('Kestra-Converter: callback is not valid function');
        }

        let httpType = options.httpType || "Request";
        const bObj = {};

        buildBase(bObj, httpType, request);
        buildHeader(bObj, request.toJSON().header);
        if (request.body) {
            buildBody(bObj, request);
        }


        const yamlString = yaml.dump({
          "tasks": [bObj]
        });
        callback(yamlString);
    },
    getOptions: function () {
        return [{
            name: 'Set http task',
            id: 'httpTask',
            type: 'enum',
            availableOptions: ['Request', 'Download'],
            default: 'Request',
            description: 'Select the http task to be used for in the example. ' +
                'Download is mainly used for large fetch requests'
        }]
    },
}


/**
 * 
 * @param {Object} obj 
 * @param {String} httpType 
 * @param {Object} request 
 * @returns Void
 */
function buildBase(obj, httpType, request) {
    obj['id'] = `example_${httpType}_task`.toLowerCase();
    obj['type'] = `io.kestra.plugin.core.${httpType}`;
    obj['method'] = request.method.toUpperCase();
    obj["url"] = `${getUrlStringfromUrlObject(request.url)}`

    if (request.url.auth && request.url.auth.user) {
      if (!obj.options) obj["options"] = {}
      obj.options["basicAuthUser"] = request.url.auth.user
      if (!request.url.auth.password) obj.options["basicAuthPassword"] = request.url.auth.password
    }
    return;
}

function buildBody(obj, request) {
  if (!_.isEmpty(request.body)) {
    switch (request.body.mode) {
      case 'urlencoded':
        obj.body = BodyParser.parseURLEncodedBody(request.body.urlencoded);
        break;
      case 'raw':
        obj.body = BodyParser.parseRawBody(request.body.raw);
        break;
      case 'graphql':
        obj.body = BodyParser.parseGraphQL(request.body.graphql);
        break;
      case 'formdata':
        obj.formData = BodyParser.parseFormData(request.body.formdata);
        break;
      case 'file':
        obj.body = BodyParser.parseFile(request.body.file);
        break;
      default:
        obj.body = "";

    }
    return;
  }
  obj.body = "";
}

/**
 * Parses headers from the request.
 *
 * @param {Object} headers headers from the request.
 */
function buildHeader(obj, headers) {
  obj.headers = {};
  if (!_.isEmpty(headers)) {
    headers = _.reject(headers, 'disabled');
    _.forEach(headers, function (header) {
      obj.headers[sanitize(header.key, true)] = sanitize(header.value)
    });
  }
}


// var t = ```
// id: api_call
// namespace: company.team
// tasks:
//   - id: basic_auth_api
//     type: io.kestra.plugin.core.http.Request
//     uri: http://host.docker.internal:8080/api/v1/executions/dev/inputs_demo
//     options:
//       basicAuthUser: admin
//       basicAuthPassword: admin
//     method: POST
//     contentType: multipart/form-data
//     formData:
//       user: John Doe
// ```;