import { useState } from 'react';
import { useAuth } from '@/modules/auth/useAuth';
import { useCases } from '../hooks/useCases';
import { CaseFilters } from '../components/CaseFilters';
import { CaseTable } from '../components/CaseTable';
import type { CaseListItem } from '../api/cases.api';

export function CaseListPage() {
    const { organization } = useAuth();

    if (!organization) {
        return (
            <div className="rounded-lg border border-dashed border-[#D8C5AA] bg-white/60 p-12 text-center">
                <p className="font-serif text-lg text-[#343434]">No hay una organización activa</p>
                <p className="mt-1 text-sm text-[#343434]/60">
                    Inicia sesión para acceder a los expedientes.
                </p>
            </div>
        );
    }

    return <CaseList organizationId={organization.id} />;
}

function CaseList({ organizationId }: { organizationId: string }) {
    const [filters, setFilters] = useState<{ status?: CaseListItem['status']; q?: string }>({});
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error } = useCases({
        organizationId,
        ...filters,
        page,
        pageSize: 20,
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-widest text-[#87958A]">Expedientes</p>
                    <h2 className="font-serif text-2xl text-[#343434]">Gestión de expedientes</h2>
                </div>
                <button type="button" className="rounded-md bg-[#34463D] px-4 py-2 text-sm font-medium text-[#F7F4EF] hover:bg-[#2a3a32] focus:outline-none focus:ring-2 focus:ring-[#87958A]">
                    Nuevo expediente
                </button>
            </header>

            <CaseFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />

            {isLoading && <p className="text-sm text-[#343434]/60">Cargando expedientes…</p>}
            {isError && <p className="text-sm text-red-700">No se han podido cargar los expedientes ({(error as Error).message}).</p>}

            {data && (
                <>
                    <CaseTable rows={data.data} />
                    {data.pagination.totalPages > 1 && (
                        <nav aria-label="Paginación" className="flex items-center justify-between text-sm text-[#343434]/70">
                            <span>
                                Página {data.pagination.page} de {data.pagination.totalPages} · {data.pagination.total} expedientes
                            </span>
                            <div className="flex gap-2">
                                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-[#D8C5AA] px-3 py-1.5 disabled:opacity-40">
                                    Anterior
                                </button>
                                <button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#D8C5AA] px-3 py-1.5 disabled:opacity-40">
                                    Siguiente
                                </button>
                            </div>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}