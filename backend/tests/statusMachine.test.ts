import { isValidTransition, transitionBooking } from '../statusMachine';

describe('Status Machine - FSM Tests (Defensive Programming)', () => {

  describe('isValidTransition()', () => {
    it('should allow valid transitions', () => {
      expect(isValidTransition('pending', 'confirmed')).toBe(true);
      expect(isValidTransition('pending', 'cancelled')).toBe(true);
      expect(isValidTransition('confirmed', 'completed')).toBe(true);
      expect(isValidTransition('confirmed', 'cancelled')).toBe(true);
    });

    it('should disallow invalid transitions', () => {
      expect(isValidTransition('pending', 'completed')).toBe(false);
      expect(isValidTransition('completed', 'confirmed')).toBe(false);
      expect(isValidTransition('cancelled', 'pending')).toBe(false);
      expect(isValidTransition('completed', 'cancelled')).toBe(false);
    });
  });

  describe('transitionBooking()', () => {
    it('should succeed for valid transition from pending to confirmed', () => {
      const result = transitionBooking('pending', 'confirmed');
      expect(result.success).toBe(true);
      expect(result.message).toBe("Status berhasil diubah ke 'confirmed'");
    });

    it('should fail if current status is same as target status', () => {
      const result = transitionBooking('pending', 'pending');
      expect(result.success).toBe(false);
      expect(result.message).toBe("Status sudah 'pending'");
    });

    it('should fail and return error message for invalid transition from pending to completed', () => {
      const result = transitionBooking('pending', 'completed');
      expect(result.success).toBe(false);
      expect(result.message).toBe("Tidak bisa mengubah status dari 'pending' ke 'completed'");
    });
  });
});
