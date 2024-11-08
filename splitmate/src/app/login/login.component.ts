import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  username: string = '';
  password: string = '';

  constructor(private router: Router,private route: ActivatedRoute, private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('authToken', token);
        // Redirect if needed
        this.router.navigate(['/dashboard']);
      } else {
        // If no token, handle as unauthenticated access
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['dashboard']);
    } else {
      console.log('User not found');
    }
  }



}
