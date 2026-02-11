"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BigHead } from "extended-bigheads";
import { useVisibilityChange } from "@uidotdev/usehooks";
import { useChat } from "@/lib/useChat";
import { getUserColor } from "@/lib/userColor";
import { VoteType, VOTE_LABELS } from "@/lib/types";
import type {
  VoteType as VoteTypeT,
  AvatarConfig,
  UserProfile,
} from "@/lib/types";
import { AvatarEditorModal } from "./AvatarEditorModal";

const VOTABLE_OPTIONS: { value: VoteTypeT; label: string }[] = [
  { value: VoteType.QUESTION, label: "?" },
  { value: VoteType.ZERO, label: "0" },
  { value: VoteType.HALF, label: "½" },
  { value: VoteType.ONE, label: "1" },
  { value: VoteType.TWO, label: "2" },
  { value: VoteType.THREE, label: "3" },
  { value: VoteType.FIVE, label: "5" },
  { value: VoteType.EIGHT, label: "8" },
  { value: VoteType.THIRTEEN, label: "13" },
  { value: VoteType.TWENTY_ONE, label: "21" },
  { value: VoteType.BREAK, label: "☕" },
];

interface ChatRoomProps {
  username: string;
  roomName: string;
  onLeave: () => void;
}

function UserAvatar({
  config,
  size,
}: {
  config?: AvatarConfig | undefined;
  size: number;
}) {
  if (!config)
    return (
      <div
        className="bg-muted/20 rounded-full"
        style={{ width: size, height: size }}
      />
    );
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <BigHead {...config} showBackground={false} />
    </div>
  );
}

function UserHoverCard({
  name,
  config,
  color,
  children,
}: {
  name: string;
  config?: AvatarConfig | undefined;
  color: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ x: rect.left, y: rect.bottom + 8 });
    }
    setShow(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  }, []);

  const handleCardEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="inline-flex items-center"
      >
        {children}
      </span>
      {show && (
        <div
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleLeave}
          className="animate-fade-in-scale bg-surface border-border fixed z-50 flex flex-col items-center gap-2 rounded-2xl border p-4 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]"
          style={{ left: pos.x, top: pos.y }}
        >
          <UserAvatar config={config} size={180} />
          <span className="text-sm font-semibold" style={{ color }}>
            {name}
          </span>
        </div>
      )}
    </>
  );
}

function TypingIndicator({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="text-muted animate-fade-in flex items-center gap-2 px-1 py-1.5 text-sm">
      <span className="flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </span>
      <span className="italic">{text}</span>
    </div>
  );
}

