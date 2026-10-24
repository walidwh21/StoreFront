import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Shares the current search text between the navbar and the catalog. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly querySubject = new BehaviorSubject<string>('');
  readonly query$ = this.querySubject.asObservable();

  updateQuery(query: string): void {
    this.querySubject.next(query);
  }
}
