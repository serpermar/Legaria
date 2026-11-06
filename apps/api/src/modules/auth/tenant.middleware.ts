import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../shared/prisma';
import { ForbiddenError, NotFoundError } from '../../shared/errors';

export interface TenantContext {
    organizationId: string;
    role: 'FUNERAL_ADMIN' | 'FUNERAL_EMPLOYEE';
}

declare global {
    namespace Express {
        interface Request {
            tenant?: TenantContext;
        }
    }
}

export async function tenantMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.auth) throw new ForbiddenError('not_authenticated');

        if (req.auth.platformRole === 'SUPER_ADMIN') {
            const orgId = req.params.organizationId ?? req.body?.organizationId;
            if (!orgId) throw new ForbiddenError('organization_required');
            req.tenant = { organizationId: orgId, role: 'FUNERAL_ADMIN' };
            return next();
        }

        const organizationId = req.params.organizationId;
        if (!organizationId) throw new ForbiddenError('organization_required');

        const member = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: { organizationId, userId: req.auth.userId },
            },
            select: { role: true, status: true },
        });

        if (!member || member.status !== 'ACTIVE') {
            throw new ForbiddenError('not_organization_member');
        }

        req.tenant = { organizationId, role: member.role as TenantContext['role'] };
        next();
    } catch (err) {
        next(err);
    }
}

export async function resolveCaseTenant(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.auth) throw new ForbiddenError('not_authenticated');
        const { caseId } = req.params;
        if (!caseId) throw new ForbiddenError('case_required');

        const kase = await prisma.case.findUnique({
            where: { id: caseId },
            select: { organizationId: true },
        });
        if (!kase) throw new NotFoundError('case_not_found');

        if (req.auth.platformRole !== 'SUPER_ADMIN') {
            const member = await prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId: kase.organizationId,
                        userId: req.auth.userId,
                    },
                },
                select: { role: true, status: true },
            });
            if (!member || member.status !== 'ACTIVE') {
                throw new ForbiddenError('not_organization_member');
            }
            req.tenant = {
                organizationId: kase.organizationId,
                role: member.role as TenantContext['role'],
            };
        } else {
            req.tenant = { organizationId: kase.organizationId, role: 'FUNERAL_ADMIN' };
        }

        next();
    } catch (err) {
        next(err);
    }
}