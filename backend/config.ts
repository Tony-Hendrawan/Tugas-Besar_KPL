/**
 * backend/config.ts
 * TEKNIK: Runtime Configuration
 * Semua konfigurasi dibaca dari environment variables di satu tempat.
 * Jika DATABASE_URL belum ada, server tetap jalan (frontend-only mode).
 */

import dotenv from 'dotenv';
dotenv.config();

const config = {
  db: {
    url: process.env.DATABASE_URL ?? '',
    available: !!process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-key',
    expiresIn: '7d' as const,
  },
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
};

if (!config.db.available) {
  console.warn('[Config] DATABASE_URL belum diisi — API akan return error, tapi frontend tetap bisa diakses.');
}

export default config;