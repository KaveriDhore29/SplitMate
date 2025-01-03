import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';


@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.css']
})
export class ExpenseModalComponent implements OnInit {
  @Input() membersNames: { name: string; email: string }[] = [];
  @Input() groupId!: string;
  @Output() closePopup = new EventEmitter<void>();
  selectedSplitOption: string = 'equally';
  @Input() groupDetails !: any;
  isSaveDisabled: boolean = false;
  @Output() onAddExpense = new EventEmitter<void>();
  groupMembersEmails : any;

  currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];


  
  expense = {
    title: '',
    currency: 'INR',
    amount: '',
    paidBy: this.dataService.currentUserEmail.email, 
    equally: true, 
    selectedMembers: [] as string[],
    splitBy:'equally'
  };

  memberShares: { [email: string]: number } = {};
  memberPercentages: { [email: string]: number } = {};

  memberExpense : [{email:string,divison:number}] = [{email:'',divison:1}];

  constructor(private route: ActivatedRoute, public dataService: DataService) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    this.initializeSharesFields();
    this.initializePercentageFields();
    this.selectAllMembers();
    this.dataService.getGroupDetailById(this.groupId).subscribe(
      (data) => {
        this.groupDetails = data;
        console.log('Specific Group Detail by Id:', this.groupDetails);
        this.groupMembersEmails = this.groupDetails[0].members.map((member:any) => {
          return member.email;
        }
      );
      },
      (error) => {
        console.error('Error fetching group details:', error);
      }
    );
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

  onSplitOptionChange(option: string): void {
    this.selectedSplitOption = option; // Set the selected split option
    this.expense.splitBy = option; // Store the selected split option in expense data
    this.expense.selectedMembers = []; // Reset selected members for each option
    
    // Initialize shares or percentage fields when needed
    if (option === 'percentage') {
      this.initializePercentageFields();
    } else if (option === 'shares') {
      this.initializeSharesFields();
    }else if (option === 'equally') {
      this.selectAllMembers(); // Select all members when "Equally" is clicked
    }
  }

  selectAllMembers(): void {
    this.expense.selectedMembers = this.membersNames.map(member => member.email); // Select all members
  }

  isAllSelected(): boolean {
    return this.membersNames.every(member => this.expense.selectedMembers.includes(member.email));
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.expense.selectedMembers = this.membersNames.map(member => member.email);
    } else {
      this.expense.selectedMembers = [];
    }
  }


  initializePercentageFields(): void {
    this.memberPercentages = {};
    this.membersNames.forEach(member => {
      this.memberPercentages[member.email] = 0; 
    });
  }
  
  initializeSharesFields(): void {
    this.memberShares = {};
    this.membersNames.forEach(member => {
      this.memberShares[member.email] = 0; 
    });
  }
  


  addExpenseData(): void {

   
    // Determine the members to use based on the split option
  let membersToUse: string[] = [];
  if (this.expense.splitBy === 'equally') {
    membersToUse = this.expense.selectedMembers || [];
  } else {
    membersToUse = this.groupMembersEmails || []; // Assume all members are stored in `this.groupMembers`
  }

  // Create member data
  let memberData = membersToUse.map(memberEmail => {
    let division = 1; // Default division for 'equally'
    if (this.expense.splitBy === 'shares') {
      division = this.memberShares[memberEmail] || 0; // Use the share value from input
    } else if (this.expense.splitBy === 'percentage') {
      division = this.memberPercentages[memberEmail] || 0; // Use the percentage value from input
    }

    return {
      person: memberEmail,
      division: division
    };
  });
    
    //  console.log('Constructed Member Data:', memberData);
    
    if (
      this.expense.splitBy === 'percentage' &&
      Object.values(this.memberPercentages).reduce((a, b) => a + b, 0) !== 100
    ) {
      alert('Total percentage must equal 100.');
      return;
    }
  
    const expenseData = {
      paidBy: this.expense.paidBy,
      members: memberData,
      amount: { value: this.expense.amount, currency: this.expense.currency },
      simplifyCurrency: this.expense.currency,
      splitBy: this.expense.splitBy, 
      title: this.expense.title,
      groupId: this.groupId,
      createdBy : this.dataService.currentUserEmail ,
      expenseDate: new Date(),    //expense created by current user
    };
  
    console.log('Expense Data:', expenseData);
  
    // Call the service API to add the expense
    this.dataService.addExpenseService(expenseData).subscribe(
      response => {
        // console.log('Expense successfully added:', response);
        this.isSaveDisabled = true;
        alert('Expense added successfully!');
        this.onAddExpense.emit();
        this.closePopup.emit(); // Close the modal
        // console.log('Selected Split Option:', this.selectedSplitOption);
        // console.log('Member Shares:', this.memberShares);
        // console.log('Member Percentages:', this.memberPercentages);

      },
      error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    );
  }
  

  closeSplitOptions(): void {
    this.selectedSplitOption = '';
  }

  close(): void {
    this.closePopup.emit();
  }
}
