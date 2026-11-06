import { api } from '@/services/api';
import type { ListCasesQueryInput } from '@legaria/contracts';

export interface CaseListItem {
    id: string;
    caseNumber: string;
    status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
    deceasedPerson: { firstName: string; lastName: string; secondLastName: string | null; deathDate: string } | null;
    servicesCount: number;
    assignmentsCount: number;
}

export interface ListCasesResponse {
    data: CaseListItem[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ListCasesParams extends Partial<ListCasesQueryInput> {
    organizationId: string;
}

export async function fetchCases(params: ListCasesParams): Promise<ListCasesResponse> {
    const { organizationId, ...query } = params;
    const { data } = await api.get<ListCasesResponse>(`/organizations/${organizationId}/cases`, { params: query });
    return data;
}