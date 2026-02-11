import Database from "better-sqlite3";
import path from "path";
import type { AvatarConfig, UserProfile } from "../src/lib/types";

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
  const row = db.prepare("SELECT color, avatar_config FROM user_profiles WHERE username = ?").get(username) as ProfileRow | undefined;
  if (!row) return null;
  return {
    color: row.color,
    avatarConfig: JSON.parse(row.avatar_config) as AvatarConfig,
  };
}

export function upsertProfile(username: string, profile: UserProfile): void {
  db.prepare(
    `INSERT INTO user_profiles (username, color, avatar_config) VALUES (?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET color = excluded.color, avatar_config = excluded.avatar_config`
  ).run(username, profile.color, JSON.stringify(profile.avatarConfig));
}
