import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OfferService } from './offer.service';
import { Offer } from '../models/offer.model';
import { Product } from '../models/product.model';

/** Applies the best currently-active offer to a product price. */
@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly offerService = inject(OfferService);
  private activeOffers: Offer[] = [];
  private readonly offersSubject = new BehaviorSubject<Offer[]>([]);

  constructor() {
    this.loadActiveOffers();
  }

  loadActiveOffers(): void {
    this.offerService.getOffers().subscribe({
      next: offers => {
        this.activeOffers = offers.filter(o => o.isActiveNow());
        this.offersSubject.next(this.activeOffers);
      },
    });
  }

  getOffersObservable() {
    return this.offersSubject.asObservable();
  }

  getDiscountedPrice(product: Product): number {
    const basePrice = product.getProductPrice();
    const bestPercent = this.activeOffers
      .filter(o => o.appliesToProduct(product.getProductId()))
      .reduce((best, o) => Math.max(best, o.getDiscountPercent()), 0);
    return basePrice - (basePrice * bestPercent) / 100;
  }

  hasDiscount(product: Product): boolean {
    return this.getDiscountedPrice(product) < product.getProductPrice();
  }
}
