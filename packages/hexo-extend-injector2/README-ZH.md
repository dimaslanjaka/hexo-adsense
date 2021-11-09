# hexo-extend-injector2

为插件或者主题提供扩展，能将代码注入到指定位置（如果主题提供相应的注入点）

![npm](https://img.shields.io/npm/v/hexo-extend-injector2.svg)

这个插件的功能借鉴了原生injector的设计，但由于其无法兼容原本的NexT插件方案，重新设计以提供更多扩展能力，详细见[这个PR](https://github.com/jiangtj/hexo-theme-cake/pull/39)

## Install

```bash
yarn add hexo-extend-injector2
```

## Usage

首先，你需要获取injector实例通过require，下面的API中injector都是这样获取

```js
const injector = require('hexo-extend-injector2')(hexo);
```

### 注册

injector 有两种注册的写法

```js
injector.register(entry, value, predicate, priority, isRun);
injector.register(entry, {
  value: value,
  predicate: predicate,
  priority: priority,
  isRun: true/false
});
```

#### 参数

|  属性名   | 类型  | 描述  | 默认值  |
|  :-----  | :----- | :-----  | :-----  |
| entry  | String | 注入点，它忽略大小写以及` ` `-` `_`，即 'bodybegin' = 'bodyBegin' = 'body-begin' = 'body_begin' | - |
| value  | String/Function  | 注入的内容，如果是函数，会传递上下文及配置参数 | - |
| predicate  | String/Function  | 生效条件，详见例子 | `() => true` |
| priority  | Number  | 优先级 | 10 |
| isRun  | Boolean  | 特别定义的参数，hexo部分内容在文件更改之后重新加载，重新加载时会清空isRun为true的内容，避免重复加载 | false |


#### 例子

1. 最简单的使用，在你的站点的head中添加fontawesome css，下面三种写法是等效的
```js
injector.register('head-end', '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">');
injector.register('head-end', () => '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">');
injector.register('head-end', {
  value: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">'
});
```

2. Predicate的使用
```js
// 当你需要在特定的页面注入内容时，需要用到Predicate，分为两种写法

// 与官方一样的，指定布局类型，如下，将在特定的music布局中添加APlayer
injector.register('head_end', () => {
  return css('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css');
}, 'music');
injector.register('body_end', '<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js">', 'music');
// 等价于 使用了 injector.is('home', 'category', ...)，可以传递多个布局，同时生效
injector.register('body_end', '<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js">', injector.is('music'));

// 依据上下文或者配置选项判断
injector.register('head-end', {
  predicate: (ctx, options) => {
    // ctx 在不同情况下，传入的值可能不同，options 在 injector.get() 时传入
    return ctx.page['music'];
  },
  value: () => {
    return css('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css');
  }
});
```

### 获取

默认情况下，只提供四个注入点 `head-begin` `head-end` `body-begin` `body-end`，你可以设置`disable_injector2_default_point`为true禁用

其他情况，需要开发者提供JS API或者Hexo Helper两种途径获取存储在injector的内容，自行处理它

#### API

```js
const result = injector.get(entry, options);
```

- result.list(): 获取该注入点的所有注入对象
- result.rendered(): 获取并渲染该注入点的所有注入对象（如果value是函数，将执行转化为String）
- result.text(): 将该注入点的所有注入内容渲染拼接后返回

例子

```js
// 在bundler中，通过添加env来判断是否是需要的css内容
injector.get('css', {env: 'dark'});
// 覆盖默认的ctx
injector.get('point', {context: this});
```

#### Helper

injector helper 与 injector.get() 十分相似，但context替换为了hexo的本地变量

```ejs
<!DOCTYPE html>
<html>
<head>
  <%- injector('head-begin').text() -%>
  ...
  <%- injector('head-end').text() -%>
</head>
<body>
  <%- injector('body-begin').text() -%>
  ...
  <%- injector('body-end').text() -%>
</body>
</html>
```

### bundler

该插件提供了js与css的bundler，你可以很方便的将js与css添加至主题中

#### config

下面是bundler的默认配置

```yml
injector2:
  js:
    enable: true
    path: js/injector.js
    options: {}
  css:
    enable: true
    path:
      default:
        # 在 head 中添加 <link rel="stylesheet" type="text/css" href="${url_for(file.path)}" />
        link: load
        path: css/injector/main.css
      dark:
        # 在 head 中添加 <link rel="preload" as="style" href="${url_for(file.path)}" />
        link: preload
        path: css/injector/dark.css
      light:
        link: preload
        path: css/injector/light.css
    options: {}
```

#### API/Example

```js
injector.register('js or css', 'content');

// Example
injector.register('js', 'function log1() {console.log("bar");}');
injector.register('css', '.book{font-size:2rem}');

// CSS spec
// 额外添加了env的选择，如果env不同，那么会打包到不同的css文件下
// 你需要提前进行配置，默认情况下配置了default、dark和light，如果不设置为default
injector.register('css', {value: '.book{font-size:2rem}', env: 'dark'});

// CSS 别名
injector.register('variable', 'css content');
//=> injector.register('css', {value: 'css content', priority: injector.order.REGISTER_VARIABLE});
injector.register('style', 'css content');
//=> injector.register('css', {value: 'css content', priority: injector.order.REGISTER_STYLE});
```

### NexT plugin

如果你希望在你的主题中使用NexT主题的插件，启用以下配置（默认启用），如果存在不兼容的插件，可以提交issue

```yml
injector:
  load_next_plugin: true
```

除此外，主题需要提供与[NexT类似的注入点](lib/next-point.js)，如[Cake](https://github.com/jiangtj/hexo-theme-cake)主题已经添加，但如果是其它主题，你可能需要自己添加它
