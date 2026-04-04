# FindEase — Lost & Found (MERN)

FindEase is a college lost & found management dashboard built with **React (Vite)** + **TailwindCSS** on the frontend and **Node.js + Express + MongoDB Atlas (Mongoose)** on the backend.

## Features

- Dashboard-style UI (SaaS-like)
- Sidebar navigation (React Router)
- Lost item reporting form (Axios)
- Lost items list fetched from backend
- Light/Dark mode toggle (Tailwind `dark` class + localStorage)
- MongoDB Atlas integration

## Project structure

```
FindEase/
  client/   # React + Vite + Tailwind
  server/   # Express + Mongoose
```

## Environment variables

Copy the examples and fill in real values:

```bash
copy .env.example server\.env
copy client\.env.example client\.env
```

You must set **MongoDB Atlas** connection string in `server/.env`:

- `MONGODB_URI=...`

## Run (recommended: from project root)

Install once (workspaces):

```bash
npm install
```

Start **backend + frontend** together:

```bash
npm run dev
```

## Run separately (exact commands)

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## API

- `POST /api/lost/add` — add lost item `{ name, category, description, image? }`
- `GET /api/lost/all` — get all items (newest first)
- `GET /health` — server health + db connection status

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step deployment (Vercel for frontend, Render for backend).

