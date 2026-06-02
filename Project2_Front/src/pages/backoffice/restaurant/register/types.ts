import type { FoodCategory, PriceRange } from '@/types/index';

export type RestaurantCategory = Exclude<FoodCategory, '전체'>;

export interface RestaurantRegisterFormData {
  name: string;
  category: RestaurantCategory | '';
  address: string;
  location: string;
  phone: string;
  priceRange: PriceRange | '';
  description: string;
}

export interface FormErrors {
  name?: string;
  category?: string;
  address?: string;
  location?: string;
  phone?: string;
}

export interface RestaurantRegisterApiResponse {
  success: boolean;
  message: string;
  idx?: number;
  name?: string;
}
