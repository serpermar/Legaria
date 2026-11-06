import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// El .env vive en la raíz del monorepo. Se comprueban ambas ubicaciones para
// que funcione tanto ejecutando desde apps/api como desde la raíz.
const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
];

for (const candidate of candidates) {
    if (existsSync(candidate)) {
        process.loadEnvFile(candidate);
        break;
    }
}
