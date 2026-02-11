"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ChatEvent,
  ClientRequest,
  UserData,
  UserProfile,
  VoteType,
} from "./types";
import { ChatEventSchema, StartSessionResponseSchema } from "./schemas";
import {
  generateDefaultAvatar,
  generateDefaultColor,
} from "./avatarDefaults";

export interface ChatMessage {
  id: string;
  type: "message" | "announcement";
  username?: string;
  text: string;
}

export interface ChatUser extends UserData {
  vote?: VoteType | undefined;
  profile?: UserProfile | undefined;
}

interface UseChatOptions {
  username: string;
  roomName: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

let msgId = 0;

export function useChat({
  username,
  roomName,
  onConnect,
  onDisconnect,
}: UseChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usersTypingTimeoutsRef = useRef<
    Map<string, { username: string; timeoutId: ReturnType<typeof setTimeout> }>
  >(new Map());

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [myProfile, setMyProfile] = useState<UserProfile>(() => ({
    color: generateDefaultColor(username),
    avatarConfig: generateDefaultAvatar(username),
  }));

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addAnnouncement = useCallback(
    (user: string, text: string) => {
      addMessage({
        id: String(++msgId),
        type: "announcement",
        username: user,
        text,
      });
    },
    [addMessage],
  );

  const updateTypingUsers = useCallback(() => {
    const names: string[] = [];
    for (const val of usersTypingTimeoutsRef.current.values()) {
      names.push(val.username);
    }
    setTypingUsers(names);
  }, []);

  const clearTypingTimeout = useCallback(
    (publicId: string) => {
      const entry = usersTypingTimeoutsRef.current.get(publicId);
      if (entry) {
        clearTimeout(entry.timeoutId);
        usersTypingTimeoutsRef.current.delete(publicId);
        updateTypingUsers();
      }
    },
    [updateTypingUsers],
  );

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      switch (event.type) {
        case "JoinEvent":
          addAnnouncement(event.username, "has joined");
          setUsers(
            event.allUsers.map((u) => ({
              username: u.username,
              publicId: u.publicId,
              vote: u.vote,
              profile: u.profile,
            })),
          );
          // Set our own profile from the join event
          {
            const me = event.allUsers.find((u) => u.username === username);
            if (me?.profile) {
              setMyProfile(me.profile);
            }
          }
          break;

        case "LeaveEvent":
          setUsers((prev) => prev.filter((u) => u.publicId !== event.publicId));
          addAnnouncement(event.username, "has left");
          break;

        case "MessageEvent":
          clearTypingTimeout(event.publicId);
          addMessage({
            id: String(++msgId),
            type: "message",
            username: event.username,
            text: event.message,
          });
          break;

        case "TypingEvent": {
          const existing = usersTypingTimeoutsRef.current.get(event.publicId);
          if (existing) clearTimeout(existing.timeoutId);

          const timeoutId = setTimeout(() => {
            usersTypingTimeoutsRef.current.delete(event.publicId);
            updateTypingUsers();
          }, 6000);

          usersTypingTimeoutsRef.current.set(event.publicId, {
            username: event.username,
            timeoutId,
          });
          updateTypingUsers();
          break;
        }

        case "VoteEvent":
          if (event.vote === "UNVOTE") {
            addAnnouncement(event.username, "has un-voted.");
          } else {
            addAnnouncement(event.username, "has voted.");
          }
          setUsers((prev) =>
            prev.map((u) =>
              u.publicId === event.publicId ? { ...u, vote: event.vote } : u,
            ),
          );
          break;

        case "RevealVotesEvent":
          addAnnouncement(event.username, "revealed the votes.");
          setVotesRevealed(true);
          setUsers((prev) =>
            prev.map((u) => {
              const voteData = event.votes.find(
                (v) => v.publicId === u.publicId,
              );
              return voteData ? { ...u, vote: voteData.vote } : u;
            }),
          );
          break;

        case "ClearVotesEvent":
          addAnnouncement(event.username, "cleared the votes.");
          setVotesRevealed(false);
          setUsers((prev) =>
            prev.map((u) => ({ ...u, vote: "UNVOTE" as VoteType })),
          );
          break;

        case "ProfileUpdateEvent":
          setUsers((prev) =>
            prev.map((u) =>
              u.publicId === event.publicId
                ? { ...u, profile: event.profile }
                : u,
            ),
          );
          // Update our own profile if it's ours
          if (event.username === username) {
            setMyProfile(event.profile);
          }
          break;
      }
    },
    [
      addMessage,
      addAnnouncement,
      clearTypingTimeout,
      updateTypingUsers,
      username,
    ],
  );

  const send = useCallback((request: ClientRequest) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(request));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const res = await fetch("/api/startSession");
      const json = await res.json();
      const { sessionId } = StartSessionResponseSchema.parse(json);
      if (cancelled) return;
      sessionIdRef.current = sessionId;

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        send({ action: "connect", sessionId });
        send({ action: "joinRoom", sessionId, roomName, username });
        setConnected(true);
        onConnect?.();
      };

      ws.onmessage = (e) => {
        try {
          const parsed = ChatEventSchema.safeParse(JSON.parse(e.data));
          if (!parsed.success) return;
          handleEvent(parsed.data);
        } catch {
          // ignore bad messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        onDisconnect?.();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        send({
          action: "leaveRoom",
          sessionId: sessionIdRef.current,
          roomName,
        });
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, roomName]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      send({
        action: "sendMessage",
        sessionId: sessionIdRef.current,
        roomName,
        message,
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [send, roomName],
  );

  const sendTyping = useCallback(() => {
    if (!typingTimeoutRef.current) {
      send({
        action: "userTyping",
        sessionId: sessionIdRef.current,
        roomName,
      });
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 4000);
    }
  }, [send, roomName]);

  const vote = useCallback(
    (voteType: VoteType) => {
      send({
        action: "userVote",
        sessionId: sessionIdRef.current,
        roomName,
        vote: voteType,
      });
    },
    [send, roomName],
  );

  const revealVotes = useCallback(() => {
    send({
      action: "revealVotes",
      sessionId: sessionIdRef.current,
      roomName,
    });
  }, [send, roomName]);

  const clearVoting = useCallback(() => {
    send({
      action: "clearVoting",
      sessionId: sessionIdRef.current,
      roomName,
    });
  }, [send, roomName]);

  const updateProfile = useCallback(
    (profile: UserProfile) => {
      send({
        action: "updateProfile",
        sessionId: sessionIdRef.current,
        roomName,
        profile,
      });
    },
    [send, roomName],
  );

  return {
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
  };
}
