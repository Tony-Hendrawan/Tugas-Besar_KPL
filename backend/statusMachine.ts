/**
 * backend/statusMachine.ts
 * TEKNIK: Automata (Finite State Machine)
 * Status booking diatur oleh FSM. Setiap perubahan harus melewati validasi transisi.
 *
 * Diagram:
 *   PENDING   --> CONFIRMED
 *   PENDING   --> CANCELLED
 *   CONFIRMED --> COMPLETED
 *   CONFIRMED --> CANCELLED
 *   COMPLETED --> (terminal)
 *   CANCELLED --> (terminal)
 */

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// TEKNIK TABLE-DRIVEN: aturan transisi disimpan sebagai data
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionBooking(current: BookingStatus, next: BookingStatus): { success: boolean; message: string } {
  if (current === next) return { success: false, message: `Status sudah '${current}'` };
  if (!isValidTransition(current, next)) {
    return { success: false, message: `Tidak bisa mengubah status dari '${current}' ke '${next}'` };
  }
  return { success: true, message: `Status berhasil diubah ke '${next}'` };
}
