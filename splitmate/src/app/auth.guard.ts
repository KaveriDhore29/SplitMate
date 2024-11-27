import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.checkUserLogin()) {
      // If the user is already logged in and tries to access restricted routes, redirect them
      if (state.url === '/login' || state.url === '/homepage') {
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true; // Allow access to other routes
    } else {
      // Redirect to login if not logged in
      if (state.url !== '/login') {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state); // Reuse the same logic as `canActivate`
  }
}
