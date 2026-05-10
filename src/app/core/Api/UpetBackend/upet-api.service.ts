import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpetApiService {

  private readonly baseUrl: string = 'https://upet-backend-w6wt.onrender.com/api/v1';
  //private readonly baseUrl: string = 'http://localhost:8000/api/v1';


  constructor(protected  http: HttpClient) {}

  protected getBaseUrl(): string {
    return this.baseUrl;
  }

  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    // Customize the error handling logic as needed
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Backend returned code ${error.status}, body was: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
