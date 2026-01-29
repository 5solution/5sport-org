'use client';

import { useQuery } from '@tanstack/react-query';

import { AXIOS_INSTANCE } from '@/lib/api/axiosInstance';
import { PaginatedResponse, User } from '@/types';

interface UseUsersParams {
  page?: number;
  limit?: number;
}

async function fetchUsers(params: UseUsersParams): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 10 } = params;
  const response = await AXIOS_INSTANCE.get('/users', {
    params: { page, limit },
  });
  return response.data;
}

export function useUsers(params: UseUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
  });
}
