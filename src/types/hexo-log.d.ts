declare module 'hexo-log' {
  function hexoLogFactory(options?: { silent?: boolean; debug?: boolean }): any;
  const logger: any;
  export default hexoLogFactory;
  export { logger };
}
