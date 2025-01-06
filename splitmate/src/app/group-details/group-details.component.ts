import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css'],
})
export class GroupDetailsComponent implements OnInit {
  groupId!: string;
  groupDetails: any;
  groupName: string = '';
  membersNames: any[] = [];
  groupCreatedBy = {username : '',email:''};
  groupCreatedAt : any;
  showPopup: boolean = false;
  showSettleUpPopup = false;
  showAddmembersPopup: boolean = false;
  // responseOftotalOwed : any;
  groupIds = [];
  groupExpenses: any;
  groupExpensesArray: any;
  activeTab: string = 'expenses';
  transactions: { from: ''; to: ''; amount: number; currency: '' }[] = [];
  owedExpenses: any[] = [];
  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  borrowedExpenses = [
    { title: 'Dinner with friends', amount: 50, date: '2024-12-12' },
    { title: 'Concert ticket', amount: 80, date: '2024-12-10' },
    { title: 'Grocery shopping', amount: 30, date: '2024-12-08' },
  ];
  groupSettlements: any;

  selectedExpense: any = null;
  isSaveDisabled: boolean = false;
  @Output() onAddExpense = new EventEmitter<void>();
  @Output() closePopup = new EventEmitter<void>();

    
  expense = {
    title: '',
    currency: 'INR',
    amount: '',
    paidBy: this.dataService.currentUserEmail.email, 
    equally: true, 
    selectedMembers: [] as string[],
    splitBy:'equally'
  };
  groupMembersEmails : any;
  memberShares: { [email: string]: number } = {};
  memberPercentages: { [email: string]: number } = {};

  memberExpense : [{email:string,divison:number}] = [{email:'',divison:1}];

  openExpenseModal(expense: any) {
    this.selectedExpense = expense;
  }

  addExpenseData(selectedExpense: any): void {
    this.isSaveDisabled = true;

    this.expense.title = 'settlment';
    this.expense.amount = selectedExpense.owesAmount;
    this.expense.selectedMembers.push(selectedExpense.to);

  let membersToUse: string[] = [];
  if (this.expense.splitBy === 'equally') {
    membersToUse = this.expense.selectedMembers || [];
  } else {
    membersToUse = this.groupMembersEmails || []; // Assume all members are stored in `this.groupMembers`
  }

  // Create member data
  let memberData = membersToUse.map(memberEmail => {
    let division = 1; // Default division for 'equally'

    return {
      person: memberEmail,
      division: division
    };
  }); 

    const expenseData = {
      paidBy: this.expense.paidBy,
      paidByName: this.membersNames.find(
        member => member.email === this.expense.paidBy
      )?.name, // Get the name of the payer
      members: memberData,
      amount: { value: this.expense.amount, currency: this.expense.currency },
      simplifyCurrency: this.expense.currency,
      splitBy: this.expense.splitBy, 
      title: this.expense.title,
      groupId: this.groupId,
      groupName: this.groupDetails[0]?.name || 'Unknown Group',
      createdBy : this.dataService.currentUserEmail ,
      expenseDate: new Date(),    //expense created by current user
    };
  
    console.log('Expense Data:', expenseData);
  
    // Call the service API to add the expense
    this.dataService.addExpenseService(expenseData).subscribe(
      response => {
        // console.log('Expense successfully added:', response);
       
        alert('Expense added successfully!');
        this.isSaveDisabled = false;
        this.onAddExpense.emit();
        this.closePopup.emit(); // Close the modal
        // console.log('Selected Split Option:', this.selectedSplitOption);
        // console.log('Member Shares:', this.memberShares);
        // console.log('Member Percentages:', this.memberPercentages);

      },
      error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }

  closeModal() {
    this.selectedExpense = null;
  }
  updates = [
    {
      person: 'Person 1',
      action: "added expense 'Dinner'",
      time: '2 hours ago',
    },
    {
      person: 'Person 2',
      action: 'settled up with Person 4',
      time: '1 day ago',
    },
    {
      person: 'Person 3',
      action: "added expense 'Groceries'",
      time: '3 days ago',
    },
    { person: 'Person 5', action: 'joined the group', time: '5 days ago' },
    {
      person: 'Person 6',
      action: 'removed expense "Lunch"',
      time: '7 days ago',
    },
  ];
  expenses = [
    {
      date: new Date(),
      title: 'Dinner',
      amount: 1500,
      paidBy: 'John Doe',
      borrowed: 500,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
    {
      date: new Date(),
      title: 'Groceries',
      amount: 3000,
      paidBy: 'Jane Smith',
      borrowed: 1200,
    },
  ];

  responseOftotalOwed:{myTotalBalance: number; owedBalance : number; owesBalance : number} = {  myTotalBalance: 0,
    owedBalance: 0,
    owesBalance: 0};

  constructor(private route: ActivatedRoute, public dataService: DataService,private router:Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
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
          email: member.email,
        }));
          this.groupCreatedBy = this.groupDetails[0].createdBy;
          this.groupCreatedAt = this.groupDetails[0].createdAt;

          console.log("details",  this.groupCreatedBy ,"[[",this.groupCreatedAt)
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );

    this.groupExpenses = this.dataService
      .getGroupExpenses(this.groupId)
      .subscribe((data: any[]) => {
        this.groupExpenses = data;
        console.log('expense', this.groupExpenses);
        this.groupExpensesArray = this.groupExpenses.expenses;
      });

    this.dataService.grpTotalOwed(this.groupId).subscribe(
      (owedData: any) => {
        this.responseOftotalOwed = owedData;
        console.log(this.responseOftotalOwed, 'totalowed');
      },
      (error) => {
        console.error('Error loading details from API:', error);
      }
    );

    this.dataService.grpBalance(this.groupId).subscribe(
      (data: any) => {
        this.groupSettlements = data;
        console.log(this.groupSettlements, 'groupSettlements');
      },
      (error) => {
        console.error('Error loading details from API:', error);
      }
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  showOwedExpenses(): void {
    this.showSettleUpPopup = true;

    //from matlab mein owe kr rhi hu
    this.owedExpenses = this.transactions.filter(
      (transaction) =>
        transaction.from === this.dataService.currentUserEmail.email
    );
    console.log('Owed Expenses', this.owedExpenses);
  }

  deleteExpense(expense: any): void {
    this.expenses = this.expenses.filter((e) => e !== expense);
    this.selectedExpense = null; // Close modal after deletion
  }

  editGroup(): void {
    this.router.navigate([`/create-group/${this.groupId}`]);
  }

  settleExpense(): void{
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Specific Group Detail by Id:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username,
          email: member.email,
        }));
        //  this.groupExpenses = this.groupDetails[0].transactions;
        // this.transactions = this.groupDetails[0].latestTransactions;
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }
}
