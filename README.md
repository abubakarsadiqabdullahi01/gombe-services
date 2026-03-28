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

## GraphQL Guide

For the full implementation and concepts (Next.js route handlers + Apollo Server/Client, schema, resolver flow, and REST vs GraphQL comparison), read:

- [GRAPHQL_IN_NEXTJS.md](./GRAPHQL_IN_NEXTJS.md)
