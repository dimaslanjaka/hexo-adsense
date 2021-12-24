# hexo-extend-injector2

Provide extensions for plugins or themes to inject code to specified locations (if the theme provides corresponding injection points)

![npm](https://img.shields.io/npm/v/hexo-extend-injector2.svg)

[中文文档](README-ZH.md)

The function of this plugin refers to the design of the native injector, but because it cannot be compatible with the original next plugin scheme, it is redesigned to provide more extension capabilities. For details, see [this PR](https://github.com/jiangtj/hexo-theme-cake/pull/39)

## Install

```bash
yarn add hexo-extend-injector2
```

## Usage

First of all, you need to obtain the injector instance through require. The injectors in the following API are all obtained like this

```js
const injector = require('hexo-extend-injector2')(hexo);
```

### Register

There are two ways to write

```js
injector.register(entry, value, predicate, priority, isRun);
injector.register(entry, {
  value: value,
  predicate: predicate,
  priority: priority,
  isRun: true/false
});
```

#### Params

|  attribute   | type  | description  | default  |
|  :-----  | :----- | :-----  | :-----  |
| entry  | String | injection position, it ignores case and ` ` `-` `_`, e.g. 'bodybegin' = 'bodyBegin' = 'body-begin' = 'body_begin' | - |
| value  | String/Function  | injected content, if it is a function, will pass the context and options parameters | - |
| predicate  | String/Function  | effective conditions, see example for details | `() => true` |
| priority  | Number  | priority | 10 |
| isRun  | Boolean  | Part of the content of hexo is reloaded after the file is changed. When reloading, the content of isRun will be cleared to avoid repeated loading. | false |


#### Example

1. This is simplest demo, add fontawesome CSS to the head of your site. The following three methods are equivalent
```js
injector.register('head-end', '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">');
injector.register('head-end', () => '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">');
injector.register('head-end', {
  value: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/css/all.min.css" crossorigin="anonymous">'
});
```

2. Use of Predicate
```js
// When you need to inject content on a specific page, you need to use Predicate, which is divided into two ways of writing

// Like the official, specify the layout type, as follows, APlayer will be added to the specific music layout
injector.register('head_end', () => {
  return css('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css');
}, 'music');
injector.register('body_end', '<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js">', 'music');
// Equivalent to using injector.is('home','category', ...), multiple layouts can be passed, and they will take effect at the same time
injector.register('body_end', '<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js">', injector.is('music'));

// Judging by context or options
injector.register('head-end', {
  predicate: (ctx, options) => {
    // ctx in different situations, the value passed in may be different, 
    return ctx.page['music'];
  },
  value: () => {
    return css('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css');
  }
});
```

### Get

By default, only four injection points are provided `head-begin` `head-end` `body-begin` `body-end`, you can set `disable_injector2_default_point` to true to disable

In other cases, developers need to use JS API or Hexo Helper to obtain the content stored in the injector, and process it by yourself

#### API

```js
const result = injector.get(entry, options);
```

- result.list(): Get all injection objects of this injection point
- result.rendered(): get and render all injection objects of this injection point (if value is a function, it will be converted to String)
- result.text(): render and merge all the injected content of this injection point

Example

```js
// In bundler, by adding env to determine whether it is the required css content
injector.get('css', {env: 'dark'});
// Override the default ctx
injector.get('point', {context: this});
```

#### Helper

The injector helper is very similar to injector.get(), but the context is replaced with the local variables of hexo

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

The plug-in provides the bundler of JS and CSS, which can be easily added to the theme

#### config

The following is the default configuration of the bundler

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
        # Add <link rel="stylesheet" type="text/css" href="${url_for(file.path)}" /> in the head
        link: load
        path: css/injector/main.css
      dark:
        # Add <link rel="preload" as="style" href="${url_for(file.path)}" /> in the head
        link: preload
        path: css/injector/dark.css
      light:
        link: preload
        path: css/injector/light.css
    options: {}
```

#### API/Example

```js
injector.register('js or css', 'content or file path');

// Example
injector.register('js', 'function log1() {console.log("bar");}');
injector.register('css', '.book{font-size:2rem}');

// CSS spec
// Additional env options are added. If the env is different, it will be packaged into a different CSS file
// But you need to configure it in advance. default dark and light are set by default, if not set, it will be default
injector.register('css', {value: '.book{font-size:2rem}', env: 'dark'});

// CSS alias
injector.register('variable', 'css content');
//=> injector.register('css', {value: 'css content', priority: injector.order.REGISTER_VARIABLE});
injector.register('style', 'css content');
//=> injector.register('css', {value: 'css content', priority: injector.order.REGISTER_STYLE});
```

### NexT plugin

If you want to use next theme plug-ins in your theme, enable the following configuration (enabled by default). If there are incompatible plug-ins, you can submit the issue

```yml
injector:
  load_next_plugin: true
```

In addition, theme need to provide the injection point similar to [next](lib/next-point.js), such as [cake](https://github.com/jiangtj/hexo-theme-cake) has been added, but if it's another theme, you may need to add it by yourself.
