import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = (req as any).requestId ?? 'unknown';

  if (err instanceof ZodError) {
    res.status(422).json({
      type: 'https://api.legaria.es/errors/validation',
      title: 'Validation failed',
      status: 422,
      code: 'VALIDATION_ERROR',
      detail: 'Hay campos inválidos.',
      instance: req.path,
      requestId,
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      type: `https://api.legaria.es/errors/${err.code.toLowerCase()}`,
      title: err.code,
      status: err.status,
      code: err.code,
      detail: err.message,
      instance: req.path,
      requestId,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  console.error('[error]', { requestId, err });
  res.status(500).json({
    type: 'https://api.legaria.es/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL_ERROR',
    detail: 'Error interno',
    instance: req.path,
    requestId,
  });
}