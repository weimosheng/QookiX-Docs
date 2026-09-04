const { execFileSync } = require("child_process");
const fs = require("fs");

let saved = null;
for (let i = 0; i < 12 && !saved; i++) {
  try {
    const out = execFileSync("curl.exe", [
      "-s",
      "--max-time", "15",
      "https://qookix.swkj1.cn/api/releases",
    ], { encoding: "utf8" });
    const data = JSON.parse(out);
    if (data && data.tag_name) {
      saved = data;
      console.log("Got valid release on attempt", i + 1, ":", data.tag_name, "assets:", data.assets.length);
    }
  } catch (e) {
    // retry
  }
  await new Promise((r) => setTimeout(r, 800));
}

if (saved) {
  fs.writeFileSync("release_fallback.json", JSON.stringify(saved, null, 2));
  console.log("Saved to release_fallback.json");
  saved.assets.forEach((a) => console.log(" -", a.name));
} else {
  console.log("FAILED to get valid release");
}
