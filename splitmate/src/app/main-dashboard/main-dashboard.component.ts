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
  groupMessage = "Currently, you're not part of any group. Join a group to start managing and splitting expenses with friends!";

  constructor(private router: Router,public authService :AuthService) { }

  ngOnInit(): void {
    this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "");
  }

 

 
  navigateToForm() {
    this.router.navigate(['/create-group/new']);
  }


}
