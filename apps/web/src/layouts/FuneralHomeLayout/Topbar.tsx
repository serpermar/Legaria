import { useAuth } from '@/modules/auth/useAuth';

export function Topbar() {
    const { user, organization } = useAuth();
    return (
        <header className="h-16 flex items-center justify-between border-b border-[#D8C5AA]/60 bg-white/60 backdrop-blur px-6 lg:px-10">
            <div>
                <p className="text-xs uppercase tracking-widest text-[#87958A]">
                    {organization?.name ?? 'Organización'}
                </p>
                <h1 className="font-serif text-lg text-[#343434]">Panel de gestión</h1>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-[#343434]">{user?.fullName ?? user?.email}</span>
                <div aria-hidden className="h-9 w-9 rounded-full bg-[#87958A] text-white grid place-items-center text-sm font-medium">
                    {(user?.fullName ?? user?.email ?? '?').charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}