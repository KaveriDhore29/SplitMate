import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  groupCreatedBy = {username : '',email:''};
  groupCreatedAt : any;
  showPopup: boolean = false;
  showSettleUpPopup = false;
  showAddmembersPopup: boolean = false;
  groupIds = [];
  groupExpenses : any;
  groupExpensesArray : any;
  activeTab: string = 'expenses'; 
  transactions :{from:'',to:'',amount:number;currency:''}[]=  [];
  owedExpenses :any[] = [];
  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  borrowedExpenses = [
    { title: 'Dinner with friends', amount: 50, date: '2024-12-12' },
    { title: 'Concert ticket', amount: 80, date: '2024-12-10' },
    { title: 'Grocery shopping', amount: 30, date: '2024-12-08' }
  ];

  selectedExpense: any = null;

  openExpenseModal(expense: any) {
    this.selectedExpense = expense;
  }

  closeModal() {
    this.selectedExpense = null;
  }
  updates = [
    { person: 'Person 1', action: "added expense 'Dinner'", time: '2 hours ago' },
    { person: 'Person 2', action: 'settled up with Person 4', time: '1 day ago' },
    { person: 'Person 3', action: "added expense 'Groceries'", time: '3 days ago' },
    { person: 'Person 5', action: 'joined the group', time: '5 days ago' },
    { person: 'Person 6', action: 'removed expense "Lunch"', time: '7 days ago' }
  ];
 
  constructor(private route: ActivatedRoute, public dataService: DataService,private router:Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newGroupId = params.get('id');
      if (newGroupId) {
        this.groupId = newGroupId;
        this.loadGroupDetails();
      }
    });
  

    this.groupDetails = this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;   
      this.groupIds = this.groupDetails.map((group: any) => group.groupId);
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );

   
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
          this.groupCreatedBy = this.groupDetails[0].createdBy;
          this.groupCreatedAt = this.groupDetails[0].createdAt;

          console.log("details",  this.groupCreatedBy ,"[[",this.groupCreatedAt)
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );

    this.groupExpenses =this.dataService.getGroupExpenses(this.groupId).subscribe(
      (data:any[]) =>{        
        this.groupExpenses = data;
        console.log("expense",this.groupExpenses);
        this.groupExpensesArray = this.groupExpenses.expenses;
      }
);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  showOwedExpenses(): void {
    this.showSettleUpPopup = true;

    //from matlab mein owe kr rhi hu
    this.owedExpenses = this.transactions.filter(transaction => transaction.from === this.dataService.currentUserEmail.email);
    console.log("Owed Expenses",this.owedExpenses)
  }

  deleteExpense(expense: any): void {

    this.selectedExpense = null; // Close modal after deletion
  }

  editGroup():void{
    this.router.navigate([`/create-group/${this.groupId}`]);
  }
}


  

