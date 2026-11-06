import { useQuery } from '@tanstack/react-query';
import { fetchCases, type ListCasesParams, type ListCasesResponse } from '../api/cases.api';

export function useCases(params: ListCasesParams) {
  return useQuery<ListCasesResponse>({
    queryKey: ['cases', params],
    queryFn: () => fetchCases(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}