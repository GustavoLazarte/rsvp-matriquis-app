import { Injectable, signal, computed } from '@angular/core';
import type { Event } from '../models';

@Injectable({ providedIn: 'root' })
export class EventStateService {
  private readonly _events = signal<Event[]>([]);
  private readonly _currentId = signal<string | null>(null);

  readonly events = this._events.asReadonly();
  readonly currentId = this._currentId.asReadonly();

  readonly currentEvent = computed(() => {
    const id = this._currentId();
    return id ? this._events().find(e => e.id === id) ?? null : null;
  });

  setEvents(events: Event[]): void {
    this._events.set(events);
  }

  addEvent(event: Event): void {
    this._events.update(list => [...list, event]);
  }

  updateEvent(id: string, partial: Partial<Event>): void {
    this._events.update(list =>
      list.map(e => (e.id === id ? { ...e, ...partial } : e))
    );
  }

  removeEvent(id: string): void {
    this._events.update(list => list.filter(e => e.id !== id));
  }

  selectEvent(id: string | null): void {
    this._currentId.set(id);
  }

  reset(): void {
    this._events.set([]);
    this._currentId.set(null);
  }
}
