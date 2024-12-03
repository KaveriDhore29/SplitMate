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
  groupDetails: any;  
  groupMembersName = [];

  constructor(private router: Router,public dataService: DataService) { }

  ngOnInit(): void {
    this.groupDetails = this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data; 
        console.log(this.groupDetails); 
        this.groupMembersName = this.groupDetails
        .map((group: any) => 
          group.members.map((member: any) => member.username)
        )
        .flat(); 
      console.log('Group Members:', this.groupMembersName);   
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
    
  }

  setSection(section: string) {
    console.log("Switching to section:", section);
    this.router.navigate([`/dashboard/${section}`]);
  }

  showGroupDetails(group: any): void {
    console.log('Group Details:', group); 
    // this.dataService.setSelectedGroup(group);
  }

 
}
