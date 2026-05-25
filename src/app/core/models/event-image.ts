export type EventImageType = 'hero' | 'gallery' | 'thumbnail';

export interface EventImage {
  id: string;
  event_id: string;
  url: string;
  type: EventImageType;
  sort_order: number;
  created_at: string;
}
