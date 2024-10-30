import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ErrorComponent } from './error/error.component';
import { FormsModule } from '@angular/forms'; // Import this
<<<<<<< HEAD
=======
import { NavbarComponent } from './navbar/navbar.component';
>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
<<<<<<< HEAD
    ErrorComponent
=======
    ErrorComponent,
    NavbarComponent,
>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
