import { useQuery } from '@tanstack/react-query';
import { defaultMutator } from '../../api/axiosInstance';

export interface ProvinceDto {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards?: WardDto[];
}

export interface WardDto {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

// --- API functions ---

const listProvinces = (search?: string) => {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return defaultMutator<ProvinceDto[]>(`/provinces${params}`, { method: 'GET' });
};

const getProvinceWithWards = (code: number) => {
  return defaultMutator<ProvinceDto>(`/provinces/${code}?depth=2`, { method: 'GET' });
};

const listWardsByProvince = (provinceCode: number, search?: string) => {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return defaultMutator<WardDto[]>(`/provinces/${provinceCode}/wards${params}`, {
    method: 'GET',
  });
};

// --- Query keys ---

export const getProvincesQueryKey = (search?: string) =>
  ['provinces', search ?? ''] as const;

export const getProvinceWardsQueryKey = (code: number) =>
  ['provinces', code, 'wards'] as const;

// --- React Query hooks ---

export const useListProvinces = (search?: string) => {
  return useQuery({
    queryKey: getProvincesQueryKey(search),
    queryFn: () => listProvinces(search),
    staleTime: 24 * 60 * 60 * 1000, // 24h - provinces don't change
  });
};

export const useListWardsByProvince = (
  provinceCode: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: getProvinceWardsQueryKey(provinceCode),
    queryFn: () => getProvinceWithWards(provinceCode),
    select: (data) => data.wards ?? [],
    enabled: options?.enabled !== false && provinceCode > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });
};
