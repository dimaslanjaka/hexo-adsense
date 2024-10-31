/**
 * Version Parser
 */
class VersionParser {
  result = {
    major: 0,
    minor: 0,
    build: 0
  };

  /**
   * Version Parser Constructor
   * @param str
   */
  constructor(str: string) {
    if (typeof str === 'string') this.parseVersion(str);
  }

  /**
   * Parse Version String
   * @param str
   * @returns
   */
  parseVersion(str: string) {
    if (typeof str !== 'string') {
      throw new Error(`Argument required string, found ${typeof str}`);
    }
    const arr = str.split('.');

    this.result.major = parseInt(arr[0]) || 0;
    this.result.minor = parseInt(arr[1]) || 0;
    this.result.build = parseInt(arr[2]) || 0;
    return this.result;
  }

  toString() {
    return `${this.result.major}.${this.result.minor}.${this.result.build}`;
  }
}

export default VersionParser;
