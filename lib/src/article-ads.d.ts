/**
 * Article ads reader
 * @param {string[]} files
 * @param {Hexo} hexo
 */
declare function articleAds(files: string[], hexo: Hexo): string[];
/**
 * Inject ads after_render:html event (on all page)
 * @param {object} data
 * @param {string} content
 */
export function after_render_html(content: string, data: object): any;
/**
 * inject ads after_post_render event
 * @example
 * hexo.extend.filter.register("after_generate", injectAdsAfterGenerate);
 */
export function after_post_render(data: any): any;
import Hexo = require("hexo");
export { articleAds as endbodycode };
