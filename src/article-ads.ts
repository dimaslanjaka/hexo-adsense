import { globSync } from 'glob';
import Hexo from 'hexo';
import fs from 'hexo-fs';
import { default as hexoIs } from 'hexo-is';
import * as hexoUtil from 'hexo-util';
import { HexoLocalsData } from 'hexo/dist/hexo/locals-d';
import path from 'path';
import { md5FileSync } from 'sbg-utility';
import { memoize } from 'underscore';
import { fileURLToPath } from 'url';
import Config from './config';
import { debugLog } from './logger';
import * as utils from './utils';

// ESM-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adsContent = `<div hexo-adsense="ads-content">ADS_CODE_HERE</div>`;

declare global {
  interface String {
    /**
     * join string with `require('path').join()`
     * @param path to join with
     */
    joinpath(path: string): string;
  }
}

String.prototype.joinpath = function (str: string): string {
  return path.join(this.toString(), str);
};

function parseConfig(hexo: Hexo | null) {
  return Config(hexo);
}

function articleAds(files: string[], hexo: Hexo): string[] {
  const base_dir = hexo.base_dir;
  const source_dir = hexo.source_dir;
  const isDevelopment = parseConfig(hexo).development;

  const result: string[] = [];
  files.forEach((file) => {
    let html = '';
    let tes = base_dir.joinpath(file);
    if (fs.existsSync(tes)) {
      html = fs.readFileSync(tes).toString();
    } else {
      tes = source_dir.joinpath(file);
      if (fs.existsSync(tes)) {
        html = fs.readFileSync(tes).toString();
      }
    }
    if (html.length > 0) {
      if (isDevelopment) {
        html = html.replace(/><\/ins>/gm, ` data-adtest="on"></ins>`);
      }
      html = html.replace(/\(adsbygoogle?\s*=?\s*window\.adsbygoogle?\s*\|\|?\s*\[\]\)\.push\({}\);/gm, '');
      html = html.replace(/<script?.*src?.*adsbygoogle\b[^>]*>([\s\S]*?)<\/script>/gm, '');
      result.push(adsContent.replace('ADS_CODE_HERE', html));
    }
  });

  return result;
}

function filter_adshtml(hexo: Hexo): string[] {
  const options = parseConfig(hexo);

  let adshtml: string[] = [];
  if (Array.isArray(options.article_ads)) {
    // array of file paths
    adshtml = options.article_ads;
  } else if (typeof options.article_ads === 'string') {
    // single file path
    adshtml = [options.article_ads];
  } else if (typeof options.article_ads === 'boolean') {
    // scan source_dir/_data/hexo-adsense/*.html
    adshtml = globSync(
      [`${hexo.config.source_dir}/ads/**/*.html`, `${hexo.config.source_dir}/_data/hexo-adsense/**/*.html`],
      {
        cwd: hexo.base_dir
      }
    );
  }

  if (adshtml.length > 0) {
    adshtml = adshtml.filter((ads) => typeof ads === 'string' && ads.trim().length > 0);
    if (adshtml.length > 0) {
      adshtml = articleAds(adshtml, hexo);
    }
  }

  return adshtml;
}

function filter_patterns(content: string, source_path: string, hexo: Hexo): { content: string; excluded: boolean } {
  const options = parseConfig(hexo);
  const excluded = utils.isIgnore(source_path, options.exclude, hexo);

  if (excluded) {
    content = content.replace(
      /<script?.*src?.*adsbygoogle?\b[^>]*>([\s\S]*?)<\/script>/gm,
      '<!--hexo-adsense disabled on this page-->'
    );
  }

  return {
    content,
    excluded
  };
}

export function after_post_render(this: Hexo, data: any): any {
  const hexo = this;
  const options = parseConfig(hexo);

  const filterPattern = filter_patterns(data.content, getPageSource(data), hexo);
  data.content = filterPattern.content;
  if (filterPattern.excluded) return data;

  const adshtml = filter_adshtml(hexo);
  if (adshtml.length < 1) return data;

  if (typeof data.adsense === 'boolean' && data.adsense) {
    data.content = processAdsHtml(data.content, adshtml, hexo);
  } else if (options.enable) {
    data.content = processAdsHtml(data.content, adshtml, hexo);
  }

  return data;
}

function processAdsHtml(content: string, adshtml: string[], hexo: Hexo): string {
  const options = parseConfig(hexo);
  const replacement = memoize((adshtml: string[]) => {
    const jsHash = md5FileSync(path.join(__dirname, 'source/article-ads.js'));
    const cssHash = md5FileSync(path.join(__dirname, 'source/article-ads.css'));
    let replacement = `<div id="hexo-adsense-hidden" style="display:none">${adshtml.join('')}</div>`;
    replacement += `<script src='${hexoUtil.url_for.call(hexo, '/hexo-adsense/article-ads.js')}?hash=${jsHash}'></script>`;
    replacement += `<link rel="stylesheet" href='${hexoUtil.url_for.call(hexo, '/hexo-adsense/article-ads.css')}?hash=${cssHash}'>`;
    return replacement;
  });

  const caller = new Error().stack?.split('at ')[2].replace(/^Hexo./g, '');
  const isFieldPost = caller?.startsWith('after_post_render');

  if (isFieldPost) {
    content += replacement(adshtml);
  } else {
    if (!options.enable) {
      content = content.replace(
        /<\/head>/gm,
        `<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.pub}" crossorigin="anonymous"></script>`
      );
    }
    content = content.replace(/<\/body>/gm, `${replacement(adshtml)}</body>`);
  }
  return content;
}

function getPageSource(page: any): string | undefined {
  return page.full_source || page.source || page.path || page.canonical_path;
}

export function after_render_html(this: Hexo, content: string, data: HexoLocalsData): string {
  const hexo = this;
  const options = parseConfig(hexo);
  const where = hexoIs(data);

  const page = data.post ?? data.page;
  const isPageAdsenseEnabled = typeof page.adsense === 'boolean' ? page.adsense : options.enable;

  if (options.field === 'post') {
    if (where.category || where.archive || where.home || where.tag) {
      debugLog(`config field for post, skipping ${data.path || '<empty path>'}`);
      return content;
    }
  }

  debugLog(page.path, 'is adsense enabled', isPageAdsenseEnabled);

  if (isPageAdsenseEnabled) {
    const filterPattern = filter_patterns(content, getPageSource(page), hexo);
    if (filterPattern.excluded) return filterPattern.content;

    const adshtml = filter_adshtml(hexo);
    if (adshtml.length < 1) return content;

    if (page.adsense || options.enable) {
      content = processAdsHtml(content, adshtml, hexo);
    }

    const pageAd = `<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.pub}" crossorigin="anonymous"></script>`;
    content = content.replace(/<\/head>/, pageAd + '</head>');
  }

  return content;
}

export default {
  endbodycode: articleAds
};
