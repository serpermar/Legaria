import { NavLink } from 'react-router-dom';

const items = [
    { to: '/app', label: 'Dashboard', end: true },
    { to: '/app/cases', label: 'Expedientes' },
    { to: '/app/families', label: 'Familias' },
    { to: '/app/memorials', label: 'Memoriales' },
    { to: '/app/team', label: 'Equipo' },
    { to: '/app/settings', label: 'Configuración' },
];

export function Sidebar() {
    return (
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#34463D] text-[#F7F4EF]" aria-label="Navegación principal">
            <div className="px-6 py-6 border-b border-white/10">
                <span className="font-serif text-xl tracking-wide">Legaria</span>
                <span className="block text-xs text-white/60 mt-1">Panel profesional</span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {items.map((it) => (
                    <NavLink
                        key={it.to}
                        to={it.to}
                        end={it.end}
                        className={({ isActive }) =>
                            [
                                'block rounded-md px-3 py-2 text-sm transition-colors',
                                isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5 hover:text-white',
                            ].join(' ')
                        }
                    >
                        {it.label}
                    </NavLink>
                ))}
            </nav>
            <div className="px-6 py-4 text-xs text-white/50 border-t border-white/10">v0.1.0 · MVP</div>
        </aside>
    );
}