import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUserCredentials } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { User } from '../../../core/models/user.model';
import { AlertService } from '../../../core/services/alert.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { StockService } from '../../../core/services/stock.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavbarComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  credentials: IUserCredentials = { email: '', password: '' };
  signInError: string | false = false;

  constructor(private UserService: UserService,
    private router: Router,
    private alertService: AlertService,
    private stockService: StockService,
    private cartService: CartService) { }

  signIn() {
    this.signInError = false;
    this.UserService.signIn(this.credentials).subscribe({
      next: (user: User) => {
        this.alertService.success("Login successful!");
        this.cartService.clearStorage();

        if (user.getUserType() === 'admin') {
          this.stockService.checkAndNotifyStock();
        }

        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        let message = 'An error occurred. Please try again.';
        if (err.status === 401 && typeof err.error === 'string') {
          message = err.error;
        } else if (typeof err.error === 'string') {
          message = err.error;
        }
        this.signInError = message;
        this.alertService.error(message);
      }
    });
  }
}
