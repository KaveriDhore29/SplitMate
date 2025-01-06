import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController, ArcElement, PieController } from 'chart.js';

// Register all necessary components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,  // Register the Bar Element for bar charts
  Title,
  Tooltip,
  Legend,
  BarController, // Register the Bar Controller
  ArcElement, // Register the Arc Element for pie charts
  PieController // Register the Pie Controller for pie charts
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
  private expenseChart: Chart | null = null; // Track the bar chart instance
  private categoryExpenseChart: Chart | null = null; // Track the pie chart instance

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
        this.createExpenseChart(); // Call the bar chart creation after fetching the data
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
        this.createExpenseChart(); // Create the monthly expense bar chart
        this.createCategoryExpenseChart(); // Create the category-wise expense pie chart
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

  // Function to create the Monthly Expense Bar Chart
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
        type: 'bar', // Use a bar chart for monthly expenses
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
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `$${context.raw}`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Month/Year' }
            },
            y: {
              title: { display: true, text: 'Amount ($)' },
              beginAtZero: true
            }
          }
        }
      });
    } else {
      console.error('Canvas element not found. Ensure the template contains an element with id="expenseChart".');
    }
  }

 // Function to create the Category-Wise Expense Pie Chart
createCategoryExpenseChart(): void {
  if (this.categoryExpenseChart) {
    this.categoryExpenseChart.destroy(); // Destroy existing chart
  }

  if (!this.chartData || !this.chartData.categoryExpenses || this.chartData.categoryExpenses.length === 0) {
    console.warn('No category expense data available to plot.');
    return;
  }

  const categoryLabels: string[] = this.chartData.categoryExpenses.map((item: any) => item.category);
  const categoryValues: number[] = this.chartData.categoryExpenses.map((item: any) => item.totalSpend);

  // Define category colors explicitly
  const categoryColors: { [key: string]: string } = {
    'Home': '#2c6e55', // Deep Green
    'Office': '#4dbf6e', // Light Green
    'Trip': '#1e4d32', // Dark Green
    'Event': '#a3bdb7', // Soft Grayish Green
    'Family': '#009688', // Teal
    'Friends': '#26a69a', // Vibrant Teal
    'Workshop': '#80cbc4', // Muted Teal
    'Conference': '#388164', // Primary Green
    'Meeting': '#004d40', // Deep Teal Green
    'Club': '#66bb6a', // Light Olive Green
    'Team': '#00796b', // Dark Teal
    'Other': '#9e9d24', // Olive Green
  };

  // Map the colors based on category labels
  const categoryColorsArray: string[] = categoryLabels.map((label: string) => categoryColors[label] || '#b3b3b3'); // Default to gray if no match

  const ctx = document.getElementById('categoryExpenseChart') as HTMLCanvasElement;
  if (ctx) {
    this.categoryExpenseChart = new Chart(ctx, {
      type: 'pie', // Use a pie chart for category-wise expenses
      data: {
        labels: categoryLabels,
        datasets: [
          {
            label: 'Category-Wise Expenses',
            data: categoryValues,
            backgroundColor: categoryColorsArray, // Use dynamic colors for each category
            borderColor: categoryColorsArray.map((color: string) => color.replace('0.8', '1')), // Making border color more prominent
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Category-Wise Expense Breakdown',
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => `$${context.raw}` // Display amount in tooltip
            }
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  } else {
    console.error('Canvas element not found. Ensure the template contains an element with id="categoryExpenseChart".');
  }
}

  
}
