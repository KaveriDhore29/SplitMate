import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {
  members = [
    { username: '', email: '' }
  ];
  groupName: string = '';
  groupType = 'Home';
  createdBy = { username: '', email: '' };
  searchResults: any[] = [];         // To store search results
  searchQuery: string = '';          // Current search query

  

  constructor(private http: HttpClient,public router:Router) {}

  ngOnInit(): void {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser); 
      this.createdBy = {
        username: userPayload.name, 
        email: userPayload.email 
      };
    }
  }

  // Add a new member input box
  addInputBox() {
    this.members.push({ username: '', email: '' });
  }

  // Remove a member input box
  removeInputBox(index: number) {
    this.members.splice(index, 1);
  }

  // Trigger search for matching usernames
  onSearchUsername(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.fetchSearchResults(input.value);
    } else {
      this.searchResults = []; // Clear results if query is empty
    }
  }

  // Fetch matching users from the backend
  fetchSearchResults(query: string): void {
    this.http.get<any[]>(`http://localhost:3000/api/search-users-by-username?query=${query}`).subscribe(
      results => {
        this.searchResults = results;
        console.log(this.searchResults,"searchresults");
      },
      error => {
        console.error('Error fetching search results:', error);
      }
    );
  }

  
// Select member from the search results using the user object
selectMember(selectedUser: { userId: string, username: string, email: string }, index: number): void {
  console.log(selectedUser);
  if (selectedUser) {
    // Set both the username and email based on the selected user data
    this.members[index].username = selectedUser.username;
    this.members[index].email = selectedUser.email;
  }
}



  // Handle changes in the group name
  onGroupNameInput(): void {
    console.log('Group Name Input Changed:', this.groupName);
  }

 
  saveGroup(): void {
   
    if(this.groupName.trim() == '' && this.members[0].username.trim() == '' && this.members[0].email.trim() == '' ){
      alert("Please fill the details");
    }
    else{
    const groupData = {
      groupName: this.groupName,
      groupType: this.groupType,
      members: this.members.map(member => ({
        username: member.username,
        email: member.email
      })),
      createdBy: this.createdBy
    };

   
     console.log(groupData,"groupData");
    // Send the POST request
    this.http.post('http://localhost:3000/api/create-group', groupData, { withCredentials: true }).subscribe(
      response => {
        console.log('Group created successfully:', response);
        alert('Group created successfully!');
        this.router.navigate(['dashboard/group-detail'])
      },
      error => {
        console.error('Error creating group from frontend:', error);
     
      }
    );
  }
  }

 

  

}
