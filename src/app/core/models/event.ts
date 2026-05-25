export type EventStatus = 'draft' | 'active' | 'closed' | 'cancelled';

export interface Event {
  id: string;
  admin_id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string;
  location: string | null;
  location_url: string | null;
  max_guests: number | null;
  status: EventStatus;
  primary_color: string;
  rsvp_deadline: string | null;
  created_at: string;
  updated_at: string;
}
