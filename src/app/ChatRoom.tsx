"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BigHead } from "@bigheads/core";
import { useChat } from "@/lib/useChat";
import { getUserColor } from "@/lib/userColor";
import { VoteType, VOTE_LABELS } from "@/lib/types";
import type { VoteType as VoteTypeT, AvatarConfig, UserProfile } from "@/lib/types";
import { AvatarEditorModal } from "./AvatarEditorModal";

const VOTABLE_OPTIONS: { value: VoteTypeT; label: string }[] = [
  { value: VoteType.QUESTION, label: "?" },
  { value: VoteType.ZERO, label: "0" },
  { value: VoteType.HALF, label: "1/2" },
  { value: VoteType.ONE, label: "1" },
  { value: VoteType.TWO, label: "2" },
  { value: VoteType.THREE, label: "3" },
  { value: VoteType.FIVE, label: "5" },
  { value: VoteType.EIGHT, label: "8" },
  { value: VoteType.THIRTEEN, label: "13" },
  { value: VoteType.TWENTY_ONE, label: "21" },
  { value: VoteType.BREAK, label: "coffee" },
];

interface ChatRoomProps {
  username: string;
  roomName: string;
  onLeave: () => void;
}

function UserAvatar({ config, size }: { config?: AvatarConfig; size: number }) {
  if (!config) return <div className="rounded-full bg-muted/30" style={{ width: size, height: size }} />;
  return (
    <div style={{ width: size, height: size }}>
      <BigHead {...(config as any)} />
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
  config?: AvatarConfig;
  color: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ x: rect.left, y: rect.bottom + 6 });
    }
    setShow(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  }

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
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleLeave}
          className="fixed z-50 bg-surface border border-border rounded-xl shadow-2xl p-4 flex flex-col items-center gap-2 animate-in fade-in"
          style={{ left: pos.x, top: pos.y }}
        >
          <UserAvatar config={config} size={96} />
          <span className="text-sm font-semibold" style={{ color }}>{name}</span>
        </div>
      )}
    </>
  );
}

