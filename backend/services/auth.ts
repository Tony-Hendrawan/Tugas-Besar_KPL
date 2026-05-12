/**
 * backend/services/auth.ts
 * TEKNIK: Defensive Programming — validasi sebelum proses
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import * as repo from '../repository';
import { validateRegister } from '../utils';

export async function register(data: { nama: string; email: string; password: string; no_telepon?: string }) {
  const errors = validateRegister(data);
  if (errors.length > 0) return { success: false, message: errors.join(', ') };

  const existing = await repo.findUserByEmail(data.email);
  if (existing) return { success: false, message: 'Email sudah terdaftar' };

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await repo.createUser(data.nama, data.email, hashed, data.no_telepon);
  return { success: true, data: user, message: 'Registrasi berhasil' };
}

export async function login(email: string, password: string) {
  if (!email || !password) return { success: false, message: 'Email dan password wajib diisi' };

  const user = await repo.findUserByEmail(email);
  if (!user) return { success: false, message: 'Email atau password salah' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, message: 'Email atau password salah' };

  const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  return { success: true, data: { token, user: { id: user.id, nama: user.nama } }, message: 'Login berhasil' };
}