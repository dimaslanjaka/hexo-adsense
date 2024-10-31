import { JSDOM } from 'jsdom';

function parse(str: string): JSDOM {
  return new JSDOM(str);
}

/**
 * Create node from HTML string
 * @param htmlString - HTML string to parse
 * @returns The first child of the created div element
 */
function createElementFromHTML(htmlString: string): ChildNode | null {
  const dom = new JSDOM('');
  const DOMParser = dom.window.DOMParser;
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlString, 'text/html');

  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  return div.firstChild;
}

export default {
  parse,
  createNodeFromHtml: createElementFromHTML
};