export function ChatRoom({ username, roomName, onLeave }: ChatRoomProps) {
  const [input, setInput] = useState("");
  const [selectedVote, setSelectedVote] = useState<VoteTypeT | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(true);
  const titleIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Helper to get color for a user — prefer profile, fall back to hash
  function colorFor(name: string, profile?: UserProfile) {
    return profile?.color || getUserColor(name);
  }

  // Helper to get avatar config for a user from the users list
  function avatarFor(name: string) {
    const user = users.find((u) => u.username === name);
    return user?.profile?.avatarConfig;
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Focus input on connect
  useEffect(() => {
    if (connected) inputRef.current?.focus();
  }, [connected]);

  // Track window focus for notifications
  useEffect(() => {
    function onFocus() {
      focusedRef.current = true;
      document.title = "Chat";
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
      }
    }
    function onBlur() {
      focusedRef.current = false;
    }
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Notify on new messages when unfocused
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length <= lastMessageCount.current) {
      lastMessageCount.current = messages.length;
      return;
    }
    lastMessageCount.current = messages.length;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.type !== "message" || lastMsg.username === username) return;

    if (!focusedRef.current) {
      // Title flash
      if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
      const titleMessage = `${lastMsg.username} said...`;
      let flip = false;
      titleIntervalRef.current = setInterval(() => {
        document.title = flip ? "Chat" : titleMessage;
        flip = !flip;
      }, 2000);
      document.title = titleMessage;

      // Browser notification
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
  }, [messages, username]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  }, [input, sendMessage]);

  function handleVote(voteType: VoteTypeT) {
    if (selectedVote === voteType) {
      vote(VoteType.UNVOTE);
      setSelectedVote(null);
    } else {
      vote(voteType);
      setSelectedVote(voteType);
    }
  }

  function handleRevealOrClear() {
    if (votesRevealed) {
      clearVoting();
      setSelectedVote(null);
    } else {
      revealVotes();
    }
  }

  function handleSaveProfile(profile: UserProfile) {
    updateProfile(profile);
    setShowEditor(false);
  }

  const typingText =
    typingUsers.length > 0
      ? `${typingUsers.join(", ")} ${typingUsers.length > 1 ? "are" : "is"} typing...`
      : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border shrink-0">
        <h1 className="text-lg font-semibold text-foreground">{roomName}</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
          <button
            onClick={() => setShowEditor(true)}
            className="cursor-pointer hover:opacity-80 transition"
            title="Edit avatar"
          >
            <UserAvatar config={myProfile?.avatarConfig} size={28} />
          </button>
          <span className="text-sm font-medium" style={{ color: colorFor(username, myProfile ?? undefined) }}>
            {username}
          </span>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Messages panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.map((msg) =>
              msg.type === "announcement" ? (
                <div key={msg.id} className="flex items-center gap-1.5 text-sm text-muted py-0.5">
                  <UserHoverCard name={msg.username || ""} config={avatarFor(msg.username || "")} color={colorFor(msg.username || "")}>
                    <div className="shrink-0">
                      <UserAvatar config={avatarFor(msg.username || "")} size={16} />
                    </div>
                    <span className="font-semibold cursor-default" style={{ color: colorFor(msg.username || "") }}>{msg.username}</span>
                  </UserHoverCard>
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2 py-1.5 border-b border-border/50">
                  <UserHoverCard name={msg.username || ""} config={avatarFor(msg.username || "")} color={colorFor(msg.username || "")}>
                    <div className="shrink-0 mt-0.5">
                      <UserAvatar config={avatarFor(msg.username || "")} size={22} />
                    </div>
                    <span className="font-semibold cursor-default" style={{ color: colorFor(msg.username || "") }}>{msg.username}</span>
                  </UserHoverCard>
                  <span className="text-foreground mt-0.5">: {msg.text}</span>
                </div>
              )
            )}
            {typingText && (
              <div className="text-sm text-muted italic pt-1">{typingText}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 bg-surface border-t border-border shrink-0">
            <div className="flex gap-2">
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
                placeholder="Type to chat..."
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition cursor-pointer"
              >
                Send
              </button>
            </div>

            {/* Voting controls */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {VOTABLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleVote(opt.value)}
                  className={`min-w-[2rem] px-2 py-1 rounded text-sm font-medium border transition cursor-pointer ${
                    selectedVote === opt.value
                      ? "bg-accent text-white border-accent"
                      : "bg-surface text-foreground border-muted/50 hover:bg-surface-hover hover:border-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => handleVote(VoteType.UNVOTE)}
                className="px-2 py-1 rounded text-sm font-medium border border-muted/50 bg-surface text-foreground hover:bg-surface-hover hover:border-muted transition cursor-pointer"
              >
                Unvote
              </button>
              <button
                onClick={handleRevealOrClear}
                className="px-3 py-1 rounded text-sm font-semibold border border-accent text-accent hover:bg-accent hover:text-white transition cursor-pointer ml-auto"
              >
                {votesRevealed ? "Clear" : "Reveal"}
              </button>
            </div>
          </div>
        </div>

        {/* Users panel */}
        <aside className="w-56 bg-surface border-l border-border overflow-y-auto shrink-0 hidden sm:block">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Users ({users.length})
            </h2>
          </div>
          <div>
            {users.map((user) => (
              <div
                key={user.publicId}
                className="flex items-center gap-2 px-3 py-2 border-b border-border/50"
              >
                <UserHoverCard name={user.username} config={user.profile?.avatarConfig} color={colorFor(user.username, user.profile)}>
                  <div className="shrink-0">
                    <UserAvatar config={user.profile?.avatarConfig} size={24} />
                  </div>
                  <span
                    className="text-sm truncate flex-1 cursor-default"
                    style={{ color: colorFor(user.username, user.profile) }}
                  >
                    {user.username}
                  </span>
                </UserHoverCard>
                {user.vote && user.vote !== VoteType.UNVOTE && (
                  <span
                    className={`text-sm font-mono font-semibold shrink-0 ${
                      user.vote === VoteType.HIDDEN ? "text-green-400" : "text-accent"
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
