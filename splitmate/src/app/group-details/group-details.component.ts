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
  showAddmembersPopup: boolean = false;

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newGroupId = params.get('id');
      if (newGroupId) {
        this.groupId = newGroupId;
        this.loadGroupDetails();
      }
    });
  }


  loadGroupDetails(): void {
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Group Detail:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;

        // Update membersNames to include both name and email
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username,  // or use the appropriate field for the name
          email: member.email
        }));

        console.log('Group Name:', this.groupName);
        console.log('Members Names:', this.membersNames);
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }
}


  

