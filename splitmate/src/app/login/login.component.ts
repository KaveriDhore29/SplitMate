import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
<<<<<<< HEAD
=======
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
<<<<<<< HEAD
  email: string = '';
  password: string = '';

  onSubmit() {
  
    if (this.email && this.password) {
      console.log('Login successful:', this.email);
    } else {
      console.log('Please enter email and password.');
=======
  username: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit(): void {
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['dashboard']);
    } else {
      console.log('User not found');
>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002
    }
  }

}
