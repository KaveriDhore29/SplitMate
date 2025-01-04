import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  constructor(private router: Router, public authService: AuthService) {}

  currentUser = '';
  email = '';
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.checkUserLogin();

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      console.log(userPayload);
      this.currentUser = userPayload.name;
      this.email = userPayload.email;
    }
  }

  getInitials(name: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const context = canvas.getContext('2d');

    if (!context) {
      return '';
    }

    // Background color
    context.fillStyle = '#f8f8f8';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Text properties
    context.font = '64px Roboto, "Helvetica Neue", sans-serif'; // Adjust font size for better fit
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Generate initials
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Calculate canvas center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw initials at the center
    context.fillText(initials, centerX, centerY);

    return canvas.toDataURL();
  }
}

  

