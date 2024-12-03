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
<<<<<<< HEAD
  username: string='';
  totalGroupExpenses: number = 0;
  totalAmountOwed: number = 0;
  value  :string='';
=======
  showAddmembersPopup: boolean = false;
>>>>>>> f43b67d0447429225cd083e62972622c8ecd600f

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
        console.log('Group Detail:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;

        // Update membersNames to include both name and email
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username,  // or use the appropriate field for the name
          email: member.email
        }));
        this.calculateTotalExpenses();
        console.log('Group Name:', this.groupName);
        console.log('Members Names:', this.membersNames);
        
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
    // Calculate total group expenses
    this.totalGroupExpenses = this.groupDetails[0].expenses.reduce(
      (total: number, expense: any) => total + expense.amount, 0
    );

    // Calculate total amount owed (example calculation)
    this.totalAmountOwed = this.calculateTotalOwed(this.groupDetails[0].expenses);
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


  

