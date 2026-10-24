import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ISignUpCredentials } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavbarComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['../signin/signin.component.css']
})
export class SignupComponent {
  credentials: ISignUpCredentials = {
    email: '',
    password: '',
    fullName: ''
  };
  confirmPassword: string = '';
  confirmPasswordTouched = false;
  signUpError: string | false = false;
  signUpSuccess = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router) { }

  get confirmPasswordError(): boolean {
    return this.confirmPassword !== this.credentials.password;
  }

  signUp() {
    this.signUpError = false;
    this.signUpSuccess = false;

    if (this.confirmPasswordError) {
      return; // prevent submitting if passwords don't match
    }

    this.userService.signUp(this.credentials).subscribe({
      next: () => {
        this.signUpSuccess = true;
        this.signUpError = false;
        this.alertService.success("Account created successfully!");
      },
      error: (err) => {
        let message = "An error occurred. Please try again.";
        if (err.status === 409 && typeof err.error === 'string') {
          message = err.error;
        } else if (typeof err.error === 'string') {
          message = err.error;
        }
        this.signUpError = message;
        this.alertService.error(message);
      },
    });
  }
}
