import { Component, OnDestroy } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ShoppingCartComponent } from '../../features/cart/shopping-cart.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { AlertService } from '../../core/services/alert.service';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchBarComponent, ShoppingCartComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {
  cartItemCount = 0;
  showCart = false;
  user$!: Observable<User | null>;
  currentRoute: string = '';

  private cartSubscription?: Subscription;
  private visibilitySubscription?: Subscription;

  constructor(
    private alertService: AlertService,
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
    private searchService: SearchService
  ) {
    this.user$ = this.userService.currentUser$;

    this.cartSubscription = this.cartService.cart.subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });

    this.visibilitySubscription = this.cartService.cartVisible.subscribe(visible => {
      this.showCart = visible;
    });

    let previousRoute = '';

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const newRoute = event.urlAfterRedirects;

        const hadSearch = this.shouldShowSearchForRoute(previousRoute);
        const hasSearch = this.shouldShowSearchForRoute(newRoute);

        // If we navigate away from a search page to a non-search page, reset the query
        if (hadSearch && !hasSearch) {
          this.searchService.updateQuery('');
        }

        previousRoute = newRoute;
        this.currentRoute = newRoute;
      }
    });
  }

  onSearch(query: string) {
    this.searchService.updateQuery(query);
  }

  private shouldShowSearchForRoute(route: string): boolean {
    return ['/catalog', '/stock-monitoring'].some(path => route.startsWith(path));
  }

  shouldShowSearch(): boolean {
    return this.shouldShowSearchForRoute(this.currentRoute);
  }

  toggleCart() {
    this.cartService.toggleCart();
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
    this.visibilitySubscription?.unsubscribe();
  }

  signOut() {
    this.userService.signOut().subscribe({
      next: () => {
        this.cartService.clearStorage();
        this.router.navigate(['/catalog']);
        this.alertService.success('Successfully logged out.');
      },
      error: () => {
        this.alertService.error('Error during logout.');
      }
    });
  }
}
