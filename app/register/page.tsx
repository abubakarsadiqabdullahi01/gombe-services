"use client";

import { gql } from "@apollo/client/core";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CATEGORY_ICONS, GOMBE_AREAS } from "@/lib/constants";
import { Category, RegisterFormData } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      icon
    }
  }
`;

const REGISTER_SERVICE = gql`
  mutation RegisterService($input: RegisterServiceInput!) {
    registerService(input: $input) {
      id
      name
    }
  }
`;

const EMPTY_FORM: RegisterFormData = {
  name: "",
  categoryId: "",
  area: "",
  phone: "",
  description: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormData>(EMPTY_FORM);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const { data } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const categories = data?.categories ?? [];

  const [registerService, { loading }] = useMutation(REGISTER_SERVICE);

  const set = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<RegisterFormData> = {};
    if (!form.name.trim()) errs.name = "Business name is required.";
    if (!form.categoryId) errs.categoryId = "Please select a category.";
    if (!form.area) errs.area = "Please select your area.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerService({
        variables: {
          input: {
            name: form.name,
            categoryId: Number(form.categoryId),
            area: form.area,
            phone: form.phone,
            description: form.description,
          },
        },
      });

      setSuccess(true);
      toast.success("Your service has been registered!");
      setTimeout(() => router.push("/services"), 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1A5E35]/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-[#1A5E35]" />
        </div>
        <h2 className="font-serif text-2xl text-zinc-900 mb-2">You&apos;re listed!</h2>
        <p className="text-zinc-500 text-sm">Redirecting you to browse services...</p>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-4 text-[#C49A2B] border-[#C49A2B]/30 bg-[#C49A2B]/5"
        >
          Free Registration
        </Badge>
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 mb-2">
          Register your service
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          List your business and get discovered by customers across Gombe State.
          It&apos;s completely free.
        </p>
      </div>

      <Card className="border-[#E8E4DC] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-xl font-normal">
            Business details
          </CardTitle>
          <CardDescription>Fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Business / Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Malam Auwal Tailoring"
                className={`border-[#E8E4DC] focus-visible:ring-[#1A5E35] ${
                  errors.name ? "border-red-400" : ""
                }`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => {
                    setForm((p) => ({ ...p, categoryId: v }));
                    setErrors((p) => ({ ...p, categoryId: undefined }));
                  }}
                >
                  <SelectTrigger
                    className={`border-[#E8E4DC] ${errors.categoryId ? "border-red-400" : ""}`}
                  >
                    <SelectValue placeholder="Select category">
                      {selectedCategory && (
                        <span className="flex items-center gap-2">
                          <span>{CATEGORY_ICONS[selectedCategory.name]}</span>
                          <span>{selectedCategory.name}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <span className="flex items-center gap-2">
                          <span>{CATEGORY_ICONS[cat.name] ?? "🛠️"}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">{errors.categoryId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Area in Gombe <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.area}
                  onValueChange={(v) => {
                    setForm((p) => ({ ...p, area: v }));
                    setErrors((p) => ({ ...p, area: undefined }));
                  }}
                >
                  <SelectTrigger
                    className={`border-[#E8E4DC] ${errors.area ? "border-red-400" : ""}`}
                  >
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOMBE_AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.area && <p className="text-xs text-red-500">{errors.area}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="e.g. 08012345678"
                className={`border-[#E8E4DC] focus-visible:ring-[#1A5E35] ${
                  errors.phone ? "border-red-400" : ""
                }`}
              />
              {errors.phone ? (
                <p className="text-xs text-red-500">{errors.phone}</p>
              ) : (
                <p className="text-xs text-zinc-400">
                  Customers will call or text this number.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-zinc-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={set("description")}
                placeholder="Briefly describe what you do, your experience, specialties..."
                rows={4}
                className="border-[#E8E4DC] focus-visible:ring-[#1A5E35] resize-none"
              />
              <p className="text-xs text-zinc-400">
                A good description helps customers choose you over others.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#1A5E35] hover:bg-[#2D7A4F] text-white font-medium shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register My Service"
                )}
              </Button>
              <p className="text-center text-xs text-zinc-400 mt-3">
                Free forever. No login required.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
