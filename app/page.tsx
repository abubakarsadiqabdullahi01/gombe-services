import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Shield, Star, Users } from "lucide-react";
import { CATEGORY_ICONS, GOMBE_AREAS } from "@/lib/constants";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [services, categories] = await Promise.all([
      prisma.service.count(),
      prisma.category.count(),
    ]);
    return { services, categories };
  } catch (error) {
    console.error("[HomePage:getStats]", error);
    return { services: 0, categories: 0 };
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("[HomePage:getCategories]", error);
    return [];
  }
}

const FEATURES = [
  {
    icon: Shield,
    title: "Trusted Providers",
    desc: "Every listing is a real local business you can call directly.",
  },
  {
    icon: MapPin,
    title: "By Area",
    desc: "Filter by neighbourhood — Tudun Wada, GRA, Pantami and more.",
  },
  {
    icon: Star,
    title: "All Categories",
    desc: "Tailors, mechanics, electricians, caterers — all in one place.",
  },
  {
    icon: Users,
    title: "Free to List",
    desc: "Any Gombe artisan can register their service for free.",
  },
];

export default async function HomePage() {
  const [stats, categories] = await Promise.all([getStats(), getCategories()]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#E8E4DC]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A5E35]/5 via-transparent to-[#C49A2B]/5 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #1A5E35 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-5 text-[#C49A2B] border-[#C49A2B]/30 bg-[#C49A2B]/5 gap-1.5"
            >
              🇳🇬 Serving Gombe State
            </Badge>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-zinc-900 leading-tight mb-5">
              Find skilled artisans{" "}
              <span className="text-[#1A5E35] italic">near you</span> in Gombe
            </h1>

            <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-xl">
              The simplest way to discover trusted local service providers
              across Gombe State — tailors, mechanics, electricians and more.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#1A5E35] hover:bg-[#2D7A4F] text-white gap-2 h-12 px-6 shadow-sm"
              >
                <Link href="/services">
                  Browse Services
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#E8E4DC] hover:border-[#1A5E35]/40 hover:bg-[#1A5E35]/5 h-12 px-6"
              >
                <Link href="/register">Register Free</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#E8E4DC]">
              <div>
                <p className="font-serif text-3xl font-normal text-[#1A5E35]">
                  {stats.services}+
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Services listed</p>
              </div>
              <div className="w-px h-8 bg-[#E8E4DC]" />
              <div>
                <p className="font-serif text-3xl font-normal text-[#1A5E35]">
                  {stats.categories}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Categories</p>
              </div>
              <div className="w-px h-8 bg-[#E8E4DC]" />
              <div>
                <p className="font-serif text-3xl font-normal text-[#1A5E35]">
                  {GOMBE_AREAS.length}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Areas covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900">
              Browse by category
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Find exactly what you need
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm text-[#1A5E35] font-medium hover:underline flex items-center gap-1"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.name] ?? "🛠️";
            return (
              <Link
                key={cat.id}
                href={`/services?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-[#E8E4DC] hover:border-[#1A5E35]/30 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F2F0EB] flex items-center justify-center text-3xl group-hover:bg-[#1A5E35]/10 transition-colors">
                  {icon}
                </div>
                <span className="text-sm font-medium text-zinc-700 group-hover:text-[#1A5E35] transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#E8E4DC] bg-[#F2F0EB]/50">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 mb-2">
            Areas in Gombe
          </h2>
          <p className="text-zinc-500 text-sm mb-7">
            Search providers in your neighbourhood
          </p>

          <div className="flex flex-wrap gap-2">
            {GOMBE_AREAS.map((area) => (
              <Link
                key={area}
                href={`/services?area=${encodeURIComponent(area)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-[#E8E4DC] text-sm text-zinc-600 hover:border-[#1A5E35]/40 hover:text-[#1A5E35] hover:shadow-sm transition-all duration-150"
              >
                <MapPin className="w-3 h-3" />
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 mb-10 text-center">
          Why Gombe Services?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-[#E8E4DC]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A5E35]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#1A5E35]" />
              </div>
              <h3 className="font-serif text-base font-medium text-zinc-900">
                {title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A5E35] px-8 py-12 text-center">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3 relative">
            Are you a service provider in Gombe?
          </h2>
          <p className="text-white/70 text-sm mb-6 relative">
            Register your business for free and get discovered by customers in
            your area.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#1A5E35] hover:bg-[#F2F0EB] gap-2 h-12 px-8 font-semibold relative shadow-md"
          >
            <Link href="/register">
              Register Your Service
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
