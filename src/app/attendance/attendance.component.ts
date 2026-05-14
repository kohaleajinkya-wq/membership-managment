import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CheckInMethod, Member } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {
  tab: CheckInMethod | 'History' | 'Peak' = 'Manual';
  phoneQuery = '';
  rfidQuery = '';
  selectedMemberId = '';
  qrPayload: string | null = null;

  vm$ = combineLatest([this.store.members(), this.store.attendance()]).pipe(
    map(([members, attendance]) => {
      const today = new Date().toISOString().slice(0, 10);
      const todayRows = attendance.filter((a) => a.checkIn.startsWith(today));
      const byHour = new Map<number, number>();
      for (const a of attendance) {
        const h = new Date(a.checkIn).getHours();
        byHour.set(h, (byHour.get(h) || 0) + 1);
      }
      const peak = Array.from(byHour.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => ({ hour, count }));
      return { members, attendance, todayRows, peak };
    })
  );

  constructor(private readonly store: GymStoreService) {}

  checkIn(method: CheckInMethod, members: Member[]): void {
    let memberId = this.selectedMemberId;
    if (method === 'Phone') {
      const q = this.phoneQuery.trim();
      const m = members.find((x) => x.phone.includes(q));
      memberId = m ? m.id : '';
    }
    if (method === 'RFID') {
      const q = this.rfidQuery.trim();
      const m = members.find((x) => (x.rfidTag || '').toLowerCase() === q.toLowerCase());
      memberId = m ? m.id : '';
    }
    if (!memberId) {
      return;
    }
    this.store.checkIn(memberId, method);
    this.phoneQuery = '';
    this.rfidQuery = '';
    this.selectedMemberId = '';
    this.qrPayload = null;
  }

  buildQr(members: Member[]): void {
    if (!this.selectedMemberId) {
      this.qrPayload = null;
      return;
    }
    const m = members.find((x) => x.id === this.selectedMemberId);
    this.qrPayload = m ? JSON.stringify({ type: 'gym-checkin', memberId: m.id, name: m.name }) : null;
  }

  memberName(id: string, members: Member[]): string {
    return members.find((m) => m.id === id)?.name || id;
  }
}
