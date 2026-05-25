export type AttendanceOption = 'yes' | 'no' | 'maybe';

export interface RsvpResponse {
  id: string;
  invitation_id: string;
  attending: AttendanceOption;
  guest_count: number;
  dietary_notes: string | null;
  message: string | null;
  ip_address: string | null;
  responded_at: string;
}
