import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { InvitationService } from '../../services/invitation.service';
import { Invitation } from '../../models/models';

@Component({
  selector: 'app-invitation-view',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule, DatePipe, TitleCasePipe],
  template: `
    @if (loading) {
      <div class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else if (!invitation) {
      <div class="not-found">
        <mat-icon>error_outline</mat-icon>
        <h2>Invitation Not Found</h2>
        <p>The invitation you're looking for doesn't exist or has been removed.</p>
        <a mat-raised-button color="primary" routerLink="/">Go Home</a>
      </div>
    } @else if (!invitation.isActive) {
      <div class="not-found">
        <mat-icon>lock_outline</mat-icon>
        <h2>Invitation Not Available</h2>
        <p>This invitation is not currently active.</p>
        <a mat-raised-button color="primary" routerLink="/">Go Home</a>
      </div>
    } @else {
      <div class="invitation-page" 
           [style.--primary-color]="getPrimaryColor()" 
           [style.--accent-color]="getAccentColor()"
           [style.background-image]="getBackgroundImage()">
        
        <div class="overlay"></div>
        
        <div class="invitation-content">
          <!-- Header Section -->
          <div class="invitation-header">
            <div class="event-badge">
              <mat-icon>{{ getEventIcon(invitation.eventType) }}</mat-icon>
              <span>{{ invitation.eventType | titlecase }}</span>
            </div>
            <h1>{{ invitation.title }}</h1>
            <p class="hosted-by">Hosted by {{ invitation.hostName }}</p>
          </div>
          
          <!-- Main Details Card -->
          <mat-card class="invitation-details">
            <mat-card-content>
              <!-- Date & Time -->
              <div class="main-info">
                <div class="info-block">
                  <mat-icon>event</mat-icon>
                  <div>
                    <span class="label">Date</span>
                    <span class="value">{{ invitation.eventDate | date:'EEEE, MMMM d, yyyy' }}</span>
                  </div>
                </div>
                
                <div class="info-block">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <span class="label">Time</span>
                    <span class="value">{{ invitation.eventTime }}</span>
                  </div>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <!-- Venue -->
              <div class="venue-section">
                <mat-icon>location_on</mat-icon>
                <div>
                  <span class="label">Venue</span>
                  <span class="value venue-name">{{ invitation.venue }}</span>
                  <span class="address">{{ invitation.venueAddress }}</span>
                  @if (invitation.venueMapUrl) {
                    <a [href]="invitation.venueMapUrl" target="_blank" class="map-link">
                      <mat-icon>map</mat-icon>
                      View on Map
                    </a>
                  }
                </div>
              </div>
              
              @if (invitation.dressCode) {
                <mat-divider></mat-divider>
                <div class="info-block">
                  <mat-icon>checkroom</mat-icon>
                  <div>
                    <span class="label">Dress Code</span>
                    <span class="value">{{ invitation.dressCode }}</span>
                  </div>
                </div>
              }
              
              @if (invitation.description) {
                <mat-divider></mat-divider>
                <div class="description-section">
                  <h3>About This Event</h3>
                  <p>{{ invitation.description }}</p>
                </div>
              }
              
              @if (invitation.additionalInfo) {
                <mat-divider></mat-divider>
                <div class="additional-info">
                  <h3>Additional Information</h3>
                  <p>{{ invitation.additionalInfo }}</p>
                </div>
              }
              
              @if (invitation.rsvpDeadline) {
                <mat-divider></mat-divider>
                <div class="deadline-section">
                  <mat-icon>timer</mat-icon>
                  <div>
                    <span class="label">Please RSVP by</span>
                    <span class="value deadline">{{ invitation.rsvpDeadline | date:'MMMM d, yyyy' }}</span>
                  </div>
                </div>
              }
            </mat-card-content>
            
            <mat-card-actions>
              <a mat-raised-button color="primary" [routerLink]="['/rsvp', invitation._id]" class="rsvp-button">
                <mat-icon>check_circle</mat-icon>
                RSVP Now
              </a>
            </mat-card-actions>
          </mat-card>
          
          <!-- Contact Section -->
          @if (invitation.hostContact || invitation.hostEmail) {
            <div class="contact-section">
              <p>Questions? Contact the host:</p>
              <div class="contact-info">
                @if (invitation.hostContact) {
                  <a [href]="'tel:' + invitation.hostContact" class="contact-link">
                    <mat-icon>phone</mat-icon>
                    {{ invitation.hostContact }}
                  </a>
                }
                @if (invitation.hostEmail) {
                  <a [href]="'mailto:' + invitation.hostEmail" class="contact-link">
                    <mat-icon>email</mat-icon>
                    {{ invitation.hostEmail }}
                  </a>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      padding: 20px;
    }
    
    .not-found mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
    }
    
    .invitation-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%);
      background-size: cover;
      background-position: center;
      position: relative;
      padding: 40px 20px;
    }
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 0;
    }
    
    .invitation-content {
      position: relative;
      z-index: 1;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .invitation-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
      padding-top: 40px;
    }
    
    .event-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 0.9rem;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }
    
    .event-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .invitation-header h1 {
      font-size: 2.8rem;
      margin: 0 0 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: 300;
      letter-spacing: 1px;
    }
    
    .hosted-by {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }
    
    .invitation-details {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px 0;
    }
    
    .info-block, .venue-section, .deadline-section {
      display: flex;
      gap: 16px;
      padding: 16px 0;
    }
    
    .info-block mat-icon, .venue-section mat-icon, .deadline-section mat-icon {
      color: var(--primary-color, #667eea);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .label {
      display: block;
      font-size: 0.85rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .value {
      display: block;
      font-size: 1.1rem;
      color: #333;
      font-weight: 500;
    }
    
    .venue-name {
      font-size: 1.2rem;
    }
    
    .address {
      display: block;
      color: #666;
      margin-top: 4px;
      font-size: 0.95rem;
    }
    
    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color, #667eea);
      text-decoration: none;
      margin-top: 12px;
      font-size: 0.9rem;
    }
    
    .map-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .map-link:hover {
      text-decoration: underline;
    }
    
    .description-section, .additional-info {
      padding: 20px 0;
    }
    
    .description-section h3, .additional-info h3 {
      color: var(--primary-color, #667eea);
      font-size: 1rem;
      margin: 0 0 12px;
      font-weight: 500;
    }
    
    .description-section p, .additional-info p {
      color: #555;
      line-height: 1.7;
      margin: 0;
      white-space: pre-line;
    }
    
    .deadline {
      color: #e91e63 !important;
    }
    
    mat-card-actions {
      display: flex;
      justify-content: center;
      padding: 30px !important;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }
    
    .rsvp-button {
      padding: 0 50px;
      height: 54px;
      font-size: 1.1rem;
      border-radius: 27px;
    }
    
    .contact-section {
      text-align: center;
      color: white;
      margin-top: 40px;
      padding: 20px;
    }
    
    .contact-section p {
      margin: 0 0 16px;
      opacity: 0.9;
    }
    
    .contact-info {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .contact-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 20px;
      border-radius: 50px;
      backdrop-filter: blur(10px);
      transition: background 0.3s;
    }
    
    .contact-link:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .contact-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    @media (max-width: 600px) {
      .invitation-header h1 {
        font-size: 2rem;
      }
      
      .main-info {
        grid-template-columns: 1fr;
        gap: 0;
      }
      
      .contact-info {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class InvitationViewComponent implements OnInit {
  invitation: Invitation | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invitationService.getById(id).subscribe({
        next: (data) => {
          this.invitation = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  getPrimaryColor(): string {
    return this.invitation?.customStyles?.primaryColor || '#667eea';
  }

  getAccentColor(): string {
    return this.invitation?.customStyles?.accentColor || '#764ba2';
  }

  getBackgroundImage(): string {
    if (this.invitation?.customStyles?.backgroundImage) {
      return `url('${this.invitation.customStyles.backgroundImage}')`;
    }
    return 'none';
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
