/**
 * TEKNIK: Code Reuse + Generics
 * Fungsi-fungsi utilitas yang dipakai di seluruh backend.
 */

import { Response } from 'express';

//Response Helpers

export function sendSuccess<T>(res: Response, data: T, message = 'Berhasil', status = 200): void {
    res.status(status).json({ success: true, data, message });
}

export function sendError(res: Response, message: string, status = 400): void {
    res.status(status).json({ success: false, data: null, message });
}

//Validation Helpers

export function validateRequired<T extends Record<string, any>>(data: T, fields: (keyof T)[]): string[] {
    const errors: string[] = [];
    for (const field of fields) {
        const value = data[field];
        if (value === undefined || value === null || value === '') {
            errors.push(`Field '${String(field)}' wajib diisi`);
        }
    }
    return errors;
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegister(data: Record<string, any>): string[] {
    const errors = validateRequired(data, ['nama', 'email', 'password']);
    if (data.email && !isValidEmail(data.email)) errors.push('Format email tidak valid');
    if (data.password && data.password.length < 6) errors.push('Password minimal 6 karakter');
    return errors;
}

export function validatePemesanan(data: Record<string, any>): string[] {
    const errors = validateRequired(data, ['kos_id', 'tanggal_masuk', 'durasi_bulan']);
    if (data.durasi_bulan && Number(data.durasi_bulan) <= 0) errors.push('Durasi harus lebih dari 0 bulan');
    return errors;
}