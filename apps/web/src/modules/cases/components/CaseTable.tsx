import { Link } from 'react-router-dom';
import type { CaseListItem } from '../api/cases.api';
import { CaseStatusBadge } from './CaseStatusBadge';

export function CaseTable({ rows }: { rows: CaseListItem[] }) {
    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-[#D8C5AA] bg-white/50 p-12 text-center">
                <p className="font-serif text-lg text-[#343434]">No hay expedientes</p>
                <p className="mt-1 text-sm text-[#343434]/60">Crea el primer expediente para comenzar.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-[#D8C5AA]/60 bg-white">
            <table className="w-full text-sm">
                <thead className="bg-[#F7F4EF] text-left text-xs uppercase tracking-wider text-[#87958A]">
                    <tr>
                        <th className="px-4 py-3">Expediente</th>
                        <th className="px-4 py-3">Persona fallecida</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Servicios</th>
                        <th className="px-4 py-3">Equipo</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C5AA]/40">
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#F7F4EF]/60">
                            <td className="px-4 py-3 font-mono text-xs text-[#343434]">{row.caseNumber}</td>
                            <td className="px-4 py-3">
                                <p className="text-[#343434]">
                                    {row.deceasedPerson ? `${row.deceasedPerson.firstName} ${row.deceasedPerson.lastName}` : '—'}
                                </p>
                                {row.deceasedPerson && (
                                    <p className="text-xs text-[#343434]/50">
                                        † {new Date(row.deceasedPerson.deathDate).toLocaleDateString('es-ES')}
                                    </p>
                                )}
                            </td>
                            <td className="px-4 py-3"><CaseStatusBadge status={row.status} /></td>
                            <td className="px-4 py-3 text-[#343434]">{row.servicesCount}</td>
                            <td className="px-4 py-3 text-[#343434]">{row.assignmentsCount}</td>
                            <td className="px-4 py-3 text-right">
                                <Link to={`/app/cases/${row.id}`} className="text-sm font-medium text-[#34463D] hover:underline">
                                    Ver
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}