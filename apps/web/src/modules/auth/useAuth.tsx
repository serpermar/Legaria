import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface AuthUser {
    id: string;
    email: string;
    fullName: string | null;
}

export interface AuthOrganization {
    id: string;
    name: string;
    slug: string;
    role: 'FUNERAL_ADMIN' | 'FUNERAL_EMPLOYEE';
}

interface AuthContextValue {
    user: AuthUser | null;
    organization: AuthOrganization | null;
    isAuthenticated: boolean;
    setSession: (user: AuthUser, organization: AuthOrganization) => void;
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [organization, setOrganization] = useState<AuthOrganization | null>(null);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            organization,
            isAuthenticated: Boolean(user),
            setSession: (u, o) => {
                setUser(u);
                setOrganization(o);
            },
            clearSession: () => {
                setUser(null);
                setOrganization(null);
                localStorage.removeItem('legaria_access_token');
            },
        }),
        [user, organization],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}