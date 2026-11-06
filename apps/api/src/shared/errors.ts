export class AppError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
        public readonly details?: Record<string, unknown>,
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(code = 'UNAUTHENTICATED') {
        super(401, code, 'No autenticado');
    }
}

export class ForbiddenError extends AppError {
    constructor(code = 'FORBIDDEN') {
        super(403, code, 'Sin permiso');
    }
}

export class NotFoundError extends AppError {
    constructor(code = 'NOT_FOUND') {
        super(404, code, 'Recurso no encontrado');
    }
}

export class ConflictError extends AppError {
    constructor(code = 'CONFLICT', details?: Record<string, unknown>) {
        super(409, code, 'Conflicto de estado', details);
    }
}