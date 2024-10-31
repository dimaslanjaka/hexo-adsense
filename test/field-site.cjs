const path = require('path');

process.env.NODE_ENV = 'development';
process.cwd = () => path.join(__dirname, 'demo');

const Hexo = require('hexo');
const glob = require('glob');
const fs = require('fs-extra');

const hexo = new Hexo(process.cwd(), { debug: true });

async function main() {
  await hexo.init();
  if (!hexo.config.adsense) hexo.config.adsense = {};
  hexo.config.adsense.enable = true;
  hexo.config.adsense.field = 'site';
  await hexo.load();
  await hexo.call('generate');
  // await hexo.call('server', { ssl: true, port: 4000, ip: '0.0.0.0' });
  const generated = await (
    await glob.glob('public/**/*.html', { cwd: process.cwd(), absolute: true })
  )
    .map((file) => {
      return { file, content: fs.readFileSync(file, 'utf-8') };
    })
    // skip without adsense post
    .filter(({ file }) => !file.includes('without-adsense'));
  console.log('generated html should contains adsense for all sites', {
    'ins.adsbygoogle': generated.every(({ content }) => content.includes('adsbygoogle')),
    pagead: generated.every(({ content }) => content.includes('pagead2.googlesyndication.com'))
  });
}

main();
