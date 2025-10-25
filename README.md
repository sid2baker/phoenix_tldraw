# Tldraw + Phoenix

A real-time collaborative whiteboard application built with [tldraw](https://tldraw.dev) and Phoenix/Elixir.

## Features

- **Real-time collaboration**: Multiple users can draw and edit simultaneously
- **Multi-tab sync**: Changes sync across browser tabs and persist after refresh
- **WebSocket-based**: Uses tldraw's sync protocol v7 over WebSockets
- **Persistent rooms**: Room state is maintained via GenServers

## Tech Stack

- **Backend**: Elixir + Phoenix + Bandit (WebSocket server)
- **Frontend**: React + TypeScript + tldraw SDK
- **Sync**: `@tldraw/sync` with custom Phoenix WebSocket handler
- **Build**: Vite

## Architecture

### Backend (`lib/`)

- **`TldrawWeb.SyncHandler`** - WebSocket handler implementing tldraw sync protocol v7
  - Handles `connect`, `push`, `ping/pong` messages
  - Applies operational transformation via recursive diff patching
  - Broadcasts changes to other clients via PubSub

- **`Tldraw.Sync.RoomServer`** - GenServer maintaining persistent room state
  - Stores document state and server clock per room
  - Registered via `Registry` for easy lookup

- **`Tldraw.Sync.RoomSupervisor`** - DynamicSupervisor managing room processes

- **`TldrawWeb.Plugs.SyncWebSocketPlug`** - Plug intercepting `/sync/*` requests for WebSocket upgrade

### Frontend (`assets/js/`)

- **`app.tsx`** - React app using tldraw's `useSync` hook
  - Connects to WebSocket endpoint
  - Handles loading/error states
  - Renders tldraw editor

## Getting Started

### Prerequisites

- Elixir 1.15+
- Node.js 18+

### Installation

```bash
# Install Elixir dependencies
mix deps.get

# Install Node dependencies
cd assets && npm install && cd ..
```

### Running

```bash
# Start Phoenix server
mix phx.server
```

Visit [http://localhost:4000](http://localhost:4000)

Open multiple tabs or browsers to test real-time collaboration!

## How It Works

1. Client connects via WebSocket to `/sync/{room_id}`
2. Server sends full document state on connect
3. Client sends `push` messages with diffs when drawing
4. Server applies diffs using operational transformation
5. Server broadcasts patches to all other clients in the room
6. Room state persists in GenServer, survives page refreshes

## Protocol

Implements tldraw sync protocol v7:

- **`connect`**: Initial handshake with full document hydration
- **`push`**: Client sends changes (diff format)
- **`push_result`**: Server acknowledges with new server clock
- **`patch`**: Server broadcasts changes to other clients
- **`ping/pong`**: Keepalive messages

Diff operations: `["put", record]`, `["patch", changes]`, `["remove"]`
