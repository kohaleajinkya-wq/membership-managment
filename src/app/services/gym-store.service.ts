import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  AttendanceRecord,
  CheckInMethod,
  DashboardStats,
  Member,
  Payment,
  Plan,
  Trainer,
  WorkoutPlan,
} from '../models/gym.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GymStoreService {
  private readonly api = environment.apiUrl;

  private readonly plans$ = new BehaviorSubject<Plan[]>([]);
  private readonly members$ = new BehaviorSubject<Member[]>([]);
  private readonly payments$ = new BehaviorSubject<Payment[]>([]);
  private readonly attendance$ = new BehaviorSubject<AttendanceRecord[]>([]);
  private readonly trainers$ = new BehaviorSubject<Trainer[]>([]);
  private readonly workouts$ = new BehaviorSubject<WorkoutPlan[]>([]);

  constructor(private readonly http: HttpClient) {}

  /** Call after login (e.g. from main layout) so lists load with JWT. */
  refreshAll(): void {
    forkJoin({
      plans: this.http.get<Plan[]>(`${this.api}/plans`),
      members: this.http.get<Member[]>(`${this.api}/members`),
      payments: this.http.get<Payment[]>(`${this.api}/payments`),
      attendance: this.http.get<AttendanceRecord[]>(`${this.api}/attendance`),
      trainers: this.http.get<Trainer[]>(`${this.api}/trainers`),
      workouts: this.http.get<WorkoutPlan[]>(`${this.api}/workouts`),
    }).subscribe(
      ({ plans, members, payments, attendance, trainers, workouts }) => {
        this.plans$.next(plans);
        this.members$.next(members);
        this.payments$.next(payments);
        this.attendance$.next(attendance);
        this.trainers$.next(trainers);
        this.workouts$.next(workouts);
      },
      () => {
        /* keep empty state if API unreachable */
      }
    );
  }

  plans(): Observable<Plan[]> {
    return this.plans$.asObservable();
  }

  members(): Observable<Member[]> {
    return this.members$.asObservable();
  }

  payments(): Observable<Payment[]> {
    return this.payments$.asObservable();
  }

  attendance(): Observable<AttendanceRecord[]> {
    return this.attendance$.asObservable();
  }

  trainers(): Observable<Trainer[]> {
    return this.trainers$.asObservable();
  }

  workouts(): Observable<WorkoutPlan[]> {
    return this.workouts$.asObservable();
  }

  snapshotMembers(): Member[] {
    return this.members$.getValue();
  }

  snapshotPlans(): Plan[] {
    return this.plans$.getValue();
  }

  getPlan(id: string): Plan | undefined {
    return this.plans$.getValue().find((p) => p.id === id);
  }

  getMember(id: string): Member | undefined {
    return this.members$.getValue().find((m) => m.id === id);
  }

  dashboardStats(): Observable<DashboardStats> {
    return combineLatest([this.members$, this.payments$, this.attendance$]).pipe(
      map(([members, payments, attendance]) => {
        const today = this.todayYmd();
        const month = today.slice(0, 7);
        const soon = this.addDaysYmd(today, 14);
        const active = members.filter((m) => m.expiryDate >= today).length;
        const expiringSoon = members.filter((m) => m.expiryDate >= today && m.expiryDate <= soon).length;
        const todayAttendance = attendance.filter((a) => a.checkIn.startsWith(today)).length;
        const monthlyRevenue = payments
          .filter((p) => p.date.startsWith(month))
          .reduce((s, p) => s + p.amount, 0);
        const pendingEstimate = members.filter((m) => m.expiryDate < this.addDaysYmd(today, 30)).length * 500;
        return {
          totalMembers: members.length,
          activeMemberships: active,
          expiringSoon,
          todayAttendance,
          monthlyRevenue,
          pendingPayments: pendingEstimate,
        };
      })
    );
  }

  addMember(m: Omit<Member, 'id'>): void {
    this.http
      .post<Member>(`${this.api}/members`, m)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  updateMember(id: string, patch: Partial<Member>): void {
    this.http
      .put<Member>(`${this.api}/members/${encodeURIComponent(id)}`, patch)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  deleteMember(id: string): void {
    this.http
      .delete(`${this.api}/members/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  upsertPlan(plan: Plan): void {
    this.http
      .put<Plan>(`${this.api}/plans/${encodeURIComponent(plan.id)}`, plan)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  deletePlan(id: string): void {
    this.http
      .delete(`${this.api}/plans/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  addPlan(plan: Omit<Plan, 'id'>): void {
    this.http
      .post<Plan>(`${this.api}/plans`, plan)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  recordPayment(input: Omit<Payment, 'id' | 'invoiceNo'> & { invoiceNo?: string }): void {
    this.http
      .post<Payment>(`${this.api}/payments`, input)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  checkIn(memberId: string, method: CheckInMethod): void {
    this.http
      .post<AttendanceRecord>(`${this.api}/attendance`, { memberId, method })
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  upsertTrainer(t: Trainer): void {
    this.http
      .put<Trainer>(`${this.api}/trainers/${encodeURIComponent(t.id)}`, t)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  addTrainer(t: Omit<Trainer, 'id'>): void {
    this.http
      .post<Trainer>(`${this.api}/trainers`, t)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  deleteTrainer(id: string): void {
    this.http
      .delete(`${this.api}/trainers/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  assignTrainerMembers(trainerId: string, memberIds: string[]): void {
    this.http
      .put<Trainer[]>(`${this.api}/trainers/${encodeURIComponent(trainerId)}/members`, { memberIds })
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  upsertWorkout(w: WorkoutPlan): void {
    this.http
      .put<WorkoutPlan>(`${this.api}/workouts/${encodeURIComponent(w.id)}`, w)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  addWorkout(w: Omit<WorkoutPlan, 'id'>): void {
    this.http
      .post<WorkoutPlan>(`${this.api}/workouts`, w)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  deleteWorkout(id: string): void {
    this.http
      .delete(`${this.api}/workouts/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.refreshAll()))
      .subscribe();
  }

  revenueByMonth(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const p of this.payments$.getValue()) {
      const key = p.date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + p.amount);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }

  joinsByMonth(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const m of this.members$.getValue()) {
      const key = m.joinDate.slice(0, 7);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }

  attendanceTrend(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const a of this.attendance$.getValue()) {
      const key = a.checkIn.slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([label, value]) => ({ label, value }));
  }

  expiredMembers(): Member[] {
    const today = this.todayYmd();
    return this.members$.getValue().filter((m) => m.expiryDate < today);
  }

  trainerPerformance(): { name: string; clients: number; checkIns: number }[] {
    const att = this.attendance$.getValue();
    const members = this.members$.getValue();
    return this.trainers$.getValue().map((t) => {
      const clients = t.memberIds.length;
      const setIds = new Set(t.memberIds);
      const checkIns = att.filter((a) => {
        const m = members.find((x) => x.id === a.memberId);
        return m && setIds.has(m.id);
      }).length;
      return { name: t.name, clients, checkIns };
    });
  }

  private todayYmd(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  private addDaysYmd(ymd: string, days: number): string {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
  }
}