export function ChatRoom({ username, roomName, onLeave }: ChatRoomProps) {
  const [input, setInput] = useState("");
  const [selectedVote, setSelectedVote] = useState<VoteTypeT | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use library hook instead of manual focus/blur addEventListener
  const documentVisible = useVisibilityChange();

  // Clear title flash when tab becomes visible again
  useEffect(() => {
    if (documentVisible) {
      document.title = "Chat";
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
      }
    }
  }, [documentVisible]);

  const {
    connected,
    messages,
    users,
    typingUsers,
    votesRevealed,
    myProfile,
    sendMessage,
    sendTyping,
    vote,
    revealVotes,
    clearVoting,
    updateProfile,
  } = useChat({
    username,
    roomName,
    onDisconnect: onLeave,
  });

  const colorFor = useCallback(
    (name: string, profile?: UserProfile) =>
      profile?.color || getUserColor(name),
    [],
  );

  const avatarFor = useCallback(
    (name: string) => {
      const user = users.find((u) => u.username === name);
      return user?.profile?.avatarConfig;
    },
    [users],
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Auto-focus input on connect
  useEffect(() => {
    if (connected) inputRef.current?.focus();
  }, [connected]);

  // Title flash + notification on new messages when tab is hidden
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length <= lastMessageCount.current) {
      lastMessageCount.current = messages.length;
      return;
    }
    lastMessageCount.current = messages.length;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.type !== "message" || lastMsg.username === username)
      return;

    if (!documentVisible) {
      if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
      const titleMessage = `${lastMsg.username} said...`;
      let flip = false;
      titleIntervalRef.current = setInterval(() => {
        document.title = flip ? "Chat" : titleMessage;
        flip = !flip;
      }, 2000);
      document.title = titleMessage;

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(lastMsg.username!, { body: lastMsg.text });
      } else if (
        "Notification" in window &&
        Notification.permission !== "denied"
      ) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(lastMsg.username!, { body: lastMsg.text });
          }
        });
      }
    }
  }, [messages, username, documentVisible]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  }, [input, sendMessage]);

  const handleVote = useCallback(
    (voteType: VoteTypeT) => {
      if (selectedVote === voteType) {
        vote(VoteType.UNVOTE);
        setSelectedVote(null);
      } else {
        vote(voteType);
        setSelectedVote(voteType);
      }
    },
    [selectedVote, vote],
  );

  const handleRevealOrClear = useCallback(() => {
    if (votesRevealed) {
      clearVoting();
      setSelectedVote(null);
    } else {
      revealVotes();
    }
  }, [votesRevealed, clearVoting, revealVotes]);

  const handleSaveProfile = useCallback(
    (profile: UserProfile) => {
      updateProfile(profile);
      setShowEditor(false);
    },
    [updateProfile],
  );

  const typingText = useMemo(
    () =>
      typingUsers.length > 0
        ? `${typingUsers.join(", ")} ${typingUsers.length > 1 ? "are" : "is"} typing...`
        : null,
    [typingUsers],
  );

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <header className="bg-surface/80 border-border flex shrink-0 items-center justify-between border-b px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-accent/80 h-2 w-2 rounded-full" />
            <h1 className="text-foreground text-base font-semibold tracking-tight">
              {roomName}
            </h1>
          </div>
          <span className="text-muted font-mono text-xs">
            {users.length} online
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-danger"}`}
            />
            <span className="text-muted text-xs">
              {connected ? "Connected" : "Reconnecting..."}
            </span>
          </div>
          <div className="bg-border h-5 w-px" />
          <button
            onClick={() => setShowEditor(true)}
            className="hover:bg-surface-hover flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors"
            title="Edit avatar"
          >
            <UserAvatar config={myProfile.avatarConfig} size={48} />
            <span
              className="text-sm font-medium"
              style={{ color: colorFor(username, myProfile) }}
            >
              {username}
            </span>
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* Messages panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((msg, i) =>
              msg.type === "announcement" ? (
                <div
                  key={msg.id}
                  className="text-muted animate-fade-in flex items-center justify-center gap-2 py-2 text-xs"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <div className="bg-border/50 h-px flex-1" />
                  <span className="flex items-center gap-1.5 px-2">
                    <span
                      className="font-medium"
                      style={{ color: colorFor(msg.username || "") }}
                    >
                      {msg.username}
                    </span>
                    <span>{msg.text}</span>
                  </span>
                  <div className="bg-border/50 h-px flex-1" />
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="message-row -mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <UserHoverCard
                    name={msg.username || ""}
                    config={avatarFor(msg.username || "")}
                    color={colorFor(msg.username || "")}
                  >
                    <div className="mt-0.5 shrink-0">
                      <UserAvatar
                        config={avatarFor(msg.username || "")}
                        size={56}
                      />
                    </div>
                  </UserHoverCard>
                  <div className="min-w-0 flex-1">
                    <UserHoverCard
                      name={msg.username || ""}
                      config={avatarFor(msg.username || "")}
                      color={colorFor(msg.username || "")}
                    >
                      <span
                        className="cursor-default text-sm font-semibold"
                        style={{ color: colorFor(msg.username || "") }}
                      >
                        {msg.username}
                      </span>
                    </UserHoverCard>
                    <p className="text-foreground mt-0.5 text-[0.9375rem] leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ),
            )}
            <TypingIndicator text={typingText} />
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 px-4 pt-2 pb-4">
            {/* Voting controls */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-muted mr-1 text-xs font-medium tracking-wider uppercase">
                Vote
              </span>
              {VOTABLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleVote(opt.value)}
                  className={`vote-btn min-w-[2rem] cursor-pointer rounded-lg border px-2 py-1 text-sm font-medium ${
                    selectedVote === opt.value
                      ? "bg-accent text-background border-accent shadow-[0_0_12px_-2px_rgba(226,160,82,0.3)]"
                      : "bg-surface text-foreground-dim border-border hover:bg-surface-hover hover:text-foreground hover:border-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {selectedVote && (
                <button
                  onClick={() => handleVote(VoteType.UNVOTE)}
                  className="vote-btn border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover cursor-pointer rounded-lg border px-2 py-1 text-sm font-medium"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleRevealOrClear}
                className={`vote-btn ml-auto cursor-pointer rounded-lg border px-3 py-1 text-sm font-semibold ${
                  votesRevealed
                    ? "border-muted/50 text-muted hover:text-foreground hover:bg-surface-hover"
                    : "border-accent/50 text-accent hover:bg-accent hover:text-background hover:border-accent"
                }`}
              >
                {votesRevealed ? "Reset" : "Reveal"}
              </button>
            </div>

            {/* Chat input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    sendTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Write a message..."
                  className="input-glow bg-surface border-border text-foreground placeholder-muted/50 focus:border-accent/50 w-full rounded-xl border px-4 py-2.5 transition-all duration-200 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-accent hover:bg-accent-hover text-background cursor-pointer rounded-xl px-4 py-2.5 font-medium shadow-[0_2px_12px_-4px_rgba(226,160,82,0.2)] transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(226,160,82,0.3)] active:scale-[0.97] disabled:cursor-default disabled:opacity-30"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Users panel */}
        <aside className="bg-surface/50 border-border hidden w-60 shrink-0 overflow-y-auto border-l sm:block">
          <div className="border-border border-b p-4">
            <h2 className="text-muted text-xs font-semibold tracking-wider uppercase">
              People
              <span className="bg-accent/10 text-accent ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold">
                {users.length}
              </span>
            </h2>
          </div>
          <div className="p-2">
            {users.map((user) => (
              <div
                key={user.publicId}
                className="hover:bg-surface-hover/50 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
              >
                <UserHoverCard
                  name={user.username}
                  config={user.profile?.avatarConfig}
                  color={colorFor(user.username, user.profile)}
                >
                  <div className="relative shrink-0">
                    <UserAvatar config={user.profile?.avatarConfig} size={48} />
                    {/* Online dot */}
                    <div className="bg-success border-surface absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2" />
                  </div>
                </UserHoverCard>
                <div className="min-w-0 flex-1">
                  <UserHoverCard
                    name={user.username}
                    config={user.profile?.avatarConfig}
                    color={colorFor(user.username, user.profile)}
                  >
                    <span
                      className="block cursor-default truncate text-sm font-medium"
                      style={{ color: colorFor(user.username, user.profile) }}
                    >
                      {user.username}
                      {user.username === username && (
                        <span className="text-muted ml-1 text-xs font-normal">
                          (you)
                        </span>
                      )}
                    </span>
                  </UserHoverCard>
                </div>
                {user.vote && user.vote !== VoteType.UNVOTE && (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
                      user.vote === VoteType.HIDDEN
                        ? "bg-success/10 text-success"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {VOTE_LABELS[user.vote] || user.vote}
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Avatar Editor Modal */}
      {showEditor && (
        <AvatarEditorModal
          profile={myProfile}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
