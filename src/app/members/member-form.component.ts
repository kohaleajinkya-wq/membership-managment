import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Member, Plan } from '../models/gym.models';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
})
export class MemberFormComponent implements OnInit {
  @Input() member: Member | null = null;
  @Input() plans: Plan[] = [];
  @Output() saved = new EventEmitter<Partial<Member>>();
  @Output() cancelled = new EventEmitter<void>();

  model: Partial<Member> = {};

  ngOnInit(): void {
    if (this.member) {
      this.model = { ...this.member };
    } else {
      const defaultPlan = this.plans[0];
      this.model = {
        name: '',
        age: 25,
        gender: 'Male',
        weightKg: 70,
        phone: '',
        joinDate: new Date().toISOString().slice(0, 10),
        membershipType: defaultPlan ? defaultPlan.name : '',
        planId: defaultPlan ? defaultPlan.id : '',
        expiryDate: new Date().toISOString().slice(0, 10),
        photoUrl: null,
        emergencyContactName: '',
        emergencyContactPhone: '',
        rfidTag: '',
      };
      if (defaultPlan) {
        this.onPlanChange(defaultPlan.id);
      }
    }
  }

  onPlanChange(planId: string): void {
    const p = this.plans.find((x) => x.id === planId);
    if (p) {
      this.model.planId = p.id;
      this.model.membershipType = p.name;
      const d = new Date();
      if (this.model.joinDate) {
        const [y, m, day] = this.model.joinDate.split('-').map(Number);
        d.setFullYear(y, m - 1, day);
      }
      d.setMonth(d.getMonth() + p.durationMonths);
      const pad = (n: number) => String(n).padStart(2, '0');
      this.model.expiryDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
  }

  onPhotoSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.model.photoUrl = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (!this.model.name || !this.model.phone || !this.model.planId) {
      return;
    }
    const payload = { ...this.model } as Partial<Member>;
    delete (payload as { id?: string }).id;
    this.saved.emit(payload);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
