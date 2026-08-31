import 'dotenv/config';

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  JWT_SECRET_KEY: string;
  JWT_2FA_SECRET: string;
  ENCRYPTION_2FA_KEY: string;
  DEFAULT_TIMEZONE: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  CLOUDINARY_URL: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET_KEY',
  'JWT_2FA_SECRET',
  'ENCRYPTION_2FA_KEY',
  'RESEND_API_KEY',
  'CLOUDINARY_URL',
] as const;


for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Error fatal: Falta la variable de entorno obligatoria: ${varName}`);
    process.exit(1);
  }
}

export const env: EnvConfig = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4400,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4400',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
  JWT_2FA_SECRET: process.env.JWT_2FA_SECRET!,
  ENCRYPTION_2FA_KEY: process.env.ENCRYPTION_2FA_KEY!,
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'America/Argentina/Buenos_Aires',
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL!,
};