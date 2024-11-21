import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

   apiUrl = 'http://localhost:3000/api/get-group-details';
   currentUser : any;

  constructor(private http: HttpClient) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser); 
      this.currentUser = {
        email: userPayload.email 
      };
    }

    console.log(this.currentUser)
  }

  getGroupDetails(): void {
    this.http.post('http://localhost:3000/api/get-group-details',this.currentUser,{withCredentials:true} ).subscribe(
      (response) => {
        console.log('Group details fetched successfully:', response);
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }
}
