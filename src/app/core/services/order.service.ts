import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order } from '../models/order.model';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/orders`;

  getOrdersByUserId(userId: string): Observable<Order[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/user/${userId}`)
      .pipe(map(list => list.map(Order.fromJSON)));
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<any>(`${this.baseUrl}/${orderId}`).pipe(map(Order.fromJSON));
  }

  placeOrder(order: Order): Observable<any> {
    return this.http.post<any>(this.baseUrl, order.toJSON());
  }
}
