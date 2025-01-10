import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
declare var initializeGoogleSignIn: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: any;
  password: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    initializeGoogleSignIn();
  }
}
