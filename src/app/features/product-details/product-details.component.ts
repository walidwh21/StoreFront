import { Component } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { CartService } from '../../core/services/cart.service';
import { StockService } from '../../core/services/stock.service';
import { AlertService } from '../../core/services/alert.service';
import { PricingService } from '../../core/services/pricing.service';

@Component({
  selector: 'app-product-details-component',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css', '../catalog/catalog.component.css']
})
export class ProductDetailsComponent {
  product: Product | null = null;

  constructor(private cartService: CartService,
    private route: ActivatedRoute,
    private productService: ProductService,
    public stockService: StockService,
    private alertService: AlertService,
    private pricingService: PricingService
  ) { }

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((productData) => {
        this.product = new Product(productData); // Convert to Product instance
      });
    }
  }

  addToCart() {
    if (this.product) {
      const price = this.pricingService.getDiscountedPrice(this.product);
      this.cartService.addToCart(this.product, price);
      this.alertService.success(`Product "${this.product.getProductTitle()}" added to cart.`);
    }
  }

  getDiscountedPrice(product: Product): number {
    return this.pricingService.getDiscountedPrice(product);
  }

  hasDiscount(product: Product): boolean {
    return this.pricingService.hasDiscount(product);
  }
}