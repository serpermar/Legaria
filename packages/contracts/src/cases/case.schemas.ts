import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD');

export const DeceasedPersonInputSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    secondLastName: z.string().max(100).optional(),
    birthDate: dateOnly.optional(),
    deathDate: dateOnly,
    birthPlace: z.string().max(200).optional(),
    deathPlace: z.string().max(200).optional(),
});

export const CreateCaseSchema = z.object({
    internalNotes: z.string().max(5000).optional(),
    deceasedPerson: DeceasedPersonInputSchema.optional(),
});

export const UpdateCaseSchema = z.object({
    internalNotes: z.string().max(5000).optional(),
    deceasedPerson: DeceasedPersonInputSchema.partial().optional(),
});

export const ChangeCaseStatusSchema = z.object({
    status: z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED']),
});

export const ListCasesQuerySchema = z.object({
    status: z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED']).optional(),
    q: z.string().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'caseNumber']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;
export type ChangeCaseStatusInput = z.infer<typeof ChangeCaseStatusSchema>;
export type ListCasesQueryInput = z.infer<typeof ListCasesQuerySchema>;