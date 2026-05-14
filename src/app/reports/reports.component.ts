import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GymStoreService } from '../services/gym-store.service';

export interface ReportBar {
  label: string;
  value: number;
  pct: number;
}

@Component({
  selector: 'app-reports',
  template: `
    <h1 class="h4 mb-1">Reports &amp; analytics</h1>
    <p class="text-muted small mb-3">
      Revenue, joins, attendance trends, trainer-linked activity, expired members.
    </p>

    <div class="row">
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header py-2 font-weight-bold small">Revenue by month</div>
          <div class="card-body">
            <div class="report-bar mb-2" *ngFor="let r of revenueBars">
              <div class="d-flex justify-content-between small mb-1">
                <span>{{ r.label }}</span>
                <span>₹{{ r.value | number }}</span>
              </div>
              <div class="progress" style="height: 10px">
                <div class="progress-bar bg-primary" [style.width.%]="r.pct"></div>
              </div>
            </div>
            <p class="text-muted small mb-0" *ngIf="!revenueBars.length">No payment data yet.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header py-2 font-weight-bold small">New joins by month</div>
          <div class="card-body">
            <div class="report-bar mb-2" *ngFor="let r of joinsBars">
              <div class="d-flex justify-content-between small mb-1">
                <span>{{ r.label }}</span>
                <span>{{ r.value }}</span>
              </div>
              <div class="progress" style="height: 10px">
                <div class="progress-bar bg-info" [style.width.%]="r.pct"></div>
              </div>
            </div>
            <p class="text-muted small mb-0" *ngIf="!joinsBars.length">No members yet.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header py-2 font-weight-bold small">Attendance trend (recent days)</div>
          <div class="card-body">
            <div class="report-bar mb-2" *ngFor="let r of attendanceBars">
              <div class="d-flex justify-content-between small mb-1">
                <span>{{ r.label }}</span>
                <span>{{ r.value }} check-ins</span>
              </div>
              <div class="progress" style="height: 10px">
                <div class="progress-bar bg-purple" [style.width.%]="r.pct"></div>
              </div>
            </div>
            <p class="text-muted small mb-0" *ngIf="!attendanceBars.length">No attendance yet.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header py-2 font-weight-bold small">Trainer performance (client-linked check-ins)</div>
          <div class="card-body">
            <div class="report-bar mb-2" *ngFor="let r of trainerBars">
              <div class="d-flex justify-content-between small mb-1">
                <span>{{ r.label }}</span>
                <span>{{ r.value }}</span>
              </div>
              <div class="progress" style="height: 10px">
                <div class="progress-bar bg-warning" [style.width.%]="r.pct"></div>
              </div>
            </div>
            <p class="text-muted small mb-0" *ngIf="!trainerBars.length">No trainer data yet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header py-2 font-weight-bold small">Expired members</div>
      <div class="card-body">
        <ul class="list-unstyled small mb-0">
          <li *ngFor="let e of expired"><strong>{{ e.name }}</strong> — expired {{ e.expiry }}</li>
          <li *ngIf="!expired.length" class="text-muted">No expired memberships in demo data.</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  revenueBars: ReportBar[] = [];
  joinsBars: ReportBar[] = [];
  attendanceBars: ReportBar[] = [];
  trainerBars: ReportBar[] = [];

  expired: { name: string; expiry: string }[] = [];

  constructor(private readonly store: GymStoreService) {}

  ngOnInit(): void {
    this.sub.add(this.store.members().subscribe(() => this.refresh()));
    this.sub.add(this.store.payments().subscribe(() => this.refresh()));
    this.sub.add(this.store.attendance().subscribe(() => this.refresh()));
    this.sub.add(this.store.trainers().subscribe(() => this.refresh()));
    this.refresh();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private refresh(): void {
    this.revenueBars = this.toBars(this.store.revenueByMonth());
    this.joinsBars = this.toBars(this.store.joinsByMonth());
    this.attendanceBars = this.toBars(this.store.attendanceTrend());
    this.trainerBars = this.toBars(
      this.store.trainerPerformance().map((p) => ({ label: p.name, value: p.checkIns }))
    );
    this.expired = this.store
      .expiredMembers()
      .map((m) => ({ name: m.name, expiry: m.expiryDate }));
  }

  private toBars(rows: { label: string; value: number }[]): ReportBar[] {
    const max = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1;
    return rows.map((r) => ({ label: r.label, value: r.value, pct: Math.round((r.value / max) * 100) }));
  }
}
