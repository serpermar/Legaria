import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Adaptador de almacenamiento compatible con S3.
 *
 * En desarrollo y en el plan gratuito se apunta a Neon Object Storage; en
 * producción puede sustituirse por cualquier proveedor S3 sin cambiar el
 * código de los módulos (solo las variables de entorno).
 */
export const storageBucket = process.env.S3_BUCKET ?? 'legaria-private';

export const s3 = new S3Client({
    region: process.env.S3_REGION ?? 'eu-central-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
});

export function buildStorageKey(parts: string[]): string {
    return parts
        .map((part) => part.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
}

export async function createUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300,
): Promise<string> {
    return getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: storageBucket,
            Key: key,
            ContentType: contentType,
        }),
        { expiresIn: expiresInSeconds },
    );
}

export async function createDownloadUrl(
    key: string,
    expiresInSeconds = 300,
): Promise<string> {
    return getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: storageBucket, Key: key }),
        { expiresIn: expiresInSeconds },
    );
}

export async function deleteObject(key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({ Bucket: storageBucket, Key: key }));
}
