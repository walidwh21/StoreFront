import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/products`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(map(Product.fromJSON));
  }

  updateProductStock(id: string, quantity: number): Observable<Product> {
    return this.http
      .put<Product>(`${this.baseUrl}/${id}/stock`, { quantity })
      .pipe(map(Product.fromJSON));
  }
}
