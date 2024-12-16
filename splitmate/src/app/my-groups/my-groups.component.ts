import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.css'],
})
export class MyGroupsComponent implements OnInit {
  currentSection: string = 'dashboard/main-dashboard';
  groupDetails: any;
  groupMembersName = [];
  currentGroupId!: any;
  groupIds = [];
  responseOftotalOwed: any;

  constructor(
    private router: Router,
    public dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentGroupId = this.route.snapshot.paramMap.get('id')!;
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

    this.dataService.totalOwed(this.groupIds).subscribe((data: any[]) => {
      this.responseOftotalOwed = data;
      console.log(this.responseOftotalOwed, 'totalowed');
    });
  }

  getInitials(name: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const context = canvas.getContext('2d');

    if (!context) {
      return '';
    }

    // Background color
    context.fillStyle = '#f8f8f8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text properties
    context.font = '64px Roboto, "Helvetica Neue", sans-serif'; // Adjust font size for better fit
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Generate initials
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Calculate canvas center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw initials at the center
    context.fillText(initials, centerX, centerY);

    return canvas.toDataURL();
  }

  setSection(section: string) {
    console.log('Switching to section:', section);
    this.currentSection = section;
    this.router.navigate([`/dashboard/${section}`]);
  }

  showGroupDetails(group: any): void {
    console.log('Group Details:', group);
  }
}
