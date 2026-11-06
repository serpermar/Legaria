import { AppError } from '../../shared/errors';

export class InvalidCaseTransitionError extends AppError {
    constructor(from: string, to: string) {
        super(422, 'INVALID_CASE_TRANSITION', `No se puede pasar de ${from} a ${to}`);
    }
}

export class CaseNotClosableError extends AppError {
    constructor() {
        super(422, 'CASE_NOT_CLOSABLE', 'El expediente necesita al menos un servicio completado');
    }
}

export class CaseWithoutDeceasedError extends AppError {
    constructor() {
        super(422, 'CASE_WITHOUT_DECEASED', 'No se puede abrir un expediente sin persona fallecida');
    }
}