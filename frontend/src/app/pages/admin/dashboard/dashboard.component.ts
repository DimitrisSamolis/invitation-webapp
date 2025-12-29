import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../../services/invitation.service';
import { DashboardStats } from '../../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Admin Dashboard</h1>
        <a mat-raised-button color="primary" routerLink="/admin/invitations/new">
          <mat-icon>add</mat-icon>
          New Invitation
        </a>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>mail</mat-icon>
              <div class="stat-value">{{ stats.totalInvitations }}</div>
              <div class="stat-label">Total Invitations</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card active">
            <mat-card-content>
              <mat-icon>visibility</mat-icon>
              <div class="stat-value">{{ stats.activeInvitations }}</div>
              <div class="stat-label">Active Invitations</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>people</mat-icon>
              <div class="stat-value">{{ stats.totalGuests }}</div>
              <div class="stat-label">Total Guests</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card confirmed">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <div class="stat-value">{{ stats.confirmedGuests }}</div>
              <div class="stat-label">Confirmed</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pending">
            <mat-card-content>
              <mat-icon>schedule</mat-icon>
              <div class="stat-value">{{ stats.pendingResponses }}</div>
              <div class="stat-label">Pending</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card declined">
            <mat-card-content>
              <mat-icon>cancel</mat-icon>
              <div class="stat-value">{{ stats.declinedGuests }}</div>
              <div class="stat-label">Declined</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <a mat-stroked-button routerLink="/admin/invitations">
              <mat-icon>mail</mat-icon>
              Manage Invitations
            </a>
            <a mat-stroked-button routerLink="/admin/guests">
              <mat-icon>people</mat-icon>
              View All Guests
            </a>
            <a mat-stroked-button routerLink="/admin/themes">
              <mat-icon>palette</mat-icon>
              Customize Themes
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    h1 {
      margin: 0;
      color: #333;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      text-align: center;
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
    }
    
    .stat-card mat-card-content {
      padding: 24px;
    }
    
    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }
    
    .stat-card.active mat-icon { color: #2196f3; }
    .stat-card.confirmed mat-icon { color: #4caf50; }
    .stat-card.pending mat-icon { color: #ff9800; }
    .stat-card.declined mat-icon { color: #f44336; }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 600;
      color: #333;
      margin: 8px 0;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .quick-actions h2 {
      color: #333;
      margin-bottom: 16px;
    }
    
    .actions-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .actions-grid a {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalInvitations: 0,
    activeInvitations: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    pendingResponses: 0,
    declinedGuests: 0
  };
  loading = true;

  constructor(private invitationService: InvitationService) { }

  ngOnInit() {
    this.invitationService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
