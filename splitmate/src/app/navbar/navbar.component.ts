import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { log } from 'console';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isDropdownVisible = false; 
  isLoggedIn = false; 

  constructor(private router: Router,public authService : AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.checkUserLogin();
    console.log(this.isLoggedIn);
  }


  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  signIn() {
    this.router.navigate(['login']);
  }

  signOut() {
    console.log('Sign-Out Clicked in navbar');
    this.authService.handleSignOut();
  }

  viewProfile() { 
   alert('View Profile Clicked');
  }


}
