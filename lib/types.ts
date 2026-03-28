export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Provider {
  id: number;
  name: string;
  phone: string;
  area: string;
}

export interface Service {
  id: number;
  name: string;
  categoryId: number;
  category: Category;
  area: string;
  phone: string;
  description: string | null;
  createdAt: string;
  provider?: Provider | null;
}

export interface ServicesResponse {
  services: Service[];
  total: number;
}

export type RegisterFormData = {
  name: string;
  categoryId: string;
  area: string;
  phone: string;
  description: string;
};
