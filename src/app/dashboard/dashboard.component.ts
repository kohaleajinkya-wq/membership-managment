import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  stats$: Observable<DashboardStats>;

  constructor(store: GymStoreService) {
    this.stats$ = store.dashboardStats();
  }
}
