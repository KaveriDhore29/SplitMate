import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {

  constructor(private router: Router,public authService :AuthService) { }

  ngOnInit(): void {
  }

  navigateToForm() {
    this.router.navigate(['/create-group/new']);
  }


}
