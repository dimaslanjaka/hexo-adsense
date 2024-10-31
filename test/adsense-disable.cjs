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
  hexo.config.adsense.enable = false;
  await hexo.load();
  await hexo.call('generate');
  // await hexo.call('server', { ssl: true, port: 4000, ip: '0.0.0.0' });
  const generated = await (
    await glob.glob('public/**/*.html', { cwd: process.cwd(), absolute: true })
  )
    .map((file) => {
      return { file, content: fs.readFileSync(file, 'utf-8') };
    })
    // skip custom layout
    .filter(({ file }) => !file.includes('custom-layout'));
  console.log('generated html should not contains adsense for all sites', {
    'ins.adsbygoogle': generated.every(({ content }) => !content.includes('adsbygoogle')),
    pagead: generated.every(({ content }) => !content.includes('pagead2.googlesyndication.com'))
  });
}

main();
