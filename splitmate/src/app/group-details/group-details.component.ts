import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css'],
})
export class GroupDetailsComponent implements OnInit {
  groupId!: string;
  groupDetails: any;
  groupName: string = '';
  membersNames: any[] = [];
  groupCreatedBy = { username: '', email: '' };
  groupCreatedAt: any;
  showPopup: boolean = false;
  showSettleUpPopup = false;
  selectedExpenseForSettleUp: any;
  showAddmembersPopup: boolean = false;
  groupCreatorEmail: any;
  groupDescription = 'This is a group for discussing tech topics.';
  settingsMenuOpen = false;
  groupIds = [];
  groupExpenses: any;
  groupExpensesArray: any;
  activeTab: string = 'expenses';
  transactions: { from: ''; to: ''; amount: number; currency: '' }[] = [];
  owedExpenses: any[] = [];
  grpBalances: any;
  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  modalRef: MdbModalRef<AlertModalComponent> | null = null;
  borrowedExpenses = [
    { title: 'Dinner with friends', amount: 50, date: '2024-12-12' },
    { title: 'Concert ticket', amount: 80, date: '2024-12-10' },
    { title: 'Grocery shopping', amount: 30, date: '2024-12-08' },
  ];
  groupSettlements: any;
  recentUpdates: any;
  updates = [
    {
      person1: ' ',
      action: ' ',
      amount: '',
      person2: '',
    },
  ];
  membersWhoOwes = [
    {
      person: '',
      amount: 0,
      currency: '',
      to: '',
      title: '',
    },
  ];

  grpBalancesList: any;
  isLoading: boolean = false;

  selectedExpense: any = null;
  isSaveDisabled: boolean = false;
  @Output() onAddExpense = new EventEmitter<void>();
  @Output() closePopup = new EventEmitter<void>();

  expense = {
    title: '',
    currency: 'INR',
    amount: '',
    paidBy: this.dataService.currentUserEmail.email,
    equally: true,
    selectedMembers: [] as string[],
    splitBy: 'equally',
  };
  groupMembersEmails: any;
  memberShares: { [email: string]: number } = {};
  memberPercentages: { [email: string]: number } = {};

  memberExpense: [{ email: string; division: number }] = [
    { email: '', division: 1 },
  ];

  openExpenseModal(expense: any) {
    this.selectedExpense = expense;
    console.warn(this.selectedExpense, 'selected exepsne');
    this.getGroupDetailByTransactionId(expense.transactionId);
  }

  getGroupDetailByTransactionId(transactionId: any) {
    const transactionDetail = this.groupDetails[0].transactions.find(
      (tr: any) => tr.transactionId === transactionId
    );

    if (transactionDetail) {
      this.membersWhoOwes = transactionDetail.netBalances.map(
        (balance: any) => {
          // Find the corresponding user based on the person email
          const member = this.groupDetails[0].members.find(
            (member: any) => member.email === balance.person
          );

          return {
            person: member ? member.username : balance.person, // Return username or email if no username
            amount: balance.balance,
            currency: balance.currency,
          };
        }
      );

      console.log(this.membersWhoOwes);
    } else {
      console.log('Transaction not found.');
    }
  }

  getAllTransactions() {
    console.log('In fn');
    this.grpBalancesList = this.groupDetails[0].transactions.flatMap(
      (transaction: any) =>
        transaction.netBalances
          .filter((balance: any) => balance.balance < 0) // Only include those who owe money
          .map((balance: any) => ({
            person: balance.person, // Email of the person who owes
            amount: Math.abs(balance.balance), // Absolute value of the amount owed
            to: transaction.paidBy, // Person who was paid
            title: transaction.title, // Title of the transaction
          }))
    );

    console.log(this.grpBalancesList, 'list');
  }

