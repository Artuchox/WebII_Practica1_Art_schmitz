// src/config/env.js
import { z } from 'zod';

const isTest = process.env.NODE_ENV === 'test'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
    DB_URI: z.string().optional(),
    JWT_SECRET:              z.string().min(32).default('test_secret_muy_largo_y_seguro_1234567890'),
    JWT_EXPIRES_IN:          z.string().default('15m'),
    JWT_REFRESH_SECRET:      z.string().min(32).default('test_refresh_secret_muy_largo_y_seguro_1234567890'),
    JWT_REFRESH_EXPIRES_IN:  z.string().default('7d'),
    SLACK_WEBHOOK:           z.string().url().optional(),
    CLOUDINARY_CLOUD_NAME:   isTest ? z.string().optional() : z.string(),
    CLOUDINARY_API_KEY:      isTest ? z.string().optional() : z.string(),
    CLOUDINARY_API_SECRET:   isTest ? z.string().optional() : z.string(),
    MAIL_HOST:               z.string().optional(),
    MAIL_PORT:               z.string().regex(/^\d+$/).transform(Number).default('587'),
    MAIL_USER:               z.string().optional(),
    MAIL_PASS:               z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Variables de entorno inválidas:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

const env = parsed.data;

export default env;