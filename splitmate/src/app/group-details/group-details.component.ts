import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent{
  groupId !: string;
  groupDetails: any;
  groupName : string ='';
  
  membersNames: string[] = [];
  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
  //   this.dataService.selectedGroup$.subscribe(group => {
  //     if (group) {
  //       this.groupDetails = group;
  //       console.log('Group details:', this.groupDetails);
  //     }
  //   });
  // }
  this.groupId = this.route.snapshot.paramMap.get('id')!;
  console.log("GROUP id:",this.groupId);
  // Fetch group details using the API
  this.dataService.getGroupDetailById(this.groupId).subscribe(
    (data) => {
      this.groupDetails = data;
      console.log('Group Detail:', this.groupDetails);
      this.groupName = this.groupDetails[0].name;
      this.membersNames = this.groupDetails[0].members.map((member: any) => member.username);
      console.log('Group Name:', this.groupName);
      console.log('Members Names:', this.membersNames);
    },
    (error) => {
      console.error('Error fetching group details:', error);
    }
  );
}
}
