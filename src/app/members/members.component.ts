import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Member, Plan } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent {
  search = '';

  formOpen = false;
  formMember: Member | null = null;
  formPlans: Plan[] = [];

  vm$ = combineLatest([this.store.members(), this.store.plans()]).pipe(
    map(([members, plans]) => ({ members, plans }))
  );

  constructor(private readonly store: GymStoreService) {}

  filtered(members: Member[]): Member[] {
    const q = this.search.trim().toLowerCase();
    if (!q) {
      return members;
    }
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.membershipType.toLowerCase().includes(q)
    );
  }

  add(plans: Plan[]): void {
    this.formPlans = plans;
    this.formMember = null;
    this.formOpen = true;
  }

  edit(m: Member, plans: Plan[]): void {
    this.formPlans = plans;
    this.formMember = m;
    this.formOpen = true;
  }

  closeMemberForm(): void {
    this.formOpen = false;
    this.formMember = null;
    this.formPlans = [];
  }

  onMemberSaved(payload: Partial<Member>): void {
    if (this.formMember) {
      this.store.updateMember(this.formMember.id, payload);
    } else {
      this.store.addMember(payload as Omit<Member, 'id'>);
    }
    this.closeMemberForm();
  }

  remove(m: Member): void {
    if (confirm(`Delete ${m.name}?`)) {
      this.store.deleteMember(m.id);
    }
  }
}
