import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

import { CATEGORY_ICONS, GOMBE_AREAS } from "@/lib/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Area = (typeof GOMBE_AREAS)[number];

function safeArea(area: string, fallback: Area = "GRA"): Area {
  return GOMBE_AREAS.includes(area as Area) ? (area as Area) : fallback;
}

async function main() {
  // Seed categories from one source of truth
  const categories = await Promise.all(
    Object.entries(CATEGORY_ICONS).map(([name, icon]) =>
      prisma.category.upsert({
        where: { name },
        update: { icon },
        create: { name, icon },
      }),
    ),
  );
  console.log(`Seeded ${categories.length} categories`);

  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));
  const getCategoryId = (name: string) => {
    const id = categoryByName.get(name);
    if (!id) throw new Error(`Missing category: ${name}`);
    return id;
  };

  // Seed providers
  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Malam Auwal",
        phone: "08012345678",
        area: safeArea("Tudun Wada"),
      },
    }),
    prisma.provider.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Hassan Garage",
        phone: "08023456789",
        area: safeArea("Pantami"),
      },
    }),
    prisma.provider.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Bello Tech",
        phone: "08034567890",
        area: safeArea("Gwomti"),
      },
    }),
    prisma.provider.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Usman Electric",
        phone: "08045678901",
        area: safeArea("GRA"),
      },
    }),
  ]);
  console.log(`Seeded ${providers.length} providers`);

  // Seed services (idempotent + dedupe by signature)
  const serviceSeeds = [
    {
      name: "Malam Auwal Tailoring",
      categoryId: getCategoryId("Tailors"),
      area: safeArea("Tudun Wada"),
      phone: "08012345678",
      description: "Kaftan, babban riga, and school uniforms",
      providerId: providers[0].id,
    },
    {
      name: "Hassan Auto Garage",
      categoryId: getCategoryId("Mechanics"),
      area: safeArea("Pantami"),
      phone: "08023456789",
      description: "Engine overhaul, welding, all vehicle repairs",
      providerId: providers[1].id,
    },
    {
      name: "Bello Phone Doctor",
      categoryId: getCategoryId("Phone Repair"),
      area: safeArea("Gwomti"),
      phone: "08034567890",
      description: "Screen replacement, battery, software fix",
      providerId: providers[2].id,
    },
    {
      name: "Usman Electric Works",
      categoryId: getCategoryId("Electricians"),
      area: safeArea("GRA"),
      phone: "08045678901",
      description: "House wiring, solar installation, generators",
      providerId: providers[3].id,
    },
    {
      name: "Garba Metal Fabrication",
      categoryId: getCategoryId("Welders"),
      area: safeArea("Bolari"),
      phone: "08056789012",
      description: "Gates, grilles, burglar proofs, furniture",
      providerId: null,
    },
    {
      name: "Alhaji Cuts Barbershop",
      categoryId: getCategoryId("Barbers"),
      area: safeArea("Shamaki"),
      phone: "08067890123",
      description: "Classic cuts, shaving, and beard grooming",
      providerId: null,
    },
    {
      name: "Mama Fati Catering",
      categoryId: getCategoryId("Caterers"),
      area: safeArea("Jauro Mato"),
      phone: "08078901234",
      description: "Weddings, naming ceremonies - local dishes",
      providerId: null,
    },
    {
      name: "Ibrahim Construction",
      categoryId: getCategoryId("Builders"),
      area: safeArea("Nasarawo"),
      phone: "08089012345",
      description: "Block laying, plastering, roofing and tiling",
      providerId: null,
    },
  ] as const;

  const services = await Promise.all(
    serviceSeeds.map(async (seed) => {
      const matches = await prisma.service.findMany({
        where: {
          name: seed.name,
          categoryId: seed.categoryId,
          area: seed.area,
          phone: seed.phone,
        },
        orderBy: { createdAt: "desc" },
      });

      if (matches.length === 0) {
        return prisma.service.create({ data: seed });
      }

      const [keep, ...duplicates] = matches;
      if (duplicates.length > 0) {
        await prisma.service.deleteMany({
          where: { id: { in: duplicates.map((s) => s.id) } },
        });
      }

      return prisma.service.update({
        where: { id: keep.id },
        data: {
          description: seed.description,
          providerId: seed.providerId,
        },
      });
    }),
  );

  console.log(`Seeded ${services.length} services`);
  console.log("Database seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
