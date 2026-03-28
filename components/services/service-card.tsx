import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { Service } from "@/lib/types";
import { MapPin, Phone } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const icon = CATEGORY_ICONS[service.category.name] ?? "🛠️";
  const color =
    CATEGORY_COLORS[service.category.name] ??
    "bg-zinc-50 text-zinc-700 border-zinc-200";

  return (
    <Card className="group border-[#E8E4DC] hover:border-[#1A5E35]/30 hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F2F0EB] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#1A5E35]/10 transition-colors">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-base font-medium text-zinc-900 leading-snug">
                {service.name}
              </h3>
              <Badge
                variant="outline"
                className={`text-[11px] px-2 py-0 flex-shrink-0 border ${color}`}
              >
                {service.category.name}
              </Badge>
            </div>

            {service.description && (
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F2F0EB]">
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <MapPin className="w-3 h-3" />
                <span>{service.area}</span>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[#1A5E35] hover:text-[#1A5E35] hover:bg-[#1A5E35]/10 gap-1 text-xs font-medium"
              >
                <a href={`tel:${service.phone}`}>
                  <Phone className="w-3 h-3" />
                  {service.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
