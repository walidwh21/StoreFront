import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { ShoppingCart } from '../../core/models/shopping-cart.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../core/services/stock.service';
import { AlertService } from '../../core/services/alert.service';
import { Product } from '../../core/models/product.model';
import { PricingService } from '../../core/services/pricing.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cart!: ShoppingCart;

  constructor(private cartService: CartService,
    private router: Router,
    private alertService: AlertService,
    public stockService: StockService,
    private pricingService: PricingService
  ) { }

  ngOnInit(): void {
    this.cartService.cart.subscribe(cart => this.cart = cart);
  }

  increaseQuantity(productId: string) {
    const item = this.cart.itemsProduct.find(i => i.itemProduct.getProductId() === productId);
    if (!item) return;

    const available = item.itemProduct.getProductQuantity();
    if (item.quantity < available) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    } else {
      this.alertService.warning('Maximum available quantity reached.');
    }
  }

  decreaseQuantity(productId: string) {
    const item = this.cart.itemsProduct.find(i => i.itemProduct.getProductId() === productId);
    if (!item) return;

    const wasLastItem = item.quantity === 1;

    this.cartService.updateQuantity(productId, item.quantity - 1);

    if (wasLastItem) {
      this.alertService.success('Product removed from cart.');
    }
  }

  remove(productId: string) {
    this.cartService.removeFromCart(productId);
    this.alertService.info('Product deleted from cart.');
  }

  clearCart() {
    this.cartService.clearCart();
    this.alertService.info('Cart emptied.');
  }

  checkout() {
    this.router.navigate(['/order-page']);
  }

  getDiscountedPrice(product: Product): number {
    return this.pricingService.getDiscountedPrice(product);
  }

  hasDiscount(product: Product): boolean {
    return this.pricingService.hasDiscount(product);
  }
}
