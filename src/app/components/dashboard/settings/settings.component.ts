import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Input() eventSettings!: {
    date: string;
    time: string;
    venue: string;
    address: string;
    adultsOnly: boolean;
    deadline: string;
    welcomeMessage: string;
    musicLink: string;
    giftsLink: string;
    instagram: string;
  };

  @Output() save = new EventEmitter<typeof this.formData>();

  formData!: {
    date: string;
    time: string;
    venue: string;
    address: string;
    adultsOnly: boolean;
    deadline: string;
    welcomeMessage: string;
    musicLink: string;
    giftsLink: string;
    instagram: string;
  };

  ngOnInit() {
    this.formData = { ...this.eventSettings };
  }

  saveSettings() {
    this.save.emit(this.formData);
  }
}
