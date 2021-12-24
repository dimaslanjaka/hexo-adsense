```js
const injector = require('../hexo/_inject/index')(hexo); // will make it as plugin
injector.register(entry, value, predicate, priority, isRun);
injector.register(entry, {
  value: value,
  predicate: predicate,
  priority: priority,
  isRun: true/false
});

entry = 'bodybegin' = 'bodyBegin' = 'body-begin' = 'body_begin'

value = 'String'
value = ctx => `${ctx.page.path}`

predicate = 'home'
predicate = injector.is('home', 'category', ...)
predicate = ctx => ctx.is_post()

// example
injector.register('body-Begin', '------------');
injector.register('bodyBegin', 'AAAA', 'home', 11);
injector.register('bodyBegin', 'BBBB', injector.is('home', 'category'));
injector.register('bodyBegin', 'CCCC', ctx => ctx.is_post());
injector.register('bodyBegin', {
  value    : 'DDDD',
  predicate: ctx => ctx.is_post(),
  priority : 1
});
// if use it in `before_generate` filter, set `isRun` to true
hexo.extend.filter.register('before_generate', () => {
  injector.register('bodyBegin', {
    value    : 'isRun',
    predicate: ctx => ctx.is_post(),
    isRun: true
  });
});
```