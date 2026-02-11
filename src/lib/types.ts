export const VoteType = {
  UNVOTE: "UNVOTE",
  HIDDEN: "HIDDEN",
  QUESTION: "QUESTION",
  BREAK: "BREAK",
  ZERO: "ZERO",
  HALF: "HALF",
  ONE: "ONE",
  TWO: "TWO",
  THREE: "THREE",
  FIVE: "FIVE",
  EIGHT: "EIGHT",
  THIRTEEN: "THIRTEEN",
  TWENTY_ONE: "TWENTY_ONE",
} as const;

export type VoteType = (typeof VoteType)[keyof typeof VoteType];

export const VOTE_LABELS: Record<string, string> = {
  [VoteType.QUESTION]: "?",
  [VoteType.BREAK]: "☕",
  [VoteType.ZERO]: "0",
  [VoteType.HALF]: "½",
  [VoteType.ONE]: "1",
  [VoteType.TWO]: "2",
  [VoteType.THREE]: "3",
  [VoteType.FIVE]: "5",
  [VoteType.EIGHT]: "8",
  [VoteType.THIRTEEN]: "13",
  [VoteType.TWENTY_ONE]: "21",
  [VoteType.HIDDEN]: "✓",
  [VoteType.UNVOTE]: "",
};

// --- Avatar / Profile ---

export interface AvatarConfig {
  hair: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  facialHair: string;
  clothing: string;
  clothingColor: string;
  accessory: string;
  graphic: string;
  skinTone: string;
  body: string;
  hat: string;
  hatColor: string;
  lipColor: string;
  lashes: boolean;
  faceMask: boolean;
}

export interface UserProfile {
  color: string;
  avatarConfig: AvatarConfig;
}

// --- Events ---

export type EventType =
  | "JoinEvent"
  | "LeaveEvent"
  | "MessageEvent"
  | "TypingEvent"
  | "VoteEvent"
  | "RevealVotesEvent"
  | "ClearVotesEvent"
  | "ProfileUpdateEvent";

export interface UserData {
  username: string;
  publicId: string;
  vote?: VoteType;
  profile?: UserProfile;
}

export interface UserVoteData extends UserData {
  vote: VoteType;
}

// --- Server -> Client events ---

export interface JoinEvent extends UserData {
  type: "JoinEvent";
  allUsers: UserData[];
}

export interface LeaveEvent extends UserData {
  type: "LeaveEvent";
}

export interface MessageEvent extends UserData {
  type: "MessageEvent";
  message: string;
}

export interface TypingEvent extends UserData {
  type: "TypingEvent";
}

export interface VoteEvent extends UserData {
  type: "VoteEvent";
  vote: VoteType;
}

export interface RevealVotesEvent extends UserData {
  type: "RevealVotesEvent";
  votes: UserVoteData[];
}

export interface ClearVotesEvent extends UserData {
  type: "ClearVotesEvent";
}

export interface ProfileUpdateEvent extends UserData {
  type: "ProfileUpdateEvent";
  profile: UserProfile;
}

export type ChatEvent =
  | JoinEvent
  | LeaveEvent
  | MessageEvent
  | TypingEvent
  | VoteEvent
  | RevealVotesEvent
  | ClearVotesEvent
  | ProfileUpdateEvent;

// --- Client -> Server requests ---

export interface StartSessionResponse {
  sessionId: string;
}

export interface ConnectRequest {
  action: "connect";
  sessionId: string;
}

export interface JoinRoomRequest {
  action: "joinRoom";
  sessionId: string;
  roomName: string;
  username: string;
}

export interface LeaveRoomRequest {
  action: "leaveRoom";
  sessionId: string;
  roomName: string;
}

export interface SendMessageRequest {
  action: "sendMessage";
  sessionId: string;
  roomName: string;
  message: string;
}

export interface UserTypingRequest {
  action: "userTyping";
  sessionId: string;
  roomName: string;
}

export interface UserVoteRequest {
  action: "userVote";
  sessionId: string;
  roomName: string;
  vote: VoteType;
}

export interface RevealVoteRequest {
  action: "revealVotes";
  sessionId: string;
  roomName: string;
}

export interface ClearVotingRequest {
  action: "clearVoting";
  sessionId: string;
  roomName: string;
}

export interface UpdateProfileRequest {
  action: "updateProfile";
  sessionId: string;
  roomName: string;
  profile: UserProfile;
}

export type ClientRequest =
  | ConnectRequest
  | JoinRoomRequest
  | LeaveRoomRequest
  | SendMessageRequest
  | UserTypingRequest
  | UserVoteRequest
  | RevealVoteRequest
  | ClearVotingRequest
  | UpdateProfileRequest;
