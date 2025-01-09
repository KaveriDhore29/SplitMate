import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';

// Define the member type
interface Member {
  username: string;
  email: string;
}

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css'],
})
export class CreateGroupComponent implements OnInit {
  groupId: string | null = null;
  members: Member[] = [];
  groupName: string = '';
  groupType: string = 'Home';
  createdBy: Member = { username: '', email: '' };
  searchResults: any[] = [];
  searchQuery: string = '';
  joinedByLink: boolean = false;
  groupData: any;
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      this.createdBy = {
        username: userPayload.name,
        email: userPayload.email,
      };
      // Add logged-in user as the first member
      this.members.push({
        username: this.createdBy.username,
        email: this.createdBy.email,
      });
    }
    this.groupId = this.route.snapshot.paramMap.get('id');
    if (this.groupId) {
      // Fetch group details for editing
      this.dataService.getGroupDetailById(this.groupId).subscribe(
        (data) => {
          this.groupData = data;
          this.groupName = this.groupData[0].name;
          this.groupType = this.groupData[0].type;
          this.members = this.groupData[0].members;
          console.log('groupdata', this.groupData);
        },
        (error) => {
          console.error('Failed to fetch group details', error);
        }
      );
    }
  }

  addInputBox(): void {
    this.members.push({ username: '', email: '' });
  }

  removeInputBox(index: number): void {
    this.members.splice(index, 1);
  }

  onSearchUsername(): void {
    if (this.searchQuery.length > 0) {
      this.fetchSearchResults(this.searchQuery);
    } else {
      this.searchResults = []; // Clear results if query is empty
    }
  }

  fetchSearchResults(query: string): void {
    this.http
      .get<any[]>(
        `http://localhost:3000/api/search-users-by-username?query=${query}`
      )
      .subscribe(
        (results) => {
          this.searchResults = results;
        },
        (error) => {
          console.error('Error fetching search results:', error);
        }
      );
  }

  selectMember(selectedUser: {
    userId?: string;
    username: string;
    email: string;
  }): void {
    // Check if the user is already in the members list
    const existingMember = this.members.find(
      (member) => member.username === selectedUser.username
    );

    // Add the user if not already present and not the creator
    if (!existingMember && selectedUser.username !== this.createdBy.username) {
      this.members.push({
        username: selectedUser.username || selectedUser.email,
        email: selectedUser.email,
      });
    }

    // Clear the search field and results
    this.searchQuery = '';
    this.searchResults = [];
  }

  addNonExistentUser(): void {
    // Add the user entered in the search query as a member
    if (this.searchQuery.trim()) {
      const existingMember = this.members.find(
        (member) => member.username === this.searchQuery.trim()
      );

      if (!existingMember) {
        this.members.push({
          username: this.searchQuery.trim(), // Using email as username since there's no username
          email: this.searchQuery.trim(),
        });
        this.openModal(
          'Member Added',
          `Added ${this.searchQuery.trim()} as a new member.`
        );
      } else {
        this.openModal('Duplicate Member', 'This user is already added.');
      }

      // Clear the search field and results
      this.searchQuery = '';
      this.searchResults = [];
    } else {
      this.openModal('Invalid Input', 'Please enter a username to add.');
    }
  }

  removeMember(index: number): void {
    this.members.splice(index, 1);
  }

  saveGroup(): void {
    if (
      !this.groupName.trim() ||
      !this.createdBy.username ||
      !this.createdBy.email
    ) {
      this.openModal(
        'Missing Information',
        'Please fill the required details.'
      );
      return;
    }

    const groupData = {
      groupName: this.groupName,
      groupType: this.groupType,
      groupId: this.groupId,
      members: [
        ...this.members.map((member) => ({
          username: member.username,
          email: member.email,
          joinedByLink: this.joinedByLink,
        })),
      ],
      createdBy: this.createdBy,
    };

    this.http
      .post('http://localhost:3000/api/create-group', groupData, {
        withCredentials: true,
      })
      .subscribe(
        (response) => {
          this.openModal('Success', 'Group created successfully!');
          this.router.navigate(['dashboard/all-groups']);
        },
        (error) => {
          this.openModal('Error', 'Failed to create group.');
        }
      );
  }

  openModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true; 
  }
}
