import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  currentGroupId !: any;
  groupIds = [];
  responseOftotalOwed : any
 

  constructor(private router: Router,public dataService: DataService,private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.currentGroupId = this.route.snapshot.paramMap.get('id')!;
    // this.groupDetails = this.dataService.getGroupDetails().subscribe(
    //   (data: any[]) => {
    //     this.groupDetails = data; 
    //    // console.log(this.groupDetails,"Printing groupDetails loaded in dashboard"); 
    //   //   this.groupMembersName = this.groupDetails
    //   //   .map((group: any) => 
    //   //     group.members.map((member: any) => member.username)
    //   //   )
    //   //   .flat(); 
    //   // console.log('Group Members:', this.groupMembersName);   
    //   },
    //   (error) => {
    //     console.error('Error fetching group details:', error);
    //   }
    // );
    this.groupDetails = this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;   
      this.groupIds = this.groupDetails.map((group: any) => group.groupId);
      console.log('Group IDs:', this.groupIds); 
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );

    this.dataService.totalOwed(this.groupIds).subscribe(
      (data: any[]) => {
        this.responseOftotalOwed = data;
        console.log( this.responseOftotalOwed ,"totalowed");
        
      }
    );
    
  }

  setSection(section: string) {
    console.log("Switching to section:", section);
    this.currentSection = section;
    this.router.navigate([`/dashboard/${section}`]);
   
  }

  showGroupDetails(group: any): void {
    console.log('Group Details:', group); 
    // this.dataService.setSelectedGroup(group);
  }


 
}
