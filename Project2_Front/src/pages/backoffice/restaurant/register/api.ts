import axios from 'axios';
import type {
  RestaurantRegisterFormData,
  RestaurantRegisterApiResponse,
  RestaurantImgUploadApiResponse,
} from './types';

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
      latitude:  data.lat,
      longitude: data.lng,
      hashtags: data.hashtags.length > 0 ? data.hashtags : null,
    }
  );
  return response.data;
};

// 점포 이미지 업로드 (multipart/form-data)
export const uploadRestaurantImages = async (
  restaurantIdx: number,
  files: File[]
): Promise<RestaurantImgUploadApiResponse> => {
  const formData = new FormData();
  formData.append('restaurantIdx', String(restaurantIdx));
  files.forEach((file) => formData.append('images', file));

  const response = await axios.post<RestaurantImgUploadApiResponse>(
    'http://localhost:8080/api/backoffice/restaurant/img/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};
