import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { RouterModule, Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  selectedTab: 'personal' | 'bank' | 'orders' = 'personal';

  editPersonal = false;
  editBank = false;

  // Temporary fields for form binding
  fullName = '';
  email = '';
  phone = 0;
  iban = '';
  bankName = '';
  orders: Order[] = [];

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.user = user;

      if (!user) {
        this.orders = [];
        return;
      }

      // Sync form fields
      this.fullName = user.getFullName();
      this.email = user.getEmail();
      this.phone = user.getPhone();
      this.iban = user.getIban();
      this.bankName = user.getBankName();

      // Fetch orders only if user is valid
      this.orderService.getOrdersByUserId(user.getUserId()).subscribe({
        next: data => {
          this.orders = data;
        },
        error: err => {
          console.error("Error retrieving user orders", err);
          this.alertService.warning("Unable to retrieve your orders.");
        }
      });

    });
  }

  savePersonalInfo(): void {
    if (!this.user) return;
    this.user.setFullName(this.fullName.trim());
    this.user.setEmail(this.email.trim());
    this.user.setPhone(this.phone);

    this.userService.updateUser(this.user).subscribe({
      next: updated => {
        this.user = updated;
        this.alertService.success("Personal information updated successfully!");
        this.editPersonal = false;
      },
      error: err => {
        console.error('Error updating personal info', err);
        this.alertService.error(" Failed to update personal information.");
      }
    });
  }

  saveBankInfo(): void {
    if (!this.user) return;
    this.user.setIban(this.iban.trim());
    this.user.setBankName(this.bankName.trim());

    this.userService.updateUser(this.user).subscribe({
      next: updated => {
        this.user = updated;
        this.alertService.success("Bank information updated successfully!");
        this.editBank = false;
      },
      error: err => {
        console.error('Error updating bank info', err);
        this.alertService.error("Failed to update bank information.");
      }
    });
  }

  goToUserManagement() {
    this.router.navigate(['/user-management']);
  }

  goToStockMonitoring() {
    this.router.navigate(['/stock-monitoring']);
  }

  goToOfferManagement() {
    this.router.navigate(['/offers']);
  }
}
