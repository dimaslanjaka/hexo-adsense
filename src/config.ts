import Hexo from 'hexo';
import minimist from 'minimist';
import assign from 'object-assign';
import { memoize } from 'underscore';
const argv = minimist(process.argv.slice(2));

type Environment = 'development' | 'production' | null;

/**
 * Check if the environment is production or development
 * @param inHexo Hexo instance
 * @returns Environment
 */
const getEnv = memoize((inHexo: Hexo | null): Environment => {
  const DEV: Environment = 'development';
  const PRD: Environment = 'production';

  // Check if --development flag is set
  const arg = typeof argv['development'] === 'boolean' && argv['development'];

  // Check if NODE_ENV is set to "development"
  const env = process.env.NODE_ENV?.toLowerCase() === 'development';

  // Determine if environment is development
  const isDev = arg || env;

  if (inHexo) {
    if (isDev) return DEV;
    if (typeof inHexo.env.args.development === 'boolean' && inHexo.env.args.development) return DEV;
    if (inHexo.env.args._ && inHexo.env.args._.length > 0) {
      for (const arg of inHexo.env.args._) {
        if (arg === 's' || arg === 'server') return DEV;
        if (arg === 'd' || arg === 'deploy') return PRD;
        if (arg === 'g' || arg === 'generate') return PRD;
      }
    }
  }

  return null;
});

/**
 * Determine if the environment is development
 * @param hexo Hexo instance
 * @returns boolean
 */
export const isDev = memoize((hexo: Hexo | null): boolean => getEnv(hexo) === 'development');

/**
 * Determine if the environment is production
 * @param hexo Hexo instance
 * @returns boolean
 */
export const isProd = memoize((hexo: Hexo | null): boolean => getEnv(hexo) === 'production');
export const env = (inHexo: Hexo | null): Environment => getEnv(inHexo);

export type DefaultConfig = {
  [key: string]: any;

  /**
   * Enable adsense
   */
  enable: boolean;
  article_ads: string[] | string | boolean;
  /**
   * Adsense ca-pub
   */
  pub: string;
  /**
   * site = adsense will available for all site pages
   * post = adsense will only available for posts only
   */
  field: 'site' | 'post';
  /**
   * amp = amp output
   * javascript = html and javascript output
   */
  type: 'amp' | 'javascript';
  /**
   * Development indicator by process.env.NODE_ENV
   */
  development: boolean;
};

const defaultConfig: DefaultConfig = {
  enable: true,
  article_ads: [''].filter((v) => typeof v === 'string' && v.length > 0),
  pub: '',
  adblock: false,
  https: false,
  field: 'site',
  type: 'javascript',
  exclude: ['.gitignore'],
  development: false
};

/**
 * hexo-adsense config
 * @param hexo
 * @returns
 */
export function getHexoAdsenseConfig(hexo: Hexo): DefaultConfig {
  if (typeof hexo.config.adsense !== 'undefined') {
    if (typeof hexo.config.adsense === 'boolean') {
      // fix when adsense: false
      hexo.config.adsense = {};
      hexo.config.adsense.enable = hexo.config.adsense;
    }
    const config = assign(defaultConfig, hexo.config.adsense);
    config.development = defaultConfig.development = isDev(hexo);
    return config;
  }
  return defaultConfig;
}

export default getHexoAdsenseConfig;
