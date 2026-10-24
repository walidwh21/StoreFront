import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { ShoppingCart } from '../../core/models/shopping-cart.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map.component';
import { Order, DeliveryAddress, OrderStatus } from '../../core/models/order.model';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { AlertService } from '../../core/services/alert.service';
import { PricingService } from '../../core/services/pricing.service';

@Component({
  selector: 'app-order-page',
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css']
})
export class OrderPageComponent implements OnInit {
  cart!: ShoppingCart;
  shippingFee = 15;
  address = {
    lat: 33.5731,
    lng: -7.5898,
    description: 'Company Location'
  };
  paymentMethod = '';
  orderConfirmed = false;
  useAddressString = false;
  addressString = '';
  userId: string = '';

  constructor(
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
    private orderService: OrderService,
    private alertService: AlertService,
    private pricingService: PricingService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.getUserId();

        this.cartService.cart.subscribe(cart => this.cart = cart);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => this.setDeliveryLocation(pos.coords.latitude, pos.coords.longitude),
            err => {
              console.error("Geolocation error :", err.message);
              this.alertService.warning("Geolocation error !");
              this.updateShippingFee();
            }
          );
        } else {
          this.updateShippingFee();
        }
      } else {
        this.alertService.warning("User not logged in.");
        this.router.navigate(['/signin']);
      }
    });
  }

  get deliveryAddressDisplay(): string {
    return this.address.description?.trim()
      ? this.address.description
      : `Latitude: ${this.address.lat}, Longitude: ${this.address.lng}`;
  }

  get totalWithShipping(): number {
    return this.getDiscountedTotalPrice() + this.shippingFee;
  }

  confirmOrder(): void {
    if (!this.paymentMethod) {
      this.alertService.error(" Please select a payment method.");
      return;
    }

    if (this.useAddressString) {
      if (!this.addressString.trim()) {
        this.alertService.error("Please enter a valid address.");
        return;
      }
      this.address.description = this.addressString.trim();
    } else {
      if (!this.address.lat || !this.address.lng) {
        this.alertService.error("Please set a valid position on the map.");
        return;
      }
      this.address.description = '';
    }

    // Apply discounted prices to every product
    this.cart.itemsProduct.forEach(item => {
      const originalPrice = item.itemProduct.getProductPrice();
      const discountedPrice = this.pricingService.hasDiscount(item.itemProduct)
        ? this.pricingService.getDiscountedPrice(item.itemProduct)
        : originalPrice;

      (item as any).unitPrice = discountedPrice;
    });

    const deliveryAddress: DeliveryAddress = this.useAddressString
      ? { description: this.address.description }
      : { lat: this.address.lat, lng: this.address.lng, description: '' };

    const totalPrice = this.getDiscountedTotalPrice();
    const finalTotal = totalPrice + this.shippingFee;

    const order = new Order(
      this.userId,
      this.cart,
      this.paymentMethod,
      deliveryAddress,
      this.shippingFee,
      finalTotal,
      OrderStatus.PENDING
    );

    this.orderService.placeOrder(order).subscribe({
      next: () => {
        this.orderConfirmed = true;
        this.cartService.clearStorage();
        this.alertService.success("Order successfully confirmed!");
      },
      error: (err) => {
        console.error("Error while submitting the order", err);
        this.alertService.error("Order failed. Please try again later.");
      }
    });
  }

  private getDiscountedTotalPrice(): number {
    return this.cart.itemsProduct.reduce((total, item) => {
      const unitPrice = (item as any).unitPrice ??
        (this.pricingService.hasDiscount(item.itemProduct)
          ? this.pricingService.getDiscountedPrice(item.itemProduct)
          : item.itemProduct.getProductPrice());
      return total + unitPrice * item.quantity;
    }, 0);
  }

  goBackToCart(): void {
    this.router.navigate(['/catalog']);
  }

  onLocationChanged(event: { lat: number; lng: number }): void {
    this.setDeliveryLocation(event.lat, event.lng);
  }

  private setDeliveryLocation(lat: number, lng: number): void {
    this.address.lat = lat;
    this.address.lng = lng;
    this.updateShippingFee();
  }

  private updateShippingFee(): void {
    const distanceKm = this.calculateDistance(33.5731, -7.5898, this.address.lat, this.address.lng);
    this.shippingFee =
      distanceKm <= 3 ? 15 :
      distanceKm <= 7 ? 25 :
      distanceKm <= 15 ? 40 : 60;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.deg2rad(lat1)) *
              Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
