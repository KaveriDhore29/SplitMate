import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { MyGroupsComponent } from './my-groups/my-groups.component';
import { FriendDetailsComponent } from './friend-details/friend-details.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthGuard } from './auth.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AlreadyLoggedInGuard } from './already-logged-in.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path: 'homepage',
    component: LandingPageComponent,
    canActivate: [AlreadyLoggedInGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AlreadyLoggedInGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'main-dashboard', pathMatch: 'full' },
      { path: 'error', component: ErrorComponent },
      { path: 'main-dashboard', component: MainDashboardComponent },
      { path: 'friend-detail', component: FriendDetailsComponent },
      { path: 'group-detail', component: GroupDetailsComponent },
      { path: 'group-detail/:id', component: GroupDetailsComponent },
      { path: 'all-groups', component: MyGroupsComponent },
    ],
  },
  { path: 'create-group/new', component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'homepage' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
