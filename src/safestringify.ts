/**
 * JSON safestringify
 * @see {@link https://github.com/bugsnag/safe-json-stringify#readme}
 */
export default function safeStringify(
  data: any,
  replacer: (this: any, key: string, value: any) => any,
  space: string | number,
  opts: { redactedKeys: any; redactedPaths: any }
) {
  const redactedKeys = opts && opts.redactedKeys ? opts.redactedKeys : [];
  const redactedPaths = opts && opts.redactedPaths ? opts.redactedPaths : [];
  return JSON.stringify(prepareObjForSerialization(data, redactedKeys, redactedPaths), replacer, space);
}

const MAX_DEPTH = 20;
const MAX_EDGES = 25000;
const MIN_PRESERVED_DEPTH = 8;
const REPLACEMENT_NODE = '...';

function isError(o) {
  return o instanceof Error || /^\[object (Error|(Dom)?Exception)\]$/.test(Object.prototype.toString.call(o));
}

function throwsMessage(err) {
  return '[Throws: ' + (err ? err.message : '?') + ']';
}

function find(haystack, needle) {
  for (let i = 0, len = haystack.length; i < len; i++) {
    if (haystack[i] === needle) return true;
  }
  return false;
}

// returns true if the string `path` starts with any of the provided `paths`
function isDescendent(paths, path) {
  for (let i = 0, len = paths.length; i < len; i++) {
    if (path.indexOf(paths[i]) === 0) return true;
  }
  return false;
}

function shouldRedact(patterns, key) {
  for (let i = 0, len = patterns.length; i < len; i++) {
    if (typeof patterns[i] === 'string' && patterns[i].toLowerCase() === key.toLowerCase()) return true;
    if (patterns[i] && typeof patterns[i].test === 'function' && patterns[i].test(key)) return true;
  }
  return false;
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function safelyGetProp(obj, prop) {
  try {
    return obj[prop];
  } catch (err) {
    return throwsMessage(err);
  }
}

function prepareObjForSerialization(obj, redactedKeys, redactedPaths) {
  const seen = []; // store references to objects we have seen before
  let edges = 0;

  function visit(obj, path) {
    function edgesExceeded() {
      return path.length > MIN_PRESERVED_DEPTH && edges > MAX_EDGES;
    }

    edges++;

    if (path.length > MAX_DEPTH) return REPLACEMENT_NODE;
    if (edgesExceeded()) return REPLACEMENT_NODE;
    if (obj === null || typeof obj !== 'object') return obj;
    if (find(seen, obj)) return '[Circular]';

    seen.push(obj);

    if (typeof obj.toJSON === 'function') {
      try {
        edges--;
        const fResult = visit(obj.toJSON(), path);
        seen.pop();
        return fResult;
      } catch (err) {
        return throwsMessage(err);
      }
    }

    const er = isError(obj);
    if (er) {
      edges--;
      const eResult = visit({ name: obj.name, message: obj.message }, path);
      seen.pop();
      return eResult;
    }

    if (isArray(obj)) {
      const aResult = [];
      for (let i = 0, len = obj.length; i < len; i++) {
        if (edgesExceeded()) {
          aResult.push(REPLACEMENT_NODE);
          break;
        }
        aResult.push(visit(obj[i], path.concat('[]')));
      }
      seen.pop();
      return aResult;
    }

    const result = {};
    try {
      for (const prop in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
        if (isDescendent(redactedPaths, path.join('.')) && shouldRedact(redactedKeys, prop)) {
          result[prop] = '[REDACTED]';
          continue;
        }
        if (edgesExceeded()) {
          result[prop] = REPLACEMENT_NODE;
          break;
        }
        result[prop] = visit(safelyGetProp(obj, prop), path.concat(prop));
      }
    } catch (_e) {
      //
    }
    seen.pop();
    return result;
  }

  return visit(obj, []);
}
