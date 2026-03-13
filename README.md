# AI-3Design Pro — Jewelry 3D Design Application

A professional web-based 3D jewelry design suite powered by AI, built with React, Three.js, and Node.js.

## Features

- **3D Workspace** — Interactive Three.js canvas with orbit controls, HDRI lighting, and real-time rendering
- **Parametric CAD Kernel** — Ring, gemstone, prong-setting, and pavé layout generators
- **AI Design Assistant** — Natural-language command interface for design operations
- **Material System** — PBR materials for gold, silver, platinum, and gemstones
- **Gemstone Library** — Round brilliant, emerald, princess, oval, marquise, and pear cuts
- **Export** — STL, OBJ, and glTF export for manufacturing
- **Undo/Redo** — Full scene history

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| 3D       | Three.js, @react-three/fiber, @react-three/drei |
| State    | Zustand |
| Backend  | Node.js, Express, Socket.IO |
| AI       | REST API with mock fallback |

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── frontend/          React + TypeScript + Vite app
│   └── src/
│       ├── components/    UI components (Workspace3D, Toolbar, Inspector…)
│       ├── lib/           CAD kernel, gem primitives, AI service client
│       ├── store/         Zustand scene store with undo/redo
│       └── types/         Shared TypeScript types
└── backend/           Express API server
    └── src/
        ├── routes/        /api/ai, /api/auth, /api/export
        └── middleware/    JWT auth
```

## License

MIT
