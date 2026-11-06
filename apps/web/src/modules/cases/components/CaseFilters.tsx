import type { CaseListItem } from '../api/cases.api';

interface Props {
    value: { status?: CaseListItem['status']; q?: string };
    onChange: (v: Props['value']) => void;
}

const STATUSES: Array<{ value: CaseListItem['status']; label: string }> = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'OPEN', label: 'Abierto' },
    { value: 'IN_PROGRESS', label: 'En curso' },
    { value: 'CLOSED', label: 'Cerrado' },
    { value: 'ARCHIVED', label: 'Archivado' },
];

export function CaseFilters({ value, onChange }: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
                type="search"
                placeholder="Buscar por nº expediente o apellidos…"
                defaultValue={value.q}
                onChange={(e) => onChange({ ...value, q: e.target.value || undefined })}
                className="w-full sm:w-80 rounded-md border border-[#D8C5AA]/70 bg-white px-3 py-2 text-sm text-[#343434] placeholder:text-[#343434]/40 focus:outline-none focus:ring-2 focus:ring-[#87958A]"
            />
            <select
                value={value.status ?? ''}
                onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as CaseListItem['status'] | undefined })}
                className="rounded-md border border-[#D8C5AA]/70 bg-white px-3 py-2 text-sm text-[#343434] focus:outline-none focus:ring-2 focus:ring-[#87958A]"
            >
                <option value="">Todos los estados</option>
                {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>
        </div>
    );
}