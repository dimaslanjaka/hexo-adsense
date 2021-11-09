const exec = require("child_process").exec;
const path = require("path");

exec("hexo server", { cwd: path.join(__dirname, "../../../") }, (err, stdout, stderr) => {
  if (err) throw err;
  console.log(stdout);
});
