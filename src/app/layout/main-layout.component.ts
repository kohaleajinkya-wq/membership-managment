import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  navCollapsed = false;

  constructor(readonly auth: AuthService, private readonly store: GymStoreService) {}

  ngOnInit(): void {
    this.store.refreshAll();
  }

  toggleNav(): void {
    this.navCollapsed = !this.navCollapsed;
  }
}

