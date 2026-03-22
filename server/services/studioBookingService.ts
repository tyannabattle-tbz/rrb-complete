/**
 * Studio Booking and Reservation System Service
 * Manages studio reservations, equipment checkout, and session recording
 */

export interface StudioReservation {
  reservationId: string;
  studioId: string;
  studioName: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  purpose: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  equipment: string[];
  notes: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
}

export interface EquipmentCheckout {
  checkoutId: string;
  reservationId: string;
  equipment: Array<{
    name: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
    checkoutTime: Date;
    returnTime?: Date;
  }>;
  status: 'checked_out' | 'returned' | 'overdue';
}

export interface SessionRecording {
  recordingId: string;
  reservationId: string;
  studioId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  fileUrl: string;
  format: string;
  bitrate: number;
  sampleRate: number;
  status: 'recording' | 'processing' | 'completed' | 'archived';
  metadata: {
    title: string;
    artist: string;
    genre: string;
    tags: string[];
  };
}

export interface StudioAvailability {
  studioId: string;
  date: Date;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    reservationId?: string;
  }>;
}

class StudioBookingService {
  private reservations: Map<string, StudioReservation> = new Map();
  private equipmentCheckouts: Map<string, EquipmentCheckout> = new Map();
  private sessionRecordings: Map<string, SessionRecording> = new Map();
  private studioCapacity: Record<string, number> = {
    'studio-001': 4,
    'studio-002': 1,
    'studio-003': 6,
    'studio-004': 8,
    'studio-005': 2,
    'studio-006': 2
  };

  /**
   * Create studio reservation
   */
  createReservation(
    studioId: string,
    studioName: string,
    userId: string,
    userName: string,
    startTime: Date,
    endTime: Date,
    purpose: string,
    equipment: string[] = [],
    recordingEnabled: boolean = true
  ): StudioReservation {
    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const reservation: StudioReservation = {
      reservationId,
      studioId,
      studioName,
      userId,
      userName,
      startTime,
      endTime,
      duration,
      purpose,
      status: 'pending',
      equipment,
      notes: '',
      recordingEnabled,
      recordingUrl: ''
    };

    this.reservations.set(reservationId, reservation);
    console.log(`[Studio Booking] Created reservation: ${reservationId} for ${studioName}`);
    return reservation;
  }

