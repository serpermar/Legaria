import { prisma } from '../../shared/prisma';
import { ForbiddenError, NotFoundError, ConflictError } from '../../shared/errors';
import type { AuthContext } from '../auth/auth.middleware';
import type { TenantContext } from '../auth/tenant.middleware';
import { casesRepository } from './cases.repository';
import { CaseNotClosableError, CaseWithoutDeceasedError, InvalidCaseTransitionError } from './cases.errors';
import type { ChangeCaseStatusInput, CreateCaseInput, ListCasesQueryInput, UpdateCaseInput } from '@legaria/contracts';

const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['OPEN', 'ARCHIVED'],
    OPEN: ['IN_PROGRESS', 'DRAFT', 'ARCHIVED'],
    IN_PROGRESS: ['CLOSED', 'ARCHIVED'],
    CLOSED: ['ARCHIVED'],
    ARCHIVED: [],
};

export const casesService = {
    async list(auth: AuthContext, tenant: TenantContext, query: ListCasesQueryInput) {
        const { page, pageSize, ...rest } = query;
        const result = await casesRepository.list(prisma, tenant.organizationId, {
            ...rest, skip: (page - 1) * pageSize, take: pageSize,
        });
        return {
            data: result.data.map((c: {
  id: string;
  caseNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deceasedPerson: { firstName: string; lastName: string; secondLastName: string | null; deathDate: Date } | null;
  _count: { services: number; assignments: number };
}) => ({
  id: c.id,
  caseNumber: c.caseNumber,
  status: c.status,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  deceasedPerson: c.deceasedPerson,
  servicesCount: c._count.services,
  assignmentsCount: c._count.assignments,
})),
        };
    },

    async listForFamily(auth: AuthContext, familyGroupIds: string[]) {
        if (familyGroupIds.length === 0) return [];
        return prisma.case.findMany({
            where: { deletedAt: null, familyGroup: { id: { in: familyGroupIds } } },
            select: {
                id: true, caseNumber: true, status: true, createdAt: true,
                deceasedPerson: { select: { firstName: true, lastName: true, deathDate: true } },
            },
        });
    },

    async getById(auth: AuthContext, tenant: TenantContext, id: string) {
        const kase = await casesRepository.findById(prisma, tenant.organizationId, id);
        if (!kase) throw new NotFoundError('case_not_found');
        return kase;
    },

    async create(auth: AuthContext, tenant: TenantContext, input: CreateCaseInput) {
        const membership = await prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId: tenant.organizationId, userId: auth.userId } },
            select: { role: true, status: true },
        });
        if (auth.platformRole !== 'SUPER_ADMIN' && (!membership || membership.status !== 'ACTIVE' || !['FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'].includes(membership.role))) {
            throw new ForbiddenError('insufficient_role');
        }

        return prisma.$transaction(async (tx) => {
            const year = new Date().getFullYear();
            const caseNumber = await casesRepository.nextCaseNumber(tx, tenant.organizationId, year);
            const created = await casesRepository.create(tx, tenant.organizationId, {
                caseNumber, internalNotes: input.internalNotes, deceasedPerson: input.deceasedPerson,
            });
            await tx.auditLog.create({
                data: {
                    actorId: auth.userId, organizationId: tenant.organizationId,
                    action: 'CASE_CREATED', resourceType: 'case', resourceId: created.id,
                    metadata: { caseNumber: created.caseNumber },
                },
            });
            return created;
        }, { isolationLevel: 'Serializable', timeout: 10_000 });
    },

    async update(auth: AuthContext, tenant: TenantContext, id: string, input: UpdateCaseInput) {
        return prisma.$transaction(async (tx) => {
            const existing = await casesRepository.findById(tx, tenant.organizationId, id);
            if (!existing) throw new NotFoundError('case_not_found');
            const updated = await casesRepository.update(tx, tenant.organizationId, id, {
                internalNotes: input.internalNotes, deceasedPerson: input.deceasedPerson,
            });
            await tx.auditLog.create({
                data: {
                    actorId: auth.userId, organizationId: tenant.organizationId,
                    action: 'CASE_UPDATED', resourceType: 'case', resourceId: id,
                    metadata: { fields: Object.keys(input) },
                },
            });
            return updated;
        });
    },

    async changeStatus(auth: AuthContext, tenant: TenantContext, id: string, input: ChangeCaseStatusInput) {
        return prisma.$transaction(async (tx) => {
            const kase = await casesRepository.findById(tx, tenant.organizationId, id);
            if (!kase) throw new NotFoundError('case_not_found');

            if (!VALID_TRANSITIONS[kase.status]?.includes(input.status)) {
                throw new InvalidCaseTransitionError(kase.status, input.status);
            }
            if (input.status === 'OPEN' && !kase.deceasedPerson) throw new CaseWithoutDeceasedError();
            if (input.status === 'CLOSED') {
                const completed = await casesRepository.countCompletedServices(tx, id);
                if (completed === 0) throw new CaseNotClosableError();
            }

            const updated = await casesRepository.changeStatus(tx, id, input.status);
            await tx.auditLog.create({
                data: {
                    actorId: auth.userId, organizationId: tenant.organizationId,
                    action: 'CASE_STATUS_CHANGED', resourceType: 'case', resourceId: id,
                    metadata: { from: kase.status, to: input.status },
                },
            });
            return updated;
        });
    },

    async archive(auth: AuthContext, tenant: TenantContext, id: string) {
        if (tenant.role !== 'FUNERAL_ADMIN' && auth.platformRole !== 'SUPER_ADMIN') {
            throw new ForbiddenError('only_admin_can_archive');
        }
        return casesService.changeStatus(auth, tenant, id, { status: 'ARCHIVED' });
    },

    async softDelete(auth: AuthContext, tenant: TenantContext, id: string) {
        if (tenant.role !== 'FUNERAL_ADMIN' && auth.platformRole !== 'SUPER_ADMIN') {
            throw new ForbiddenError('only_admin_can_delete');
        }
        return prisma.$transaction(async (tx) => {
            const kase = await casesRepository.findById(tx, tenant.organizationId, id);
            if (!kase) throw new NotFoundError('case_not_found');
            if (!['DRAFT', 'ARCHIVED'].includes(kase.status)) {
                throw new ConflictError('case_not_deletable_in_status', { status: kase.status });
            }
            await casesRepository.softDelete(tx, tenant.organizationId, id);
            await tx.auditLog.create({
                data: {
                    actorId: auth.userId, organizationId: tenant.organizationId,
                    action: 'CASE_DELETED', resourceType: 'case', resourceId: id,
                },
            });
        });
    },
};