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
  styleUrls: ['./main-dashboard.component.css'],
})
export class MainDashboardComponent implements OnInit {
  userProfile: any;
  groupMessage =
    "Currently, you're not part of any group. Join a group to start managing and splitting expenses with friends!";
  responseOftotalOwed = { myTotalBalance: 0, owedBalance: 0, owesBalance: 0 };
  groupDetails: any[] = [];
  friendsList: any[] = [];
  groupIds: string[] = [];
  expenseData: any[] = [];
  chartData: any = {};
  private expenseChart: Chart | null = null; // Track the bar chart instance
  private categoryExpenseChart: Chart | null = null; // Track the pie chart instance
  isLoading: boolean = true;

  constructor(
    private router: Router,
    public authService: AuthService,
    public dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(
      sessionStorage.getItem('loggedInUser') || '{}'
    );

    this.dataService.getGroupDetails().subscribe(
      (data: any[]) => {
        this.groupDetails = data.map((group) => ({
          name: group.name,
          groupId: group.groupId,
          members: group.members,
        }));

        this.groupIds = this.groupDetails.map((group) => group.groupId);

        // Extract unique friends list from group members
        this.extractFriendsList();

        // Fetch data for expenses and charts
        this.fetchExpensesData();
        this.fetchChartData();
        this.fetchTotalOwedData();
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }

  extractFriendsList(): void {
    const friendsMap = new Map<string, any>(); // Use Map to ensure unique entries by email

    this.groupDetails.forEach((group: any) => {
      group.members.forEach((member: any) => {
        // Exclude the current user based on their email
        if (member.email !== this.userProfile.email) {
          friendsMap.set(member.email, {
            username: member.username,
            email: member.email,
          });
        }
      });
    });

    this.friendsList = Array.from(friendsMap.values()); // Convert the Map back to an array
  }

  fetchExpensesData(): void {
    this.isLoading = true;
    
    this.dataService.getGroupDetails().subscribe(
      (groupDetails: any[]) => {
        this.groupIds = groupDetails.map((group) => group.groupId);
        this.createExpenseChart(); // Call the bar chart creation after fetching the data
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching expenses data:', error);
        this.isLoading = false;
      }
    );
  }

  fetchChartData(): void {
    this.isLoading = true;

    this.dataService.getChartData(this.groupIds).subscribe(
      (chartData: any) => {
        this.chartData = chartData;
        this.createExpenseChart(); // Create the monthly expense bar chart
        this.createCategoryExpenseChart(); // Create the category-wise expense pie chart
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching chart data:', error);
        this.isLoading = false;
      }
    );
  }

  fetchTotalOwedData(): void {
    this.isLoading = true;
    
    this.dataService.totalOwed(this.groupIds).subscribe(
      (owedData: any) => {
        this.responseOftotalOwed = owedData;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading details from API:', error);
        this.isLoading = false;
      }
    );
  }

  createExpenseChart(): void {
    if (this.expenseChart) {
      this.expenseChart.destroy(); // Destroy existing chart
    }

    if (
      !this.chartData ||
      !this.chartData.groupExpenses ||
      this.chartData.groupExpenses.length === 0
    ) {
      console.warn('No expense data available to plot.');
      return;
    }

    const monthlyExpenses = new Map<string, number>();
    this.chartData.groupExpenses.forEach((expense: any) => {
      const expenseDate = new Date(expense.date);
      const formattedMonth = `${
        expenseDate.getMonth() + 1
      }/${expenseDate.getFullYear()}`;
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
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Monthly Expenses ($)',
              data: data,
              backgroundColor: 'rgba(16, 179, 51, 0.6)',
              borderColor: 'rgb(38, 133, 35)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Expense Breakdown',
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `$${context.raw}`,
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Month/Year' },
            },
            y: {
              title: { display: true, text: 'Amount ($)' },
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.error(
        'Canvas element not found. Ensure the template contains an element with id="expenseChart".'
      );
    }
  }

  createCategoryExpenseChart(): void {
    if (this.categoryExpenseChart) {
      this.categoryExpenseChart.destroy(); // Destroy existing chart
    }

    if (
      !this.chartData ||
      !this.chartData.categoryExpenses ||
      this.chartData.categoryExpenses.length === 0
    ) {
      console.warn('No category expense data available to plot.');
      return;
    }

    const categoryLabels: string[] = this.chartData.categoryExpenses.map(
      (item: any) => item.category
    );
    const categoryValues: number[] = this.chartData.categoryExpenses.map(
      (item: any) => item.totalSpend
    );

    const categoryColors: { [key: string]: string } = {
      Home: '#2c6e55',
      Office: '#4dbf6e',
      Trip: '#1e4d32',
      Event: '#a3bdb7',
      Family: '#009688',
      Friends: '#26a69a',
      Workshop: '#80cbc4',
      Conference: '#388164',
      Meeting: '#004d40',
      Club: '#66bb6a',
      Team: '#00796b',
      Other: '#9e9d24',
    };

    const categoryColorsArray: string[] = categoryLabels.map(
      (label: string) => categoryColors[label] || '#b3b3b3'
    );

    const ctx = document.getElementById(
      'categoryExpenseChart'
    ) as HTMLCanvasElement;
    if (ctx) {
      this.categoryExpenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: categoryLabels,
          datasets: [
            {
              label: 'Category-Wise Expenses',
              data: categoryValues,
              backgroundColor: categoryColorsArray,
              borderColor: categoryColorsArray.map((color: string) =>
                color.replace('0.8', '1')
              ),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Category-Wise Expense Breakdown',
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `$${context.raw}`,
              },
            },
            legend: {
              position: 'top',
            },
          },
        },
      });
    } else {
      console.error(
        'Canvas element not found. Ensure the template contains an element with id="categoryExpenseChart".'
      );
    }
  }
}
