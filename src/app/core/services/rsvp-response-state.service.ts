import { Injectable, signal, computed } from '@angular/core';
import type { RsvpResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RsvpResponseStateService {
  private readonly _responses = signal<RsvpResponse[]>([]);

  readonly responses = this._responses.asReadonly();

  readonly confirmedCount = computed(() =>
    this._responses().filter(r => r.attending === 'yes').length
  );

  readonly declinedCount = computed(() =>
    this._responses().filter(r => r.attending === 'no').length
  );

  readonly totalGuests = computed(() =>
    this._responses()
      .filter(r => r.attending === 'yes')
      .reduce((acc, r) => acc + r.guest_count, 0)
  );

  setResponses(responses: RsvpResponse[]): void {
    this._responses.set(responses);
  }

  addResponse(response: RsvpResponse): void {
    this._responses.update(list => [...list, response]);
  }

  removeResponse(id: string): void {
    this._responses.update(list => list.filter(r => r.id !== id));
  }

  reset(): void {
    this._responses.set([]);
  }
}
