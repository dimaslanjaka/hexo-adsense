/* global hexo */
'use strict';

import fs from 'fs-extra';
import Hexo from 'hexo';
import { StoreFunction } from 'hexo/dist/extend/renderer-d';
import { HexoLocalsData } from 'hexo/dist/hexo/locals-d';
import assign from 'object-assign';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
// import injector2 from '../packages/hexo-extend-injector2/index';
import * as hexoUtil from 'hexo-util';
import { after_post_render, after_render_html } from './article-ads';
import getConfig from './config';
import logger, { debugLog, logname } from './logger';
import { tmpFolder } from './utils';

// ESM-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (typeof hexo !== 'undefined' && typeof hexo.config.adsense !== 'undefined') {
  // const injector = injector2(hexo); // Create injector plugin
  const config = getConfig(hexo);
  const isDevelopment = config.development;

  // clean temp folder on `hexo clean`
  hexo.extend.filter.register('after_clean', function () {
    // remove some other temporary files
    hexo.log.debug(logname + '(clean)', 'cleaning temp folder');
    if (fs.existsSync(tmpFolder)) fs.rmSync(tmpFolder, { recursive: true, force: true });
  });

  if (config.pub.length < 1) {
    logger.error(logname + '(config)', `adsense ca-pub (adsense.pub) not configured in _config.yml`);
  } else {
    if (config.enable) {
      // Router register
      const routeOptions = [
        {
          route: '/hexo-adsense/article-ads.js',
          src: path.join(__dirname, 'source/article-ads.js'),
          type: 'text/javascript'
        },
        {
          route: '/hexo-adsense/article-ads.css',
          src: path.join(__dirname, 'source/article-ads.css'),
          type: 'text/css'
        }
      ];
      routeOptions.forEach((item) => {
        const routePath = item.route;
        const sourcePath = item.src;
        const contentType = item.type;
        hexo.extend.generator.register(hexoUtil.url_for.call(hexo, routePath), () => {
          return {
            path: routePath,
            data: () => fs.createReadStream(sourcePath)
          };
        });
        hexo.extend.filter.register('server_middleware', function (app: import('connect').Server) {
          app.use(routePath, function (_req, res) {
            res.setHeader('content-type', contentType);
            res.end(fs.readFileSync(sourcePath).toString());
          });
        });
      });

      hexo.extend.filter.register('after_render:html', function (content: string, _data: HexoLocalsData) {
        const lastBodyRegex = /<\/body>(?=[^<]*$)/;
        const firstHeadRegex = /<\/head>/;

        const adsenseConfigObject = JSON.stringify(
          assign(config, hexo.env, { adsense: hexo.config.adsense }),
          null,
          isDevelopment ? 2 : undefined
        );
        const script = `<script id="hexo-adsense-config" type="application/json">${adsenseConfigObject}</script>`;

        // Apply functions only in production
        if (!isDevelopment) {
          // Redirect to HTTPS if configured
          if (typeof config.https === 'boolean' && config.https) {
            const https_js = fs.readFileSync(path.join(__dirname, 'source/https.js'), 'utf-8');
            content = content.replace(lastBodyRegex, `<script>${https_js}</script></body>`);
          }

          // Add adblock blocker if configured
          if (typeof config.adblock === 'boolean' && config.adblock) {
            const adblock_css = fs.readFileSync(path.join(__dirname, 'source/adblock.css'), 'utf-8');
            const adblock_js = fs.readFileSync(path.join(__dirname, 'source/adblock.js'), 'utf-8');
            content = content.replace(
              lastBodyRegex,
              `<style>${adblock_css}</style><script>${adblock_js}</script></body>`
            );
          }
        }

        return content.replace(firstHeadRegex, script + '</head>');
      } as StoreFunction);

      // Handle article ads if configured
      if (typeof config.article_ads !== 'undefined') {
        if (config.field === 'post') {
          logger.info(logname, 'apply adsense only for posts');
          // Apply to posts
          hexo.extend.filter.register('after_post_render', after_post_render as StoreFunction);
        } else {
          logger.info(logname, 'apply adsense for all sites pages and posts');
          // Apply to entire HTML
          hexo.extend.filter.register('after_render:html', after_render_html as StoreFunction);
        }
      }

      // Prettify on development
      if (hexo.env.cmd === 'server' && isDevelopment) {
        hexo.extend.filter.register('after_render:html', async function (
          this: Hexo,
          content: string,
          _page: HexoLocalsData
        ) {
          const format = await prettier.format(content, { parser: 'html' });
          debugLog(`Prettier formatted html result of ${_page.path}`);
          return format;
        } as StoreFunction);
      }
    }
  }
}
