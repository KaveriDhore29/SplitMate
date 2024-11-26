import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.css']
})
export class ExpenseModalComponent implements OnInit {
  @Input() membersNames: string[] = [];
  expense = {
    title: '',
    currency: 'USD',
    amount: 0,
    selectedMembers: []
  };

  saveExpense() {
    console.log('Expense saved:', this.expense);
    // Add your save logic here, such as sending data to the backend.
  }
  constructor() { }

  ngOnInit(): void {
  }

}
