import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { LogoutComponent } from "./logout/logout.component";
import { CreateGroupComponent } from './create-group/create-group.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { FriendDetailsComponent } from './friend-details/friend-details.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthGuard } from './auth.guard';

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
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path:'error',component:ErrorComponent},
      { path: 'logout', component: LogoutComponent },
      { path: 'main-dashboard', component: MainDashboardComponent },
      { path: 'friend-detail', component: FriendDetailsComponent },
      { path: 'group-detail', component: GroupDetailsComponent },
      { path: 'group-detail/:id', component: GroupDetailsComponent },
    ],
  },
  { path:'create-group/new',component:CreateGroupComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
