import { Injectable } from '@angular/core';
import { map, share, first } from 'rxjs/operators';
import { User } from '../app/models/user';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError } from 'rxjs/operators';
import { Product } from './models/product';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import 'rxjs/add/observable/of';


@Injectable({
  providedIn: 'root'
})

export class AuthentificationService {

  isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private httpClient: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  addUser(user: User): Observable<User> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.httpClient.post<User>(environment.signUp, user, httpOptions)
      .pipe(map( value => {
        // login successful if there's a jwt token in the response
        if (value['login'] && value['Authorization']) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', value['Authorization']);
          localStorage.setItem('user', JSON.stringify(value['login']));
          this.isLoginSubject.next(true);

          return User.fromJson(value['login']);
        }
      }));
  }

  updateUser(user: User): Observable<User> {

    let token;
    this.getToken().pipe(first()).subscribe(result => token = result);

    let headers_object = {
      headers: new HttpHeaders({
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json',
      })
    };

    return this.httpClient.put<User>(environment.updateUser, user, headers_object)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteUser(): Observable<any> {
    let token = localStorage.getItem('token');
    //this.getToken().pipe(first()).subscribe(result => token = result);

    var headers_object = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + token
    });

    const httpOptions = {
      headers: headers_object
    };

    return this.httpClient.delete<any>(environment.deleteUser, httpOptions)
      .pipe(
        map(res => {
        })
      ).pipe(
        catchError(this.handleError)
      );

  }

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(environment.products)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
*
* @returns {Observable<T>}
*/
  isLoggedIn(): Observable<boolean> {
    return this.isLoginSubject.asObservable();
  }

  login(login: string, password: string): Observable<User> {
    return this.httpClient.post<User>(environment.signIn, { login, password })
      .pipe(map(value => {

        // login successful if there's a jwt token in the response
        if (value['login'] && value['Authorization']) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', value['Authorization']);
          localStorage.setItem('user', JSON.stringify(value['login']));
          this.isLoginSubject.next(true);

          return User.fromJson(value['login']);
        }
      }));

  }

  public getUserInfosByToken(): Observable<User> {
    
    let token;
    this.getToken().pipe(first()).subscribe(result => token = result);

    let headers_object = {
      headers: new HttpHeaders({
        "Authorization": "Bearer " + token
      })
    };

    return this.httpClient.get<User>(environment.getUserInfo, headers_object).pipe(map(
      value => {
        return User.fromJson(value)
      }));
  }


  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.isLoginSubject.next(false);
  }

  /**
    * if we have token the user is loggedIn
    * @returns {boolean}
    */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  public getToken(): Observable<string> {
    if (this.hasToken()) {
      return Observable.of(localStorage.getItem('token'))
    }
    else {
      return Observable.of(null);
    }

  }
}
