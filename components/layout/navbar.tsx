"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ label: "Browse", href: "/services" }];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E4DC] bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#1A5E35] flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[15px] font-semibold text-zinc-900 group-hover:text-[#1A5E35] transition-colors">
              Gombe Services
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide uppercase">
              Gombe State, Nigeria
            </span>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[#1A5E35]/10 text-[#1A5E35]"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="hidden sm:flex text-[#C49A2B] border-[#C49A2B]/30 bg-[#C49A2B]/5 text-xs"
          >
            🇳🇬 Gombe
          </Badge>
          <Button
            asChild
            size="sm"
            className="bg-[#1A5E35] hover:bg-[#2D7A4F] text-white gap-1.5 shadow-sm"
          >
            <Link href="/register">
              <Plus className="w-3.5 h-3.5" />
              Register
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
