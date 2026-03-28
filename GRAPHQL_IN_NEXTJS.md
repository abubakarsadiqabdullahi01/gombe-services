# GraphQL in This Next.js App

This project uses **Next.js Route Handlers** plus **Apollo Server** for GraphQL, and **Apollo Client** on the frontend.

## Architecture

- GraphQL API endpoint: `app/api/graphql/route.ts`
- Apollo Server integration: `@as-integrations/next`
- Prisma data access: `lib/db.ts`
- Apollo Client provider: `components/providers/apollo-provider.tsx`
- Frontend GraphQL usage:
  - `app/services/page.tsx` (`GetCategories`, `GetServices`)
  - `app/register/page.tsx` (`GetCategories`, `RegisterService`)

## How Next.js API and GraphQL Fit Together

Next.js gives you built-in backend handlers under `app/api/**/route.ts`.

- With REST: each route usually maps to a resource/action (`GET /api/services`, `POST /api/services`).
- With GraphQL: you still use a Next route, but usually **one endpoint** (`/api/graphql`) and send queries/mutations in request body.

So GraphQL in Next.js is not separate from Next API. It runs inside Next API route handlers.

## Schema Implemented Here

Types:
- `Category`
- `Provider`
- `Service`
- `ServicesResult` (services + pagination metadata)

Operations:
- Query `categories`
- Query `services(filter: ServicesFilterInput)`
- Mutation `registerService(input: RegisterServiceInput!)`

## Key Things to Know in Next.js + GraphQL

1. **App Router typing**
- Route handlers must match Next handler signatures.
- Export `GET` and `POST` functions from `app/api/graphql/route.ts`.

2. **Server lifecycle**
- Apollo server instance should be module-scoped (initialized once per server runtime, reused).

3. **Database safety**
- Prisma should use singleton pattern in dev to avoid connection leaks on hot reload.

4. **Client provider placement**
- Apollo provider must wrap client components using GraphQL hooks.
- In this app it is mounted in `app/layout.tsx`.

5. **Apollo Client v4 imports**
- Core utilities: `@apollo/client/core`
- React hooks/provider: `@apollo/client/react`

6. **Validation and error handling**
- Validation stays in resolver layer (e.g., phone format).
- Return user-facing GraphQL errors (`GraphQLError` + `BAD_USER_INPUT`).

7. **Caching**
- Apollo caches by object identity (`id` + `__typename`).
- Good for repeated reads (categories, list views), but keep mutation side-effects in mind.

## REST vs GraphQL in Next.js (Practical Comparison)

### REST in Next.js
- Multiple endpoints (`/api/categories`, `/api/services`, etc.)
- HTTP method driven (`GET`, `POST`, `PUT`, `DELETE`)
- Easy to reason about for simple CRUD
- Potential over-fetching/under-fetching across multiple client calls

### GraphQL in Next.js
- Typically one endpoint (`/api/graphql`)
- Client asks exactly for required fields
- Strong schema contract (types/inputs)
- Easier to combine related data in one request (e.g., service + category + provider)
- More setup complexity (schema, resolvers, client cache)

## When to Use Which

Use REST when:
- API is small/simple
- You want very explicit endpoint semantics
- Team is already heavily REST-based

Use GraphQL when:
- UI needs flexible data shapes
- You want fewer round trips for nested/related data
- You need strong typed contract across many screens/clients

## Example GraphQL Calls

### Query services

```graphql
query GetServices($filter: ServicesFilterInput) {
  services(filter: $filter) {
    total
    services {
      id
      name
      phone
      area
      category {
        id
        name
      }
    }
  }
}
```

Variables:

```json
{
  "filter": {
    "category": "Tailors",
    "area": "GRA",
    "search": "auwal",
    "page": 1
  }
}
```

### Mutation register service

```graphql
mutation RegisterService($input: RegisterServiceInput!) {
  registerService(input: $input) {
    id
    name
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Malam Auwal Tailoring",
    "categoryId": 1,
    "area": "Tudun Wada",
    "phone": "08012345678",
    "description": "Kaftan and uniforms"
  }
}
```

## Notes for This Repo

- Existing REST routes can remain during migration.
- Frontend pages can be migrated one-by-one from REST fetch calls to Apollo hooks.
- If build fails due Google Font fetch in restricted networks, it is unrelated to GraphQL setup.
