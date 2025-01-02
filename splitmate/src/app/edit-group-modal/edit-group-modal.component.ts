import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.css']
})
export class EditGroupModalComponent{

 @Output() closeAddMemberPopup = new EventEmitter<void>();
 @Input() groupId!: string;
 memberToAdd: { email: string, username:string }[] = [];
 newEmail: string = '';
 errorMessage = '';
 @Output() onMemberAdd = new EventEmitter<any>();
 searchResults: any[] = [];
 searchQuery: string = '';
 members : any;
 groupDetails : any;   //for extracting members
 newmemberToAdd: { email: string, username:string }[] = [];

 constructor(private dataService:DataService,public http:HttpClient){}

 ngOnInit():void{
  this.dataService.getGroupDetailById(this.groupId).subscribe(
    (data) => {
      this.groupDetails = data;
      console.log('Specific Group Detail by Id in modal:', this.groupDetails);
      this.memberToAdd = this.groupDetails[0].members.map((member: any) => ({
        username: member.username, 
        email: member.email
      }));
    },
    (error) => {
      console.error('Error fetching group details:', error);
    }
  );
 }


removeInputBox(index: number): void {
  this.memberToAdd.splice(index, 1);
}

close(){
  this.closeAddMemberPopup.emit();
 }

 addChip(): void {
  if (this.newEmail.trim()) {
    const existingMember = this.memberToAdd.find(
      (member) => member.email === this.newEmail.trim()
    );
    const newMember = { email: this.newEmail.trim(),username:'' };
    
    // // Add to the new members list only
    // this.newmemberToAdd.push(newMember);
    
    // // Optionally add it to the UI list (if you want to display it there too)
    // this.memberToAdd.push(newMember);
    

    if (!existingMember) {
      this.memberToAdd.push({ email: this.newEmail.trim(),username: ''});
      this.newmemberToAdd.push(newMember);
      this.errorMessage = '';
    } else {
      this.errorMessage = 'This member is already added.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);  // 3000ms = 3 seconds
    
    }
  } else {
    this.errorMessage = 'Please enter a valid email.';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);  // 3000ms = 3 seconds
  
  }

  this.newEmail = ''; // Clear the input field
}

removeChip(index: number): void {
  this.newmemberToAdd.splice(index, 1);
  
  // Remove from the UI list
  this.memberToAdd.splice(index, 1);
}


 isValidEmail(email: string): boolean {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
 }

 onSearchUsername(): void {
  if (this.newEmail.trim()) {
    this.fetchSearchResults(this.newEmail.trim());
  } else {
    this.searchResults = []; // Clear results if input is empty
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

selectMember(selectedUser: { username: string; email: string }): void {
  // Check if the user is already added
  const existingMember = this.memberToAdd.find(
    (member) => member.email === selectedUser.email
  );

  if (!existingMember) {
    this.memberToAdd.push({
      username: selectedUser.username || '', // Use username if available
      email: selectedUser.email,
    });
    this.newmemberToAdd.push({
      username: selectedUser.username || '', // Use username if available
      email: selectedUser.email,
    });
    this.errorMessage = ''; // Clear error message if any
  } else {
    this.errorMessage = 'This member is already added.';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);  // 3000ms = 3 seconds
   
  }

  // Clear input and search results
  this.newEmail = '';
  this.searchResults = [];
}

addNonExistentUser(): void {
  if (this.newEmail.trim()) {
    const existingMember = this.memberToAdd.find(
      (member) => member.email === this.newEmail.trim()
    );

    if (!existingMember) {
      this.memberToAdd.push({
        username: '', // No username for new user
        email: this.newEmail.trim(),
      });
      this.errorMessage = ''; // Clear any error message
    } else {
      this.errorMessage = 'This member is already added.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);  // 3000ms = 3 seconds
    
    }

    // Clear input
    this.newEmail = '';
  } else {
    this.errorMessage = 'Please enter an email to add.';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);  // 3000ms = 3 seconds
  
  }
}

addMembers(): void {
 
console.log(this.newmemberToAdd,"adding members");
  if (this.newmemberToAdd.length > 0) {
    this.dataService.addMembersToGroup(this.newmemberToAdd, this.groupId).subscribe(
      (response) => {
        alert(`${this.newmemberToAdd.length} member(s) added successfully!`);
        this.newmemberToAdd = []; // Clear new members list after success
        this.memberToAdd = []; // Optional: Clear UI list
        this.closeAddMemberPopup.emit(); // Close modal
        this.onMemberAdd.emit();
      },
      (error) => {
        console.error('Error adding new members:', error);
        alert('Failed to add new members. Please try again.');
      }
    );
  } else {
    alert('Please add new members first or unknown error');
  }

}

}
