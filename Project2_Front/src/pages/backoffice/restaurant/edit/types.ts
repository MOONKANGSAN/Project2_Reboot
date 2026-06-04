import type { FoodCategory, PriceRange } from '@/types/index';

export type RestaurantCategory = Exclude<FoodCategory, '전체'>;

export interface RestaurantEditFormData {
  name: string;
  category: RestaurantCategory | '';
  address: string;
  location: string;
  phone: string;
  priceRange: PriceRange | '';
  description: string;
  hashtags: string[];
}

export interface FormErrors {
  name?: string;
  category?: string;
  address?: string;
  location?: string;
  phone?: string;
}

export interface RestaurantEditApiResponse {
  success: boolean;
  message: string;
  idx?: number;
  name?: string;
}

export interface RestaurantDetailApiResponse {
  success: boolean;
  message?: string;
  data?: {
    idx: number;
    name: string;
    category: string;
    address: string;
    location: string;
    phone: string;
    priceRange: string | null;
    description: string | null;
    imageUrl: string | null;
    imgIdx: number | null;
    state: number;
    regDate: string;
  };
}
