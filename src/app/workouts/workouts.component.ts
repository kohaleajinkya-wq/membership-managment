import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkoutPlan } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss'],
})
export class WorkoutsComponent {
  vm$ = combineLatest([this.store.workouts(), this.store.members()]).pipe(
    map(([workouts, members]) => ({ workouts, members }))
  );

  draft: Partial<WorkoutPlan> | null = null;

  constructor(private readonly store: GymStoreService) {}

  startNew(): void {
    this.draft = {
      memberId: '',
      title: '',
      notes: '',
      dietNotes: '',
      lastWeightKg: undefined,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  }

  startEdit(w: WorkoutPlan): void {
    this.draft = { ...w };
  }

  cancel(): void {
    this.draft = null;
  }

  save(): void {
    if (!this.draft || !this.draft.memberId || !this.draft.title) {
      return;
    }
    const payload: WorkoutPlan = {
      id: this.draft.id || '',
      memberId: String(this.draft.memberId),
      title: String(this.draft.title),
      notes: String(this.draft.notes || ''),
      dietNotes: this.draft.dietNotes,
      lastWeightKg: this.draft.lastWeightKg != null ? Number(this.draft.lastWeightKg) : undefined,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    if (this.draft.id) {
      this.store.upsertWorkout(payload);
    } else {
      this.store.addWorkout({
        memberId: payload.memberId,
        title: payload.title,
        notes: payload.notes,
        dietNotes: payload.dietNotes,
        lastWeightKg: payload.lastWeightKg,
        updatedAt: payload.updatedAt,
      });
    }
    this.draft = null;
  }

  remove(w: WorkoutPlan): void {
    if (confirm(`Remove plan “${w.title}”?`)) {
      this.store.deleteWorkout(w.id);
    }
  }

  memberName(id: string, members: import('../models/gym.models').Member[]): string {
    return members.find((m) => m.id === id)?.name || id;
  }
}
