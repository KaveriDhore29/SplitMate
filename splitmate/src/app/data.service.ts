import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:3000/api';
   currentUserEmail : any;
   private selectedGroupSource = new BehaviorSubject<any>(null); 
 
  constructor(private http: HttpClient) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userPayload = JSON.parse(loggedInUser); 
      this.currentUserEmail = {
        email: userPayload.email,
        name : userPayload.name
      };
    }   

     console.log("Current User Email:",this.currentUserEmail)
  }

  setSelectedGroup(group: any) {
    this.selectedGroupSource.next(group); 
  }

    getGroupDetails(): Observable<any[]> {
      return this.http.post<any[]>(`${this.apiUrl}/get-group-details`, this.currentUserEmail, {
        withCredentials: true
      })
    }

    getGroupDetailById(groupId: string): Observable<any> {
      const payload = {
        email: this.currentUserEmail,
        groupId: groupId,
      };
      return this.http.post<any>(`${this.apiUrl}/get-one-group-detail`, payload)
    }

    addExpenseService(expenseData :any){
      return this.http.post<any>(`${this.apiUrl}/simplify`, expenseData,{
        withCredentials: true,
      });
    }

    addMembersToGroup(membersToAdd:any,groupId:any){
      const payload ={
        members : membersToAdd,
        groupId : groupId
      }
      return this.http.post<any>(`${this.apiUrl}/add-members`,{
        withCredentials: true,
      });
    }


    totalOwed(groupIds :any[]){
      const payload = {
        email : this.currentUserEmail,
        groupIds : groupIds
      }
      return this.http.post<any>(`${this.apiUrl}/totalOwed`,payload,{
        withCredentials: true,
      });
    }


  
}


    // getGroupDetails(): Observable<any[]> {
    //   this.http.post('http://localhost:3000/api/get-group-details',this.currentUserEmail,{withCredentials:true} ).subscribe(
    //     (response) => {
    //       console.log('Group details fetched successfully:', response);
    //       this.groupDetailsBackend.push(response);
    //     },
    //     (error) => {
    //       console.error('Error fetching group details:', error);
    //     }
    //   );
    // }