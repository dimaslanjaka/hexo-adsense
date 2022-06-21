declare function _exports(hexo: Hexo): typeof defaultConfig;
export = _exports;
import Hexo = require("hexo");
declare namespace defaultConfig {
    const enable: boolean;
    const article_ads: string[];
    const pub: string;
    const adblock: boolean;
    const https: boolean;
    const field: "site" | "post";
    const type: "amp" | "javascript";
    const exclude: string[];
    const development: boolean;
}
