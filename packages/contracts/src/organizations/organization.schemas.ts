import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
    name: z.string().min(2).max(120),
    slug: z
        .string()
        .min(3)
        .max(60)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
    taxId: z.string().optional(),
});