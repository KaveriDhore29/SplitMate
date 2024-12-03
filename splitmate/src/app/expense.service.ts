import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses: any[] = [];

 
  getExpenses(): any[] {
    return this.expenses;
  }

 
  addExpense(newExpense: any): void {
    this.expenses.push(newExpense);
  }

 
  setExpenses(expenses: any[]): void {
    this.expenses = expenses;
  }
 
}
