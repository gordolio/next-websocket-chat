import { randomBytes } from "crypto";
import type { WebSocket } from "ws";
import type {
  ChatEvent,
  UserData,
  UserProfile,
  UserVoteData,
  VoteType,
} from "../src/lib/types";
import { ClientRequestSchema } from "../src/lib/schemas";
import { getProfile, upsertProfile } from "./db";
import {
  generateDefaultAvatar,
  generateDefaultColor,
} from "../src/lib/avatarDefaults";

interface Session {
  sessionId: string;
  publicId: string;
  socket: WebSocket | null;
  username: string;
  roomName: string;
  currentVote: VoteType;
  voteHidden: boolean;
  profile: UserProfile;
}

interface Room {
  name: string;
  users: Map<string, Session>;
}

const sessions = new Map<string, Session>();
const rooms = new Map<string, Room>();

function randomId(): string {
  return randomBytes(6).toString("hex");
}

function getOrCreateRoom(name: string): Room {
  let room = rooms.get(name);
  if (!room) {
    room = { name, users: new Map() };
    rooms.set(name, room);
  }
  return room;
}

function buildUserData(session: Session): UserData {
  const vote =
    session.voteHidden && session.currentVote !== "UNVOTE"
      ? "HIDDEN"
      : session.currentVote;
  return {
    username: session.username,
    publicId: session.publicId,
    vote: vote as VoteType,
    profile: session.profile,
  };
}

function broadcast(roomName: string, event: ChatEvent) {
  const room = rooms.get(roomName);
  if (!room) return;
  const data = JSON.stringify(event);
  for (const session of room.users.values()) {
    if (session.socket?.readyState === 1) {
      session.socket.send(data);
    }
  }
}

function loadOrCreateProfile(username: string): UserProfile {
  const existing = getProfile(username);
  if (existing) return existing;

  const profile: UserProfile = {
    color: generateDefaultColor(username),
    avatarConfig: generateDefaultAvatar(username),
  };
  upsertProfile(username, profile);
  return profile;
}

export function startSession(): string {
  const session: Session = {
    sessionId: randomId(),
    publicId: randomId(),
    socket: null,
    username: "",
    roomName: "",
    currentVote: "UNVOTE",
    voteHidden: true,
    profile: { color: "", avatarConfig: generateDefaultAvatar("") },
  };
  sessions.set(session.sessionId, session);
  return session.sessionId;
}

export function connectSocket(sessionId: string, socket: WebSocket) {
  const session = sessions.get(sessionId);
  if (session) {
    session.socket = socket;
  }
}

export function handleMessage(socket: WebSocket, raw: string) {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return;
  }

  const result = ClientRequestSchema.safeParse(json);
  if (!result.success) return;
  const request = result.data;

  switch (request.action) {
    case "connect":
      connectSocket(request.sessionId, socket);
      break;
    case "joinRoom":
      joinRoom(request.sessionId, request.roomName, request.username);
      break;
    case "leaveRoom":
      leaveRoom(request.sessionId);
      break;
    case "sendMessage":
      sendMessage(request.sessionId, request.message);
      break;
    case "userTyping":
      userTyping(request.sessionId);
      break;
    case "userVote":
      userVote(request.sessionId, request.vote);
      break;
    case "revealVotes":
      revealVotes(request.sessionId);
      break;
    case "clearVoting":
      clearVoting(request.sessionId);
      break;
    case "updateProfile":
      updateProfile(request.sessionId, request.profile);
      break;
  }
}

export function handleDisconnect(socket: WebSocket) {
  for (const session of sessions.values()) {
    if (session.socket === socket) {
      leaveRoom(session.sessionId);
      return;
    }
  }
}

function deduplicateName(room: Room, desired: string): string {
  const taken = new Set<string>();
  for (const u of room.users.values()) {
    taken.add(u.username);
  }
  if (!taken.has(desired)) return desired;

  let suffix = 2;
  while (taken.has(`${desired} (${suffix})`)) suffix++;
  return `${desired} (${suffix})`;
}

function joinRoom(sessionId: string, roomName: string, username: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const room = getOrCreateRoom(roomName);
  session.username = deduplicateName(room, username);
  session.roomName = roomName;
  session.currentVote = "UNVOTE";
  session.voteHidden = true;
  session.profile = loadOrCreateProfile(session.username);

  room.users.set(sessionId, session);

  const allUsers: UserData[] = [];
  for (const u of room.users.values()) {
    allUsers.push(buildUserData(u));
  }

  broadcast(roomName, {
    type: "JoinEvent",
    username: session.username,
    publicId: session.publicId,
    profile: session.profile,
    allUsers,
  });
}

function leaveRoom(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  const room = rooms.get(session.roomName);
  if (room) {
    room.users.delete(sessionId);
    if (room.users.size === 0) {
      rooms.delete(session.roomName);
    }
  }

  broadcast(session.roomName, {
    type: "LeaveEvent",
    username: session.username,
    publicId: session.publicId,
  });

  sessions.delete(sessionId);
}

function sendMessage(sessionId: string, message: string) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  broadcast(session.roomName, {
    type: "MessageEvent",
    username: session.username,
    publicId: session.publicId,
    message,
  });
}

function userTyping(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  broadcast(session.roomName, {
    type: "TypingEvent",
    username: session.username,
    publicId: session.publicId,
  });
}

function userVote(sessionId: string, vote: VoteType) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  session.currentVote = vote;

  const broadcastVote =
    session.voteHidden && vote !== "UNVOTE" ? "HIDDEN" : vote;

  broadcast(session.roomName, {
    type: "VoteEvent",
    username: session.username,
    publicId: session.publicId,
    vote: broadcastVote as VoteType,
  });
}

function revealVotes(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  const room = rooms.get(session.roomName);
  if (!room) return;

  const votes: UserVoteData[] = [];
  for (const u of room.users.values()) {
    u.voteHidden = false;
    votes.push({
      username: u.username,
      publicId: u.publicId,
      vote: u.currentVote,
    });
  }

  broadcast(session.roomName, {
    type: "RevealVotesEvent",
    username: session.username,
    publicId: session.publicId,
    votes,
  });
}

function clearVoting(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  const room = rooms.get(session.roomName);
  if (!room) return;

  for (const u of room.users.values()) {
    u.voteHidden = true;
    u.currentVote = "UNVOTE";
  }

  broadcast(session.roomName, {
    type: "ClearVotesEvent",
    username: session.username,
    publicId: session.publicId,
  });
}

function updateProfile(sessionId: string, profile: UserProfile) {
  const session = sessions.get(sessionId);
  if (!session || !session.roomName) return;

  session.profile = profile;
  upsertProfile(session.username, profile);

  broadcast(session.roomName, {
    type: "ProfileUpdateEvent",
    username: session.username,
    publicId: session.publicId,
    profile,
  });
}
