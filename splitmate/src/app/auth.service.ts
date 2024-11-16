import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
declare var handleSignOut: any;

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  isUserLoggedIn: string = '';

  constructor(private router: Router) {}
  
  checkUserLogin(): boolean {
    this.isUserLoggedIn = sessionStorage.getItem('IsLoggedIn') || ''; 
    
    if (this.isUserLoggedIn === 'true') {
      return true; 
    } else {
      return false; 
    }
  }
  


  handleSignOut(){
    handleSignOut();
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("IsLoggedIn");
    this.router.navigate(['/login']).then(()=>{
       window.location.reload();
    })
  }
}
