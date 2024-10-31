const path = require('path');

process.env.NODE_ENV = 'development';
process.cwd = () => path.join(__dirname, 'demo');

const Hexo = require('hexo');

const hexo = new Hexo(process.cwd(), { debug: true });

async function main() {
  await hexo.init();
  if (!hexo.config.adsense) hexo.config.adsense = {};
  hexo.config.adsense.enable = true;
  hexo.config.adsense.field = 'site';
  await hexo.load();
  await hexo.call('server', { ssl: true, port: 4000, ip: '0.0.0.0' });
}

main();
