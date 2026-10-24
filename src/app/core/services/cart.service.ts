import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShoppingCartItem } from '../models/shopping-cart-item.model';
import { ShoppingCart } from '../models/shopping-cart.model';
import { Product } from '../models/product.model';
import { AlertService } from './alert.service';

const STORAGE_KEY = 'cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly alertService = inject(AlertService);

  private items: ShoppingCartItem[] = this.restoreItems();
  private readonly cartSubject = new BehaviorSubject<ShoppingCart>(this.snapshot());
  private readonly visibilitySubject = new BehaviorSubject<boolean>(false);

  readonly cart = this.cartSubject.asObservable();
  readonly cartVisible = this.visibilitySubject.asObservable();

  /** Adds one unit; `price` is the (possibly discounted) unit price. */
  addToCart(product: Product, price?: number): void {
    const existing = this.items.find(i => i.itemProduct.getProductId() === product.getProductId());

    if (existing) {
      if (existing.quantity >= product.getProductQuantity()) {
        this.alertService.warning('Insufficient stock for this product.');
        return;
      }
      existing.quantity++;
    } else {
      if (product.getProductQuantity() <= 0) {
        this.alertService.error('Product is out of stock.');
        return;
      }
      this.items.push({ itemProduct: product, quantity: 1, price: price ?? product.getProductPrice() });
    }
    this.publish();
  }

  removeFromCart(productId: string): void {
    this.items = this.items.filter(i => i.itemProduct.getProductId() !== productId);
    this.publish();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.items.find(i => i.itemProduct.getProductId() === productId);
    if (item) {
      item.quantity = quantity;
      this.publish();
    }
  }

  clearCart(): void {
    this.items = [];
    this.publish();
  }

  /** Same as {@link clearCart}; kept for the sign-in / sign-out flows. */
  clearStorage(): void {
    this.clearCart();
  }

  getCart(): ShoppingCart {
    return this.snapshot();
  }

  openCart(): void {
    this.visibilitySubject.next(true);
  }

  toggleCart(): void {
    this.visibilitySubject.next(!this.visibilitySubject.value);
  }

  closeCart(): void {
    this.visibilitySubject.next(false);
  }

  // ---------------------------------------------------------------- internals

  private snapshot(): ShoppingCart {
    return {
      itemsProduct: this.items,
      totalItems: this.items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: this.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    };
  }

  private publish(): void {
    this.cartSubject.next(this.snapshot());
    if (this.hasStorage()) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    }
  }

  private restoreItems(): ShoppingCartItem[] {
    if (!this.hasStorage()) return [];
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(stored)) return [];
      return stored.map((entry: any) => {
        const product = new Product(entry.itemProduct);
        return { itemProduct: product, quantity: entry.quantity, price: entry.price ?? product.getProductPrice() };
      });
    } catch {
      return [];
    }
  }

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }
}
