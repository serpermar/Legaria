import { prisma } from '../../shared/prisma';
import { ForbiddenError, NotFoundError } from '../../shared/errors';
import type { AuthContext } from '../auth/auth.middleware';

export const organizationsService = {
    async list(auth: AuthContext) {
        if (auth.platformRole === 'SUPER_ADMIN') {
            return prisma.organization.findMany({
                where: { deletedAt: null },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, slug: true, city: true, status: true, createdAt: true },
            });
        }
        return prisma.organization.findMany({
            where: {
                deletedAt: null,
                members: { some: { userId: auth.userId, status: 'ACTIVE' } },
            },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, city: true, status: true, createdAt: true },
        });
    },

    async getById(auth: AuthContext, organizationId: string) {
        const org = await prisma.organization.findFirst({
            where: { id: organizationId, deletedAt: null },
            select: {
                id: true,
                name: true,
                slug: true,
                legalName: true,
                taxId: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                province: true,
                postalCode: true,
                country: true,
                logoUrl: true,
                plan: true,
                status: true,
                createdAt: true,
                _count: { select: { members: true, cases: true } },
            },
        });
        if (!org) throw new NotFoundError('organization_not_found');
        return org;
    },

    async create(auth: AuthContext, input: { name: string; slug: string; taxId?: string }) {
        if (auth.platformRole !== 'SUPER_ADMIN') {
            throw new ForbiddenError('only_super_admin_can_create');
        }
        return prisma.organization.create({
            data: {
                name: input.name,
                slug: input.slug,
                taxId: input.taxId,
                subscription: { create: { plan: 'BASIC', status: 'TRIALING' } },
            },
        });
    },
};