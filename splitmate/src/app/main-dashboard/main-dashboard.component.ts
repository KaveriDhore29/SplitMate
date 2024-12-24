import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {

  userProfile:any;
  groupMessage = "Currently, you're not part of any group. Join a group to start managing and splitting expenses with friends!";
  responseOftotalOwed:{myTotalBalance: number; owedBalance : number; owesBalance : number} = {  myTotalBalance: 0,
    owedBalance: 0,
    owesBalance: 0};
  groupDetails : any;
  groupIds : any;


  constructor(private router: Router,public authService :AuthService,public dataService:DataService) { }

  // ngOnInit(): void {
  //   this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "");
  //   this.groupDetails = this.dataService.getGroupDetails().subscribe(
  //     (data: any[]) => {
  //       this.groupDetails = data;   
  //     this.groupIds = this.groupDetails.map((group: any) => group.groupId);
  //     console.log('Group IDs:', this.groupIds); 
  //     },
  //     (error) => {
  //       console.error('Error fetching group details:', error);
  //     }
  //   );
  //   this.dataService.totalOwed(this.groupIds).subscribe(
  //     (data: any[]) => {
  //       this.responseOftotalOwed = data;
  //       console.log( this.responseOftotalOwed ,"totalowed");
        
  //     },
  //     (error) =>{
  //        console.error("error loading details from api")
  //     }
  //   );
   
  // }

  ngOnInit(): void {
    this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "");
  
    this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;   
        this.groupIds = this.groupDetails.map((group: any) => group.groupId);
        console.log('Group IDs:', this.groupIds); 
  
        
        this.dataService.totalOwed(this.groupIds).subscribe(
          (owedData: any) => {
            this.responseOftotalOwed = owedData;
            console.log(this.responseOftotalOwed, "totalowed");
          },
          (error) => {
            console.error("Error loading details from API:", error);
          }
        );
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }
  


}
