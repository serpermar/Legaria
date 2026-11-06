import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

export const RedeemInvitationSchema = z.object({
    token: z.string().min(1),
});