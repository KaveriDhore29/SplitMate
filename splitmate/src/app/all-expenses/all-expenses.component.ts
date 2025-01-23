import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'all-expenses-list',
  templateUrl: './all-expenses.component.html',
  styleUrls: ['./all-expenses.component.css'],
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  groupIds: string[] = []; // To store the groupIds dynamically
  isLoading: boolean = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchExpenses();
    // Fetch group details which contains groupIds
    this.dataService.getGroupDetails().subscribe(
      (groupDetails: any[]) => {
        // Extract the groupIds from the group details response
        this.groupIds = groupDetails.map((group) => group.groupId);

        // Now that we have the groupIds, fetch expenses for those groups
        this.dataService.getAllExpense(this.groupIds).subscribe(
          (data) => {
            this.expenses = data.expenses; // Set the expenses data
          },
          (error) => {
            console.error('Error fetching expenses:', error); // Handle error
          }
        );
      },
      (error) => {
        console.error('Error fetching group details:', error); // Handle error
      }
    );
  }

  fetchExpenses(): void {
    this.isLoading = true;
    this.dataService.getGroupDetails().subscribe(
      (groupDetails: any[]) => {
        this.groupIds = groupDetails.map((group) => group.groupId);

        this.dataService.getAllExpense(this.groupIds).subscribe(
          (data) => {
            // Add `open: false` for all expenses
            this.expenses = data.expenses.map((expense: any) => ({
              ...expense,
              open: false, // Initialize the `open` state for all expenses
            }));
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching expenses:', error);
            this.isLoading = false;
          }
        );
      },
      (error) => {
        console.error('Error fetching group details:', error);
        this.isLoading = false;
      }
    );
  }

  toggleAccordion(id: number): void {
    this.expenses = this.expenses.map((expense) => {
      const isToggled = expense.id === id ? !expense.open : false;
      // console.log(`Expense ID: ${expense.id}, Open: ${isToggled}`);
      return {
        ...expense,
        open: isToggled,  
      };
    });
    // console.log('Updated Expenses:', this.expenses);
  }
}
