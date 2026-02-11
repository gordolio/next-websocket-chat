"use client";

import { useCallback, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { ChatRoom } from "./ChatRoom";

function getHashRoom() {
  if (typeof window === "undefined") return "";
  return window.location.hash.slice(1);
}

export default function Home() {
  const [savedName, setSavedName] = useLocalStorageState("chat-name", { defaultValue: "" });
  const [savedRoom, setSavedRoom] = useLocalStorageState("chat-room", { defaultValue: "" });

  const [name, setName] = useState(savedName);
  const [room, setRoom] = useState(() => getHashRoom() || savedRoom);
  const [joined, setJoined] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const nameRef = useCallback((node: HTMLInputElement | null) => node?.focus(), []);

  const handleStart = useCallback(() => {
    const nameEmpty = !name.trim();
    const roomEmpty = !room.trim();
    setNameError(nameEmpty);
    setRoomError(roomEmpty);
    if (nameEmpty || roomEmpty) return;

    setSavedName(name.trim());
    setSavedRoom(room.trim());
    setJoined(true);
  }, [name, room, setSavedName, setSavedRoom]);

  if (joined) {
    return (
      <ChatRoom
        username={name.trim()}
        roomName={room.trim()}
        onLeave={() => setJoined(false)}
      />
    );
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      <div className="animate-fade-in-scale w-full max-w-sm">
        {/* Card */}
        <div className="relative bg-surface/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)]">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="text-center mb-8">
            {/* Logo mark */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Join the conversation
            </h1>
            <p className="text-muted text-sm mt-1.5">Pick a name and a room to get started</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                Your name
              </label>
              <input
                ref={nameRef}
                id="name"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className={`input-glow w-full px-4 py-2.5 rounded-xl bg-background border text-foreground placeholder-muted/60 focus:outline-none transition-all duration-200 ${
                  nameError
                    ? "border-danger animate-[shake_0.4s_ease-in-out]"
                    : "border-border hover:border-muted/50 focus:border-accent/50"
                }`}
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                Room
              </label>
              <input
                id="room"
                type="text"
                placeholder="e.g. design-team, standup"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  setRoomError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className={`input-glow w-full px-4 py-2.5 rounded-xl bg-background border text-foreground placeholder-muted/60 focus:outline-none transition-all duration-200 ${
                  roomError
                    ? "border-danger animate-[shake_0.4s_ease-in-out]"
                    : "border-border hover:border-muted/50 focus:border-accent/50"
                }`}
              />
            </div>

            <button
              onClick={handleStart}
              className="group w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold transition-all duration-200 cursor-pointer shadow-[0_2px_16px_-4px_rgba(226,160,82,0.3)] hover:shadow-[0_4px_24px_-4px_rgba(226,160,82,0.4)] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                Start Chatting
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-muted/50 text-xs mt-4">
          Tip: share a room link with <span className="font-mono text-muted/70">#room-name</span> in the URL
        </p>
      </div>
    </div>
  );
}
