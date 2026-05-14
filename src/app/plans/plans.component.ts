import { Component } from '@angular/core';
import { Plan } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent {
  plans$ = this.store.plans();
  draft: Partial<Plan> | null = null;

  constructor(private readonly store: GymStoreService) {}

  startNew(): void {
    this.draft = {
      name: '',
      price: 1500,
      durationMonths: 1,
      ptIncluded: false,
      freezeAllowed: false,
    };
  }

  startEdit(p: Plan): void {
    this.draft = { ...p };
  }

  cancel(): void {
    this.draft = null;
  }

  save(): void {
    if (!this.draft || !this.draft.name || this.draft.price == null || !this.draft.durationMonths) {
      return;
    }
    if (this.draft.id) {
      this.store.upsertPlan(this.draft as Plan);
    } else {
      this.store.addPlan({
        name: this.draft.name,
        price: Number(this.draft.price),
        durationMonths: Number(this.draft.durationMonths),
        ptIncluded: !!this.draft.ptIncluded,
        freezeAllowed: !!this.draft.freezeAllowed,
      });
    }
    this.draft = null;
  }

  remove(p: Plan): void {
    if (confirm(`Delete plan “${p.name}”?`)) {
      this.store.deletePlan(p.id);
    }
  }
}
