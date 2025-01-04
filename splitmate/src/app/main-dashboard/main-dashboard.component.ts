import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';

// Register the necessary components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,  // Register the Bar Element
  Title,
  Tooltip,
  Legend,
  BarController // Register the Bar Controller
);

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  userProfile: any;
  groupMessage = "Currently, you're not part of any group. Join a group to start managing and splitting expenses with friends!";
  responseOftotalOwed = { myTotalBalance: 0, owedBalance: 0, owesBalance: 0 };
  groupDetails: any;
  groupIds: string[] = [];
  expenseData: any[] = [];
  chartData: any = {};
  private expenseChart: Chart | null = null; // Track the chart instance

  constructor(private router: Router, public authService: AuthService, public dataService: DataService) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");

    this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data;
        this.groupIds = this.groupDetails.map((group: any) => group.groupId);

        // Fetch data for expenses and chart
        this.fetchExpensesData();
        this.fetchChartData();
        this.fetchTotalOwedData();
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }

  fetchExpensesData(): void {
   this.dataService.getGroupDetails().subscribe(
      (groupDetails: any[]) => {
        // Extract the groupIds from the group details response
        this.groupIds = groupDetails.map(group => group.groupId); 


        this.createExpenseChart();
      },
      (error) => {
        console.error('Error fetching expenses data:', error);
      }
    );
  }

  fetchChartData(): void {
    this.dataService.getChartData(this.groupIds).subscribe(
      (chartData: any) => {
        this.chartData = chartData;
        this.createExpenseChart();
      },
      (error) => {
        console.error('Error fetching chart data:', error);
      }
    );
  }

  fetchTotalOwedData(): void {
    this.dataService.totalOwed(this.groupIds).subscribe(
      (owedData: any) => {
        this.responseOftotalOwed = owedData;
      },
      (error) => {
        console.error("Error loading details from API:", error);
      }
    );
  }

  createExpenseChart(): void {
    if (this.expenseChart) {
      this.expenseChart.destroy(); // Destroy existing chart
    }

    if (!this.chartData || !this.chartData.groupExpenses || this.chartData.groupExpenses.length === 0) {
      console.warn('No expense data available to plot.');
      return;
    }

    const monthlyExpenses = new Map<string, number>();
    this.chartData.groupExpenses.forEach((expense: any) => {
      const expenseDate = new Date(expense.date);
      const formattedMonth = `${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`;
      const expenseAmount = parseFloat(expense.amount) || 0;

      monthlyExpenses.set(
        formattedMonth,
        (monthlyExpenses.get(formattedMonth) || 0) + expenseAmount
      );
    });

    const labels = Array.from(monthlyExpenses.keys());
    const data = Array.from(monthlyExpenses.values());

    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (ctx) {
      this.expenseChart = new Chart(ctx, {
        type: 'bar', // Changed to 'bar' for a bar chart
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Monthly Expenses ($)',
              data: data,
              backgroundColor: 'rgba(16, 179, 51, 0.6)', // Bar color
              borderColor: 'rgb(38, 133, 35)',       // Bar border color
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Expense Breakdown',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `$${context.raw}`
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month/Year'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Amount ($)'
              },
              beginAtZero: true // Ensure Y-axis starts at 0
            }
          }
        }
      });
    } else {
      console.error('Canvas element not found. Ensure the template contains an element with id="expenseChart".');
    }
  }
}
