import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services?category=Tailors&area=GRA&search=auwal&page=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = 12;
    const skip = (page - 1) * limit;

    const where = {
      ...(category && { category: { name: category } }),
      ...(area && { area: { contains: area, mode: "insensitive" as const } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { area: { contains: search, mode: "insensitive" as const } },
        ],
      }),
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

    return NextResponse.json({ services, total, page, limit });
  } catch (error) {
    console.error("[GET /api/services]", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST /api/services — register a new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, area, phone, description } = body;

    if (!name?.trim() || !categoryId || !area?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name, category, area and phone are required." },
        { status: 400 },
      );
    }

    // Validate phone — basic Nigerian format
    const cleanPhone = phone.replace(/\s/g, "");
    if (!/^0[7-9][01]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          error: "Please enter a valid Nigerian phone number (e.g. 08012345678).",
        },
        { status: 400 },
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
      include: { category: true },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[POST /api/services]", error);
    return NextResponse.json(
      { error: "Failed to register service. Please try again." },
      { status: 500 },
    );
  }
}
