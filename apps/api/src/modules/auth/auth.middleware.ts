import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import { prisma } from '../../shared/prisma';
import { UnauthorizedError } from '../../shared/errors';

export interface AuthContext {
    userId: string;
    authUserId: string;
    email: string;
    platformRole: 'USER' | 'SUPER_ADMIN';
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) throw new UnauthorizedError('missing_session');

        const user = await prisma.user.findUnique({
            where: { authUserId: session.user.id },
            select: { id: true, email: true, platformRole: true, deletedAt: true },
        });

        if (!user || user.deletedAt) throw new UnauthorizedError('user_not_registered');

        req.auth = {
            userId: user.id,
            authUserId: session.user.id,
            email: user.email,
            platformRole: user.platformRole,
        };

        prisma.user
            .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            .catch(() => undefined);

        next();
    } catch (err) {
        next(err);
    }
}
