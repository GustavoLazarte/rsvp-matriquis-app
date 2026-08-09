import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { RsvpResponseStateService } from '../core/services/rsvp-response-state.service';
import type { RsvpResponse } from '../core/models';

export interface RespondInvitationInput {
  attending: 'yes' | 'no' | 'maybe';
  guest_count: number;
  dietary_notes: string | null;
  message: string | null;
}

@Injectable({ providedIn: 'root' })
export class RsvpResponseService {
  readonly state = this.responseState;

  constructor(
    private supabase: SupabaseService,
    private responseState: RsvpResponseStateService,
  ) {}

  async loadByToken(token: string): Promise<RsvpResponse | null> {
    const { data, error } = await this.supabase.supabase.rpc('get_invitation', { p_token: token });
    if (error) throw error;
    return (data as { response: RsvpResponse | null } | null)?.response ?? null;
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

  async removeByInvitationId(invitationId: string): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('rsvp_responses')
      .delete()
      .eq('invitation_id', invitationId);
    if (error) throw error;
    this.responseState.removeByInvitationId(invitationId);
  }

  async submit(token: string, input: RespondInvitationInput): Promise<RsvpResponse | null> {
    const { data, error } = await this.supabase.supabase.rpc('respond_invitation', {
      p_token: token,
      p_attending: input.attending,
      p_guest_count: input.guest_count,
      p_dietary_notes: input.dietary_notes,
      p_message: input.message,
    });
    if (error) throw error;
    if (data) this.responseState.addResponse(data as RsvpResponse);
    return data as RsvpResponse | null;
  }
}
