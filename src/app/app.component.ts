import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { AlertComponent } from './shared/alert/alert.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    // Restore the session from the auth cookie (if any) when the app starts.
    this.userService.whenSessionReady().subscribe();
  }
}
