import { Component, OnInit } from '@angular/core';
import { Offer } from '../../../core/models/offer.model';
import { OfferService } from '../../../core/services/offer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { AlertService } from '../../../core/services/alert.service';


@Component({
  selector: 'app-offer-management',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './offer-management.component.html',
  styleUrls: ['./offer-management.component.css']
})
export class OfferManagementComponent implements OnInit {
  offers: Offer[] = [];
  offerForm: FormGroup;
  editingOffer: Offer | null = null;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory = '';
  categories: string[] = []; // all categories

  constructor(private offerService: OfferService,
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      discountPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [true],
      type: ['discount', Validators.required],
      selectedCategory: [''],
      productIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOffers();
    this.loadProducts();

    this.offerForm.get('selectedCategory')?.valueChanges.subscribe(() => this.updateFilteredProducts());
    this.offerForm.get('productIds')?.valueChanges.subscribe(() => this.updateFilteredProducts());
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.allProducts = products.map(p => new Product(p));
        this.categories = Array.from(new Set(this.allProducts.map(p => p.getProductCategory())));

        this.updateFilteredProducts();  // initialize filteredProducts properly
      },
      error: () => this.alertService.error('Error loading products.')
    });
  }

  loadOffers() {
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => this.offers = offers,
      error: () => this.alertService.error('Error loading offers.')
    });
  }

  updateFilteredProducts() {
    const selectedIds: string[] = this.offerForm.get('productIds')?.value || [];
    const selectedCategory: string = this.offerForm.get('selectedCategory')?.value || '';

    const categoryProducts = selectedCategory
      ? this.allProducts.filter(p => p.getProductCategory() === selectedCategory)
      : this.allProducts;

    const selectedProducts = this.allProducts.filter(p => selectedIds.includes(p.getProductId()));

    // Merge without duplicates
    this.filteredProducts = Array.from(new Set([...categoryProducts, ...selectedProducts]));
  }

  isAllSelected(): boolean {
    const selectedIds: string[] = this.offerForm.get('productIds')?.value || [];
    const filteredIds = this.filteredProducts.map(p => p.getProductId());
    return filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const filteredIds = this.filteredProducts.map(p => p.getProductId());
    let selectedIds: string[] = this.offerForm.get('productIds')?.value || [];

    if (checked) {
      selectedIds = Array.from(new Set([...selectedIds, ...filteredIds]));
    } else {
      selectedIds = selectedIds.filter(id => !filteredIds.includes(id));
    }

    this.offerForm.patchValue({ productIds: selectedIds });
  }


  isSelected(productId: string): boolean {
    const selectedIds: string[] = this.offerForm.get('productIds')?.value || [];
    return selectedIds.includes(productId);
  }

  submitForm(): void {
    if (this.offerForm.invalid) return;

    const formValue = this.offerForm.value;
    const offer = new Offer(
      this.editingOffer ? this.editingOffer.getId() : null,
      formValue.title,
      formValue.description,
      formValue.discountPercent,
      new Date(formValue.startDate),
      new Date(formValue.endDate),
      formValue.active,
      formValue.type,
      formValue.productIds
    );

    if (this.editingOffer) {
      this.offerService.updateOffer(offer).subscribe(() => {
        this.loadOffers();
        this.resetForm();
      });
    } else {
      this.offerService.createOffer(offer).subscribe(() => {
        this.loadOffers();
        this.resetForm();
      });
    }
  }

  editOffer(offer: Offer): void {
    this.editingOffer = offer;
    this.offerForm.patchValue({
      title: offer.getTitle(),
      description: offer.getDescription(),
      discountPercent: offer.getDiscountPercent(),
      startDate: offer.getStartDate().toISOString().substring(0, 10),
      endDate: offer.getEndDate().toISOString().substring(0, 10),
      active: offer.isActive(),
      type: offer.getType(),
      productIds: offer.getProductIds()
    });
  }

  deleteOffer(id: string): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id).subscribe(() => this.loadOffers());
    }
  }

  resetForm(): void {
    this.editingOffer = null;
    this.offerForm.reset({
      title: '',
      description: '',
      discountPercent: 0,
      startDate: '',
      endDate: '',
      active: true,
      type: 'discount',
      productIds: []
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
