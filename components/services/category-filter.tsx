"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/constants";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const all = [{ id: 0, name: "All", icon: null }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((cat) => {
        const isSelected = selected === cat.name;
        const icon = CATEGORY_ICONS[cat.name];

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.name)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
              isSelected
                ? "bg-[#1A5E35] text-white border-[#1A5E35] shadow-sm"
                : "bg-white text-zinc-600 border-[#E8E4DC] hover:border-[#1A5E35]/40 hover:text-[#1A5E35]",
            )}
          >
            {icon && <span className="text-base leading-none">{icon}</span>}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
