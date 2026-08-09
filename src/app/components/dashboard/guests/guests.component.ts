import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import type { Invitation, RsvpResponse, Event } from '../../../core/models';
import { InvitationService } from '../../../services/invitation.service';
import { ExportService } from '../../../services/export.service';

@Component({
  standalone: false,
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss'],
})
export class GuestsComponent {
  private invitationService = inject(InvitationService);
  private exportService = inject(ExportService);

  @Input() invitations: Invitation[] = [];
  @Input() responses: RsvpResponse[] = [];
  @Input() searchQuery = '';
  @Input() statusFilter: 'all' | 'yes' | 'no' | 'pending' | 'revoked' = 'all';
  @Input() eventId = '';
  @Input() eventSettings: any = {};

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<'all' | 'yes' | 'no' | 'pending' | 'revoked'>();

  readonly showModal = signal(false);
  readonly expandedId = signal<string | null>(null);
  readonly creating = signal(false);
  readonly createdLink = signal('');
  readonly formName = signal('');
  readonly formEmail = signal('');
  readonly formPhone = signal('');
  readonly formGroup = signal('');
  readonly formPlusOne = signal(false);

  readonly editModal = signal(false);
  readonly savingEdit = signal(false);
  readonly editId = signal('');
  readonly editName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');
  readonly editGroup = signal('');
  readonly editPlusOne = signal(false);

  get stats() {
    const active = this.invitations.filter(i => i.status !== 'revoked');
    const total = active.length;
    const confirmed = this.responses.filter(r => r.attending === 'yes' && active.some(i => i.id === r.invitation_id)).length;
    const declined = this.responses.filter(r => r.attending === 'no' && active.some(i => i.id === r.invitation_id)).length;
    const revoked = this.invitations.filter(i => i.status === 'revoked').length;
    const pending = total - confirmed - declined;
    return { total, confirmed, declined, pending, revoked };
  }

  get filteredGuests(): Array<{
    invitation: Invitation;
    response: RsvpResponse | undefined;
  }> {
    let list = this.invitations.map(inv => ({
      invitation: inv,
      response: this.responses.find(r => r.invitation_id === inv.id),
    }));

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(({ invitation }) =>
        invitation.guest_name.toLowerCase().includes(q) ||
        (invitation.guest_email?.toLowerCase().includes(q) ?? false) ||
        (invitation.guest_phone?.toLowerCase().includes(q) ?? false)
      );
    }

    if (this.statusFilter === 'yes') list = list.filter(({ response }) => response?.attending === 'yes');
    else if (this.statusFilter === 'no') list = list.filter(({ response }) => response?.attending === 'no');
    else if (this.statusFilter === 'pending') list = list.filter(({ response, invitation }) => !response && invitation.status !== 'revoked');
    else if (this.statusFilter === 'revoked') list = list.filter(({ invitation }) => invitation.status === 'revoked');

    return list;
  }

  setStatusFilter(filter: 'all' | 'yes' | 'no' | 'pending' | 'revoked') {
    this.statusFilter = filter;
    this.statusFilterChange.emit(filter);
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.searchQueryChange.emit(value);
  }

  openModal() {
    this.showModal.set(true);
    this.formName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formGroup.set('');
    this.formPlusOne.set(false);
    this.createdLink.set('');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal.set(false);
    document.body.style.overflow = '';
  }

  async submitInvitation() {
    const name = this.formName().trim();
    if (!name || !this.eventId) return;

    this.creating.set(true);
    try {
      const created = await this.invitationService.create({
        event_id: this.eventId,
        guest_name: name,
        guest_email: this.formEmail().trim() || null,
        guest_phone: this.formPhone().trim() || null,
        group: this.formGroup().trim() || null,
        plus_one_allowed: this.formPlusOne() ? 1 : 0,
        token: this.generateToken(),
        status: 'pending',
      });
      if (created) {
        this.createdLink.set(`${this.getBaseUrl()}/rsvp/${created.token}`);
      }
    } catch {
      alert('Error al crear la invitación');
    } finally {
      this.creating.set(false);
    }
  }

  openEdit(inv: Invitation) {
    this.editId.set(inv.id);
    this.editName.set(inv.guest_name);
    this.editEmail.set(inv.guest_email ?? '');
    this.editPhone.set(inv.guest_phone ?? '');
    this.editGroup.set(inv.group ?? '');
    this.editPlusOne.set(inv.plus_one_allowed === 1);
    this.editModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeEdit() {
    this.editModal.set(false);
    document.body.style.overflow = '';
  }

  async saveEdit() {
    const name = this.editName().trim();
    if (!name || !this.editId()) return;

    this.savingEdit.set(true);
    try {
      await this.invitationService.update(this.editId(), {
        guest_name: name,
        guest_email: this.editEmail().trim() || null,
        guest_phone: this.editPhone().trim() || null,
        group: this.editGroup().trim() || null,
        plus_one_allowed: this.editPlusOne() ? 1 : 0,
      });
      this.closeEdit();
    } catch {
      alert('Error al guardar la invitación');
    } finally {
      this.savingEdit.set(false);
    }
  }

  copyLink() {
    navigator.clipboard.writeText(this.createdLink());
  }

  private getBaseUrl(): string {
    const host = window.location.host.replace(/^www\./i, '');
    return `${window.location.protocol}//${host}`;
  }

  getInvitationLink(inv: Invitation): string {
    return `${this.getBaseUrl()}/rsvp/${inv.token}`;
  }

  copyInvitationLink(inv: Invitation) {
    navigator.clipboard.writeText(this.getInvitationLink(inv));
  }

  async revokeInvitation(inv: Invitation) {
    if (!confirm(`¿Revocar invitación de "${inv.guest_name}"? Esta acción puede deshacerse después.`)) return;
    await this.invitationService.revoke(inv.id);
  }

  async restoreInvitation(inv: Invitation) {
    await this.invitationService.restore(inv.id);
  }

  async deleteInvitation(inv: Invitation) {
    if (!confirm(`¿Eliminar permanentemente la invitación de "${inv.guest_name}"? Esta acción no se puede deshacer.`)) return;
    await this.invitationService.remove(inv.id);
  }

  getResponseStatus(response: RsvpResponse | undefined): 'yes' | 'no' | null {
    if (!response) return null;
    return response.attending === 'yes' ? 'yes' : 'no';
  }

  exportCsv() {
    this.exportService.exportInvitations(this.invitations, this.responses, this.eventSettings);
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let token = '';
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 8; i++) {
      token += chars[arr[i] % chars.length];
    }
    return token;
  }
}
