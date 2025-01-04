import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'all-expenses-list',
  templateUrl: './all-expenses.component.html',
  styleUrls: ['./all-expenses.component.css'],
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  groupIds: string[] = [];  // To store the groupIds dynamically

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Fetch group details which contains groupIds
    this.dataService.getGroupDetails().subscribe(
      (groupDetails: any[]) => {
        // Extract the groupIds from the group details response
        this.groupIds = groupDetails.map(group => group.groupId); 

        // Now that we have the groupIds, fetch expenses for those groups
        this.dataService.getAllExpense(this.groupIds).subscribe(
          (data) => {
            this.expenses = data.expenses;  // Set the expenses data
          },
          (error) => {
            console.error('Error fetching expenses:', error);  // Handle error
          }
        );
      },
      (error) => {
        console.error('Error fetching group details:', error);  // Handle error
      }
    );
  }

  toggleAccordion(id: number): void {
    this.expenses = this.expenses.map((expense) =>
      expense.id === id ? { ...expense, open: !expense.open } : expense
    );
  }
}
