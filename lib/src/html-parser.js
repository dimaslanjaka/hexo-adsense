var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
function parse(str) {
    return new JSDOM(str);
}
/**
 * create node from html string
 * @param {string} htmlString
 * @returns
 */
function createElementFromHTML(htmlString) {
    var dom = new JSDOM("");
    // Get DOMParser, same API as in browser
    var DOMParser = dom.window.DOMParser;
    var parser = new DOMParser();
    // Create document by parsing XML/HTML
    var document = parser.parseFromString(htmlString, "text/html");
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}
module.exports = {
    parse: parse,
    createNodeFromHtml: createElementFromHTML,
};
