import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ErrorComponent } from './error/error.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Imported FormsModule for ngModel
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // Imported HttpClientModule for API calls

// Angular Material Imports
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // For autocomplete
import { MatInputModule } from '@angular/material/input'; // For material input fields
import { MatChipsModule } from '@angular/material/chips'; // For chips
import { MatFormFieldModule } from '@angular/material/form-field'; // For form field styling
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { FriendDetailsComponent } from './friend-details/friend-details.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseModalComponent } from './expense-modal/expense-modal.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { EditGroupModalComponent } from './edit-group-modal/edit-group-modal.component';
import { AuthInterceptorInterceptor } from './auth-interceptor.interceptor';
import { SettleUpComponent } from './settle-up/settle-up.component';
import { MyGroupsComponent } from './my-groups/my-groups.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ExpenseDetailModalComponent } from './expense-detail-modal/expense-detail-modal.component';
import { ExpenseListComponent } from './all-expenses/all-expenses.component';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorInterceptor,
      multi: true,
    },
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    ErrorComponent,
    NavbarComponent,
    CreateGroupComponent,
    MainDashboardComponent,
    FriendDetailsComponent,
    GroupDetailsComponent,
    HomepageComponent,
    ExpenseModalComponent,
    LandingPageComponent,
    EditGroupModalComponent,
    SettleUpComponent,
    MyGroupsComponent,
    MyProfileComponent,
    ExpenseDetailModalComponent,
    ExpenseListComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, // Enables two-way binding for form elements
    HttpClientModule, // Allows HTTP client usage for API calls
    MatAutocompleteModule, // Autocomplete module
    MatInputModule, // Input module
    MatChipsModule, // Chips module
    MatFormFieldModule, // Form field module
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
