import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E4DC] bg-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#1A5E35] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-serif text-sm font-medium text-zinc-700">
            Gombe Services
          </span>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Connecting communities across Gombe State, Nigeria 🇳🇬
        </p>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <Link href="/services" className="hover:text-zinc-700 transition-colors">
            Browse
          </Link>
          <Link href="/register" className="hover:text-zinc-700 transition-colors">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
