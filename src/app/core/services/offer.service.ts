import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Offer } from '../models/offer.model';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/offers`;

  getOffers(): Observable<Offer[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(map(list => list.map(Offer.fromJSON)));
  }

  getOffer(id: string): Observable<Offer> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map(Offer.fromJSON));
  }

  createOffer(offer: Offer): Observable<Offer> {
    return this.http.post<any>(this.baseUrl, offer.toJSON()).pipe(map(Offer.fromJSON));
  }

  updateOffer(offer: Offer): Observable<Offer> {
    return this.http
      .put<any>(`${this.baseUrl}/${offer.getId()}`, offer.toJSON())
      .pipe(map(Offer.fromJSON));
  }

  deleteOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
