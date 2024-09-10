var _ = require('./lodash'),
    sanitize = require('./util').sanitize,
    sanitizeMultiline = require('./util').sanitizeMultiline,
    sanitizeOptions = require('./util').sanitizeOptions,
    addFormParam = require('./util').addFormParam,
    getUrlStringfromUrlObject = require('./util').getUrlStringfromUrlObject,
    isFile = false,
    self;

/**
 * Parses Raw data to fetch syntax
 *
 * @param {Object} body Raw body data
 */
function parseRawBody(body) {
    return sanitizeMultiline(body.toString());
}

/**
 * Parses graphql data to golang syntax
 *
 * @param {Object} body Raw body data
 */
function parseGraphQL(body) {
    let query = body ? body.query : '',
        graphqlVariables;
    try {
        graphqlVariables = JSON.parse(body.variables);
    }
    catch (e) {
        graphqlVariables = {};
    }
    return sanitize(
        JSON.stringify({
            query: query || '',
            variables: graphqlVariables
        })
    );
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body URLEncoded Body
 */
function parseURLEncodedBody(body) {
    return _.reduce(body, function (accumulator, data) {
        if (!data.disabled) {
            accumulator.push(`${encodeURIComponent(data.key)}=${encodeURIComponent(data.value)}`);
        }
        return accumulator;
    }, []).join('&');
}

/**
 * Parses formData body from request to fetch syntax
 *
 * @param {Object} body formData Body
 */
function parseFormData(body) {
    var outMap = {};
    _.forEach(body, function (data, index) {
        if (!data.disabled) {
            if (data.type === "file") {
                outMap[data.key] = `<Content of ${data.src}>`
            } else if (data.contentType) {
                // todo: find way to handle contentType in formData with kestra
                outMap[data.key] = data.value
                console.log(0, data.key)
            } else {
                outMap[data.key] = data.value
                console.log(1, data.key);
            }
        }
    });
    return outMap;
}

/**
 * Parses file body from the Request
 *
 */
function parseFile() {
    return  '<file contents here>';
}

module.exports = {
    parseRawBody,
    parseURLEncodedBody,
    parseGraphQL,
    parseFormData,
    parseFile
}