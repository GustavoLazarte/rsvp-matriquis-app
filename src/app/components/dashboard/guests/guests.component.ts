import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Guest {
  name: string;
  email: string;
  group: string;
  attending: 'yes' | 'no' | null;
  plusOne: boolean;
  plusOneName: string;
  food: string;
}

@Component({
  standalone: false,
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss'],
})
export class GuestsComponent {
  @Input() guests: Guest[] = [];
  @Input() searchQuery = '';
  @Input() statusFilter: 'all' | 'yes' | 'no' | 'pending' = 'all';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<'all' | 'yes' | 'no' | 'pending'>();
  @Output() openSheet = new EventEmitter<void>();

  get stats() {
    const total = this.guests.length;
    const confirmed = this.guests.filter(g => g.attending === 'yes').length;
    const declined = this.guests.filter(g => g.attending === 'no').length;
    const pending = total - confirmed - declined;
    return { total, confirmed, declined, pending };
  }

  get filteredGuests(): Guest[] {
    let list = this.guests;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter === 'yes') list = list.filter(g => g.attending === 'yes');
    else if (this.statusFilter === 'no') list = list.filter(g => g.attending === 'no');
    else if (this.statusFilter === 'pending') list = list.filter(g => g.attending === null);
    return list;
  }

  setStatusFilter(filter: 'all' | 'yes' | 'no' | 'pending') {
    this.statusFilter = filter;
    this.statusFilterChange.emit(filter);
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.searchQueryChange.emit(value);
  }
}
