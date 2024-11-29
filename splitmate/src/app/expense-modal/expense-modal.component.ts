import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';


@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.css']
})
export class ExpenseModalComponent implements OnInit {
  @Input() membersNames: { name: string; email: string }[] = [];
  @Input() groupId!: string;
  @Output() closePopup = new EventEmitter<void>();
  selectedSplitOption: string = '';
  @Input() groupDetails !: any;

  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  
  expense = {
    title: '',
    currency: 'INR',
    amount: 0,
    paidBy: this.dataService.currentUserEmail.email, 
    equally: true, 
    selectedMembers: [] as string[],
    splitBy:''
  };

  memberShares: { [email: string]: number } = {};
  memberPercentages: { [email: string]: number } = {};

  constructor(private route: ActivatedRoute, public dataService: DataService) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    const currentUser = this.membersNames.find(
      (member) => member.email === this.dataService.currentUserEmail
    );
  
    // Pre-select the current user's email for the dropdown
    if (currentUser) {
      this.expense.paidBy = currentUser.email; // Set the email of the current user
      console.log("Default selected user:", currentUser.name);
    } else {
      console.error("Current user not found in members list!");
    }

    // if (this.expense.equally) {
    //   this.toggleEqually();
    // }
  }

  // toggleEqually(): void {
  //   console.warn("intogle")
  //   if (this.expense.equally) {
  //     console.log("in iffffffffffff");
      
  //           this.expense.selectedMembers = this.membersNames.map(member => member.email);
  //   } else {
  //     console.log("in elsee");
  //     this.expense.selectedMembers = [];
  //   }
  // }

  toggleMemberSelection(memberEmail: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.expense.selectedMembers.push(memberEmail);
    } else {
      this.expense.selectedMembers = this.expense.selectedMembers.filter(
        email => email !== memberEmail
      );
    }
  }

  onSplitOptionChange(option: string): void {
    this.selectedSplitOption = option; // Set the selected split option
    this.expense.splitBy = option; // Store the selected split option in expense data
    this.expense.selectedMembers = []; // Reset selected members for each option
    
    // Initialize shares or percentage fields when needed
    if (option === 'percentage') {
      this.initializePercentageFields();
    } else if (option === 'shares') {
      this.initializeSharesFields();
    }else if (option === 'equally') {
      this.selectAllMembers(); // Select all members when "Equally" is clicked
    }
  }

  selectAllMembers(): void {
    this.expense.selectedMembers = this.membersNames.map(member => member.email); // Select all members
  }

  // To check if all members are selected
isAllSelected(): boolean {
  return this.membersNames.every(member => this.expense.selectedMembers.includes(member.email));
}

// To handle the "Select All" toggle
toggleSelectAll(event: Event): void {
  const isChecked = (event.target as HTMLInputElement).checked;
  if (isChecked) {
    // Select all members
    this.expense.selectedMembers = this.membersNames.map(member => member.email);
  } else {
    // Deselect all members
    this.expense.selectedMembers = [];
  }
}


  initializePercentageFields(): void {
    this.memberPercentages = {}; // Reset
    this.membersNames.forEach(member => {
      this.memberPercentages[member.email] = 0; // Initialize to 0
    });
  }

  initializeSharesFields(): void {
    this.memberShares = {}; // Reset
    this.membersNames.forEach(member => {
      this.memberShares[member.email] = 0; // Initialize to 0
    });
  }

  addExpenseData(): void {
    const expenseData = {
      paidBy: this.expense.paidBy,
      members: this.expense.selectedMembers,
      Amount: { value: this.expense.amount, currency: this.expense.currency },
      simplifyCurrency: this.expense.currency,
      splitBy: this.expense.equally ? 'equally' : 'manually',
      title: this.expense.title,
      groupId: this.groupId
    };

    console.log('Expense Data:', expenseData);

    // Call the service API to add the expense
    this.dataService.addExpenseService(expenseData).subscribe(
      response => {
        console.log('Expense successfully added:', response);
        alert('Expense added successfully!');
        this.closePopup.emit(); 
      },
      error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }

  closeSplitOptions(): void {
    this.selectedSplitOption = ''; // Reset the split option to hide the div
  }

  close(): void {
    this.closePopup.emit();
  }
}
