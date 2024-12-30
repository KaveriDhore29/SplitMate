import { Component, OnInit,HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { log } from 'console';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isDropdownVisible = false;
  isLoggedIn = false;
  currentUser = '';

  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.checkUserLogin();

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      this.currentUser = userPayload.name;
    }
  }

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  signIn() {
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  signOut() {
    console.log('Sign-Out Clicked in navbar');
    this.authService.handleSignOut();
  }

  viewProfile() {
    this.router.navigate(['/dashboard/my-profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown-menu');
    const profileIcon = document.querySelector('.profile-icon');

    if (
      this.isDropdownVisible &&
      !dropdown?.contains(target) &&
      !profileIcon?.contains(target)
    ) {
      this.isDropdownVisible = false;
    }
  }
}
