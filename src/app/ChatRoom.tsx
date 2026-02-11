"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BigHead } from "extended-bigheads";
import { useVisibilityChange } from "@uidotdev/usehooks";
import { useChat } from "@/lib/useChat";
import { getUserColor } from "@/lib/userColor";
import { VoteType, VOTE_LABELS } from "@/lib/types";
import type { VoteType as VoteTypeT, AvatarConfig, UserProfile } from "@/lib/types";
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

function UserAvatar({ config, size }: { config?: AvatarConfig | undefined; size: number }) {
  if (!config) return <div className="rounded-full bg-muted/20" style={{ width: size, height: size }} />;
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <BigHead {...(config as React.ComponentProps<typeof BigHead>)} showBackground={false} />
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
          className="animate-fade-in-scale fixed z-50 bg-surface border border-border rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] p-4 flex flex-col items-center gap-2"
          style={{ left: pos.x, top: pos.y }}
        >
          <UserAvatar config={config} size={180} />
          <span className="text-sm font-semibold" style={{ color }}>{name}</span>
        </div>
      )}
    </>
  );
}

function TypingIndicator({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-muted py-1.5 px-1 animate-fade-in">
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
    (name: string, profile?: UserProfile) => profile?.color || getUserColor(name),
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
    if (!lastMsg || lastMsg.type !== "message" || lastMsg.username === username) return;

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
      } else if ("Notification" in window && Notification.permission !== "denied") {
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-surface/80 backdrop-blur-md border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent/80" />
            <h1 className="text-base font-semibold text-foreground tracking-tight">{roomName}</h1>
          </div>
          <span className="text-xs text-muted font-mono">{users.length} online</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-success" : "bg-danger"}`} />
            <span className="text-xs text-muted">{connected ? "Connected" : "Reconnecting..."}</span>
          </div>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => setShowEditor(true)}
            className="cursor-pointer flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors"
            title="Edit avatar"
          >
            <UserAvatar config={myProfile?.avatarConfig} size={48} />
            <span className="text-sm font-medium" style={{ color: colorFor(username, myProfile ?? undefined) }}>
              {username}
            </span>
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Messages panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((msg, i) =>
              msg.type === "announcement" ? (
                <div key={msg.id} className="flex items-center justify-center gap-2 text-xs text-muted py-2 animate-fade-in" style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}>
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="flex items-center gap-1.5 px-2">
                    <span className="font-medium" style={{ color: colorFor(msg.username || "") }}>{msg.username}</span>
                    <span>{msg.text}</span>
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              ) : (
                <div key={msg.id} className="message-row flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg" style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}>
                  <UserHoverCard name={msg.username || ""} config={avatarFor(msg.username || "")} color={colorFor(msg.username || "")}>
                    <div className="shrink-0 mt-0.5">
                      <UserAvatar config={avatarFor(msg.username || "")} size={56} />
                    </div>
                  </UserHoverCard>
                  <div className="flex-1 min-w-0">
                    <UserHoverCard name={msg.username || ""} config={avatarFor(msg.username || "")} color={colorFor(msg.username || "")}>
                      <span className="text-sm font-semibold cursor-default" style={{ color: colorFor(msg.username || "") }}>
                        {msg.username}
                      </span>
                    </UserHoverCard>
                    <p className="text-foreground text-[0.9375rem] leading-relaxed mt-0.5 break-words">{msg.text}</p>
                  </div>
                </div>
              )
            )}
            <TypingIndicator text={typingText} />
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            {/* Voting controls */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 px-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wider mr-1">Vote</span>
              {VOTABLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleVote(opt.value)}
                  className={`vote-btn min-w-[2rem] px-2 py-1 rounded-lg text-sm font-medium border cursor-pointer ${
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
                  className="vote-btn px-2 py-1 rounded-lg text-sm font-medium border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleRevealOrClear}
                className={`vote-btn ml-auto px-3 py-1 rounded-lg text-sm font-semibold border cursor-pointer ${
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
              <div className="flex-1 relative">
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
                  className="input-glow w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-default text-background font-medium transition-all duration-200 cursor-pointer shadow-[0_2px_12px_-4px_rgba(226,160,82,0.2)] hover:shadow-[0_4px_20px_-4px_rgba(226,160,82,0.3)] active:scale-[0.97]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Users panel */}
        <aside className="w-60 bg-surface/50 border-l border-border overflow-y-auto shrink-0 hidden sm:block">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
              People
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] px-1 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                {users.length}
              </span>
            </h2>
          </div>
          <div className="p-2">
            {users.map((user) => (
              <div
                key={user.publicId}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-hover/50 transition-colors"
              >
                <UserHoverCard name={user.username} config={user.profile?.avatarConfig} color={colorFor(user.username, user.profile)}>
                  <div className="shrink-0 relative">
                    <UserAvatar config={user.profile?.avatarConfig} size={48} />
                    {/* Online dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface" />
                  </div>
                </UserHoverCard>
                <div className="flex-1 min-w-0">
                  <UserHoverCard name={user.username} config={user.profile?.avatarConfig} color={colorFor(user.username, user.profile)}>
                    <span
                      className="text-sm font-medium truncate block cursor-default"
                      style={{ color: colorFor(user.username, user.profile) }}
                    >
                      {user.username}
                      {user.username === username && (
                        <span className="text-muted text-xs ml-1 font-normal">(you)</span>
                      )}
                    </span>
                  </UserHoverCard>
                </div>
                {user.vote && user.vote !== VoteType.UNVOTE && (
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
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
      {showEditor && myProfile && (
        <AvatarEditorModal
          profile={myProfile}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
