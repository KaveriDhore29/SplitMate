import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
<<<<<<< HEAD

const routes: Routes = [
  {path:'login',component:LoginComponent},
  {path:'dashboard',component:DashboardComponent},
  {path:'error',component:ErrorComponent},
  { path: '', component: LoginComponent, pathMatch: 'full' }
=======
import { AlreadyLoggedinGuard } from './already-loggedin.guard';
import { AuthGuard } from './auth.guard';
import { LogoutComponent } from "./logout/logout.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path:'error',component:ErrorComponent},
      { path: 'logout', component: LogoutComponent },
    ],
  },
>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
