export function parse(str: any): jsdom.JSDOM;
/**
 * create node from html string
 * @param {string} htmlString
 * @returns
 */
declare function createElementFromHTML(htmlString: string): ChildNode;
import jsdom = require("jsdom");
export { createElementFromHTML as createNodeFromHtml };
