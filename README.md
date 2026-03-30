# Gombe Services

Gombe Services is a Next.js app for discovering and registering local services in Gombe State.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## API Layers

- REST routes: under `app/api/**`
- GraphQL route: `app/api/graphql/route.ts`

## Docker Modes

Development mode (app + postgres + redis + file sync):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Production-like mode (web only, external DB/Redis required):

```bash
set DATABASE_URL=postgresql://...
set REDIS_URL=redis://...
docker compose up --build
```

## GraphQL Guide

For the full implementation and concepts (Next.js route handlers + Apollo Server/Client, schema, resolver flow, and REST vs GraphQL comparison), read:

- [GRAPHQL_IN_NEXTJS.md](./GRAPHQL_IN_NEXTJS.md)
