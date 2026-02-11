import { z } from "zod";
import {
  HAIR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_OPTIONS,
  EYEBROW_OPTIONS,
  MOUTH_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  CLOTHING_OPTIONS,
  CLOTHING_COLOR_OPTIONS,
  ACCESSORY_OPTIONS,
  GRAPHIC_OPTIONS,
  SKIN_TONE_OPTIONS,
  BODY_OPTIONS,
  HAT_OPTIONS,
  HAT_COLOR_OPTIONS,
  LIP_COLOR_OPTIONS,
} from "./avatarDefaults";

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

export const AvatarConfigSchema = z.object({
  hair: z.enum(HAIR_OPTIONS),
  hairColor: z.enum(HAIR_COLOR_OPTIONS),
  eyes: z.enum(EYE_OPTIONS),
  eyebrows: z.enum(EYEBROW_OPTIONS),
  mouth: z.enum(MOUTH_OPTIONS),
  facialHair: z.enum(FACIAL_HAIR_OPTIONS),
  clothing: z.enum(CLOTHING_OPTIONS),
  clothingColor: z.enum(CLOTHING_COLOR_OPTIONS),
  accessory: z.enum(ACCESSORY_OPTIONS),
  graphic: z.enum(GRAPHIC_OPTIONS),
  skinTone: z.enum(SKIN_TONE_OPTIONS),
  body: z.enum(BODY_OPTIONS),
  hat: z.enum(HAT_OPTIONS),
  hatColor: z.enum(HAT_COLOR_OPTIONS),
  lipColor: z.enum(LIP_COLOR_OPTIONS),
  lashes: z.boolean(),
  faceMask: z.boolean(),
});

export const UserProfileSchema = z.object({
  color: z.string(),
  avatarConfig: AvatarConfigSchema,
});

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