  /**
   * Confirm reservation
   */
  confirmReservation(reservationId: string): StudioReservation | null {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'confirmed';
      console.log(`[Studio Booking] Confirmed reservation: ${reservationId}`);
      return reservation;
    }
    return null;
  }

  /**
   * Start session (mark as active)
   */
  startSession(reservationId: string): StudioReservation | null {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'active';
      console.log(`[Studio Booking] Started session: ${reservationId}`);
      return reservation;
    }
    return null;
  }

  /**
   * End session and complete reservation
   */
  endSession(reservationId: string): StudioReservation | null {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'completed';
      console.log(`[Studio Booking] Completed session: ${reservationId}`);
      return reservation;
    }
    return null;
  }

  /**
   * Cancel reservation
   */
  cancelReservation(reservationId: string, reason: string): StudioReservation | null {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'cancelled';
      reservation.notes = reason;
      console.log(`[Studio Booking] Cancelled reservation: ${reservationId}`);
      return reservation;
    }
    return null;
  }

  /**
   * Get reservation
   */
  getReservation(reservationId: string): StudioReservation | undefined {
    return this.reservations.get(reservationId);
  }

  /**
   * Get user's reservations
   */
  getUserReservations(userId: string): StudioReservation[] {
    return Array.from(this.reservations.values()).filter(r => r.userId === userId);
  }

  /**
   * Get studio's reservations
   */
  getStudioReservations(studioId: string): StudioReservation[] {
    return Array.from(this.reservations.values()).filter(r => r.studioId === studioId);
  }

  /**
   * Checkout equipment
   */
  checkoutEquipment(
    reservationId: string,
    equipment: Array<{ name: string; quantity: number }>
  ): EquipmentCheckout {
    const checkoutId = `checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const checkout: EquipmentCheckout = {
      checkoutId,
      reservationId,
      equipment: equipment.map(e => ({
        ...e,
        condition: 'excellent',
        checkoutTime: new Date()
      })),
      status: 'checked_out'
    };

    this.equipmentCheckouts.set(checkoutId, checkout);
    console.log(`[Equipment Checkout] Checked out equipment for reservation: ${reservationId}`);
    return checkout;
  }

  /**
   * Return equipment
   */
  returnEquipment(checkoutId: string): EquipmentCheckout | null {
    const checkout = this.equipmentCheckouts.get(checkoutId);
    if (checkout) {
      checkout.status = 'returned';
      checkout.equipment.forEach(e => {
        e.returnTime = new Date();
      });
      console.log(`[Equipment Checkout] Returned equipment: ${checkoutId}`);
      return checkout;
    }
    return null;
  }

  /**
   * Start session recording
   */
  startRecording(
    reservationId: string,
    studioId: string,
    title: string,
    artist: string,
    genre: string
  ): SessionRecording {
    const recordingId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const recording: SessionRecording = {
      recordingId,
      reservationId,
      studioId,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      fileUrl: `https://recordings.rockinrockinboogie.com/${recordingId}.wav`,
      format: 'WAV',
      bitrate: 320,
      sampleRate: 48000,
      status: 'recording',
      metadata: {
        title,
        artist,
        genre,
        tags: []
      }
    };

    this.sessionRecordings.set(recordingId, recording);
    console.log(`[Session Recording] Started recording: ${recordingId}`);
    return recording;
  }

  /**
   * Stop recording
   */
  stopRecording(recordingId: string): SessionRecording | null {
    const recording = this.sessionRecordings.get(recordingId);
    if (recording) {
      recording.endTime = new Date();
      recording.duration = Math.floor(
        (recording.endTime.getTime() - recording.startTime.getTime()) / 1000
      );
      recording.status = 'processing';
      console.log(`[Session Recording] Stopped recording: ${recordingId}`);
      return recording;
    }
    return null;
  }

  /**
   * Complete recording
   */
  completeRecording(recordingId: string): SessionRecording | null {
    const recording = this.sessionRecordings.get(recordingId);
    if (recording) {
      recording.status = 'completed';
      console.log(`[Session Recording] Completed recording: ${recordingId}`);
      return recording;
    }
    return null;
  }

  /**
   * Get recording
   */
  getRecording(recordingId: string): SessionRecording | undefined {
    return this.sessionRecordings.get(recordingId);
  }

  /**
   * Get studio availability
   */
  getStudioAvailability(studioId: string, date: Date): StudioAvailability {
    const timeSlots = this.generateTimeSlots(date);
    const studioReservations = this.getStudioReservations(studioId).filter(
      r => r.startTime.toDateString() === date.toDateString()
    );

    const availability: StudioAvailability = {
      studioId,
      date,
      timeSlots: timeSlots.map(slot => {
        const isBooked = studioReservations.some(
          r =>
            r.startTime.getHours() === parseInt(slot.startTime.split(':')[0]) &&
            r.status !== 'cancelled'
        );

        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: !isBooked,
          reservationId: isBooked ? 'reserved' : undefined
        };
      })
    };

    return availability;
  }

  /**
   * Generate time slots for a day
   */
  private generateTimeSlots(date: Date): Array<{ startTime: string; endTime: string }> {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  }

  /**
   * Get all reservations
   */
  getAllReservations(): StudioReservation[] {
    return Array.from(this.reservations.values());
  }

  /**
   * Get all recordings
   */
  getAllRecordings(): SessionRecording[] {
    return Array.from(this.sessionRecordings.values());
  }
}

export const studioBookingService = new StudioBookingService();
