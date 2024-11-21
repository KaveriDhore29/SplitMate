import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  currentSection: string = 'dashboard/main-dashboard'; 

  constructor(private router: Router,public dataService: DataService) { }

  ngOnInit(): void {
    const data = this.dataService.getGroupDetails();
    console.log(data);
  }

  setSection(section: string) {
    console.log("Switching to section:", section);
    this.router.navigate([`/dashboard/${section}`]);
  }

  navigateToForm() {
    this.router.navigate(['/create-group/new']);
  }

 
}
