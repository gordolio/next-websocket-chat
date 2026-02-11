# Next WebSocket Chat

A real-time chat app with customizable bighead avatars and planning poker voting, built with Next.js, WebSockets, and SQLite.

## Features

- **Real-time chat rooms** — join by name, share room links via URL hash
- **Avatar editor** — 20+ options (hair, eyes, hats, clothing, etc.) with live preview and shuffle
- **Planning poker** — Fibonacci-scale voting with hidden votes and reveal/reset controls
- **Typing indicators** — see who's currently typing
- **Browser notifications** — tab title flashing and desktop alerts for new messages
- **Persistent profiles** — avatars and name colors saved to SQLite across sessions

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Runtime | Node.js with custom HTTP + WebSocket server |
| Frontend | React 19, Tailwind CSS 4 |
| Avatars | `extended-bigheads` |
| Database | SQLite via `better-sqlite3` |
| Validation | Zod |
| Language | TypeScript (strict mode) |

## Getting started

```bash
# install dependencies
pnpm install

# start dev server (http://localhost:3000)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), pick a name and room, and start chatting.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build the Next.js app for production |
| `pnpm start` | Run the production server |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |

## Project structure

```
server/
  index.ts            # HTTP + WebSocket server entry
  chatRoom.ts         # Room, session, and broadcast logic
  db.ts               # SQLite profile storage
  env.ts              # Environment variable validation
src/
  app/
    page.tsx           # Login / room selection
    ChatRoom.tsx       # Main chat UI
    AvatarEditorModal.tsx  # Avatar customization modal
    layout.tsx         # Root layout
    globals.css        # Theme and global styles
  lib/
    types.ts           # Shared TypeScript types
    schemas.ts         # Zod validation schemas
    useChat.ts         # WebSocket hook (state, reconnect)
    avatarDefaults.ts  # Avatar generation helpers
    bigheadOptions.ts  # Avatar option definitions
data/
  chat.db             # SQLite database (auto-created)
```
