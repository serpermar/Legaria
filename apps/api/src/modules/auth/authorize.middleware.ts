import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../shared/errors';

type OrgRole = 'FUNERAL_ADMIN' | 'FUNERAL_EMPLOYEE';

export function authorize(...allowed: OrgRole[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.tenant) return next(new ForbiddenError('tenant_not_resolved'));
        if (!allowed.includes(req.tenant.role)) {
            return next(new ForbiddenError('insufficient_role'));
        }
        next();
    };
}