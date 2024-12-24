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
  
  members: Member[] = []; 
  groupName: string = '';
  groupType: string = 'Home';
  createdBy: Member = { username: '', email: '' }; 
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
        username: selectedUser.username,
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
          username: this.searchQuery.trim(),
          email: '', // Email can be left empty or collected later
        });
        alert(`Added ${this.searchQuery.trim()} as a new member.`);
      } else {
        alert('This user is already added.');
      }

      // Clear the search field and results
      this.searchQuery = '';
      this.searchResults = [];
    } else {
      alert('Please enter a username to add.');
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
