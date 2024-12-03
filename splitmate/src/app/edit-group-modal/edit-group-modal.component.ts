import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.css']
})
export class EditGroupModalComponent{

 @Output() closeAddMemberPopup = new EventEmitter<void>();
 memberToAdd: { email: string }[] = [{ email: '' }];

 addMembers(){
   console.log(this.memberToAdd,"This person is getting added in the group") 
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
