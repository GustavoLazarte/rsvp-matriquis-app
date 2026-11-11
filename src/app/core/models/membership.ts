export type MembershipRole = 'platform_admin' | 'org_admin' | 'event_admin' | 'viewer';

export interface Membership {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
  updated_at: string;
}
