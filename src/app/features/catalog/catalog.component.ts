import { Component, OnInit } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { StockService } from '../../core/services/stock.service';
import { AlertService } from '../../core/services/alert.service';
import { PricingService } from '../../core/services/pricing.service';
import { Offer } from '../../core/models/offer.model';
import { OfferService } from '../../core/services/offer.service';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  filter: string = '';
  products: Product[] = [];
  allProducts: Product[] = [];
  activeOffers: Offer[] = [];
  categories: string[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    public stockService: StockService,
    private alertService: AlertService,
    private pricingService: PricingService,
    private offerService: OfferService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.loadOffers();
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data.map(item => new Product(item));
        this.categories = Array.from(new Set(this.allProducts.map(p => p.getProductCategory())));
        this.route.queryParams.subscribe(params => {
          this.filter = params['filter'] ?? '';
          const search = params['search'] ?? '';
          this.applyFilter(this.filter, search);
        });

        // Listen to live updates from search bar
        this.searchService.query$.subscribe((query) => {
          this.applyFilter(this.filter, query);
        });
      },
      error: () => {
        this.alertService.error('Failed to load products.');
      }
    });
  }

  private loadOffers(): void {
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => {
        this.activeOffers = offers.filter(o => o.isActiveNow());
      },
      error: () => {
        this.alertService.error('Failed to load offers.');
      }
    });
  }

  applyFilter(filter: string, search: string) {
    this.products = this.allProducts.filter(product =>
      (filter === '' || product.getProductCategory() === filter) &&
      (search === '' || product.getProductTitle().toLowerCase().includes(search.toLowerCase()))
    );
  }

  goToProductDetails(product: Product) {
    this.router.navigate(['/product-details', product.getProductId()], { state: { product } });
  }

  addToCart(product: Product) {
    const price = this.pricingService.getDiscountedPrice(product);
    this.cartService.addToCart(product, price);
    this.alertService.success(`Product "${product.getProductTitle()}" added to cart.`);
  }

  getDiscountedPrice(product: Product): number {
    return this.pricingService.getDiscountedPrice(product);
  }

  hasDiscount(product: Product): boolean {
    return this.pricingService.hasDiscount(product);
  }
}
