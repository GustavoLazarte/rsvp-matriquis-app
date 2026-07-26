import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
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
    const active = invitations.filter(i => i.status !== 'revoked');
    const responded = responses.filter(r => active.some(i => i.id === r.invitation_id));
    const confirmed = responded.filter(r => r.attending === 'yes');
    const declined = responded.filter(r => r.attending === 'no');
    const maybe = responded.filter(r => r.attending === 'maybe');
    const pending = active.length - confirmed.length - declined.length - maybe.length;
    const revoked = invitations.filter(i => i.status === 'revoked').length;
    const totalGuests = confirmed.reduce((acc, r) => acc + r.guest_count, 0);
    const responseRate = active.length ? Math.round(((confirmed.length + declined.length + maybe.length) / active.length) * 100) : 0;

    const wb = XLSX.utils.book_new();

    // Summary sheet (polished)
    const summaryData = [
      [],
      ['REPORTE DE INVITACIONES'],
      [event.title || ''],
      [],
      [`Fecha del evento: ${this.fmt(event.event_date)}`],
      [`Lugar: ${event.location || '—'}`],
      [`Generado: ${this.fmt(new Date().toISOString())}`],
      [],
      ['RESUMEN'],
      ['Invitados activos', active.length],
      ['Confirmados', confirmed.length],
      ['Rechazados', declined.length],
      ['Tal vez', maybe.length],
      ['Pendientes', pending],
      ['Revocados', revoked],
      ['Total personas asistentes', totalGuests],
      ['Tasa de respuesta', responseRate + '%'],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    // Merge title row across columns A..F for nice look
    wsSummary['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
    // Basic styling (best-effort with community xlsx)
    const titleCell = wsSummary[XLSX.utils.encode_cell({ r: 1, c: 0 })];
    if (titleCell) (titleCell as any).s = { font: { name: 'Georgia', sz: 16, bold: true }, alignment: { horizontal: 'center' } };

    // Details sheet with attendees
    const headers = ['#', 'Nombre', 'Email', 'Teléfono', 'Grupo', '+1', 'Estado', 'RSVP', 'Invitados', 'Notas / Mensaje', 'Respondió', 'Enlace'];
    const dataRows = invitations.map((inv, idx) => {
      const resp = responseMap.get(inv.id);
      let rsvpText = 'Sin respuesta';
      if (resp) {
        if (resp.attending === 'yes') rsvpText = 'Asistirá';
        else if (resp.attending === 'no') rsvpText = 'No asistirá';
        else if (resp.attending === 'maybe') rsvpText = 'Tal vez';
      }
      const notes = [resp?.dietary_notes, resp?.message].filter(Boolean).join(' — ');
      return [
        idx + 1,
        inv.guest_name,
        inv.guest_email || '—',
        inv.guest_phone || '—',
        inv.group || '—',
        inv.plus_one_allowed ? 'Sí' : '—',
        this.statusLabels[inv.status] || inv.status,
        rsvpText,
        resp ? resp.guest_count : '—',
        notes || '—',
        resp ? this.fmt(resp.responded_at) : '—',
        `${window.location.origin}/rsvp/${inv.token}`,
      ];
    });

    const wsData = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Auto-width columns: compute max length per column
    const colsCount = headers.length;
    const colWidths: { wch: number }[] = new Array(colsCount).fill({ wch: 10 }).map(() => ({ wch: 10 }));
    const allData = [headers, ...dataRows];
    for (let c = 0; c < colsCount; c++) {
      let max = 10;
      for (let r = 0; r < allData.length; r++) {
        const v = allData[r][c];
        const len = v === null || v === undefined ? 0 : String(v).length;
        if (len > max) max = len;
      }
      // cap width to reasonable value
      colWidths[c] = { wch: Math.min(Math.max(max + 2, 10), 50) };
    }
    wsData['!cols'] = colWidths;

    // Header style
    const headerRow = 0;
    for (let c = 0; c < colsCount; c++) {
      const cell = wsData[XLSX.utils.encode_cell({ r: headerRow, c })];
      if (cell) {
        (cell as any).s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '3A6B4A' } }, alignment: { horizontal: 'center' } };
      }
    }

    // Alternate row shading and wrap for notes column (column index 9)
    const notesColIndex = 9;
    for (let r = 1; r <= dataRows.length; r++) {
      const shade = r % 2 === 1 ? 'F7FBF7' : 'FFFFFF';
      for (let c = 0; c < colsCount; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        const cell = wsData[cellRef];
        if (!cell) continue;
        const baseStyle: any = { alignment: { vertical: 'center', horizontal: c === 1 ? 'left' : 'center' } };
        baseStyle.fill = { fgColor: { rgb: shade } };
        // wrap text for notes
        if (c === notesColIndex) baseStyle.alignment.wrapText = true;
        // style link column (last column)
        if (c === colsCount - 1) baseStyle.font = { color: { rgb: '0563BF' }, underline: true };
        (cell as any).s = { ...(cell as any).s, ...baseStyle };
      }
    }

    // Append sheets
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
    XLSX.utils.book_append_sheet(wb, wsData, 'Invitados');

    const filename = `Reporte_${(event.title || 'evento').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    // Ensure styles are written when possible
    try {
      XLSX.writeFile(wb, filename, { bookType: 'xlsx', bookSST: false, cellStyles: true });
    } catch (e) {
      // fallback
      XLSX.writeFile(wb, filename);
    }
  }

  exportInvitationsCsv(
    invitations: Invitation[],
    responses: RsvpResponse[],
    event: Event
  ) {
    if (invitations.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const responseMap = new Map(responses.map(r => [r.invitation_id, r]));

    const headers = ['#', 'Nombre', 'Email', 'Teléfono', 'Grupo', '+1', 'Estado', 'RSVP', 'Invitados', 'Notas / Mensaje', 'Respondió', 'Enlace'];

    const rows = invitations.map((inv, idx) => {
      const resp = responseMap.get(inv.id);
      let rsvpText = 'Sin respuesta';
      if (resp) {
        if (resp.attending === 'yes') rsvpText = 'Asistirá';
        else if (resp.attending === 'no') rsvpText = 'No asistirá';
        else if (resp.attending === 'maybe') rsvpText = 'Tal vez';
      }
      const notes = [resp?.dietary_notes, resp?.message].filter(Boolean).join(' — ');
      return [
        String(idx + 1),
        inv.guest_name || '',
        inv.guest_email || '',
        inv.guest_phone || '',
        inv.group || '',
        inv.plus_one_allowed ? 'Sí' : '',
        this.statusLabels[inv.status] || inv.status,
        rsvpText,
        resp ? String(resp.guest_count) : '',
        notes || '',
        resp ? this.fmt(resp.responded_at) : '',
        `${window.location.origin}/rsvp/${inv.token}`,
      ];
    });

    const escape = (v: string) => {
      if (v == null) return '';
      const s = String(v);
      if (s.includes(';') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const lines = [headers.join(';')].concat(rows.map(r => r.map(escape).join(';')));
    const csv = '\uFEFF' + lines.join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invitaciones_${(event.title || 'evento').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private fmt(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
