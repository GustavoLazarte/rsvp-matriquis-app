export type InvitationStatus = 'pending' | 'opened' | 'responded' | 'expired';

export interface Invitation {
  id: string;
  event_id: string;
  token: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  group: string | null;
  plus_one_allowed: number;
  status: InvitationStatus;
  sent_at: string | null;
  expires_at: string | null;
  created_at: string;
}
