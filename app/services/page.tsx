"use client";

import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/services/service-card";
import { CategoryFilter } from "@/components/services/category-filter";
import { SearchBar } from "@/components/services/search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GOMBE_AREAS } from "@/lib/constants";
import { Category, Service } from "@/lib/types";
import { Frown, SlidersHorizontal } from "lucide-react";

const ALL_AREAS = "__all_areas__";

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      icon
    }
  }
`;

const GET_SERVICES = gql`
  query GetServices($filter: ServicesFilterInput) {
    services(filter: $filter) {
      services {
        id
        name
        categoryId
        area
        phone
        description
        createdAt
        category {
          id
          name
          icon
        }
        provider {
          id
          name
          phone
          area
        }
      }
      total
      page
      limit
    }
  }
`;

function ServiceSkeleton() {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xl p-5 space-y-3">
      <div className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "All");
  const [area, setArea] = useState(searchParams.get("area") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const filter = {
    ...(category !== "All" ? { category } : {}),
    ...(area ? { area } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page: 1,
  };

  const { data: servicesData, loading } = useQuery<{
    services: { services: Service[]; total: number };
  }>(GET_SERVICES, {
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });

  const categories = categoriesData?.categories ?? [];
  const services = servicesData?.services.services ?? [];
  const total = servicesData?.services.total ?? 0;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("All");
    setArea("");
    router.replace("/services");
  };

  const hasFilters = search || category !== "All" || area;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 mb-1">
          Browse Services
        </h1>
        <p className="text-zinc-500 text-sm">
          {loading ? "Loading..." : `${total} service${total !== 1 ? "s" : ""} found in Gombe`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, skill or description..."
          />
        </div>

        <Select
          value={area || ALL_AREAS}
          onValueChange={(value) => setArea(value === ALL_AREAS ? "" : value)}
        >
          <SelectTrigger className="w-full sm:w-48 border-[#E8E4DC] bg-white h-11">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400 mr-2" />
            <SelectValue placeholder="All areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_AREAS}>All areas</SelectItem>
            {GOMBE_AREAS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-zinc-400 hover:text-zinc-700 sm:w-auto"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="mb-8">
        <CategoryFilter categories={categories} selected={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Frown className="w-10 h-10 text-zinc-300 mb-4" />
          <h3 className="font-serif text-xl text-zinc-700 mb-1">
            No services found
          </h3>
          <p className="text-zinc-400 text-sm mb-5">
            Try a different search term, category, or area.
          </p>
          <Button variant="outline" onClick={clearFilters} className="border-[#E8E4DC]">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
