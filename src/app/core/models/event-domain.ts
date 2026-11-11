export interface EventDomain {
  id: string;
  event_id: string;
  domain: string;
  verified: boolean;
  verification_token: string | null;
  dns_config: any | null;
  created_at: string;
  verified_at: string | null;
}
