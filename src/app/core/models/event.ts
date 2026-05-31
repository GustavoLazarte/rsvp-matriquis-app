export type EventStatus = 'draft' | 'active' | 'closed' | 'cancelled';

export interface Event {
  id: string;
  admin_id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string;
  location: string | null;
  adress: string | null;
  adress_url: string | null;
  max_guests: number | null;
  status: EventStatus;
  primary_color: string;
  rsvp_deadline: string | null;
  couple_logo_url: string | null;
  adress_photo_url: string | null;
  created_at: string;
  updated_at: string;
  gif_table_url: string | null;
}
