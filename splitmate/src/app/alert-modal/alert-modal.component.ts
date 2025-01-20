import { Component, OnInit } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css'],
})
export class AlertModalComponent implements OnInit {
  constructor(public modalRef: MdbModalRef<AlertModalComponent>) {}

  ngOnInit(): void {}
}
