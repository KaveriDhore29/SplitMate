import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.css'],
})
export class MyGroupsComponent implements OnInit {
  currentSection: string = 'dashboard/main-dashboard';
  groupDetails: any;
  currentGroupId!: any;
  groupIds = [];
  responseOftotalOwed: any;
  isOptionsMenuOpen = false;
  openGroupId: any;

  isLoading: boolean = true;

  constructor(
    private router: Router,
    public dataService: DataService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  // ngOnInit(): void {
  //   this.currentGroupId = this.route.snapshot.paramMap.get('id')!;
  //   this.groupDetails = this.dataService.getGroupDetails().subscribe(
  //     (data: any[]) => {
  //       this.groupDetails = data;
  //       this.groupIds = this.groupDetails.map((group: any) => group.groupId);
  //       this.groupDetails.forEach((group: any) => {
  //         group.isOptionsMenuOpen = false;
  //       });
  //     },

  //     (error) => {
  //       console.error('Error fetching group details:', error);
  //     }
  //   );

  //   this.dataService.totalOwed(this.groupIds).subscribe((data: any[]) => {
  //     this.responseOftotalOwed = data;
  //     console.log(this.responseOftotalOwed, 'totalowed');
  //   });
  // }

  ngOnInit(): void {
    this.currentGroupId = this.route.snapshot.paramMap.get('id')!;
    this.groupDetails = this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;
        this.groupIds = this.groupDetails.map((group: any) => group.groupId);
        this.groupDetails.forEach((group: any) => {
          group.isOptionsMenuOpen = false;
        });
        this.isLoading = false; // Data is loaded, hide loader
      },
      (error) => {
        console.error('Error fetching group details:', error);
        this.isLoading = false; // In case of error, hide loader
      }
    );

    this.dataService.totalOwed(this.groupIds).subscribe((data: any[]) => {
      this.responseOftotalOwed = data;
      // console.log(this.responseOftotalOwed, 'totalowed');
    });
  }

  onGroupClick(groupId: any) {
    this.router.navigate([`/dashboard/group-detail/${groupId}`]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // If the click target is not part of the options menu or the dots icon, close the menu
    const target = event.target as Element; // Cast to Element
    const clickedInsideMenu = target.closest('.our-team');
    if (!clickedInsideMenu) {
      this.closeAllOptionsMenus();
    }
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
    // console.log('Switching to section:', section);
    this.currentSection = section;
    this.router.navigate([`/dashboard/${section}`]);
  }

  showGroupDetails(group: any): void {
    // console.log('Group Details:', group);
  }

  toggleOptionsMenu(group: any): void {
    if (this.openGroupId === group.groupId) {
      this.closeAllOptionsMenus(); // If the same group is clicked again, close the menu
    } else {
      this.openGroupId = group.groupId;
      group.isOptionsMenuOpen = true; // Open the options menu for the clicked group
    }
  }

  // Close all options menus
  closeAllOptionsMenus(): void {
    this.groupDetails.forEach((group: any) => {
      group.isOptionsMenuOpen = false; // Close the menu for each group
    });
    this.openGroupId = null; // Reset the open group ID
  }

  editGroup(group: any) {
    // console.log('Edit Group Details clicked', group);
    this.router.navigate([`create-group/${group.groupId}`]);
  }

  deleteGroup(group: any) {
    const groupId = group.groupId;
    const members = group.members;

    if (!groupId) {
      console.error('groupId is undefined. Cannot delete group.');
      return;
    }

    if (!members || members.length === 0) {
      // console.log('No members provided for deletion.');
      return;
    }

    this.dataService.deleteGroup(groupId, members).subscribe(
      (response) => {
        // console.log('API Response:', response);

        if (response.success) {
          // Remove the deleted group from the frontend
          const index = this.groupDetails.findIndex(
            (g: any) => g.groupId === groupId
          );
          if (index !== -1) {
            this.groupDetails.splice(index, 1);
            // console.log('Deleted Group from frontend:', group);
          }
        } else {
          console.error('Backend responded with failure:', response.message);
        }
      },
      (error) => {
        console.error('Error deleting group from backend:', error);
      }
    );
  }

  navigateToCreateGroup(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['create-group']);
  }

  // deleteGroup(group:any) {

  //   //below part when response from api will come
  //   const index = this.groupDetails.findIndex((g:any) => g.groupId === group.groupId);
  //   if (index !== -1) {
  //     this.groupDetails.splice(index, 1);
  //     console.log('Deleted Group:', group);
  //   }
  // }

  // deleteGroup(group: any) {
  //   const groupId = group.groupId;
  //   console.log(groupId);
  //   const members = group.members;
  //   console.log(members);

  //   if (!members || members.length === 0) {
  //     console.log('No members provided for deletion.');
  //     return;
  //   }

  //   this.dataService.deleteGroup(groupId, members).subscribe(
  //     (response) => {
  //       const index = this.groupDetails.findIndex(
  //         (g: any) => g.groupId === groupId
  //       );
  //       if (index !== -1) {
  //         this.groupDetails.splice(index, 1);
  //         console.log('Deleted Group:', group);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error deleting group:', error);
  //     }
  //   );
  // }

  // deleteGroup(group: any) {
  //   console.log('Group to be deleted:', group);

  //   const groupId = group.groupId;
  //   const members = group.members;

  //   if (!groupId) {
  //     console.error('groupId is undefined. Cannot delete group.');
  //     return;
  //   }

  //   if (!members || members.length === 0) {
  //     console.log('No members provided for deletion.');
  //     return;
  //   }

  //   this.dataService.deleteGroup(groupId, members).subscribe(
  //     (response) => {
  //       console.log('API Response:', response);

  //       if (response.success) {
  //         const index = this.groupDetails.findIndex(
  //           (g: any) => g.groupId === groupId
  //         );
  //         if (index !== -1) {
  //           this.groupDetails.splice(index, 1);
  //           console.log('Deleted Group from frontend:', group);
  //         }
  //       } else {
  //         console.error('Backend responded with failure:', response.message);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error deleting group from backend:', error);
  //     }
  //   );
  // }
}
