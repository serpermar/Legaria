import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../../shared/prisma';

const trustedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    // Nombres propios para no colisionar con el modelo de dominio `User`.
    user: { modelName: 'authUser' },
    session: { modelName: 'authSession' },
    account: { modelName: 'authAccount' },
    verification: { modelName: 'authVerification' },
    advanced: {
        database: {
            joins: true,
        },
    },
});
