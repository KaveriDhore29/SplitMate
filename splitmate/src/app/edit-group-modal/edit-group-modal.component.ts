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
 memberToAdd: { email: string }[] = [{ email: '' }];

 constructor(private dataService:DataService){}

 addMembers(){
   console.log(this.memberToAdd,"Adding to group");
   this.dataService.addMembersToGroup(this.memberToAdd,this.groupId).subscribe(
    response => {
      console.log('Members successfully added:', response);
      this.closeAddMemberPopup.emit(); // Close the modal
    },
    error => {
      console.error('Error adding expense:', error);
      alert('Failed to add members. Please try again.');
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
}
