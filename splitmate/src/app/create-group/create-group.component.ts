import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  // Define members as an array of Member objects
  members: Member[] = []; // Now explicitly typed
  groupName: string = '';
  groupType: string = 'Home';
  createdBy: Member = { username: '', email: '' }; // Typed createdBy object
  searchResults: any[] = [];
  searchQuery: string = '';
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
      // Add logged-in user as the first member
      this.members.push({
        username: this.createdBy.username,
        email: this.createdBy.email,
      });
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
    userId: string;
    username: string;
    email: string;
  }): void {
    // Prevent adding the logged-in user again
    if (selectedUser.username !== this.createdBy.username) {
      const existingMember = this.members.find(
        (member) => member.username === selectedUser.username
      );
      if (!existingMember) {
        this.members.push({
          username: selectedUser.username,
          email: selectedUser.email,
        });
      }
    }
    this.searchQuery = ''; // Clear search field after selection
    this.searchResults = []; // Clear suggestions after selection
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

    this.http
      .post('http://localhost:3000/api/create-group', groupData, {
        withCredentials: true,
      })
      .subscribe(
        (response) => {
          alert('Group created successfully!');
          this.router.navigate(['dashboard/all-groups']);
        },
        (error) => {
          console.error('Error creating group:', error);
        }
      );
  }
}
