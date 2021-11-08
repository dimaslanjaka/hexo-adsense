const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function parse(str) {
  return new JSDOM(str);
}

module.exports = {
  parse,
};
