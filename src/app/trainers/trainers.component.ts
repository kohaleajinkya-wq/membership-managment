import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trainer } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.scss'],
})
export class TrainersComponent {
  vm$ = combineLatest([this.store.trainers(), this.store.members()]).pipe(
    map(([trainers, members]) => ({ trainers, members }))
  );

  draft: Partial<Trainer> | null = null;
  assigning: Trainer | null = null;
  assignSelection: Record<string, boolean> = {};

  constructor(private readonly store: GymStoreService) {}

  startNew(): void {
    this.draft = {
      name: '',
      phone: '',
      specialty: '',
      salaryMonthly: 25000,
      scheduleNotes: '',
      memberIds: [],
    };
  }

  startEdit(t: Trainer): void {
    this.draft = { ...t, memberIds: [...t.memberIds] };
  }

  cancel(): void {
    this.draft = null;
  }

  save(): void {
    if (!this.draft || !this.draft.name || !this.draft.phone) {
      return;
    }
    const payload = {
      name: this.draft.name,
      phone: this.draft.phone,
      specialty: this.draft.specialty || '',
      salaryMonthly: Number(this.draft.salaryMonthly || 0),
      scheduleNotes: this.draft.scheduleNotes || '',
      memberIds: this.draft.memberIds || [],
    };
    if (this.draft.id) {
      this.store.upsertTrainer({ ...(this.draft as Trainer), ...payload });
    } else {
      this.store.addTrainer(payload);
    }
    this.draft = null;
  }

  remove(t: Trainer): void {
    if (confirm(`Remove trainer ${t.name}?`)) {
      this.store.deleteTrainer(t.id);
    }
  }

  openAssign(t: Trainer): void {
    this.assigning = t;
    this.assignSelection = {};
    for (const id of t.memberIds) {
      this.assignSelection[id] = true;
    }
  }

  cancelAssign(): void {
    this.assigning = null;
    this.assignSelection = {};
  }

  toggle(mid: string): void {
    this.assignSelection = { ...this.assignSelection, [mid]: !this.assignSelection[mid] };
  }

  saveAssign(): void {
    if (!this.assigning) {
      return;
    }
    const ids = Object.keys(this.assignSelection).filter((k) => this.assignSelection[k]);
    this.store.assignTrainerMembers(this.assigning.id, ids);
    this.cancelAssign();
  }

  memberName(id: string, members: import('../models/gym.models').Member[]): string {
    return members.find((m) => m.id === id)?.name || id;
  }
}
