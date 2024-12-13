import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit{
  groupId !: string;
  groupDetails: any;
  groupName : string ='';
  membersNames: any[] = [];
  showPopup: boolean = false;
  showSettleUpPopup = false;
  showAddmembersPopup: boolean = false;
  groupIds = [];
  groupExpenses : any;
  activeTab: string = 'expenses'; 
  

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newGroupId = params.get('id');
      if (newGroupId) {
        this.groupId = newGroupId;
        this.loadGroupDetails();
      }
    });
  

    this.groupDetails = this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;   
      this.groupIds = this.groupDetails.map((group: any) => group.groupId);
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }


  loadGroupDetails(): void {
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Specific Group Detail by Id:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username, 
          email: member.email
        }));
         this.groupExpenses = this.groupDetails[0].transactions;
        
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}


  

