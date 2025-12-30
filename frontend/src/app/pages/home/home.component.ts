import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';
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
        @if (isLoggedIn()) {
          <a mat-raised-button color="primary" routerLink="/admin">
            <mat-icon>add</mat-icon>
            Create Invitation
          </a>
        } @else {
          <div class="hero-buttons">
            <a mat-raised-button color="primary" routerLink="/login">
              <mat-icon>login</mat-icon>
              Login
            </a>
            <a mat-stroked-button class="register-btn" routerLink="/login">
              <mat-icon>person_add</mat-icon>
              Register
            </a>
          </div>
        }
      </div>
    </div>

    @if (isLoggedIn()) {
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
                <mat-card-actions (click)="$event.stopPropagation()">
                  <a mat-button color="primary" [routerLink]="['/invitation', invitation._id]">
                    Preview Invitation
                  </a>
                  <a mat-button color="accent" [routerLink]="['/admin/invitations/edit', invitation._id]">
                    Edit Invitation
                  </a>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </div>
    } @else {
      <div class="container">
        <div class="features-section">
          <h2>Why Choose Our Platform?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <mat-icon>palette</mat-icon>
              <h3>Beautiful Themes</h3>
              <p>Choose from stunning animated themes for any occasion</p>
            </div>
            <div class="feature-card">
              <mat-icon>share</mat-icon>
              <h3>Easy Sharing</h3>
              <p>Share your invitations with a simple link</p>
            </div>
            <div class="feature-card">
              <mat-icon>how_to_reg</mat-icon>
              <h3>RSVP Tracking</h3>
              <p>Track guest responses in real-time</p>
            </div>
          </div>
        </div>
      </div>
    }
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

    .hero-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .register-btn {
      color: white !important;
      border-color: rgba(255,255,255,0.5) !important;
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

    .features-section {
      padding: 40px 20px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
      background: #f8f9fa;
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .feature-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      margin: 0 0 8px;
      color: #333;
    }

    .feature-card p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  invitations: Invitation[] = [];
  loading = true;
  isLoggedIn: () => boolean;

  constructor(
    private invitationService: InvitationService,
    private authService: AuthService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadInvitations();
    } else {
      this.loading = false;
    }
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
