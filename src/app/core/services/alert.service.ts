import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  readonly alerts$ = this.alertsSubject.asObservable();

  showAlert(alert: Alert): void {
    this.alertsSubject.next([...this.alertsSubject.value, alert]);
    if (alert.timeout && alert.timeout > 0) {
      setTimeout(() => this.removeAlert(alert), alert.timeout);
    }
  }

  removeAlert(alert: Alert): void {
    this.alertsSubject.next(this.alertsSubject.value.filter(a => a !== alert));
  }

  clearAlerts(): void {
    this.alertsSubject.next([]);
  }

  success(message: string, timeout = 3000): void {
    this.showAlert({ type: 'success', message, timeout });
  }

  error(message: string, timeout = 5000): void {
    this.showAlert({ type: 'error', message, timeout });
  }

  info(message: string, timeout = 3000): void {
    this.showAlert({ type: 'info', message, timeout });
  }

  warning(message: string, timeout = 4000): void {
    this.showAlert({ type: 'warning', message, timeout });
  }
}
