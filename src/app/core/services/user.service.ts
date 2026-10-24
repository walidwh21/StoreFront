import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, defer, map, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { ISignUpCredentials, IUserCredentials, NewUserForm, User } from '../models/user.model';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  /** One-shot "who am I?" call made when the app starts (cookie-based session). */
  private readonly initialSession$ = defer(() => this.getCurrentUser()).pipe(
    catchError(() => of(null)),
    shareReplay(1)
  );

  /** Resolves with the current user once the startup session check has finished. */
  whenSessionReady(): Observable<User | null> {
    return this.initialSession$.pipe(
      switchMap(() => this.currentUser$),
      take(1)
    );
  }

  signIn(credentials: IUserCredentials): Observable<User> {
    return this.http
      .post(`${this.apiUrl}/signin`, credentials, { responseType: 'text' })
      .pipe(switchMap(() => this.getCurrentUser()));
  }

  signUp(credentials: ISignUpCredentials): Observable<string> {
    return this.http.post(`${this.apiUrl}/signup`, credentials, { responseType: 'text' });
  }

  signOut(): Observable<unknown> {
    return this.http
      .post(`${this.apiUrl}/signout`, {}, { responseType: 'text' })
      .pipe(tap(() => this.currentUserSubject.next(null)));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(User.fromJSON),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http
      .put<any>(`${this.apiUrl}/users/${user.getUserId()}`, user.toJSON())
      .pipe(map(User.fromJSON));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(map(list => list.map(User.fromJSON)));
  }

  addUser(data: NewUserForm): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
