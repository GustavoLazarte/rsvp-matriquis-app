export interface TemplateConfig {
  sections: string[];
  fonts: { heading: string; body: string };
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preview_image_url: string | null;
  config: TemplateConfig;
  is_active: boolean;
  created_at: string;
}
