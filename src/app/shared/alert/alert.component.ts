import { Component, OnDestroy } from '@angular/core';
import { AlertService } from '../../core/services/alert.service';
import { Alert } from '../../core/models/alert.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnDestroy {
  alerts: Alert[] = [];
  private subscription: Subscription;

  constructor(private alertService: AlertService) {
    this.subscription = this.alertService.alerts$.subscribe(alerts => this.alerts = alerts);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close(alert: Alert) {
    this.alertService.removeAlert(alert);
  }

  cssClass(type: string) {
    return type;
  }
}
