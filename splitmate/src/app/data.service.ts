import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // private apiUrl = 'https://api-hxibxy2qza-uc.a.run.app/api'; // API base URL
  private apiUrl = 'https://split-mate-1.vercel.app/api';
  currentUserEmail: any;
  private selectedGroupSource = new BehaviorSubject<any>(null);
  currentUserGroupIds = [];

  constructor(private http: HttpClient) {
    // Load the logged-in user's email and name from session storage
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser);
      this.currentUserEmail = {
        email: userPayload.email,
        name: userPayload.name,
      };
    }

    // console.log('Current User Email:', this.currentUserEmail);
  }

  // Set the selected group in the BehaviorSubject
  setSelectedGroup(group: any) {
    this.selectedGroupSource.next(group);
  }

  // Fetch the details of all groups the user is part of
  getGroupDetails(): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.apiUrl}/get-group-details`,
      this.currentUserEmail,
      {
        withCredentials: true,
      }
    );
  }

  // Fetch details for a specific group by its ID
  getGroupDetailById(groupId: string): Observable<any> {
    const payload = {
      email: this.currentUserEmail.email,
      groupId: groupId,
    };
    return this.http.post<any>(`${this.apiUrl}/get-one-group-detail`, payload);
  }

  // Add an expense for a group
  addExpenseService(expenseData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/simplify`, expenseData, {
      withCredentials: true,
    });
  }

  // Add members to a group
  addMembersToGroup(membersToAdd: any, groupId: any): Observable<any> {
    const payload = {
      members: membersToAdd,
      groupId: groupId,
    };
    return this.http.post<any>(`${this.apiUrl}/add-members`, payload, {
      withCredentials: true,
    });
  }

  // Fetch the total amount owed for specific groups
  totalOwed(groupIds: any[]): Observable<any> {
    const payload = {
      email: this.currentUserEmail.email,
      groupIds: groupIds,
    };
    // console.log(JSON.stringify(payload), "totalowed data");
    return this.http.post<any>(`${this.apiUrl}/totalOwed`, payload, {
      withCredentials: true,
    });
  }

  grpTotalOwed(groupId: any) {
    const payload = {
      email: this.currentUserEmail.email,
      groupId: groupId,
    };
    // console.log(JSON.stringify(payload), 'grpTotalowed data');
    return this.http.post<any>(`${this.apiUrl}/grpTotalOwed`, payload, {
      withCredentials: true,
    });
  }

  grpBalance(groupId: any) {
    const payload = {
      groupId: groupId,
      email: this.currentUserEmail.email,
    };
    // console.log(JSON.stringify(payload), 'grpBalance data');
    return this.http.post<any>(`${this.apiUrl}/grpBalance`, payload, {
      withCredentials: true,
    });
  }

  // Delete a group by groupId and members
  deleteGroup(groupId: string, members: any[]): Observable<any> {
    const payload = { groupId, members };
    // console.log(JSON.stringify(payload));
    return this.http.post<any>(`${this.apiUrl}/deleteGroup`, payload, {
      withCredentials: true,
    });
  }

  // Fetch group expenses based on the groupId
  getGroupExpenses(groupId: string): Observable<any> {
    const payload = {
      groupId: groupId,
      currentUserEmail: this.currentUserEmail.email,
    };
    return this.http.post<any>(`${this.apiUrl}/get-group-expenses`, payload, {
      withCredentials: true,
    });
  }

  // Fetch expenses for multiple groups using groupIds
  getExpensesForGroups(groupIds: string[]): Observable<any> {
    const payload = {
      groupIds: groupIds,
    };
    return this.http.post<any>(`${this.apiUrl}/getAllExpense`, payload, {
      withCredentials: true,
    });
  }

  getAllExpense(groupIds: string[]): Observable<any> {
    const payload = {
      groupIds: groupIds,
    };
    return this.http.post<any>(`${this.apiUrl}/getAllExpense`, payload, {
      withCredentials: true,
    });
  }
  // Fetch chart data for specific groups
  getChartData(groupIds: string[]): Observable<any> {
    const payload = {
      groupIds: groupIds,
    };
    return this.http.post<any>(`${this.apiUrl}/getChartData`, payload, {
      withCredentials: true,
    });
  }

  deleteExpenseService(groupId: any, transactionId: any) {
    const payload = {
      groupId: groupId,
      transactionId: transactionId,
    };
    return this.http.post<any>(`${this.apiUrl}/deleteExpense`, payload, {
      withCredentials: true,
    });
  }

  // grpBalance(groupId:any) {
  //     const payload = {
  //       groupId: groupId,
  //       currentUserEmail: this.currentUserEmail.email
  //     }
  //     return this.http.post<any>(`${this.apiUrl}/grpBalance`, payload, {
  //       withCredentials: true,
  //     });
  // }
}
