const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const webjs = require("../source/article-ads");

function parse(str) {
  return new JSDOM(str);
}

/**
 * create node from html string
 * @param {string} htmlString
 * @returns
 */
function createElementFromHTML(htmlString) {
  const dom = new JSDOM("");
  // Get DOMParser, same API as in browser
  const DOMParser = dom.window.DOMParser;
  const parser = new DOMParser();
  // Create document by parsing XML/HTML
  const document = parser.parseFromString(htmlString, "text/html");

  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

module.exports = {
  parse,
  webjs.replaceWith,
  webjs.insertAfter,
  createNodeFromHtml: createElementFromHTML,
};
