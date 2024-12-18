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
  selectedSplitOption: string = 'equally';
  @Input() groupDetails !: any;
  isSaveDisabled: boolean = false;
  @Output() onAddExpense = new EventEmitter<void>();

  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];


  
  expense = {
    title: '',
    currency: 'INR',
    amount: '',
    paidBy: this.dataService.currentUserEmail.email, 
    equally: true, 
    selectedMembers: [] as string[],
    splitBy:'equally'
  };

  memberShares: { [email: string]: number } = {};
  memberPercentages: { [email: string]: number } = {};

  constructor(private route: ActivatedRoute, public dataService: DataService) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    this.selectAllMembers();
  }



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

  isAllSelected(): boolean {
    return this.membersNames.every(member => this.expense.selectedMembers.includes(member.email));
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.expense.selectedMembers = this.membersNames.map(member => member.email);
    } else {
      this.expense.selectedMembers = [];
    }
  }


  initializePercentageFields(): void {
    this.memberPercentages = {}; 
    this.membersNames.forEach(member => {
      this.memberPercentages[member.email] = 0; 
    });
  }

  initializeSharesFields(): void {
    this.memberShares = {}; 
    this.membersNames.forEach(member => {
      this.memberShares[member.email] = 0; 
    });
  }


  addExpenseData(): void {
    const memberForEqualSplit = this.expense.selectedMembers.map(memberEmail => {
      return {
        person: memberEmail,
        division: this.expense.splitBy === 'equally' ? 1 : this.memberShares[memberEmail] || 1
      };
    });

    
  
    const expenseData = {
      paidBy: this.expense.paidBy,
      members: memberForEqualSplit,
      amount: { value: this.expense.amount, currency: this.expense.currency },
      simplifyCurrency: this.expense.currency,
      splitBy: this.expense.splitBy, 
      title: this.expense.title,
      groupId: this.groupId,
      createdBy : this.dataService.currentUserEmail     //expense created by current user
    };
  
    console.log('Expense Data:', expenseData);
  
    // Call the service API to add the expense
    this.dataService.addExpenseService(expenseData).subscribe(
      response => {
        console.log('Expense successfully added:', response);
        this.isSaveDisabled = true;
        alert('Expense added successfully!');
        this.onAddExpense.emit();
        this.closePopup.emit(); // Close the modal
      },
      error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }
  

  closeSplitOptions(): void {
    this.selectedSplitOption = '';
  }

  close(): void {
    this.closePopup.emit();
  }
}
