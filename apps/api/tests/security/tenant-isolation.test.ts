import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { casesService } from '../../src/modules/cases/cases.service';
import { ForbiddenError, NotFoundError } from '../../src/shared/errors';

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_TEST! } },
});

// Fixtures
let orgA: any, orgB: any;
let adminA: any, adminB: any, employeeA: any, superAdmin: any, familyAdminA: any;
let caseA1: any, caseA2: any, caseB1: any, familyGroupA1: any;

beforeAll(async () => {
    // Limpieza (en orden inverso a las FK)
    await prisma.auditLog.deleteMany();
    await prisma.aiGeneration.deleteMany();
    await prisma.memory.deleteMany();
    await prisma.condolence.deleteMany();
    await prisma.memorialMedia.deleteMany();
    await prisma.memorialPublicationAuthorization.deleteMany();
    await prisma.memorialTimelineEvent.deleteMany();
    await prisma.memorialAnniversary.deleteMany();
    await prisma.memorial.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.familyMember.deleteMany();
    await prisma.familyGroup.deleteMany();
    await prisma.caseDocument.deleteMany();
    await prisma.ceremony.deleteMany();
    await prisma.funeralService.deleteMany();
    await prisma.caseAssignment.deleteMany();
    await prisma.deceasedPerson.deleteMany();
    await prisma.case.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    // Organizaciones
    orgA = await prisma.organization.create({
        data: { name: 'Funeraria Sevillana', slug: 'funeraria-sevillana', subscription: { create: { plan: 'BASIC', status: 'TRIALING' } } },
    });
    orgB = await prisma.organization.create({
        data: { name: 'Funeraria Madrileña', slug: 'funeraria-madrilena', subscription: { create: { plan: 'BASIC', status: 'TRIALING' } } },
    });

    // Usuarios
    const mkUser = (email: string, platformRole: 'USER' | 'SUPER_ADMIN' = 'USER') =>
        prisma.user.create({ data: { email, authUserId: randomUUID(), platformRole } });

    adminA = await mkUser('admin.a@funeraria-a.test');
    adminB = await mkUser('admin.b@funeraria-b.test');
    employeeA = await mkUser('employee.a@funeraria-a.test');
    superAdmin = await mkUser('super@platform.test', 'SUPER_ADMIN');
    familyAdminA = await mkUser('family.a@example.test');

    await prisma.organizationMember.createMany({
        data: [
            { organizationId: orgA.id, userId: adminA.id, role: 'FUNERAL_ADMIN', status: 'ACTIVE' },
            { organizationId: orgA.id, userId: employeeA.id, role: 'FUNERAL_EMPLOYEE', status: 'ACTIVE' },
            { organizationId: orgB.id, userId: adminB.id, role: 'FUNERAL_ADMIN', status: 'ACTIVE' },
        ],
    });

    // Casos
    const mkCase = async (organizationId: string, caseNumber: string) =>
        prisma.case.create({
            data: {
                organizationId, caseNumber, status: 'OPEN',
                deceasedPerson: { create: { firstName: 'Nombre', lastName: `Apellido${caseNumber}`, deathDate: new Date('2026-11-01') } },
            },
        });

    caseA1 = await mkCase(orgA.id, 'FUN-2026-0001');
    caseA2 = await mkCase(orgA.id, 'FUN-2026-0002');
    caseB1 = await mkCase(orgB.id, 'FUN-2026-0001');

    // Familia
    familyGroupA1 = await prisma.familyGroup.create({
        data: {
            organizationId: orgA.id, caseId: caseA1.id, name: 'Familia García',
            members: { create: { userId: familyAdminA.id, role: 'FAMILY_ADMIN', isActive: true } },
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

// Helper para contextos
const ctx = (user: any) => ({
    userId: user.id,
    authUserId: user.authUserId,
    email: user.email,
    platformRole: user.platformRole ?? 'USER',
});

describe('Aislamiento cross-tenant', () => {
    it('el admin de A solo ve casos de A', async () => {
        const result = await casesService.list(ctx(adminA), { organizationId: orgA.id, role: 'FUNERAL_ADMIN' }, { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        expect(result.data.map((c: any) => c.id).sort()).toEqual([caseA1.id, caseA2.id].sort());
    });

    it('el admin de B solo ve casos de B', async () => {
        const result = await casesService.list(ctx(adminB), { organizationId: orgB.id, role: 'FUNERAL_ADMIN' }, { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        expect(result.data.map((c: any) => c.id)).toEqual([caseB1.id]);
    });

    it('el admin de A no puede obtener un caso de B por id', async () => {
        await expect(casesService.getById(ctx(adminA), { organizationId: orgA.id, role: 'FUNERAL_ADMIN' }, caseB1.id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('el admin de A no puede modificar un caso de B aunque conozca el id', async () => {
        await expect(casesService.update(ctx(adminA), { organizationId: orgA.id, role: 'FUNERAL_ADMIN' }, caseB1.id, { internalNotes: 'intento' })).rejects.toBeInstanceOf(NotFoundError);
        const check = await prisma.case.findUnique({ where: { id: caseB1.id }, select: { internalNotes: true } });
        expect(check?.internalNotes).toBeNull();
    });

    it('el empleado de A no puede crear casos en B aunque pase el organizationId de B', async () => {
        await expect(casesService.create(ctx(employeeA), { organizationId: orgB.id, role: 'FUNERAL_EMPLOYEE' }, { deceasedPerson: { firstName: 'X', lastName: 'Y', deathDate: '2026-01-01' } })).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('el empleado no puede archivar (solo FUNERAL_ADMIN)', async () => {
        await expect(casesService.archive(ctx(employeeA), { organizationId: orgA.id, role: 'FUNERAL_EMPLOYEE' }, caseA1.id)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('SUPER_ADMIN puede leer casos de cualquier organización', async () => {
        const a = await casesService.list(ctx(superAdmin), { organizationId: orgA.id, role: 'FUNERAL_ADMIN' }, { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        const b = await casesService.list(ctx(superAdmin), { organizationId: orgB.id, role: 'FUNERAL_ADMIN' }, { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        expect(a.data).toHaveLength(2);
        expect(b.data).toHaveLength(1);
    });

    it('un familiar solo ve su expediente, no los demás de la misma organización', async () => {
        const result = await casesService.listForFamily(ctx(familyAdminA), [familyGroupA1.id]);
        expect(result.map((c: any) => c.id)).toEqual([caseA1.id]);
    });
});