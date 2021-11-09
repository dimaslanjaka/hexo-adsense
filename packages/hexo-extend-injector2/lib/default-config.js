'use strict';

module.exports = {

  /**
   * Injector Point
   * If helper used, it will set injector_point_<key> to true
   */
  disable_default_point: false,
  injector_point_headbegin: false,
  injector_point_headend: false,
  injector_point_bodybegin: false,
  injector_point_bodyend: false,

  /**
   * NexT Plugin
   */
  load_next_compatible: true,
  load_next_plugin: true,

  /**
   * Js bundler config, use terser
   */
  js: {
    enable: true,
    path: 'js/injector.js',
    options: {}
  },

  /**
   * CSS bundler config, use clean css
   */
  css: {
    enable: true,
    path: {
      default: {
        path: 'css/injector/main.css',
        link: 'load'
      },
      dark: {
        path: 'css/injector/dark.css',
        link: 'preload'
      },
      light: {
        path: 'css/injector/light.css',
        link: 'preload'
      }
    },
    options: {}
  }

};
