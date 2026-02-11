"use client";

import { useEffect, useRef, useState } from "react";
import { ChatRoom } from "./ChatRoom";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("chat-name") || "";
    const savedRoom = localStorage.getItem("chat-room") || "";
    if (savedName) setName(savedName);

    const hash = window.location.hash.slice(1);
    if (hash) {
      setRoom(hash);
    } else if (savedRoom) {
      setRoom(savedRoom);
    }

    nameRef.current?.focus();
  }, []);

  function handleStart() {
    const nameEmpty = !name.trim();
    const roomEmpty = !room.trim();
    setNameError(nameEmpty);
    setRoomError(roomEmpty);
    if (nameEmpty || roomEmpty) return;

    localStorage.setItem("chat-name", name.trim());
    localStorage.setItem("chat-room", room.trim());
    setJoined(true);
  }

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface rounded-xl border border-border p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chat</h1>
          <p className="text-muted mt-2">Chat with people.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted mb-1">
              Name
            </label>
            <input
              ref={nameRef}
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className={`w-full px-3 py-2 rounded-lg bg-background border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition ${
                nameError
                  ? "border-red-500 animate-[shake_0.4s_ease-in-out]"
                  : "border-border"
              }`}
            />
          </div>

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-muted mb-1">
              Room
            </label>
            <input
              id="room"
              type="text"
              placeholder="Room name"
              value={room}
              onChange={(e) => {
                setRoom(e.target.value);
                setRoomError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className={`w-full px-3 py-2 rounded-lg bg-background border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition ${
                roomError
                  ? "border-red-500 animate-[shake_0.4s_ease-in-out]"
                  : "border-border"
              }`}
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition cursor-pointer"
          >
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
}
