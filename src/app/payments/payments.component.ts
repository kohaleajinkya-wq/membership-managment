import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Member, PaymentMethod } from '../models/gym.models';
import { GymStoreService } from '../services/gym-store.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent {
  memberId = '';
  amount: number | null = null;
  method: PaymentMethod = 'UPI';
  note = '';
  invoicePreview: string | null = null;

  vm$ = combineLatest([this.store.members(), this.store.payments()]).pipe(
    map(([members, payments]) => {
      const today = new Date();
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 30);
      const ymd = (d: Date) => d.toISOString().slice(0, 10);
      const pendingMembers = members.filter((m) => m.expiryDate <= ymd(horizon) && m.expiryDate >= ymd(today));
      return { members, payments, pendingMembers };
    })
  );

  constructor(private readonly store: GymStoreService) {}

  collect(): void {
    if (!this.memberId || this.amount == null || this.amount <= 0) {
      return;
    }
    this.store.recordPayment({
      memberId: this.memberId,
      amount: Number(this.amount),
      method: this.method,
      date: new Date().toISOString().slice(0, 10),
      note: this.note || undefined,
    });
    this.amount = null;
    this.note = '';
  }

  memberName(id: string, members: Member[]): string {
    return members.find((m) => m.id === id)?.name || id;
  }

  showInvoice(p: import('../models/gym.models').Payment, members: Member[]): void {
    const m = members.find((x) => x.id === p.memberId);
    this.invoicePreview = [
      `Invoice ${p.invoiceNo}`,
      `Date: ${p.date}`,
      `Member: ${m ? m.name : p.memberId}`,
      `Amount: ₹${p.amount}`,
      `Method: ${p.method}`,
      p.note ? `Note: ${p.note}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  closeInvoice(): void {
    this.invoicePreview = null;
  }

  printInvoice(): void {
    if (!this.invoicePreview) {
      return;
    }
    const w = window.open('', 'PRINT', 'height=400,width=600');
    if (w) {
      w.document.write(`<pre>${this.invoicePreview}</pre>`);
      w.document.close();
      w.print();
      w.close();
    }
  }
}
