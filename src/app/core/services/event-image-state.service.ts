import { Injectable, signal } from '@angular/core';
import type { EventImage } from '../models';

@Injectable({ providedIn: 'root' })
export class EventImageStateService {
  private readonly _images = signal<EventImage[]>([]);

  readonly images = this._images.asReadonly();

  setImages(images: EventImage[]): void {
    this._images.set(images);
  }

  addImage(image: EventImage): void {
    this._images.update(list => [...list, image]);
  }

  addImages(images: EventImage[]): void {
    this._images.update(list => [...list, ...images]);
  }

  removeImage(id: string): void {
    this._images.update(list => list.filter(img => img.id !== id));
  }

  reset(): void {
    this._images.set([]);
  }
}
