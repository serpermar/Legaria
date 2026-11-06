import { z } from 'zod';

export const ApiErrorSchema = z.object({
    type: z.string(),
    title: z.string(),
    status: z.number(),
    code: z.string(),
    detail: z.string(),
    instance: z.string().optional(),
    requestId: z.string(),
    errors: z
        .array(
            z.object({
                path: z.string(),
                message: z.string(),
            }),
        )
        .optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;