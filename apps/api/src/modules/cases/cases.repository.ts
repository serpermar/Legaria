import { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../shared/prisma';

type Tx = Prisma.TransactionClient | PrismaClient;

export const casesRepository = {
    async list(tx: Tx, organizationId: string, opts: {
        status?: string; q?: string; skip: number; take: number;
        sortBy: 'createdAt' | 'updatedAt' | 'caseNumber'; sortOrder: 'asc' | 'desc';
    }) {
        const where: Prisma.CaseWhereInput = {
            organizationId,
            deletedAt: null,
            ...(opts.status ? { status: opts.status as any } : {}),
            ...(opts.q ? {
                OR: [
                    { caseNumber: { contains: opts.q, mode: 'insensitive' } },
                    {
                        deceasedPerson: {
                            OR: [
                                { firstName: { contains: opts.q, mode: 'insensitive' } },
                                { lastName: { contains: opts.q, mode: 'insensitive' } },
                                { secondLastName: { contains: opts.q, mode: 'insensitive' } },
                            ]
                        }
                    },
                ],
            } : {}),
        };

        const [data, total] = await Promise.all([
            tx.case.findMany({
                where,
                orderBy: { [opts.sortBy]: opts.sortOrder },
                skip: opts.skip,
                take: opts.take,
                select: {
                    id: true, caseNumber: true, status: true, createdAt: true, updatedAt: true,
                    deceasedPerson: { select: { firstName: true, lastName: true, secondLastName: true, deathDate: true } },
                    _count: { select: { services: true, assignments: true } },
                },
            }),
            tx.case.count({ where }),
        ]);

        return { data, total };
    },

    async findById(tx: Tx, organizationId: string, id: string) {
        return tx.case.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                deceasedPerson: true,
                services: { orderBy: { scheduledAt: 'asc' } },
                ceremonies: { orderBy: { scheduledAt: 'asc' } },
                assignments: { where: { isActive: true }, include: { user: { select: { id: true, fullName: true, email: true } } } },
                documents: { where: { deletedAt: null }, select: { id: true, type: true, name: true, mimeType: true, fileSizeBytes: true, isPublic: true, createdAt: true } },
            },
        });
    },

    async findByIdForFamily(tx: Tx, familyGroupIds: string[], id: string) {
        return tx.case.findFirst({
            where: { id, deletedAt: null, familyGroup: { id: { in: familyGroupIds } } },
            include: { deceasedPerson: true, services: true, ceremonies: true },
        });
    },

    async nextCaseNumber(tx: Tx, organizationId: string, year: number) {
        const prefix = `FUN-${year}-`;
        const last = await tx.case.findFirst({
            where: { organizationId, caseNumber: { startsWith: prefix } },
            orderBy: { caseNumber: 'desc' },
            select: { caseNumber: true },
        });
        const next = last ? parseInt(last.caseNumber.slice(prefix.length), 10) + 1 : 1;
        return `${prefix}${String(next).padStart(4, '0')}`;
    },

    async create(tx: Tx, organizationId: string, input: { caseNumber: string; internalNotes?: string; deceasedPerson?: any }) {
        return tx.case.create({
            data: {
                organizationId,
                caseNumber: input.caseNumber,
                internalNotes: input.internalNotes,
                status: 'DRAFT',
                ...(input.deceasedPerson ? {
                    deceasedPerson: {
                        create: {
                            ...input.deceasedPerson,
                            birthDate: input.deceasedPerson.birthDate ? new Date(input.deceasedPerson.birthDate) : undefined,
                            deathDate: new Date(input.deceasedPerson.deathDate),
                        },
                    },
                } : {}),
            },
            select: { id: true, caseNumber: true, status: true },
        });
    },

    async update(tx: Tx, organizationId: string, id: string, input: { internalNotes?: string; deceasedPerson?: any }) {
        const data: Prisma.CaseUpdateInput = {};
        if (input.internalNotes !== undefined) data.internalNotes = input.internalNotes;
        if (input.deceasedPerson) {
            data.deceasedPerson = {
                update: {
                    ...input.deceasedPerson,
                    birthDate: input.deceasedPerson.birthDate ? new Date(input.deceasedPerson.birthDate) : undefined,
                    deathDate: input.deceasedPerson.deathDate ? new Date(input.deceasedPerson.deathDate) : undefined,
                },
            };
        }
        return tx.case.update({ where: { id }, data, include: { deceasedPerson: true } });
    },

    async changeStatus(tx: Tx, id: string, status: string) {
        return tx.case.update({
            where: { id },
            data: {
                status: status as any,
                ...(status === 'CLOSED' ? { closedAt: new Date() } : {}),
                ...(status === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
            },
        });
    },

    async countCompletedServices(tx: Tx, caseId: string) {
        return tx.funeralService.count({ where: { caseId, status: 'COMPLETED' } });
    },

    async softDelete(tx: Tx, organizationId: string, id: string) {
        return tx.case.update({ where: { id }, data: { deletedAt: new Date() } });
    },
};