import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/" class="logo">
        <mat-icon>celebration</mat-icon>
        <span>Invitation App</span>
      </a>
      
      <span class="mat-toolbar-spacer"></span>
      
      @if (authService.isLoggedIn()) {
        <a mat-button routerLink="/admin">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </a>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-info">
            <mat-icon>person</mat-icon>
            <span>{{ authService.user()?.name }}</span>
          </div>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/login">
          <mat-icon>login</mat-icon>
          Login
        </a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .mat-toolbar-spacer {
      flex: 1 1 auto;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) { }
}
