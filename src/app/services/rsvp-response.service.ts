import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { RsvpResponseStateService } from '../core/services/rsvp-response-state.service';
import type { RsvpResponse } from '../core/models';

@Injectable({ providedIn: 'root' })
export class RsvpResponseService {
  readonly state = this.responseState;

  constructor(
    private supabase: SupabaseService,
    private responseState: RsvpResponseStateService,
  ) {}

  async loadByInvitation(invitationId: string): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('rsvp_responses')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('responded_at', { ascending: false });
    if (error) throw error;
    if (data) this.responseState.setResponses(data as RsvpResponse[]);
  }

  async loadByEvent(eventId: string): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('rsvp_responses')
      .select('*, invitations!inner(event_id)')
      .eq('invitations.event_id', eventId)
      .order('responded_at', { ascending: false });
    if (error) throw error;
    if (data) this.responseState.setResponses(data as RsvpResponse[]);
  }

  async submit(input: Partial<RsvpResponse>): Promise<RsvpResponse | null> {
    const { data, error } = await this.supabase.supabase
      .from('rsvp_responses')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.responseState.addResponse(data as RsvpResponse);
    return data as RsvpResponse | null;
  }
}
