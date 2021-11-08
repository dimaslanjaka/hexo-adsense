const injector = require('hexo-extend-injector2')(hexo); // will make it as plugin

injector.register('head-end', {
  value: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1165447249910969" crossorigin="anonymous"></script>`
});