import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "assets", "json", "muted.json");

if (!fs.existsSync(path.dirname(FILE))) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
}

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({}));
}

let muted: Record<string, number> = {};

try {
  muted = JSON.parse(fs.readFileSync(FILE, "utf-8"));
} catch {
  muted = {};
}

export function getMuted() {
  return muted;
}

export function setMuted(user: string, time: number) {
  muted[user] = time;
  saveMuted();
}

export function removeMuted(user: string) {
  delete muted[user];
  saveMuted();
}

export function saveMuted() {
  fs.writeFileSync(FILE, JSON.stringify(muted, null, 2));
}