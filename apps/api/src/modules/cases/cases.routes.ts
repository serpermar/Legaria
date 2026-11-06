import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { resolveCaseTenant, tenantMiddleware } from '../auth/tenant.middleware';
import { authorize } from '../auth/authorize.middleware';
import { casesController } from './cases.controller';

const router = Router();
router.use(authMiddleware);

router.get('/organizations/:organizationId/cases', tenantMiddleware, authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'), casesController.list);
router.post('/organizations/:organizationId/cases', tenantMiddleware, authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'), casesController.create);

router.get('/cases/:caseId', resolveCaseTenant, authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'), casesController.getById);
router.patch('/cases/:caseId', resolveCaseTenant, authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'), casesController.update);
router.post('/cases/:caseId/status', resolveCaseTenant, authorize('FUNERAL_ADMIN', 'FUNERAL_EMPLOYEE'), casesController.changeStatus);
router.post('/cases/:caseId/archive', resolveCaseTenant, authorize('FUNERAL_ADMIN'), casesController.archive);
router.delete('/cases/:caseId', resolveCaseTenant, authorize('FUNERAL_ADMIN'), casesController.remove);

export { router as casesRoutes };