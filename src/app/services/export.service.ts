import { Injectable } from '@angular/core';
import type { Invitation, RsvpResponse, Event } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ExportService {

  private statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    opened: 'Abierta',
    responded: 'Respondida',
    expired: 'Expirada',
    revoked: 'Revocada',
  };

  private attendanceLabels: Record<string, string> = {
    yes: 'Asistirá',
    no: 'No asistirá',
    maybe: 'Tal vez',
  };

  private SEP = ';';
  private NL = '\r\n';

  exportInvitations(
    invitations: Invitation[],
    responses: RsvpResponse[],
    event: Event
  ) {
    if (invitations.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const responseMap = new Map(responses.map(r => [r.invitation_id, r]));
    const lines: string[] = [];

    const headers = [
      'Nombre del invitado',
      'Email',
      'Teléfono',
      'Grupo',
      '+1 Permitido',
      'Estado de invitación',
      'Estado RSVP',
      'Cantidad de invitados',
      'Notas alimentarias',
      'Mensaje',
      'Enviado el',
      'Expira el',
      'Veces abierto',
      'Última apertura',
      'Respondió el',
      'Creado el',
      'Enlace',
    ];
    lines.push(headers.join(this.SEP));

    for (const inv of invitations) {
      const r = responseMap.get(inv.id);
      const row = [
        inv.guest_name,
        inv.guest_email || '',
        inv.guest_phone || '',
        inv.group || '',
        inv.plus_one_allowed ? 'Sí' : 'No',
        this.statusLabels[inv.status] || inv.status,
        r ? this.attendanceLabels[r.attending] || r.attending : 'Sin respuesta',
        r ? String(r.guest_count) : '',
        r?.dietary_notes || '',
        r?.message || '',
        inv.sent_at ? this.formatDate(inv.sent_at) : '',
        inv.expires_at ? this.formatDate(inv.expires_at) : '',
        String(inv.opened_count),
        inv.last_opened_at ? this.formatDate(inv.last_opened_at) : '',
        r ? this.formatDate(r.responded_at) : '',
        this.formatDate(inv.created_at),
        `${window.location.origin}/invi/${inv.token}`,
      ];
      lines.push(row.map(v => this.escapeField(v)).join(this.SEP));
    }

    lines.push('');
    lines.push(this.buildSummary(invitations, responses));

    const csvContent = lines.join(this.NL);
    const filename = `invitaciones_${event.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    this.download(csvContent, filename);
  }

  private buildSummary(invitations: Invitation[], responses: RsvpResponse[]): string {
    const active = invitations.filter(i => i.status !== 'revoked');
    const responded = responses.filter(r => active.some(i => i.id === r.invitation_id));
    const confirmed = responded.filter(r => r.attending === 'yes');
    const declined = responded.filter(r => r.attending === 'no');
    const pending = active.length - confirmed.length - declined.length;
    const revoked = invitations.filter(i => i.status === 'revoked').length;
    const totalGuests = confirmed.reduce((acc, r) => acc + r.guest_count, 0);
    const total = active.length;
    const pct = total ? Math.round(((confirmed.length + declined.length) / total) * 100) : 0;

    const summaryHeaders = ['Concepto', 'Cantidad'];
    const summaryRows = [
      summaryHeaders.join(this.SEP),
      this.escapeField('Total invitados activos') + this.SEP + total,
      this.escapeField('Confirmados') + this.SEP + confirmed.length,
      this.escapeField('Rechazados') + this.SEP + declined.length,
      this.escapeField('Pendientes') + this.SEP + pending,
      this.escapeField('Revocados') + this.SEP + revoked,
      this.escapeField('Total personas asistentes') + this.SEP + totalGuests,
      this.escapeField('Tasa de respuesta') + this.SEP + pct + '%',
    ];

    return summaryRows.join(this.NL);
  }

  private escapeField(value: string): string {
    if (value.includes(this.SEP) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }

  private download(csvContent: string, filename: string) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
