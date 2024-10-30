import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isDropdownOpen = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }


}
