import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'all-expenses-list',
  templateUrl: './all-expenses.component.html',
  styleUrls: ['./all-expenses.component.css'],
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = []; 
  groupIds = ["61cda4df-8af8-49e7-9964-a8a6ae1cec91", "031cde3f-7843-4fe0-9188-3f2830ea06d3"]; // Example 

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Call the service to get expenses for multiple groups
    this.dataService.getExpensesForGroups(this.groupIds).subscribe(
      (data) => {
       
        this.expenses = data.expenses;  
      },
      (error) => {
        console.error('Error fetching expenses:', error); 
      }
    );
  }

  toggleAccordion(id: number): void {
    this.expenses = this.expenses.map((expense) =>
      expense.id === id ? { ...expense, open: !expense.open } : expense
    );
  }
}
