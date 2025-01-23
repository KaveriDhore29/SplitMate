import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { log } from 'console';
import { DataService } from '../data.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-settle-up',
  templateUrl: './settle-up.component.html',
  styleUrls: ['./settle-up.component.css'],
})
export class SettleUpComponent implements OnInit {
  @Output() closeSettleUpPopup = new EventEmitter<void>();
  @Input() groupDetails!: any;
  transactions: { from: ''; to: ''; amount: number; currency: '' }[] = [];
  @Input() owedExpenses: any[] = [];
  @Input() groupId: any;
  @Output() onSettleUp = new EventEmitter<any>();

  constructor(
    public dataService: DataService,
    public alertService: AlertService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // console.log(this.owedExpenses);
  }

  close() {
    this.closeSettleUpPopup.emit();
  }

  settleUp(members: any, amount: number, currency: string) {
    const expenseData = {
      paidBy: this.dataService.currentUserEmail,
      members: [{ person: members, divison: 1 }],
      amount: { value: amount, currency: currency },
      simplifyCurrency: currency,
      splitBy: 'equally',
      title: 'settle up',
      groupId: this.groupId,
      createdBy: this.dataService.currentUserEmail, //expense created by current user
    };

    console.log('SettleData', expenseData);
    this.dataService.addExpenseService(expenseData).subscribe(
      (response) => {
        console.log('Settle up:', response);
        // alert('Settle up!');
        this.alertService.success(`Settle up!`, {
          id: 'alert-1',
          autoClose: true,
        });
        this.cdr.detectChanges();
        this.onSettleUp.emit();
        this.closeSettleUpPopup.emit(); // Close the modal
      },
      (error) => {
        console.error('Error settling expense:', error);
        // alert('Failed to settling expense. Please try again.');
        this.alertService.error(
          `Failed to settling expense. Please try again.`,
          {
            id: 'alert-1',
            autoClose: true,
          }
        );
        this.cdr.detectChanges();
      }
    );
  }
}
