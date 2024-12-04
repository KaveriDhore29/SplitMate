import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit{
  groupId !: string;
  groupDetails: any;
  groupName : string ='';
  membersNames: any[] = [];
  showPopup: boolean = false;
  showAddmembersPopup: boolean = false;
  username: string='';

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    
    this.route.paramMap.subscribe(params => {
      const newGroupId = params.get('id');
      if (newGroupId) {
        this.groupId = newGroupId;
        this.loadGroupDetails();
      this.getUserFromSessionStorage();
      this.senddata();
      }
    });
  
  }


  loadGroupDetails(): void {
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Specific Group Detail by Id:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username, 
          email: member.email
        }));
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }
  getUserFromSessionStorage() {
    const userString = sessionStorage.getItem('loggedInUser');
    if (userString) {
      const user = JSON.parse(userString);
      this.username = user.given_name;
      console.log("heheh"+ this.username);
      
    }
  }
  calculateTotalExpenses(): void {
  }

  calculateTotalOwed(expenses: any[]): number {
    // Implement your specific logic to calculate total amount owed
    // This is a placeholder and should be replaced with your actual business logic
    return expenses.reduce((total, expense) => {
      // Example simplified calculation
      return total + (expense.amount / expense.members.length);
    }, 0);
  }
  senddata(){
    
  }
}


  

