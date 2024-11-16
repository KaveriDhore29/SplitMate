import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  currentSection: string = 'dashboard/main-dashboard'; 

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  setSection(section: string) {
    console.log("Switching to section:", section);
    this.router.navigate([`/dashboard/${section}`]);
  }

 
}
