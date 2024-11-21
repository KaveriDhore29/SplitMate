import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {

  userProfile:any;
  groupMessage = '';

  ngOnInit(): void {
    this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "");
  }

  constructor(private router: Router,public authService :AuthService) { }

 
  navigateToForm() {
    this.router.navigate(['/create-group/new']);
  }


}
