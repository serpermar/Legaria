import { Router } from 'express';
import { authMiddleware } from './auth.middleware';
import { prisma } from '../../shared/prisma';

const router = Router();

router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.auth!.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                platformRole: true,
                organizationMemberships: {
                    where: { status: 'ACTIVE' },
                    select: {
                        organizationId: true,
                        role: true,
                        organization: { select: { name: true, slug: true } },
                    },
                },
                familyMemberships: {
                    where: { isActive: true },
                    select: {
                        familyGroupId: true,
                        role: true,
                        familyGroup: { select: { caseId: true, name: true } },
                    },
                },
            },
        });
        res.json({ data: user });
    } catch (err) {
        next(err);
    }
});

export { router as authRoutes };