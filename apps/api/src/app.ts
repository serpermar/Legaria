import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './modules/auth/auth';
import { authRoutes } from './modules/auth/auth.routes';
import { organizationsRoutes } from './modules/organizations/organizations.routes';
import { casesRoutes } from './modules/cases/cases.routes';
import { errorHandler } from './shared/error-handler';

const app = express();
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? [],
        credentials: true,
    }),
);

// Better Auth necesita consumir el body sin procesar: debe montarse antes de
// `express.json()`. El prefijo por defecto es `/api/auth`.
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json({ limit: '1mb' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1', casesRoutes);

app.use(errorHandler);
export { app };
