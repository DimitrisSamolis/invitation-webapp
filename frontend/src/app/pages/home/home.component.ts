import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { Invitation } from '../../models/models';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, TitleCasePipe],
  template: `
    <div class="hero-section">
      <div class="hero-content">
        <h1>Create Beautiful Invitations</h1>
        <p>Design and share stunning digital invitations for any occasion</p>
        <a mat-raised-button color="primary" routerLink="/admin">
          <mat-icon>add</mat-icon>
          Create Invitation
        </a>
      </div>
    </div>

    <div class="container">
      <h2>Featured Invitations</h2>
      
      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (invitations.length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>No invitations available yet</p>
        </div>
      } @else {
        <div class="card-container">
          @for (invitation of invitations; track invitation._id) {
            <mat-card class="invitation-card" [routerLink]="['/invitation', invitation._id]">
              <mat-card-header>
                <mat-icon mat-card-avatar>{{ getEventIcon(invitation.eventType) }}</mat-icon>
                <mat-card-title>{{ invitation.title }}</mat-card-title>
                <mat-card-subtitle>{{ invitation.eventType | titlecase }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p><mat-icon>event</mat-icon> {{ invitation.eventDate | date:'mediumDate' }}</p>
                <p><mat-icon>schedule</mat-icon> {{ invitation.eventTime }}</p>
                <p><mat-icon>location_on</mat-icon> {{ invitation.venue }}</p>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/invitation', invitation._id]">
                  View Details
                </a>
                <a mat-button color="accent" [routerLink]="['/rsvp', invitation._id]">
                  RSVP
                </a>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
    }
    
    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    
    .hero-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 24px;
    }
    
    .container h2 {
      text-align: center;
      margin: 40px 0 20px;
      color: #333;
    }
    
    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    
    .invitation-card {
      cursor: pointer;
    }
    
    mat-card-content p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
    }
    
    mat-card-content mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #888;
    }
  `]
})
export class HomeComponent implements OnInit {
  invitations: Invitation[] = [];
  loading = true;

  constructor(private invitationService: InvitationService) { }

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.invitationService.getAll().subscribe({
      next: (data) => {
        this.invitations = data.filter(inv => inv.isActive);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      wedding: 'favorite',
      birthday: 'cake',
      corporate: 'business',
      party: 'celebration',
      other: 'event'
    };
    return icons[eventType] || 'event';
  }
}
