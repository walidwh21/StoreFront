import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { AlertService } from './alert.service';

const LOW_STOCK_THRESHOLD = 10;
const RECENT_RESTOCK_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly productService = inject(ProductService);
  private readonly alertService = inject(AlertService);

  isOutOfStock(product: Product): boolean {
    return product.getProductQuantity() === 0;
  }

  isLowStock(product: Product): boolean {
    return product.getProductQuantity() <= LOW_STOCK_THRESHOLD;
  }

  isRecentlyRestocked(product: Product): boolean {
    const restockDate = product.getRestockDate();
    return !!restockDate && Date.now() - new Date(restockDate).getTime() <= RECENT_RESTOCK_MS;
  }

  getStockMessage(product: Product): string | null {
    if (this.isOutOfStock(product)) return 'Out of stock!';
    if (this.isLowStock(product)) return 'Low stock - hurry up !';
    if (this.isRecentlyRestocked(product)) return 'Recently restocked !';
    return null;
  }

  getStockStatusClass(product: Product): string {
    if (this.isOutOfStock(product)) return 'out-stock';
    if (this.isLowStock(product)) return 'low-stock';
    if (this.isRecentlyRestocked(product)) return 'restocked';
    return '';
  }

  /** Raises an alert when some products are low on stock or sold out. */
  checkAndNotifyStock(): void {
    this.productService.getProducts().subscribe({
      next: raw => {
        const products = raw.map(Product.fromJSON);
        const soldOut = products.filter(p => this.isOutOfStock(p)).length;
        const low = products.filter(p => this.isLowStock(p)).length;

        if (low > 0) this.alertService.warning(`${low} product(s) have low stock.`, 5000);
        if (soldOut > 0) this.alertService.error(`${soldOut} product(s) are out of stock.`, 5000);
      },
      error: () => this.alertService.error('Error checking stock levels.'),
    });
  }
}
