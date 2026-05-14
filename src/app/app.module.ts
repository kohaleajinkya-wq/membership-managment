import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './core/auth.interceptor';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './auth/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { MemberFormComponent } from './members/member-form.component';
import { PlansComponent } from './plans/plans.component';
import { PaymentsComponent } from './payments/payments.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { TrainersComponent } from './trainers/trainers.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    LoginComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    MembersComponent,
    MemberFormComponent,
    PlansComponent,
    PaymentsComponent,
    AttendanceComponent,
    TrainersComponent,
    WorkoutsComponent,
    ReportsComponent,
    SettingsComponent,
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
