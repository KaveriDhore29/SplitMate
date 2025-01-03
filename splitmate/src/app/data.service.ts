import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api';
  currentUserEmail: any;
  private selectedGroupSource = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      this.currentUserEmail = {
        email: userPayload.email,
        name: userPayload.name,
      };
    }

    console.log('Current User Email:', this.currentUserEmail);
  }

  setSelectedGroup(group: any) {
    this.selectedGroupSource.next(group);
  }

  getGroupDetails(): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiUrl}/get-group-details`,
      this.currentUserEmail,
      {
        withCredentials: true,
      }
    );
  }

  getGroupDetailById(groupId: string): Observable<any> {
    const payload = {
      email: this.currentUserEmail.email,
      groupId: groupId,
    };
    return this.http.post<any>(`${this.apiUrl}/get-one-group-detail`, payload);
  }

  addExpenseService(expenseData: any) {
    return this.http.post<any>(`${this.apiUrl}/simplify`, expenseData, {
      withCredentials: true,
    });
  }

  addMembersToGroup(membersToAdd: any, groupId: any) {
    const payload = {
      members: membersToAdd,
      groupId: groupId,
    };
    return this.http.post<any>(`${this.apiUrl}/add-members`, payload, {
      withCredentials: true,
    });
  }

  totalOwed(groupIds: any[]) {
    const payload = {
      email: this.currentUserEmail.email,
      groupIds: groupIds,
    };
    console.log(JSON.stringify(payload),"totalowed data");
    return this.http.post<any>(`${this.apiUrl}/totalOwed`, payload, {
      withCredentials: true,
    });
  }

  deleteGroup(groupId: string, members: any[]): Observable<any> {
    const payload = { groupId, members };
    console.log(JSON.stringify(payload));
    return this.http.post<any>(`${this.apiUrl}/deleteGroup`, payload, {
      withCredentials: true, 
    });
  }
  getGroupExpenses(groupId : string) : Observable<any> {
    const payload = {
     groupId: groupId,
     currentUserEmail:  this.currentUserEmail.email
    }
    return this.http.post<any>(`${this.apiUrl}/get-group-expenses`, payload, {
      withCredentials: true, 
    }); 
  }
   // Fetch expenses for multiple groups using groupIds
   getExpensesForGroups(groupIds: string[]): Observable<any> {
    const payload = {
      groupIds: groupIds
    };
    return this.http.post<any>(`${this.apiUrl}/get-group-expenses`, payload, {
      withCredentials: true,
    });
  }
}