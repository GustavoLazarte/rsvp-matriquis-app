import { Injectable, signal } from '@angular/core';
import type { AlbumImage } from '../models';

@Injectable({ providedIn: 'root' })
export class AlbumImageStateService {
  private readonly _images = signal<AlbumImage[]>([]);

  readonly images = this._images.asReadonly();

  setImages(images: AlbumImage[]): void {
    this._images.set(images);
  }

  addImage(image: AlbumImage): void {
    this._images.update(list => [...list, image]);
  }

  updateImage(id: string, partial: Partial<AlbumImage>): void {
    this._images.update(list =>
      list.map(img => (img.id === id ? { ...img, ...partial } : img))
    );
  }

  removeImage(id: string): void {
    this._images.update(list => list.filter(img => img.id !== id));
  }

  swapImages(i1: number, i2: number): void {
    this._images.update(list => {
      const arr = [...list];
      [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
      return arr;
    });
  }

  reset(): void {
    this._images.set([]);
  }
}
