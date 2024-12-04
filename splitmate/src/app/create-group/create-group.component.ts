import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {
  members = [{ username: '', email: '' }]; // Holds additional members
  groupName: string = '';
  groupType: string = 'Home';
  createdBy = { username: '', email: '' }; // Stores logged-in user info
  searchResults: any[] = []; // Stores search results
  searchQuery: string = ''; // Current search query
  joinedByLink: boolean = false;

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit(): void {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      this.createdBy = {
        username: userPayload.name,
        email: userPayload.email,
      };
    }
  }

  // Add a new member input box
  addInputBox(): void {
    this.members.push({ username: '', email: '' });
  }

  // Remove a member input box
  removeInputBox(index: number): void {
    this.members.splice(index, 1);
  }

  // Trigger search for matching usernames
  onSearchUsername(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.fetchSearchResults(input.value);
    } else {
      this.searchResults = [];
    }
  }

  // Fetch matching users from the backend
  fetchSearchResults(query: string): void {
    this.http.get<any[]>(`http://localhost:3000/api/search-users-by-username?query=${query}`).subscribe(
      (results) => {
        this.searchResults = results;
      },
      (error) => {
        console.error('Error fetching search results:', error);
      }
    );
  }

  // Select member from search results
  selectMember(selectedUser: { userId: string; username: string; email: string }, index: number): void {
    this.members[index].username = selectedUser.username;
    this.members[index].email = selectedUser.email;
  }

  // Handle group name input change
  onGroupNameInput(): void {
    console.log('Group Name Input Changed:', this.groupName);
  }

  // Save the group
  saveGroup(): void {
    if (!this.groupName.trim() || !this.createdBy.username || !this.createdBy.email) {
      alert('Please fill the required details');
      return;
    }

    const groupData = {
      groupName: this.groupName,
      groupType: this.groupType,
      members: [
        {
          username: this.createdBy.username,
          email: this.createdBy.email,
          joinedByLink: false,
        },
        ...this.members.map((member) => ({
          username: member.username,
          email: member.email,
          joinedByLink: this.joinedByLink,
        })),
      ],
      createdBy: this.createdBy,
    };

    this.http.post('http://localhost:3000/api/create-group', groupData, { withCredentials: true }).subscribe(
      (response) => {
        alert('Group created successfully!');
        this.router.navigate(['dashboard/group-detail']);
      },
      (error) => {
        console.error('Error creating group:', error);
      }
    );
  }
}
