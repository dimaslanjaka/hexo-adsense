const { exec } = require("child_process");
const { writeFileSync, readFileSync } = require("fs");
const versionParser = require("./packages/hexo-blogger-xml/src/parser/versionParser");
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);
const packages = require("./package.json");
const version = new versionParser(packages.version);
const Moment = require("moment");
const { join } = require("path");

if (typeof version == "object") {
  rl.question("Overwrite? [yes]/no: ", function (answer) {
    if ((answer.toLowerCase() === "no") | (answer.toLowerCase() === "n")) {
      console.log("Publish Cancel");
    } else {
      console.log("Updating version");
      version.result.build++;
      packages.version = version.toString();
      writeFileSync("./package.json", JSON.stringify(packages, null, 2));
      console.log("Publishing");
      exec("npm publish", (err, stdout, stderr) => {
        console.log("Packages Published Successfully");

        // add to git
        updateChangelog(() => {
          exec("git add .", (err) => {
            if (!err) exec(`git commit -m "Update release ${version.toString()}"`);
          });
        });
      });
    }
    rl.close();
  });
}

function updateChangelog(callback) {
  exec('git log --reflog --pretty=format:"%h : %s" --not --remotes', (err, stdout, stderr) => {
    const std = stdout
      .split("\n")
      .filter(
        /**
         * filter non-empty
         * @param {string} el
         * @returns {boolean}
         */
        function (el) {
          return el != null && el.trim().length > 0;
        }
      )
      .map(
        /**
         * Trim
         * @param {string} str
         * @returns {string}
         */
        function (str) {
          return str.trim();
        }
      );
    const date = Moment().format("LL");
    let build = `\n\n## [${packages.version}] ${date}\n`;
    std.forEach((str) => {
      build += `-${str}\n`;
    });

    const changelog = join(__dirname, "CHANGELOG.md");
    let readChangelog = readFileSync(changelog).toString().trim();
    readChangelog += build;
    writeFileSync(changelog, readChangelog);
    if (typeof callback == "function") callback();
  });
}
