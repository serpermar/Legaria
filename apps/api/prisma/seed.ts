import '../src/config/env';
import { prisma } from '../src/shared/prisma';
import { auth } from '../src/modules/auth/auth';

const DEMO_PASSWORD = 'Legaria123!';

async function main() {
    console.log('🌱 Seeding...');

    // Organizaciones
    const orgA = await prisma.organization.create({
        data: {
            name: 'Funeraria Sevillana', slug: 'funeraria-sevillana',
            legalName: 'Funeraria Sevillana S.L.', taxId: 'B41000001',
            email: 'contacto@funeraria-sevillana.test', city: 'Sevilla', country: 'ES',
            plan: 'PROFESSIONAL', status: 'ACTIVE',
            subscription: { create: { plan: 'PROFESSIONAL', status: 'ACTIVE' } },
        },
    });

    const orgB = await prisma.organization.create({
        data: {
            name: 'Funeraria Madrileña', slug: 'funeraria-madrilena',
            legalName: 'Funeraria Madrileña S.A.', taxId: 'A28000002',
            email: 'contacto@funeraria-madrilena.test', city: 'Madrid', country: 'ES',
            plan: 'BASIC', status: 'ACTIVE',
            subscription: { create: { plan: 'BASIC', status: 'TRIALING' } },
        },
    });

    // Usuarios: Better Auth es la fuente de identidad. Se crea la cuenta de
    // autenticación y se enlaza el perfil de dominio mediante `authUserId`.
    const mkUser = async (
        email: string,
        fullName: string,
        platformRole: 'USER' | 'SUPER_ADMIN' = 'USER',
    ) => {
        const { user: authUser } = await auth.api.signUpEmail({
            body: { email, password: DEMO_PASSWORD, name: fullName },
        });

        return prisma.user.create({
            data: { email, fullName, authUserId: authUser.id, platformRole },
        });
    };

    const superAdmin = await mkUser('super@memora.test', 'Super Admin', 'SUPER_ADMIN');
    const adminA = await mkUser('admin@sevillana.test', 'Ana Ruiz');
    const employeeA = await mkUser('empleado@sevillana.test', 'Luis Pardo');
    const adminB = await mkUser('admin@madrilena.test', 'Carlos Vega');
    const familyAdmin1 = await mkUser('familia.garcia@example.test', 'Marta García');
    const familyMember1 = await mkUser('hijo.garcia@example.test', 'Javier García');

    // Membresías
    await prisma.organizationMember.createMany({
        data: [
            { organizationId: orgA.id, userId: adminA.id, role: 'FUNERAL_ADMIN', status: 'ACTIVE' },
            { organizationId: orgA.id, userId: employeeA.id, role: 'FUNERAL_EMPLOYEE', status: 'ACTIVE' },
            { organizationId: orgB.id, userId: adminB.id, role: 'FUNERAL_ADMIN', status: 'ACTIVE' },
        ],
    });

    // Salas
    const roomA = await prisma.ceremonyRoom.create({
        data: { organizationId: orgA.id, name: 'Sala La Paz', capacity: 60, location: 'Sevilla' },
    });

    // Caso A1 (García) — completo
    const caseA1 = await prisma.case.create({
        data: {
            organizationId: orgA.id, caseNumber: 'FUN-2026-0001', status: 'IN_PROGRESS',
            internalNotes: 'Familia numerosa; coordinar con parroquia.',
            deceasedPerson: {
                create: {
                    firstName: 'Manuel', lastName: 'García', secondLastName: 'López',
                    birthDate: new Date('1935-03-12'), deathDate: new Date('2026-10-28'),
                    birthPlace: 'Sevilla', deathPlace: 'Sevilla', occupation: 'Maestro',
                    biography: 'Maestro de profesión, amante de la lectura y del flamenco.',
                },
            },
            services: {
                create: [
                    { serviceType: 'velatorio', status: 'COMPLETED', scheduledAt: new Date('2026-10-29T10:00:00Z'), location: 'Sala La Paz' },
                    { serviceType: 'entierro', status: 'SCHEDULED', scheduledAt: new Date('2026-10-30T11:00:00Z'), location: 'Cementerio de San Fernando' },
                ],
            },
            ceremonies: {
                create: { title: 'Misa de despedida', status: 'SCHEDULED', scheduledAt: new Date('2026-10-30T10:00:00Z'), roomId: roomA.id },
            },
            assignments: { create: { userId: employeeA.id, isActive: true } },
        },
    });

    await prisma.familyGroup.create({
        data: {
            organizationId: orgA.id, caseId: caseA1.id, name: 'Familia García',
            members: {
                create: [
                    { userId: familyAdmin1.id, role: 'FAMILY_ADMIN', relationship: 'hija' },
                    { userId: familyMember1.id, role: 'FAMILY_MEMBER', relationship: 'nieto' },
                ],
            },
        },
    });

    // Caso A2 (Rodríguez) — borrador
    await prisma.case.create({
        data: {
            organizationId: orgA.id, caseNumber: 'FUN-2026-0002', status: 'DRAFT',
            deceasedPerson: { create: { firstName: 'Carmen', lastName: 'Rodríguez', deathDate: new Date('2026-11-02'), deathPlace: 'Dos Hermanas' } },
        },
    });

    // Caso B1 (Fernández) — otra organización
    await prisma.case.create({
        data: {
            organizationId: orgB.id, caseNumber: 'FUN-2026-0001', status: 'OPEN',
            internalNotes: 'No debe ser visible desde la org de Sevilla.',
            deceasedPerson: { create: { firstName: 'José', lastName: 'Fernández', deathDate: new Date('2026-11-01'), deathPlace: 'Madrid' } },
        },
    });

    console.log('✅ Seed completo');
    console.log('   Super Admin  → super@memora.test');
    console.log('   Admin A      → admin@sevillana.test');
    console.log('   Empleado A   → empleado@sevillana.test');
    console.log('   Admin B      → admin@madrilena.test');
    console.log('   Familia A    → familia.garcia@example.test');
    console.log('   Org A:', orgA.id);
    console.log('   Org B:', orgB.id);
    console.log(`   Contraseña demo: ${DEMO_PASSWORD}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());