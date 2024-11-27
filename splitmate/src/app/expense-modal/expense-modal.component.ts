import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.css']
})
export class ExpenseModalComponent {
  @Input() membersNames:{ name: string; email: string }[] = []; 
  @Input() groupId !: string;
  @Output() closePopup = new EventEmitter<void>();
  expenseDataPaidBy = this.dataService.currentUserEmail;
  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  expense = {
    title: '',
    currency: 'INR',
    amount: 0,
    paidBy: this.dataService.currentUserEmail, // Default to current user
    equally: true, // Default to true
    selectedMembers: [] as string[]
  };


  constructor(private route: ActivatedRoute, private dataService: DataService){}


  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    console.log("GROUP Id:",this.groupId);
 
  }

  

  toggleEqually(): void {
    if (this.expense.equally) {
      this.expense.selectedMembers = this.membersNames.map(member => member.email);
    } else {
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

    console.log(expenseData);
    

    // Call the service API
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