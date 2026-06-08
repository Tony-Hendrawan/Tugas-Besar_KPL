import { validateRegister, validatePemesanan, isValidEmail, validateRequired } from '../utils';

describe('Utils - Validation Tests (Defensive Programming)', () => {

  describe('validateRequired()', () => {
    it('should return errors for missing required fields', () => {
      const data = { name: '', age: null, city: 'Bandung' };
      const errors = validateRequired(data, ['name', 'age', 'city']);
      expect(errors).toContain("Field 'name' wajib diisi");
      expect(errors).toContain("Field 'age' wajib diisi");
      expect(errors).not.toContain("Field 'city' wajib diisi");
    });
  });

  describe('isValidEmail()', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.id')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('validateRegister()', () => {
    it('should return errors when essential fields are empty', () => {
      const result = validateRegister({});
      expect(result).toContain("Field 'nama' wajib diisi");
      expect(result).toContain("Field 'email' wajib diisi");
      expect(result).toContain("Field 'password' wajib diisi");
    });

    it('should return error for invalid email format', () => {
      const result = validateRegister({ nama: 'John', email: 'invalid-email', password: 'password123' });
      expect(result).toContain('Format email tidak valid');
    });

    it('should return error for password shorter than 6 characters', () => {
      const result = validateRegister({ nama: 'John', email: 'john@example.com', password: '123' });
      expect(result).toContain('Password minimal 6 karakter');
    });

    it('should return empty array when register data is valid', () => {
      const result = validateRegister({ nama: 'John Doe', email: 'john@example.com', password: 'password123' });
      expect(result.length).toBe(0);
    });
  });

  describe('validatePemesanan()', () => {
    it('should return errors when fields are empty', () => {
      const result = validatePemesanan({});
      expect(result).toContain("Field 'kos_id' wajib diisi");
      expect(result).toContain("Field 'tanggal_masuk' wajib diisi");
      expect(result).toContain("Field 'durasi_bulan' wajib diisi");
    });

    it('should return error for durasi_bulan less than or equal to 0', () => {
      const result1 = validatePemesanan({ kos_id: 1, tanggal_masuk: '2026-06-10', durasi_bulan: 0 });
      expect(result1).toContain('Durasi harus lebih dari 0 bulan');

      const result2 = validatePemesanan({ kos_id: 1, tanggal_masuk: '2026-06-10', durasi_bulan: -3 });
      expect(result2).toContain('Durasi harus lebih dari 0 bulan');
    });

    it('should return empty array for valid pemesanan data', () => {
      const result = validatePemesanan({ kos_id: 1, tanggal_masuk: '2026-06-10', durasi_bulan: 3 });
      expect(result.length).toBe(0);
    });
  });
});
