import type { Request, Response, NextFunction } from 'express';
import { casesService } from './cases.service';
import { ChangeCaseStatusSchema, CreateCaseSchema, ListCasesQuerySchema, UpdateCaseSchema } from '@legaria/contracts';

export const casesController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const query = ListCasesQuerySchema.parse(req.query);
            const result = await casesService.list(req.auth!, req.tenant!, query);
            res.json(result);
        } catch (err) { next(err); }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const kase = await casesService.getById(req.auth!, req.tenant!, req.params.caseId!);
            res.json({ data: kase });
        } catch (err) { next(err); }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const input = CreateCaseSchema.parse(req.body);
            const created = await casesService.create(req.auth!, req.tenant!, input);
            res.status(201).json({ data: created });
        } catch (err) { next(err); }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const input = UpdateCaseSchema.parse(req.body);
            const updated = await casesService.update(req.auth!, req.tenant!, req.params.caseId!, input);
            res.json({ data: updated });
        } catch (err) { next(err); }
    },

    async changeStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const input = ChangeCaseStatusSchema.parse(req.body);
            const updated = await casesService.changeStatus(req.auth!, req.tenant!, req.params.caseId!, input);
            res.json({ data: updated });
        } catch (err) { next(err); }
    },

    async archive(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await casesService.archive(req.auth!, req.tenant!, req.params.caseId!);
            res.json({ data: updated });
        } catch (err) { next(err); }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            await casesService.softDelete(req.auth!, req.tenant!, req.params.caseId!);
            res.status(204).send();
        } catch (err) { next(err); }
    },
};