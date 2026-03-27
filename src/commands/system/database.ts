import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "assets", "db.json");

if (!fs.existsSync(path.dirname(FILE))) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
}

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({
    mutes: {},
    blacklist: {},
    settings: {}
  }, null, 2));
}

function load() {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data: any) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export { load, save };