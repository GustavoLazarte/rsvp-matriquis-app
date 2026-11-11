export interface EventTheme {
  id: string;
  event_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  fonts: { heading?: string; body?: string } | null;
  sections: Record<string, boolean> | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}
