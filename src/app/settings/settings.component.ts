import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  gymName = 'Demo Gym';
  reminderDays = 7;
  taxPercent = 0;
}
