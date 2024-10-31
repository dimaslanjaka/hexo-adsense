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
  hexo.config.adsense.field = 'post';
  await hexo.load();
  await hexo.call('generate');
  // await hexo.call('server', { ssl: true, port: 4000, ip: '0.0.0.0' });
  const generated = await (
    await glob.glob('public/**/*.html', { cwd: process.cwd(), absolute: true })
  ).map((file) => {
    return { file, content: fs.readFileSync(file, 'utf-8') };
  });
  const posts = generated.filter(
    ({ file }) =>
      !file.includes('archives/') &&
      !file.includes('categories/') &&
      !file.includes('tags/') &&
      !file.endsWith('index.html') &&
      !file.includes('page') &&
      !file.includes('without-adsense')
  );
  const nonPosts = generated.filter((element) => !posts.includes(element));
  console.clear();
  console.log('generated html should contains adsense for post only', {
    'ins.adsbygoogle': posts.every(({ content }) => content.includes('adsbygoogle')),
    pagead: posts.every(({ content }) => content.includes('pagead2.googlesyndication.com'))
  });
  console.log('generated html should not contains adsense for pages, archives, tags, categories, index', {
    'ins.adsbygoogle': nonPosts.every(({ content }) => !content.includes('adsbygoogle')),
    pagead: nonPosts.every(({ content }) => !content.includes('pagead2.googlesyndication.com'))
  });
}

main();
