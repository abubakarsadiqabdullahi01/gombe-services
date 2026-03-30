import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { GraphQLError } from "graphql";
import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {
  getCachedJson,
  invalidateCacheByPattern,
  setCachedJson,
} from "@/lib/redis";

const typeDefs = `#graphql
  type Category {
    id: Int!
    name: String!
    icon: String
  }

  type Provider {
    id: Int!
    name: String!
    phone: String!
    area: String!
  }

  type Service {
    id: Int!
    name: String!
    categoryId: Int!
    category: Category!
    area: String!
    phone: String!
    description: String
    createdAt: String!
    provider: Provider
  }

  type ServicesResult {
    services: [Service!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input ServicesFilterInput {
    category: String
    area: String
    search: String
    page: Int
  }

  input RegisterServiceInput {
    name: String!
    categoryId: Int!
    area: String!
    phone: String!
    description: String
  }

  type Query {
    categories: [Category!]!
    services(filter: ServicesFilterInput): ServicesResult!
  }

  type Mutation {
    registerService(input: RegisterServiceInput!): Service!
  }
`;

type ServiceWithRelations = Prisma.ServiceGetPayload<{
  include: { category: true; provider: true };
}>;

function serializeService(service: ServiceWithRelations) {
  return {
    ...service,
    createdAt: service.createdAt.toISOString(),
  };
}

const SERVICES_CACHE_TTL_SECONDS = 120;
const SERVICES_CACHE_PREFIX = "services:list:";
const isDev = process.env.NODE_ENV !== "production";

type ServicesResult = {
  services: ReturnType<typeof serializeService>[];
  total: number;
  page: number;
  limit: number;
};

function buildServicesCacheKey(input: {
  category?: string;
  area?: string;
  search?: string;
  page: number;
}) {
  const normalize = (value?: string) =>
    encodeURIComponent((value ?? "").trim().toLowerCase());

  return `${SERVICES_CACHE_PREFIX}category=${normalize(input.category)}:area=${normalize(
    input.area,
  )}:search=${normalize(input.search)}:page=${input.page}`;
}

const resolvers = {
  Query: {
    categories: async () => {
      return prisma.category.findMany({ orderBy: { name: "asc" } });
    },
    services: async (
      _: unknown,
      args: {
        filter?: {
          category?: string;
          area?: string;
          search?: string;
          page?: number;
        };
      },
    ) => {
      const category = args.filter?.category;
      const area = args.filter?.area;
      const search = args.filter?.search;
      const page = Math.max(1, Number(args.filter?.page ?? 1));
      const limit = 12;
      const skip = (page - 1) * limit;
      const cacheKey = buildServicesCacheKey({ category, area, search, page });

      const cached = await getCachedJson<ServicesResult>(cacheKey);
      if (cached) {
        if (isDev) console.log(`[Cache][services] HIT key=${cacheKey}`);
        return cached;
      }
      if (isDev) console.log(`[Cache][services] MISS key=${cacheKey}`);

      const where: Prisma.ServiceWhereInput = {
        ...(category ? { category: { name: category } } : {}),
        ...(area
          ? { area: { equals: area, mode: "insensitive" } }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { area: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          include: { category: true, provider: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.service.count({ where }),
      ]);

      const payload: ServicesResult = {
        services: services.map(serializeService),
        total,
        page,
        limit,
      };

      await setCachedJson(cacheKey, payload, SERVICES_CACHE_TTL_SECONDS);
      if (isDev) {
        console.log(
          `[Cache][services] SET key=${cacheKey} ttl=${SERVICES_CACHE_TTL_SECONDS}s`,
        );
      }
      return payload;
    },
  },
  Mutation: {
    registerService: async (
      _: unknown,
      args: {
        input: {
          name: string;
          categoryId: number;
          area: string;
          phone: string;
          description?: string | null;
        };
      },
    ) => {
      const { name, categoryId, area, phone, description } = args.input;

      if (!name?.trim() || !categoryId || !area?.trim() || !phone?.trim()) {
        throw new GraphQLError("Name, category, area and phone are required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const cleanPhone = phone.replace(/\s/g, "");
      if (!/^0[7-9][01]\d{8}$/.test(cleanPhone)) {
        throw new GraphQLError(
          "Please enter a valid Nigerian phone number (e.g. 08012345678).",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const service = await prisma.service.create({
        data: {
          name: name.trim(),
          categoryId: Number(categoryId),
          area: area.trim(),
          phone: cleanPhone,
          description: description?.trim() ?? "",
        },
        include: { category: true, provider: true },
      });

      const pattern = `${SERVICES_CACHE_PREFIX}*`;
      await invalidateCacheByPattern(pattern);
      if (isDev) console.log(`[Cache][services] INVALIDATE pattern=${pattern}`);
      return serializeService(service);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server);

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
