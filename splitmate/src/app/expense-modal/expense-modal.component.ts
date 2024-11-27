import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { log, warn } from 'console';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.css']
})
export class ExpenseModalComponent implements OnInit {
  @Input() membersNames: { name: string; email: string }[] = [];
  @Input() groupId!: string;
  @Output() closePopup = new EventEmitter<void>();

  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  
  expense = {
    title: '',
    currency: 'INR',
    amount: 0,
    paidBy: this.dataService.currentUserEmail.email, // Default to current user
    equally: true, // Default to true
    selectedMembers: [] as string[]
  };

  constructor(private route: ActivatedRoute, public dataService: DataService) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    console.log("GROUP Id:",this.expense);
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
  }

  toggleEqually(): void {
    console.warn("intogle")
    if (this.expense.equally) {
      console.log("in iffffffffffff");
      
            this.expense.selectedMembers = this.membersNames.map(member => member.email);
    } else {
      console.log("in elsee");
      this.expense.selectedMembers = [];
    }
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
        this.closePopup.emit(); // Close the popup
      },
      error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }

  close(): void {
    this.closePopup.emit();
  }
}
