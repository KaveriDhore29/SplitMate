import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class AlertService {
  private alertSubject = new Subject<string>();
  alert$ = this.alertSubject.asObservable();

  showAlert(message: string): void {
    this.alertSubject.next(message);
  }
}
