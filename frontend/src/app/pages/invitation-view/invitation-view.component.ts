import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe, TitleCasePipe, CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InvitationService } from '../../services/invitation.service';
import { GuestService } from '../../services/guest.service';
import { Invitation } from '../../models/models';
import { AnimationCanvasComponent, AnimationType } from '../../components/animation-canvas/animation-canvas.component';

// Invitation Details Dialog Component
@Component({
  selector: 'app-invitation-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    DatePipe,
    TitleCasePipe
  ],
  template: `
    <div class="details-dialog" [style.--primary-color]="data.invitation.customStyles?.primaryColor || '#667eea'"
         [style.--accent-color]="data.invitation.customStyles?.accentColor || '#764ba2'">
      <button mat-icon-button class="close-btn" mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
      
      <div class="dialog-header">
        <div class="event-badge">
          <mat-icon>{{ getEventIcon(data.invitation.eventType) }}</mat-icon>
          <span>{{ data.invitation.eventType | titlecase }}</span>
        </div>
        <h1>{{ data.invitation.title }}</h1>
        <p class="hosted-by">Hosted by {{ data.invitation.hostName }}</p>
      </div>

      <div class="dialog-content">
        <!-- Date & Time -->
        <div class="main-info">
          <div class="info-block">
            <mat-icon>event</mat-icon>
            <div>
              <span class="label">Date</span>
              <span class="value">{{ data.invitation.eventDate | date:'EEEE, MMMM d, yyyy' }}</span>
            </div>
          </div>
          
          <div class="info-block">
            <mat-icon>schedule</mat-icon>
            <div>
              <span class="label">Time</span>
              <span class="value">{{ data.invitation.eventTime }}</span>
            </div>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <!-- Venue -->
        <div class="venue-section">
          <mat-icon>location_on</mat-icon>
          <div>
            <span class="label">WHERE</span>
            <span class="value venue-name">{{ data.invitation.venue }}</span>
            <span class="address">{{ data.invitation.venueAddress }}</span>
            @if (data.invitation.venueMapUrl) {
              <a [href]="data.invitation.venueMapUrl" target="_blank" class="map-link">
                <mat-icon>map</mat-icon>
                View on Map
              </a>
            }
          </div>
        </div>
        
        @if (data.invitation.dressCode) {
          <mat-divider></mat-divider>
          <div class="info-block">
            <mat-icon>checkroom</mat-icon>
            <div>
              <span class="label">Dress Code</span>
              <span class="value">{{ data.invitation.dressCode }}</span>
            </div>
          </div>
        }
        
        @if (data.invitation.description) {
          <mat-divider></mat-divider>
          <div class="description-section">
            <h3>About This Event</h3>
            <p>{{ data.invitation.description }}</p>
          </div>
        }
        
        @if (data.invitation.additionalInfo) {
          <mat-divider></mat-divider>
          <div class="additional-info">
            <h3>Additional Information</h3>
            <p>{{ data.invitation.additionalInfo }}</p>
          </div>
        }
        
        @if (data.invitation.spotifyPlaylistUrl) {
          <mat-divider></mat-divider>
          <div class="spotify-section">
            <h3><mat-icon>library_music</mat-icon> Event Playlist</h3>
            <p>Check out our playlist for this event!</p>
            <a [href]="data.invitation.spotifyPlaylistUrl" target="_blank" rel="noopener" class="spotify-link">
              <mat-icon>play_circle</mat-icon>
              Open in Spotify
            </a>
          </div>
        }
        
        @if (data.invitation.rsvpDeadline) {
          <mat-divider></mat-divider>
          <div class="deadline-section">
            <mat-icon>timer</mat-icon>
            <div>
              <span class="label">Please Respond by</span>
              <span class="value deadline">{{ data.invitation.rsvpDeadline | date:'MMMM d, yyyy' }}</span>
            </div>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button mat-raised-button class="rsvp-button" (click)="onRsvpClick()">
          <mat-icon>how_to_reg</mat-icon>
          Respond Now
        </button>
        
        @if (data.invitation.hostContact || data.invitation.hostEmail) {
          <div class="contact-info">
            <p>Questions? Contact:</p>
            <div class="contact-links">
              @if (data.invitation.hostContact) {
                <a [href]="'tel:' + data.invitation.hostContact" class="contact-link">
                  <mat-icon>phone</mat-icon>
                </a>
              }
              @if (data.invitation.hostEmail) {
                <a [href]="'mailto:' + data.invitation.hostEmail" class="contact-link">
                  <mat-icon>email</mat-icon>
                </a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .details-dialog {
      padding: 0;
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .details-dialog::-webkit-scrollbar {
      display: none;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
      background: rgba(0, 0, 0, 0.3);
      color: white;
    }

    .dialog-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: white;
      padding: 40px 24px 30px;
      text-align: center;
    }

    .event-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 0.9rem;
      margin-bottom: 16px;
      backdrop-filter: blur(10px);
    }

    .event-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .dialog-header h1 {
      font-size: 2rem;
      margin: 0 0 12px;
      font-weight: 300;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hosted-by {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .dialog-content {
      padding: 24px;
      background: white;
    }

    .main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 16px 0;
    }

    .info-block, .venue-section, .deadline-section {
      display: flex;
      gap: 14px;
      padding: 16px 0;
    }

    .info-block mat-icon, .venue-section mat-icon, .deadline-section mat-icon {
      color: var(--primary-color);
      font-size: 26px;
      width: 26px;
      height: 26px;
      flex-shrink: 0;
    }

    .label {
      display: block;
      font-size: 0.75rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .value {
      display: block;
      font-size: 1.1rem;
      color: #333;
      font-weight: 500;
    }

    .venue-name {
      font-size: 1.15rem;
    }

    .address {
      display: block;
      color: #666;
      margin-top: 4px;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color);
      text-decoration: none;
      margin-top: 10px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .map-link mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .description-section, .additional-info {
      padding: 20px 0;
    }

    .description-section h3, .additional-info h3 {
      color: var(--primary-color);
      font-size: 0.95rem;
      margin: 0 0 10px;
      font-weight: 600;
    }

    .description-section p, .additional-info p {
      color: #555;
      line-height: 1.7;
      margin: 0;
      white-space: pre-line;
    }

    .spotify-section {
      padding: 20px 0;
      text-align: center;
    }

    .spotify-section h3 {
      color: var(--primary-color);
      font-size: 0.95rem;
      margin: 0 0 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .spotify-section p {
      color: #555;
      margin: 0 0 14px;
    }

    .spotify-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1DB954;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .spotify-link:hover {
      background: #1ed760;
      transform: scale(1.05);
    }

    .deadline {
      color: #e91e63 !important;
    }

    .dialog-actions {
      padding: 20px 24px 24px;
      background: #f8f9fa;
      text-align: center;
      border-top: 1px solid #eee;
    }

    .rsvp-button {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%) !important;
      color: white !important;
      padding: 14px 40px !important;
      font-size: 1.1rem !important;
      border-radius: 50px !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
      height: auto !important;
    }

    .rsvp-button mat-icon {
      margin-right: 8px;
    }

    .contact-info {
      margin-top: 20px;
    }

    .contact-info p {
      color: #888;
      font-size: 0.85rem;
      margin: 0 0 10px;
    }

    .contact-links {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .contact-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      text-decoration: none;
      transition: all 0.3s;
    }

    .contact-link:hover {
      transform: scale(1.1);
    }

    .contact-link mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    @media (max-width: 480px) {
      .dialog-header h1 {
        font-size: 1.6rem;
      }

      .main-info {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .dialog-content {
        padding: 16px;
      }
    }
  `]
})
export class InvitationDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InvitationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invitation: Invitation }
  ) { }

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

  onRsvpClick() {
    this.dialogRef.close('rsvp');
  }
}

