import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { AlreadyLoggedinGuard } from './already-loggedin.guard';
import { LogoutComponent } from "./logout/logout.component";
import { CreateGroupComponent } from './create-group/create-group.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { FriendDetailsComponent } from './friend-details/friend-details.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { HomepageComponent } from './homepage/homepage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path:'homepage',
    component:HomepageComponent
  },
  {
    path: 'login',
    component: LoginComponent
    // canActivate: [AlreadyLoggedinGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard/main-dashboard', pathMatch: 'full' },
      { path:'error',component:ErrorComponent},
      { path: 'logout', component: LogoutComponent },
      { path: 'main-dashboard', component: MainDashboardComponent },
      { path: 'friend-detail', component: FriendDetailsComponent },
      { path: 'group-detail', component: GroupDetailsComponent },
    ],
  },
  { path:'create-group/new',component:CreateGroupComponent},
  { path:'create-group/existing/:id',component:CreateGroupComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
