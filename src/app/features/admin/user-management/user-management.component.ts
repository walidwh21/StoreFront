import { Component, OnInit } from '@angular/core';
import { User, NewUserForm, UserType } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  selectedUserCopy: any = null;

  newUser: NewUserForm = {
    fullName: '',
    email: '',
    password: '',
    phone: 0,
    iban: '',
    bankName: '',
    userType: UserType.Member
  };

  constructor(private userService: UserService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: users => this.users = users,
      error: () => alert("Error loading users.")
    });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.selectedUserCopy = {
      fullName: user.getFullName(),
      email: user.getEmail(),
      phone: user.getPhone(),
      iban: user.getIban(),
      bankName: user.getBankName(),
      userType: user.getUserType(),
    };
  }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUserCopy) return;

    this.selectedUser.setFullName(this.selectedUserCopy.fullName);
    this.selectedUser.setEmail(this.selectedUserCopy.email);
    this.selectedUser.setPhone(this.selectedUserCopy.phone);
    this.selectedUser.setIban(this.selectedUserCopy.iban);
    this.selectedUser.setBankName(this.selectedUserCopy.bankName);
    this.selectedUser.setUserType(this.selectedUserCopy.userType);

    this.userService.updateUser(this.selectedUser).subscribe({
      next: () => {
        this.alertService.success('User updated!');
        this.selectedUser = null;
        this.selectedUserCopy = null;
        this.fetchUsers();
      },
      error: () => this.alertService.error("Update failed.")
    });
  }

  deleteUser(id: string): void {
    if (!confirm("Confirm deletion?")) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.alertService.success("User deleted!");
        this.fetchUsers();
      },
      error: () => alert("Deletion error.")
    });
  }

  addUser(): void {
    if (!this.newUser.fullName || !this.newUser.email || !this.newUser.password) {
      this.alertService.error("Full name, email, and password are required.");
      return;
    }

    this.userService.addUser(this.newUser).subscribe({
      next: () => {
        this.alertService.success("User added!");
        this.newUser = {
          fullName: '',
          email: '',
          password: '',
          phone: 0,
          iban: '',
          bankName: '',
          userType: UserType.Member
        };
        this.fetchUsers();
      },
      error: () => this.alertService.error("Add error.")
    });
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
