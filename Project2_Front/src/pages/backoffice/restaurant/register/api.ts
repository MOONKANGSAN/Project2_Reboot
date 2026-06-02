import axios from 'axios';
import type { RestaurantRegisterFormData, RestaurantRegisterApiResponse } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export const registerRestaurant = async (
  data: RestaurantRegisterFormData
): Promise<RestaurantRegisterApiResponse> => {
  const response = await apiClient.post<RestaurantRegisterApiResponse>(
    '/backoffice/restaurant/register',
    {
      name: data.name,
      category: data.category,
      address: data.address,
      location: data.location,
      phone: data.phone,
      priceRange: data.priceRange || null,
      description: data.description || null,
      imageUrl: null,
    }
  );
  return response.data;
};
