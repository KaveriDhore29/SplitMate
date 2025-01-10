import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs'; // Import Observable

declare var handleSignOut: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isUserLoggedIn: string = '';
  apiUrl: string = 'http://localhost:3000/api';  // Define the API base URL

  constructor(private router: Router, private http: HttpClient) {}  // Inject HttpClient

  // Check if the user is logged in
  checkUserLogin(): boolean {
    this.isUserLoggedIn = sessionStorage.getItem('IsLoggedIn') || '';

    return this.isUserLoggedIn === 'true'; 
  }

  // Handle sign-out functionality
  handleSignOut(): void {
    // Assuming `handleSignOut` is a global function. If it isn't, remove this line.
    if (typeof handleSignOut === 'function') {
      handleSignOut();
    }

    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('IsLoggedIn');

    this.router.navigate(['/landing']).then(() => {
      window.location.reload();
    });
  }

  // Method to upload profile picture
  uploadProfilePicture(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadProfilePicture`, formData); 
  }
}
