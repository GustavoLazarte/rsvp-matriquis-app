export type OrganizationStatus = 'active' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
}
