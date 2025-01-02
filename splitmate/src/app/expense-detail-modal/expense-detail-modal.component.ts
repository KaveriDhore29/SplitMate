import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-expense-detail-modal',
  templateUrl: './expense-detail-modal.component.html',
  styleUrls: ['./expense-detail-modal.component.css'],
})
export class ExpenseDetailModalComponent {
  @Input() expense: any;
  @Input() showModal: boolean = false;
  @Output() closeExpenseDetailPopup = new EventEmitter<void>();

  closeModal() {
    this.closeExpenseDetailPopup.emit();
  }
}
