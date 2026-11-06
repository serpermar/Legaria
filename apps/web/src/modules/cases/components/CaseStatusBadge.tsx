const styles: Record<string, string> = {
    DRAFT: 'bg-[#D8C5AA]/40 text-[#5a4d3a]',
    OPEN: 'bg-[#87958A]/20 text-[#34463D]',
    IN_PROGRESS: 'bg-[#34463D] text-[#F7F4EF]',
    CLOSED: 'bg-[#343434] text-white',
    ARCHIVED: 'bg-[#343434]/10 text-[#343434]',
};

const labels: Record<string, string> = {
    DRAFT: 'Borrador', OPEN: 'Abierto', IN_PROGRESS: 'En curso', CLOSED: 'Cerrado', ARCHIVED: 'Archivado',
};

export function CaseStatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? ''}`}>
            {labels[status] ?? status}
        </span>
    );
}