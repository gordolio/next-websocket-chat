import Database from "better-sqlite3";
import path from "path";
import type { AvatarConfig, UserProfile } from "../src/lib/types";
import { generateDefaultAvatar } from "../src/lib/avatarDefaults";

const dbPath = path.join(process.cwd(), "data", "chat.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    username TEXT PRIMARY KEY,
    color TEXT NOT NULL,
    avatar_config TEXT NOT NULL
  )
`);

interface ProfileRow {
  username: string;
  color: string;
  avatar_config: string;
}

export function getProfile(username: string): UserProfile | null {
  const row = db
    .prepare(
      "SELECT color, avatar_config FROM user_profiles WHERE username = ?",
    )
    .get(username) as ProfileRow | undefined;
  if (!row) return null;

  // Merge stored config with defaults to fill any missing keys from schema changes
  const defaults = generateDefaultAvatar(username);
  const stored = JSON.parse(row.avatar_config) as Partial<AvatarConfig>;
  const avatarConfig: AvatarConfig = { ...defaults, ...stored };

  return { color: row.color, avatarConfig };
}

export function upsertProfile(username: string, profile: UserProfile): void {
  db.prepare(
    `INSERT INTO user_profiles (username, color, avatar_config) VALUES (?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET color = excluded.color, avatar_config = excluded.avatar_config`,
  ).run(username, profile.color, JSON.stringify(profile.avatarConfig));
}
