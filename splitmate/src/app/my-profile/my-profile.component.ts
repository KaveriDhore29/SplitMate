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
  picture = ''; // To store user's profile image URL
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.checkUserLogin();

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      console.log(userPayload);

      this.currentUser = userPayload.name;
      this.email = userPayload.email;

      // Check if a profile picture is available
      this.picture =
        userPayload.picture || this.getInitialsImage(this.currentUser);
    }
  }

  // Generate an image with initials
  getInitialsImage(name: string): string {
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
    context.font = '64px Roboto, "Helvetica Neue", sans-serif';
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

    return canvas.toDataURL(); // Return the image as a data URL
  }

  // Trigger file input dialog
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  // Handle the file select event
  onFileSelect(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Create a FormData object to send the file to the server
      const formData = new FormData();
      formData.append('profilePicture', file, file.name);

      // Upload the file to the backend
      this.uploadProfilePicture(formData);
    }
  }
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file, file.name);
      this.authService.uploadProfilePicture(formData).subscribe(
        (response) => {
          console.log('File uploaded successfully', response);
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
  
  // Upload the profile picture to the backend
  uploadProfilePicture(formData: FormData): void {
    this.authService.uploadProfilePicture(formData).subscribe(
      (response) => {
        // On success, update the profile picture URL
        console.log(response);
        this.picture = response.imageUrl; // Assuming response contains the URL of the uploaded image
      },
      (error) => {
        console.error('Error uploading profile picture', error);
      }
    );
  }
}
