import { exec } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import versionParser from './tmp/dist/src/versionParser.js';
import readline from 'readline';
import Moment from 'moment';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const packages = JSON.parse(readFileSync('./package.json'));

const version = new versionParser(packages.version);
const __dirname = dirname(fileURLToPath(import.meta.url));

function updateChangelog(callback) {
  exec('git log --reflog --pretty=format:"%h : %s %b %ad" --not --remotes', (err, stdout, stderr) => {
    const std = stdout
      .split('\n')
      .filter((el) => el != null && el.trim().length > 0)
      .map((str) => str.trim());
    const date = Moment().format('YYYY-MM-DDTHH:mm:ss');
    let build = `\n\n## [${packages.version}] ${date}\n`;
    std.forEach((str) => {
      build += `- ${str}\n`;
    });

    const changelog = join(__dirname, 'CHANGELOG.md');
    let readChangelog = readFileSync(changelog).toString().trim();
    readChangelog += build;
    writeFileSync(changelog, readChangelog);
    if (typeof callback === 'function') callback();
  });
}

if (typeof version === 'object') {
  rl.question('Overwrite? [yes]/no: ', (answer) => {
    if (answer.toLowerCase() === 'no' || answer.toLowerCase() === 'n') {
      console.log('Publish Cancel');
    } else {
      console.log('Updating version');
      version.result.build++;
      packages.version = version.toString();
      writeFileSync('./package.json', JSON.stringify(packages, null, 2));
      console.log('Compiling...');
      exec('tsc -p tsconfig.json', (err, stdout, stderr) => {
        if (!err) {
          console.log('Build Typescript Successfully');
          console.log('Publishing');
          exec('npm publish', (err, stdout, stderr) => {
            console.log('Packages Published Successfully');

            // add to git
            updateChangelog(() => {
              exec('git add .', (err) => {
                if (!err) exec(`git commit -m "Update release ${version.toString()}"`);
              });
            });
          });
        } else {
          console.log('Publish Failed, Rollback version');
          version.result.build--;
          packages.version = version.toString();
          writeFileSync('./package.json', JSON.stringify(packages, null, 2));

          console.log(stderr);
          throw err;
        }
      });
    }
    rl.close();
  });
}
