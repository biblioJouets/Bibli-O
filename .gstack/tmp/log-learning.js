const { spawnSync } = require("child_process");
const fs = require("fs");

for (const file of [".gstack/tmp/learning.json", ".gstack/tmp/learning-ops.json"]) {
  const json = fs.readFileSync(file, "utf8");
  const result = spawnSync(
    "C:/Program Files/Git/bin/bash.exe",
    ["-c", '~/.cursor/skills/gstack/bin/gstack-learnings-log "$1"', "bash", json],
    { encoding: "utf8" }
  );
  console.log(file, result.status);
  console.log(result.stdout || "");
  console.log(result.stderr || "");
}