  fetchGroupDetails() {
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data: any) => {
        this.groupDetails = data;
        this.getAllTransactions(); // Call only after groupDetails is populated
      },
      (error: any) => {
        console.error('Failed to fetch group details:', error);
      }
    );
  }

  toggleSettingsMenu() {
    this.settingsMenuOpen = !this.settingsMenuOpen;
  }

  viewGroupDetails() {
    console.log('View Group Details clicked');
    // Implement navigation or modal logic
  }

  addExpenseData(selectedExpense: any): void {
    this.isSaveDisabled = true;

    this.expense.title = 'settlement';
    this.expense.amount = selectedExpense.owesAmount;
    this.expense.selectedMembers.push(selectedExpense.to);

    let membersToUse: string[] = [];
    if (this.expense.splitBy === 'equally') {
      membersToUse = this.expense.selectedMembers || [];
    } else {
      membersToUse = this.groupMembersEmails || []; // Assume all members are stored in `this.groupMembers`
    }

    // Create member data
    let memberData = membersToUse.map((memberEmail) => {
      let division = 1; // Default division for 'equally'

      return {
        person: memberEmail,
        division: division,
      };
    });

    const expenseData = {
      paidBy: this.expense.paidBy,
      paidByName: this.membersNames.find(
        (member) => member.email === this.expense.paidBy
      )?.name, // Get the name of the payer
      members: memberData,
      amount: { value: this.expense.amount, currency: this.expense.currency },
      simplifyCurrency: this.expense.currency,
      splitBy: this.expense.splitBy,
      title: this.expense.title,
      groupId: this.groupId,
      groupName: this.groupDetails[0]?.name || 'Unknown Group',
      createdBy: this.dataService.currentUserEmail,
      expenseDate: new Date(), // expense created by current user
    };

    console.log('Expense Data:', expenseData);

    // Call the service API to add the expense
    this.dataService.addExpenseService(expenseData).subscribe(
      (response) => {
        alert('Expense added successfully!');
        this.loadGroupDetails();
        this.fetchGroupDetails();
        this.isSaveDisabled = false;
        this.onAddExpense.emit();
        this.closePopup.emit(); // Close the modal
        this.selectedExpense = null;
      },
      (error) => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }

  closeModal() {
    this.selectedExpense = null;
  }

  updateExpenseAmount(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.expense.amount = inputElement.value;
  }

  expenses = [];

  responseOftotalOwed: {
    myTotalBalance: number;
    owedBalance: number;
    owesBalance: number;
  } = {
    myTotalBalance: 0,
    owedBalance: 0,
    owesBalance: 0,
  };

  constructor(
    private route: ActivatedRoute,
    public dataService: DataService,
    private router: Router,
    private modalService: MdbModalService
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Start loading indicator
    this.route.paramMap.subscribe((params) => {
      const newGroupId = params.get('id');
      if (newGroupId) {
        this.groupId = newGroupId;
        this.loadGroupDetails();
        this.fetchGroupDetails();
      }
    });
  }

  abs(value: number): number {
    return value < 0 ? -value : value;
  }

  loadGroupDetails(): void {
    this.isLoading = true; // Show loader
    let dataFetched = 0; // Track number of API calls completed
    const totalApiCalls = 3; // Total API calls needed

    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        this.getAllTransactions();
        console.log('Specific group detail by id:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;
        this.groupCreatedBy.username = this.groupDetails[0].createdBy.username;
        this.groupCreatedBy.email = this.groupDetails[0].createdBy.email;
        this.groupCreatedAt = this.groupDetails[0].createdAt;

        this.updates = this.groupDetails[0].transactions.map((e: any) => {
          return {
            person1: e.transactions[0].to,
            action: e.title,
            amount: e.amount,
            person2: e.transactions[0].from,
          };
        });
        const groupCreatorEmail = this.groupDetails[0].createdBy.email;

        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username,
          email: member.email,
          role: member.email === groupCreatorEmail ? 'Admin' : 'Member',
        }));

        dataFetched++;
        if (dataFetched === totalApiCalls) this.isLoading = false; // Hide loader
      },
      (error) => {
        console.error('Error fetching group details:', error);
        this.isLoading = false; // Hide loader on error
      }
    );

    this.dataService.grpTotalOwed(this.groupId).subscribe(
      (owedData: any) => {
        this.responseOftotalOwed = owedData;
        console.log('Total Owed Data:', this.responseOftotalOwed);
        dataFetched++;
        if (dataFetched === totalApiCalls) this.isLoading = false; // Hide loader
      },
      (error) => {
        console.error('Error loading details from API:', error);
        this.isLoading = false; // Hide loader on error
      }
    );

    this.dataService.grpBalance(this.groupId).subscribe(
      (data: any) => {
        this.groupSettlements = data;
        console.log('Group Settlements:', this.groupSettlements);
        dataFetched++;
        if (dataFetched === totalApiCalls) this.isLoading = false; // Hide loader
      },
      (error) => {
        console.error('Error loading details from API:', error);
        this.isLoading = false; // Hide loader on error
      }
    );

    this.groupExpenses = this.dataService
      .getGroupExpenses(this.groupId)
      .subscribe((data: any[]) => {
        this.groupExpenses = data;
        // console.log('Group Expenses for table:', this.groupExpenses);
        this.groupExpensesArray = this.groupExpenses.expenses;
      });

    this.dataService.grpTotalOwed(this.groupId).subscribe(
      (owedData: any) => {
        this.responseOftotalOwed = owedData;
        console.log('Total Owed Data:', this.responseOftotalOwed);
      },
      (error) => {
        console.error('Error loading details from API:', error);
      }
    );

    this.dataService.grpBalance(this.groupId).subscribe(
      (data: any) => {
        this.groupSettlements = data;
        console.log('Group Settlements:', this.groupSettlements);
      },
      (error) => {
        console.error('Error loading details from API:', error);
      }
    );

    this.grpBalances = this.dataService
      .grpBalance(this.groupId)
      .subscribe((data: any) => {
        this.grpBalances = data;
        console.log('grpBalances', this.grpBalances);
      });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  showOwedExpenses(): void {
    this.showSettleUpPopup = true;

    // Filter owed expenses by the current user
    this.owedExpenses = this.transactions.filter(
      (transaction) =>
        transaction.from === this.dataService.currentUserEmail.email
    );
    console.log('Owed Expenses:', this.owedExpenses);
  }

  deleteExpense(expense: any): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete the expense?'
    );
    if (!confirmDelete) {
      return;
    } else {
      console.log(this.groupId, expense.transactionId);
      this.dataService
        .deleteExpenseService(this.groupId, expense.transactionId)
        .subscribe(
          (data: any) => {
            this.expenses = this.expenses.filter((e) => e !== expense);
            this.loadGroupDetails();
            this.fetchGroupDetails();
            this.selectedExpense = null; // Close modal after deletion
          },
          (error) => {
            console.error(
              'Error loading details after delete from API:',
              error
            );
          }
        );
    }
  }

  editGroup(): void {
    this.router.navigate([`/create-group/${this.groupId}`]);
  }

  close() {
    this.selectedExpense = '';
  }
  settleExpense(): void {
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Specific Group Detail by Id:', this.groupDetails);
        this.groupName = this.groupDetails[0].name;
        this.membersNames = this.groupDetails[0].members.map((member: any) => ({
          name: member.username,
          email: member.email,
        }));
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
  }

  openModal() {
    this.modalRef = this.modalService.open(AlertModalComponent, {
      data: { title: 'Custom title' },
    });
  }
}