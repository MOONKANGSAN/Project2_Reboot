import type { RestaurantRegisterFormData, FormErrors } from './types';

export const validateRestaurantForm = (data: RestaurantRegisterFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) errors.name = '점포명을 입력해주세요.';
  if (!data.category) errors.category = '카테고리를 선택해주세요.';
  if (!data.address.trim()) errors.address = '주소를 입력해주세요.';
  if (!data.location.trim()) errors.location = '지역명을 입력해주세요.';
  if (!data.phone.trim()) {
    errors.phone = '전화번호를 입력해주세요.';
  } else if (!/^[\d\-+]{7,20}$/.test(data.phone.trim())) {
    errors.phone = '올바른 전화번호 형식으로 입력해주세요. (예: 02-1234-5678)';
  }

  return errors;
};

export const hasErrors = (errors: FormErrors): boolean =>
  Object.values(errors).some((e) => e !== undefined);
