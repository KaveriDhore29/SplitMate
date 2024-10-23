import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  email: string = '';
  password: string = '';

  onSubmit() {
  
    if (this.email && this.password) {
      console.log('Login successful:', this.email);
    } else {
      console.log('Please enter email and password.');
    }
  }

}