// RSVP Dialog Component
@Component({
  selector: 'app-rsvp-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="rsvp-dialog">
      @if (submitted) {
        <div class="success-content">
          <mat-icon class="success-icon">{{ rsvpResponse === 'confirmed' ? 'celebration' : 'thumb_up' }}</mat-icon>
          <h2>Thank You, {{ submittedName }}!</h2>
          @if (rsvpResponse === 'confirmed') {
            <p>We're excited to see you at the event!</p>
          } @else {
            <p>We're sorry you can't make it. Thank you for letting us know.</p>
          }
          <button mat-raised-button color="primary" mat-dialog-close class="close-btn">
            <mat-icon>check</mat-icon>
            Close
          </button>
        </div>
      } @else {
        <div class="dialog-header">
          <mat-icon>how_to_reg</mat-icon>
          <div>
            <h2>RSVP</h2>
            <p>Let us know if you'll be attending</p>
          </div>
          <button mat-icon-button mat-dialog-close class="close-icon">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <form [formGroup]="rsvpForm" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Your Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter your full name">
            @if (rsvpForm.get('name')?.hasError('required') && rsvpForm.get('name')?.touched) {
              <mat-error>Please enter your name</mat-error>
            }
          </mat-form-field>

          <div class="response-section">
            <label class="response-label">Will you attend?</label>
            <mat-radio-group formControlName="rsvpStatus" class="response-options">
              <mat-radio-button value="confirmed" color="primary">
                <span class="response-option">
                  <mat-icon>check_circle</mat-icon>
                  Yes, I'll be there!
                </span>
              </mat-radio-button>
              <mat-radio-button value="declined" color="primary">
                <span class="response-option">
                  <mat-icon>cancel</mat-icon>
                  Sorry, I can't make it
                </span>
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message for the Host (Optional)</mat-label>
            <textarea matInput formControlName="message" rows="3" placeholder="Any message or well wishes..."></textarea>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="submitting || rsvpForm.invalid" 
                  class="submit-btn">
            @if (submitting) {
              <mat-spinner diameter="24"></mat-spinner>
            } @else {
              <ng-container>
                Send My Response
              </ng-container>
            }
          </button>
        </form>
      }
    </div>
  `,
  styles: [`
    .rsvp-dialog {
      padding: 24px;
      min-width: 300px;
      max-width: 450px;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 480px) {
      .rsvp-dialog {
        padding: 20px;
        min-width: 280px;
        max-width: 90vw;
      }

      .dialog-header > mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .dialog-header h2 {
        font-size: 1.25rem;
      }

      .success-icon {
        font-size: 60px;
        width: 60px;
        height: 60px;
      }
    }
    
    .dialog-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      position: relative;
    }
    
    .dialog-header > mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }
    
    .dialog-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }
    
    .dialog-header p {
      margin: 4px 0 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .close-icon {
      position: absolute;
      top: -8px;
      right: -8px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .response-section {
      margin: 16px 0 24px;
    }
    
    .response-label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .response-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .response-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .response-option mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .submit-btn {
      width: 100%;
      height: 50px;
      font-size: 1rem;
      margin-top: 16px;
      border-radius: 25px;
    }
    
    .success-content {
      text-align: center;
      padding: 20px 0;
    }
    
    .success-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #667eea;
    }
    
    .success-content h2 {
      margin: 20px 0 8px;
      color: #333;
    }
    
    .success-content p {
      color: #666;
      margin-bottom: 24px;
    }
    
    .close-btn {
      border-radius: 25px;
      padding: 0 32px;
    }
  `]
})
export class RsvpDialogComponent {
  rsvpForm: FormGroup;
  submitting = false;
  submitted = false;
  rsvpResponse = '';
  submittedName = '';

  constructor(
    private fb: FormBuilder,
    private guestService: GuestService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RsvpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invitation: Invitation }
  ) {
    this.rsvpForm = this.fb.group({
      name: ['', Validators.required],
      rsvpStatus: ['confirmed', Validators.required],
      message: ['']
    });
  }

  submit() {
    if (this.rsvpForm.invalid) return;

    this.submitting = true;
    const formData = this.rsvpForm.value;

    this.submittedName = formData.name;
    this.rsvpResponse = formData.rsvpStatus;

    const guestData = {
      name: formData.name,
      rsvpStatus: formData.rsvpStatus,
      message: formData.message || '',
      numberOfGuests: 1
    };

    this.guestService.submitRsvp(this.data.invitation._id!, guestData).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to submit RSVP', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }
}

@Component({
  selector: 'app-invitation-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    DatePipe,
    AnimationCanvasComponent
  ],
  template: `
    @if (loading) {
      <div class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading invitation...</p>
      </div>
    } @else if (!invitation) {
      <div class="error-page">
        <div class="error-content">
          <mat-icon>error_outline</mat-icon>
          <h1>Invitation Not Found</h1>
          <p>The invitation you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    } @else if (!invitation.isActive) {
      <div class="error-page">
        <div class="error-content">
          <mat-icon>lock_outline</mat-icon>
          <h1>Invitation Not Available</h1>
          <p>This invitation is not currently active.</p>
        </div>
      </div>
    } @else {
      <div class="invitation-page" 
           [style.--primary-color]="getPrimaryColor()" 
           [style.--accent-color]="getAccentColor()"
           [style.background-image]="getBackgroundImage()">
        
        <div class="overlay"></div>
        
        <!-- Floating Header -->
        <div class="floating-header">
          <h1>{{ invitation.title }}</h1>
          <p class="hosted-by"> Hosted by {{ invitation.hostName }}</p>
        </div>

        <!-- Animated Envelope -->
        <div class="envelope-container" (click)="openDetailsDialog()">
          <div class="envelope" [class.bounce]="!envelopeClicked">
            <div class="envelope-back"></div>
            <div class="envelope-front">
              <div class="envelope-flap"></div>
              <div class="envelope-letter">
                <div class="letter-content">
                  <mat-icon class="letter-icon">{{ getEventIcon(invitation.eventType) }}</mat-icon>
                  <span class="letter-text">You're Invited!</span>
                </div>
              </div>
            </div>
            <div class="envelope-shadow"></div>
          </div>
          <p class="tap-hint">
            <mat-icon>touch_app</mat-icon>
            Tap to open
          </p>
        </div>

        <!-- Quick Info Pills -->
        <div class="quick-info">
          <div class="info-pill">
            <mat-icon>event</mat-icon>
            <span>{{ invitation.eventDate | date:'MMM d, yyyy' }}</span>
          </div>
          <div class="info-pill">
            <mat-icon>schedule</mat-icon>
            <span>{{ invitation.eventTime }}</span>
          </div>
        </div>
        
        <!-- Canvas Animation Layer -->
        @if (getAnimation() && getAnimation() !== 'none') {
          <app-animation-canvas 
            [animation]="getAnimationType()"
            [primaryColor]="getPrimaryColor()"
            [accentColor]="getAccentColor()">
          </app-animation-canvas>
        }
      </div>
    }
  `,
  styles: [`
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .loading p {
      margin-top: 20px;
      font-size: 1.1rem;
    }
    
    .error-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .error-content {
      text-align: center;
      color: white;
      padding: 40px;
    }
    
    .error-content mat-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      opacity: 0.8;
    }
    
    .error-content h1 {
      font-size: 2rem;
      margin: 20px 0 10px;
      font-weight: 300;
    }
    
    .error-content p {
      opacity: 0.9;
      font-size: 1.1rem;
    }
    
    .invitation-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%);
      background-size: contain;
      background-repeat: repeat;
      background-position: center;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(0, 0, 0, 0.3) 100%
      );
      z-index: 0;
      pointer-events: none;
    }

    /* Floating Header */
    .floating-header {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .floating-header h1 {
      font-size: 2.5rem;
      margin: 0 0 8px;
      font-weight: 300;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
      letter-spacing: 1px;
    }

    .floating-header .hosted-by {
      font-size: 1.1rem;
      opacity: 0.9;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
      margin: 0;
    }

    /* Envelope Container */
    .envelope-container {
      position: relative;
      z-index: 2;
      cursor: pointer;
      opacity: 0.8;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .envelope {
      position: relative;
      width: 200px;
      height: 140px;
      perspective: 1000px;
      transition: transform 0.3s ease;
    }

    .envelope:hover {
      transform: scale(1.05);
    }

    .envelope:active {
      transform: scale(0.98);
    }

    .envelope.bounce {
      animation: envelopeBounce 2s ease-in-out infinite;
    }

    @keyframes envelopeBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    .envelope-back {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 8px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .envelope-front {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
      border-radius: 8px;
      overflow: hidden;
    }

    .envelope-flap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 45px;
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%);
      clip-path: polygon(0 0, 50% 100%, 100% 0);
      transform-origin: top center;
      z-index: 2;
    }

    .envelope-letter {
      position: absolute;
      top: 30px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(0, 0, 0, 0.05);
    }

    .letter-content {
      text-align: center;
      color: var(--primary-color, #667eea);
    }

    .letter-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      margin-bottom: 4px;
    }

    .letter-text {
      display: block;
      font-weight: 600;
    }

    .envelope-shadow {
      position: absolute;
      bottom: -20px;
      left: 10%;
      width: 80%;
      height: 20px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%);
    }

    .tap-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 0.95rem;
      margin-top: 30px;
      opacity: 0.9;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }

    .tap-hint mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 0.5; }
    }

    /* Quick Info Pills */
    .quick-info {
      position: relative;
      z-index: 2;
      display: flex;
      gap: 16px;
      margin-top: 40px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .info-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 12px 20px;
      border-radius: 50px;
      color: white;
      font-size: 0.95rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.3);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    .info-pill mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .floating-header h1 {
        font-size: 1.8rem;
      }

      .envelope {
        width: 180px;
        height: 126px;
      }

      .envelope-flap {
        height: 45px;
      }

      .letter-icon {
        font-size: 25px;
        width: 25px;
        height: 25px;
      }

      .letter-text {
        font-size: 0.75rem;
      }

      .quick-info {
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .info-pill {
        font-size: 0.85rem;
        padding: 10px 18px;
      }
    }
  `]
})
export class InvitationViewComponent implements OnInit {
  invitation: Invitation | null = null;
  loading = true;
  envelopeClicked = false;

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    private dialog: MatDialog
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

  openDetailsDialog() {
    if (!this.invitation) return;
    this.envelopeClicked = true;

    const dialogRef = this.dialog.open(InvitationDetailsDialogComponent, {
      data: { invitation: this.invitation },
      panelClass: 'invitation-details-dialog-panel',
      maxWidth: '95vw',
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'rsvp') {
        this.openRsvpDialog();
      }
    });
  }

  openRsvpDialog() {
    if (!this.invitation) return;

    this.dialog.open(RsvpDialogComponent, {
      data: { invitation: this.invitation },
      panelClass: 'rsvp-dialog-panel',
      maxWidth: '95vw'
    });
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

  getAnimation(): string {
    return this.invitation?.customStyles?.animation || 'none';
  }

  getAnimationType(): AnimationType {
    const anim = this.invitation?.customStyles?.animation;
    if (anim === 'confetti' || anim === 'hearts' || anim === 'balloons' ||
      anim === 'sparkles' || anim === 'stars' || anim === 'fireworks') {
      return anim;
    }
    return 'none';
  }
}
