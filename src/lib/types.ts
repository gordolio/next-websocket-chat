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

export type Hair = "none" | "long" | "bun" | "short" | "pixie" | "balding" | "buzz" | "afro" | "bob" | "mohawk";
export type HairColor = "blonde" | "brown" | "black" | "white" | "silver" | "red" | "orange" | "blue" | "pink" | "purple" | "lightRed" | "lightOrange" | "lightGreen" | "lightBlue" | "lightPink" | "lightPurple" | "green" | "turqoise" | "lightTurqoise";
export type Eyes = "normal" | "leftTwitch" | "happy" | "content" | "squint" | "simple" | "dizzy" | "wink" | "heart" | "crazy" | "cute" | "cyborg" | "dollars" | "stars" | "simplePatch" | "piratePatch";
export type Eyebrows = "raised" | "leftLowered" | "serious" | "angry" | "concerned" | "none";
export type Mouth = "grin" | "sad" | "openSmile" | "lips" | "open" | "serious" | "tongue" | "piercedTongue" | "vomitingRainbow";
export type FacialHair = "none" | "stubble" | "mediumBeard" | "goatee";
export type Clothing = "naked" | "shirt" | "dressShirt" | "vneck" | "tankTop" | "dress" | "denimJacket" | "hoodie" | "chequeredShirt" | "chequeredShirtDark";
export type ClothingColor = "white" | "gray" | "black" | "red" | "orange" | "yellow" | "green" | "blue" | "pink" | "purple" | "lightRed" | "lightOrange" | "lightYellow" | "lightGreen" | "lightBlue" | "lightPink" | "lightPurple" | "turqoise" | "lightTurqoise";
export type Accessory = "none" | "roundGlasses" | "tinyGlasses" | "shades" | "hoopEarrings";
export type Graphic = "none" | "redwood" | "gatsby" | "vue" | "react" | "graphQL" | "donut" | "rainbow";
export type SkinTone = "light" | "yellow" | "brown" | "dark" | "red" | "black";
export type Body = "chest" | "breasts";
export type Hat = "none" | "beanie" | "turban" | "party" | "hijab";
export type HatColor = ClothingColor;
export type LipColor = "red" | "pink" | "purple" | "blue" | "green" | "turqoise" | "lightRed" | "lightPink" | "lightPurple" | "lightBlue" | "lightGreen" | "lightTurqoise";

export interface AvatarConfig {
  hair: Hair;
  hairColor: HairColor;
  eyes: Eyes;
  eyebrows: Eyebrows;
  mouth: Mouth;
  facialHair: FacialHair;
  clothing: Clothing;
  clothingColor: ClothingColor;
  accessory: Accessory;
  graphic: Graphic;
  skinTone: SkinTone;
  body: Body;
  hat: Hat;
  hatColor: HatColor;
  lipColor: LipColor;
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
  vote?: VoteType | undefined;
  profile?: UserProfile | undefined;
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
