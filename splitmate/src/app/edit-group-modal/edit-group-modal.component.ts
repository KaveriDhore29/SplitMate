import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';


@Component({
  selector: 'app-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.css']
})
export class EditGroupModalComponent{

 @Output() closeAddMemberPopup = new EventEmitter<void>();
 @Input() groupId!: string;
 memberToAdd: { email: string }[] = [];
 newEmail: string = '';
 errorMessage = '';
 @Output() onMemberAdd = new EventEmitter<any>();

 constructor(private dataService:DataService){}

 addMembers(){
   console.log(this.memberToAdd,"Adding to group");
   if(this.memberToAdd.length == 0){
    this.errorMessage = 'Email cannot be empty'
    setTimeout(()=>{
      this.errorMessage = ''  
    },3000);
  
   }
   this.dataService.addMembersToGroup(this.memberToAdd,this.groupId).subscribe(
    response => {
      console.log('Members successfully added:', response);
      this.onMemberAdd.emit();
      alert(this.memberToAdd[0].email+" added in group");
      this.closeAddMemberPopup.emit(); // Close the modal
    },
    error => {
      console.error('Error adding expense:', error);
      // alert('Failed to add members. Please try again.');
    }
  );
 }

 addInputBox(): void {
  console.log("add");
  
  this.memberToAdd.push({ email: '' });
}
removeInputBox(index: number): void {
  this.memberToAdd.splice(index, 1);
}

close(){
  this.closeAddMemberPopup.emit();
 }

 addChip(): void {
   // Add email only if valid and not empty
   if (this.newEmail.trim() && this.isValidEmail(this.newEmail)) {
     this.memberToAdd.push({ email: this.newEmail.trim() });
     this.newEmail = ''; // Clear the input field
   } else {
     alert('Please enter a valid email!');
   }
 }

 removeChip(index: number): void {
   this.memberToAdd.splice(index, 1); // Remove chip at the specified index
 }



 isValidEmail(email: string): boolean {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
 }


}
