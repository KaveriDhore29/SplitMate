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

  
  constructor(private router: Router,public authService : AuthService) { }


  ngOnInit(): void {
  }

  isDropdownVisible = false; 

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
    console.log(this.isDropdownVisible)
  }

  // Placeholder for the sign-in logic
  signIn() {
 
   this.router.navigate(['login']);
 
  }


}
