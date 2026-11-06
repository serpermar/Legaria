import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { tenantMiddleware } from '../auth/tenant.middleware';
import { organizationsService } from './organizations.service';
import { CreateOrganizationSchema } from '@legaria/contracts';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
    try {
        const data = await organizationsService.list(req.auth!);
        res.json({ data });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const input = CreateOrganizationSchema.parse(req.body);
        const created = await organizationsService.create(req.auth!, input);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

router.get('/:organizationId', tenantMiddleware, async (req, res, next) => {
    try {
        const data = await organizationsService.getById(req.auth!, req.tenant!.organizationId);
        res.json({ data });
    } catch (err) {
        next(err);
    }
});

export { router as organizationsRoutes };