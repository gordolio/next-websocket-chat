import { z } from "zod";
import { bigHeadOptions } from "./bigheadOptions";
import type { AvatarConfig, UserProfile } from "./types";

// --- Vote ---

export const VoteTypeSchema = z.enum([
  "UNVOTE",
  "HIDDEN",
  "QUESTION",
  "BREAK",
  "ZERO",
  "HALF",
  "ONE",
  "TWO",
  "THREE",
  "FIVE",
  "EIGHT",
  "THIRTEEN",
  "TWENTY_ONE",
]);

// --- Avatar / Profile ---

const AvatarConfigRaw = z.object({
  hair: z.enum(bigHeadOptions.hair),
  hairColor: z.enum(bigHeadOptions.hairColor),
  eyes: z.enum(bigHeadOptions.eyes),
  eyebrows: z.enum(bigHeadOptions.eyebrows),
  mouth: z.enum(bigHeadOptions.mouth),
  facialHair: z.enum(bigHeadOptions.facialHair),
  clothing: z.enum(bigHeadOptions.clothing),
  clothingColor: z.enum(bigHeadOptions.clothingColor),
  accessory: z.enum(bigHeadOptions.accessory),
  graphic: z.enum(bigHeadOptions.graphic),
  skinTone: z.enum(bigHeadOptions.skinTone),
  body: z.enum(bigHeadOptions.body),
  hat: z.enum(bigHeadOptions.hat),
  hatColor: z.enum(bigHeadOptions.hatColor),
  lipColor: z.enum(bigHeadOptions.lipColor),
  facialHairColor: z.enum(bigHeadOptions.facialHairColor),
  backgroundColor: z.enum(bigHeadOptions.backgroundColor),
  backgroundShape: z.enum(bigHeadOptions.backgroundShape),
  faceMaskColor: z.enum(bigHeadOptions.faceMaskColor),
  showBackground: z.boolean(),
  lashes: z.boolean(),
  faceMask: z.boolean(),
});

export const AvatarConfigSchema: z.ZodType<AvatarConfig> =
  AvatarConfigRaw as z.ZodType<AvatarConfig>;

export const UserProfileSchema: z.ZodType<UserProfile> = z.object({
  color: z.string(),
  avatarConfig: AvatarConfigSchema,
}) as z.ZodType<UserProfile>;

// --- User Data ---

export const UserDataSchema = z.object({
  username: z.string(),
  publicId: z.string(),
  vote: VoteTypeSchema.optional(),
  profile: UserProfileSchema.optional(),
});

export const UserVoteDataSchema = UserDataSchema.extend({
  vote: VoteTypeSchema,
});

// --- Server -> Client events ---

export const JoinEventSchema = UserDataSchema.extend({
  type: z.literal("JoinEvent"),
  allUsers: z.array(UserDataSchema),
});

export const LeaveEventSchema = UserDataSchema.extend({
  type: z.literal("LeaveEvent"),
});

export const MessageEventSchema = UserDataSchema.extend({
  type: z.literal("MessageEvent"),
  message: z.string(),
});

export const TypingEventSchema = UserDataSchema.extend({
  type: z.literal("TypingEvent"),
});

export const VoteEventSchema = UserDataSchema.extend({
  type: z.literal("VoteEvent"),
  vote: VoteTypeSchema,
});

export const RevealVotesEventSchema = UserDataSchema.extend({
  type: z.literal("RevealVotesEvent"),
  votes: z.array(UserVoteDataSchema),
});

export const ClearVotesEventSchema = UserDataSchema.extend({
  type: z.literal("ClearVotesEvent"),
});

export const ProfileUpdateEventSchema = UserDataSchema.extend({
  type: z.literal("ProfileUpdateEvent"),
  profile: UserProfileSchema,
});

export const ChatEventSchema = z.discriminatedUnion("type", [
  JoinEventSchema,
  LeaveEventSchema,
  MessageEventSchema,
  TypingEventSchema,
  VoteEventSchema,
  RevealVotesEventSchema,
  ClearVotesEventSchema,
  ProfileUpdateEventSchema,
]);

// --- Client -> Server requests ---

export const StartSessionResponseSchema = z.object({
  sessionId: z.string(),
});

export const ConnectRequestSchema = z.object({
  action: z.literal("connect"),
  sessionId: z.string(),
});

export const JoinRoomRequestSchema = z.object({
  action: z.literal("joinRoom"),
  sessionId: z.string(),
  roomName: z.string(),
  username: z.string(),
});

export const LeaveRoomRequestSchema = z.object({
  action: z.literal("leaveRoom"),
  sessionId: z.string(),
  roomName: z.string(),
});

export const SendMessageRequestSchema = z.object({
  action: z.literal("sendMessage"),
  sessionId: z.string(),
  roomName: z.string(),
  message: z.string(),
});

export const UserTypingRequestSchema = z.object({
  action: z.literal("userTyping"),
  sessionId: z.string(),
  roomName: z.string(),
});

export const UserVoteRequestSchema = z.object({
  action: z.literal("userVote"),
  sessionId: z.string(),
  roomName: z.string(),
  vote: VoteTypeSchema,
});

export const RevealVoteRequestSchema = z.object({
  action: z.literal("revealVotes"),
  sessionId: z.string(),
  roomName: z.string(),
});

export const ClearVotingRequestSchema = z.object({
  action: z.literal("clearVoting"),
  sessionId: z.string(),
  roomName: z.string(),
});

export const UpdateProfileRequestSchema = z.object({
  action: z.literal("updateProfile"),
  sessionId: z.string(),
  roomName: z.string(),
  profile: UserProfileSchema,
});

export const ClientRequestSchema = z.discriminatedUnion("action", [
  ConnectRequestSchema,
  JoinRoomRequestSchema,
  LeaveRoomRequestSchema,
  SendMessageRequestSchema,
  UserTypingRequestSchema,
  UserVoteRequestSchema,
  RevealVoteRequestSchema,
  ClearVotingRequestSchema,
  UpdateProfileRequestSchema,
]);

// --- API responses ---

export const ProfileResponseSchema = z.object({
  profile: UserProfileSchema.nullable(),
});
