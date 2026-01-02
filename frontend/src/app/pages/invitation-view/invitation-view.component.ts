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
import { InvitationService } from '../../services/invitation.service';
import { GuestService } from '../../services/guest.service';
import { Invitation } from '../../models/models';
import { AnimationCanvasComponent, AnimationType } from '../../components/animation-canvas/animation-canvas.component';

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
            <mat-icon matPrefix>person</mat-icon>
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
            <mat-icon matPrefix>message</mat-icon>
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
      min-width: 350px;
      max-width: 450px;
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
    TitleCasePipe,
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
                  <span class="label">WHERE</span>
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
              
              @if (invitation.spotifyPlaylistUrl) {
                <mat-divider></mat-divider>
                <div class="spotify-section">
                  <h3><mat-icon>library_music</mat-icon> Event Playlist</h3>
                  <p>Check out our playlist for this event!</p>
                  <a [href]="invitation.spotifyPlaylistUrl" target="_blank" rel="noopener" class="spotify-link">
                    <mat-icon>play_circle</mat-icon>
                    Open in Spotify
                  </a>
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
          </mat-card>

          <!-- RSVP Button -->
          <div class="rsvp-cta">
            <button mat-raised-button class="rsvp-button" (click)="openRsvpDialog()">
              <mat-icon>how_to_reg</mat-icon>
              RSVP Now
            </button>
            <p class="rsvp-hint">Click to let us know if you'll be attending</p>
          </div>
          
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
        
        <!-- Canvas Animation Layer (rendered in front) -->
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
      background-size: auto;
      background-repeat: repeat;
      background-position: top left;
      background-attachment: fixed;
      position: relative;
      padding: 40px 20px 60px;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 0;
      pointer-events: none;
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
      padding-top: 20px;
    }
    
    .event-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 24px;
      border-radius: 50px;
      font-size: 0.95rem;
      margin-bottom: 24px;
      backdrop-filter: blur(10px);
    }
    
    .event-badge mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    
    .invitation-header h1 {
      font-size: 2.8rem;
      margin: 0 0 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: 300;
      letter-spacing: 1px;
      line-height: 1.2;
    }
    
    .hosted-by {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }
    
    .invitation-details, .rsvp-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      margin-bottom: 24px;
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
      padding: 20px 0;
    }
    
    .info-block mat-icon, .venue-section mat-icon, .deadline-section mat-icon {
      color: var(--primary-color, #667eea);
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }
    
    .label {
      display: block;
      font-size: 0.8rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    
    .value {
      display: block;
      font-size: 1.15rem;
      color: #333;
      font-weight: 500;
    }
    
    .venue-name {
      font-size: 1.25rem;
    }
    
    .address {
      display: block;
      color: #666;
      margin-top: 6px;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-color, #667eea);
      text-decoration: none;
      margin-top: 12px;
      font-size: 0.9rem;
      font-weight: 500;
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
      padding: 24px 0;
    }
    
    .description-section h3, .additional-info h3 {
      color: var(--primary-color, #667eea);
      font-size: 1rem;
      margin: 0 0 12px;
      font-weight: 600;
    }
    
    .description-section p, .additional-info p {
      color: #555;
      line-height: 1.8;
      margin: 0;
      white-space: pre-line;
    }
    
    .spotify-section {
      padding: 24px 0;
      text-align: center;
    }
    
    .spotify-section h3 {
      color: var(--primary-color, #667eea);
      font-size: 1rem;
      margin: 0 0 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .spotify-section p {
      color: #555;
      margin: 0 0 16px;
    }
    
    .spotify-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1DB954;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
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
    
    /* RSVP CTA Button */
    .rsvp-cta {
      text-align: center;
      padding: 30px 0;
    }
    
    .rsvp-button {
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%) !important;
      color: white !important;
      padding: 16px 48px !important;
      font-size: 1.2rem !important;
      border-radius: 50px !important;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
      transition: all 0.3s ease !important;
      height: auto !important;
    }
    
    .rsvp-button:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
    }
    
    .rsvp-button mat-icon {
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .rsvp-hint {
      color: white;
      opacity: 0.9;
      margin-top: 16px;
      font-size: 0.95rem;
    }
    
    /* Contact Section */
    .contact-section {
      text-align: center;
      color: white;
      padding: 30px 20px;
    }
    
    .contact-section > p {
      margin: 0 0 16px;
      opacity: 0.9;
    }
    
    .contact-info {
      display: flex;
      gap: 16px;
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
      padding: 12px 24px;
      border-radius: 50px;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    }
    
    .contact-link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
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
      
      .invitation-page {
        padding: 20px 16px 40px;
        background-position: center;
      }
    }
  `]
})
export class InvitationViewComponent implements OnInit {
  invitation: Invitation | null = null;
  loading = true;

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
