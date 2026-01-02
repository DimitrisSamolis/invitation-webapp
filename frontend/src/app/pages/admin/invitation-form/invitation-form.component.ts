import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { InvitationService } from '../../../services/invitation.service';
import { ThemeService } from '../../../services/theme.service';
import { Theme, Invitation } from '../../../models/models';
import { AnimationCanvasComponent, AnimationType } from '../../../components/animation-canvas/animation-canvas.component';

// Preview Details Dialog Component
@Component({
  selector: 'app-preview-details-dialog',
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
    <div class="details-dialog" [style.--primary-color]="data.primaryColor || '#667eea'"
         [style.--accent-color]="data.accentColor || '#764ba2'">
      <button mat-icon-button class="close-btn" mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
      
      <div class="dialog-header">
        <div class="event-badge">
          <mat-icon>{{ getEventIcon(data.eventType) }}</mat-icon>
          <span>{{ data.eventType | titlecase }}</span>
        </div>
        <h1>{{ data.title || 'Your Event Title' }}</h1>
        <p class="hosted-by">Hosted by {{ data.hostName || 'Host Name' }}</p>
      </div>

      <div class="dialog-content">
        <!-- Date & Time -->
        <div class="main-info">
          <div class="info-block">
            <mat-icon>event</mat-icon>
            <div>
              <span class="label">Date</span>
              <span class="value">{{ data.eventDate | date:'EEEE, MMMM d, yyyy' }}</span>
            </div>
          </div>
          
          <div class="info-block">
            <mat-icon>schedule</mat-icon>
            <div>
              <span class="label">Time</span>
              <span class="value">{{ data.eventTime || 'Time TBD' }}</span>
            </div>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <!-- Venue -->
        <div class="venue-section">
          <mat-icon>location_on</mat-icon>
          <div>
            <span class="label">WHERE</span>
            <span class="value venue-name">{{ data.venue || 'Venue TBD' }}</span>
            @if (data.venueAddress) {
              <span class="address">{{ data.venueAddress }}</span>
            }
            @if (data.venueMapUrl) {
              <a [href]="data.venueMapUrl" target="_blank" class="map-link">
                <mat-icon>map</mat-icon>
                View on Map
              </a>
            }
          </div>
        </div>
        
        @if (data.dressCode) {
          <mat-divider></mat-divider>
          <div class="info-block">
            <mat-icon>checkroom</mat-icon>
            <div>
              <span class="label">Dress Code</span>
              <span class="value">{{ data.dressCode }}</span>
            </div>
          </div>
        }
        
        @if (data.description) {
          <mat-divider></mat-divider>
          <div class="description-section">
            <h3>About This Event</h3>
            <p>{{ data.description }}</p>
          </div>
        }
        
        @if (data.additionalInfo) {
          <mat-divider></mat-divider>
          <div class="additional-info">
            <h3>Additional Information</h3>
            <p>{{ data.additionalInfo }}</p>
          </div>
        }
        
        @if (data.spotifyPlaylistUrl) {
          <mat-divider></mat-divider>
          <div class="spotify-section">
            <h3><mat-icon>library_music</mat-icon> Event Playlist</h3>
            <p>Check out our playlist for this event!</p>
            <a [href]="data.spotifyPlaylistUrl" target="_blank" rel="noopener" class="spotify-link">
              <mat-icon>play_circle</mat-icon>
              Open in Spotify
            </a>
          </div>
        }
        
        @if (data.rsvpDeadline) {
          <mat-divider></mat-divider>
          <div class="deadline-section">
            <mat-icon>timer</mat-icon>
            <div>
              <span class="label">Please Respond by</span>
              <span class="value deadline">{{ data.rsvpDeadline | date:'MMMM d, yyyy' }}</span>
            </div>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button mat-raised-button class="rsvp-button" mat-dialog-close>
          <mat-icon>how_to_reg</mat-icon>
          Respond Now
        </button>
        <p class="preview-note">This is a preview - guests will see this when they tap the envelope</p>
      </div>
    </div>
  `,
  styles: [`
    .details-dialog {
      padding: 0;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
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

    .preview-note {
      color: #888;
      font-size: 0.8rem;
      margin: 16px 0 0;
      font-style: italic;
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
export class PreviewDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PreviewDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
}

@Component({
  selector: 'app-invitation-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    ClipboardModule,
    MatDialogModule,
    DatePipe,
    AnimationCanvasComponent
  ],
  template: `
    <div class="page-container">
      @if (createdInvitation) {
        <!-- Success Card with Shareable Link -->
        <mat-card class="success-card">
          <mat-card-content>
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h2>Invitation Created Successfully!</h2>
            <p>Share this link with your guests:</p>
            
            <div class="link-box">
              <input type="text" [value]="getShareableLink()" readonly #linkInput>
              <button mat-icon-button (click)="copyLink()" matTooltip="Copy Link">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            
            <div class="action-buttons">
              <a mat-stroked-button [href]="getShareableLink()" target="_blank">
                <mat-icon>visibility</mat-icon>
                Preview Invitation
              </a>
              <button mat-stroked-button (click)="copyLink()">
                <mat-icon>share</mat-icon>
                Copy Link
              </button>
              <a mat-raised-button color="primary" routerLink="/admin/invitations">
                <mat-icon>list</mat-icon>
                View All Invitations
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="form-preview-layout" [class.preview-active]="showPreview">
          <!-- Form Section -->
          <div class="form-section">
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>{{ isEdit ? 'edit' : 'add' }}</mat-icon>
                <mat-card-title>{{ isEdit ? 'Edit' : 'Create' }} Invitation</mat-card-title>
                <button mat-icon-button class="preview-toggle" (click)="togglePreview()" 
                  [matTooltip]="showPreview ? 'Hide Preview' : 'Show Preview'">
                  <mat-icon>{{ showPreview ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-card-header>

          <mat-card-content>
            <form [formGroup]="invitationForm" (ngSubmit)="onSubmit()">
              <!-- Basic Info -->
              <h3 class="section-title">Basic Information</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Event Title</mat-label>
                  <input matInput formControlName="title" placeholder="e.g., John & Jane's Wedding">
                  <mat-hint>This will be the main heading of your invitation</mat-hint>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Event Type</mat-label>
                  <mat-select formControlName="eventType" (selectionChange)="onEventTypeChange($event.value)">
                    <mat-option value="wedding">💒 Wedding</mat-option>
                    <mat-option value="birthday">🎂 Birthday</mat-option>
                    <mat-option value="corporate">💼 Corporate</mat-option>
                    <mat-option value="party">🎉 Party</mat-option>
                    <mat-option value="other">📅 Other</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Theme Selection -->
              <h3 class="section-title">Choose a Theme</h3>
              <div class="theme-grid">
                @for (theme of getThemesForEventType(); track theme.id) {
                  <div class="theme-card" 
                       [class.selected]="selectedBuiltInTheme === theme.id"
                       (click)="selectBuiltInTheme(theme)">
                    <div class="theme-preview" 
                         [style.background]="theme.gradient">
                      <div class="theme-animation-preview">
                        @if (theme.animation === 'confetti') {
                          <span class="mini-confetti">🎊</span>
                        } @else if (theme.animation === 'hearts') {
                          <span class="mini-hearts">💕</span>
                        } @else if (theme.animation === 'balloons') {
                          <span class="mini-balloons">🎈</span>
                        } @else if (theme.animation === 'sparkles') {
                          <span class="mini-sparkles">✨</span>
                        } @else if (theme.animation === 'stars') {
                          <span class="mini-stars">⭐</span>
                        } @else if (theme.animation === 'fireworks') {
                          <span class="mini-fireworks">🎆</span>
                        }
                      </div>
                    </div>
                    <div class="theme-info">
                      <span class="theme-name">{{ theme.name }}</span>
                      <span class="theme-desc">{{ theme.description }}</span>
                    </div>
                    @if (selectedBuiltInTheme === theme.id) {
                      <mat-icon class="theme-check">check_circle</mat-icon>
                    }
                  </div>
                }
              </div>

              <!-- Date & Time -->
              <h3 class="section-title">Date & Time</h3>
              
              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Event Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="eventDate">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Event Time</mat-label>
                  <input matInput formControlName="eventTime" placeholder="e.g., 6:00 PM">
                </mat-form-field>
              </div>

              <!-- Venue -->
              <h3 class="section-title">Address Details</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Location Name</mat-label>
                  <input matInput formControlName="venue" placeholder="e.g., Grand Ballroom, Hilton Hotel">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="venueAddress" rows="2" placeholder="Full address for your guests"></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Google Maps Link (Optional)</mat-label>
                  <input matInput formControlName="venueMapUrl" placeholder="https://maps.google.com/...">
                  <mat-icon matSuffix>map</mat-icon>
                  <mat-hint>Paste a Google Maps link to help guests find the venue</mat-hint>
                </mat-form-field>
              </div>

              <!-- Event Description -->
              <h3 class="section-title">Event Details</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Event Description</mat-label>
                  <textarea matInput formControlName="description" rows="4" placeholder="Tell your guests about the event, what to expect, special notes..."></textarea>
                  <mat-hint>This will appear on the invitation page</mat-hint>
                </mat-form-field>
              </div>

              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Dress Code (Optional)</mat-label>
                  <input matInput formControlName="dressCode" placeholder="e.g., Black Tie, Casual, Smart Casual">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Max Guests Per RSVP</mat-label>
                  <input matInput type="number" formControlName="maxGuests" placeholder="e.g., 2">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Additional Information (Optional)</mat-label>
                  <textarea matInput formControlName="additionalInfo" rows="3" placeholder="Parking info, gift registry, special instructions..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Spotify Playlist URL (Optional)</mat-label>
                  <input matInput formControlName="spotifyPlaylistUrl" placeholder="https://open.spotify.com/playlist/...">
                  <mat-icon matSuffix>library_music</mat-icon>
                  <mat-hint>Share a playlist with your guests</mat-hint>
                </mat-form-field>
              </div>

              <!-- Host Info -->
              <h3 class="section-title">Host Information</h3>
              
              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Host Name</mat-label>
                  <input matInput formControlName="hostName" placeholder="Who is hosting this event?">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Host Phone (Optional)</mat-label>
                  <input matInput formControlName="hostContact" placeholder="Contact number">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Host Email (Optional)</mat-label>
                  <input matInput formControlName="hostEmail" type="email" placeholder="Email for questions">
                </mat-form-field>
              </div>

              <!-- Respond Settings -->
              <h3 class="section-title">Respond Settings</h3>
              
              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Respond Deadline</mat-label>
                  <input matInput [matDatepicker]="rsvpPicker" formControlName="rsvpDeadline">
                  <mat-datepicker-toggle matSuffix [for]="rsvpPicker"></mat-datepicker-toggle>
                  <mat-datepicker #rsvpPicker></mat-datepicker>
                  <mat-hint>Guests won't be able to respond after this date</mat-hint>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="isActive" color="primary">
                    Active (visible to guests)
                  </mat-slide-toggle>
                  <p class="toggle-hint">Turn off to hide the invitation temporarily</p>
                </div>
              </div>

              <!-- Custom Styling -->
              <mat-expansion-panel class="custom-styles-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>palette</mat-icon>
                    Customize (Optional)
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div formGroupName="customStyles" class="custom-styles-content">
                  <div class="form-row two-col">
                    <mat-form-field appearance="outline">
                      <mat-label>Primary Color</mat-label>
                      <input matInput formControlName="primaryColor" type="color">
                      <mat-hint>Main color for headers</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Accent Color</mat-label>
                      <input matInput formControlName="accentColor" type="color">
                      <mat-hint>Secondary color for gradients</mat-hint>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <div class="background-image-section">
                      <label class="section-label">Background Image (Optional)</label>
                      
                      <div class="image-source-tabs">
                        <button type="button" mat-stroked-button 
                          [class.active]="imageSourceMode === 'url'"
                          (click)="setImageSourceMode('url')">
                          <mat-icon>link</mat-icon>
                          URL
                        </button>
                        <button type="button" mat-stroked-button 
                          [class.active]="imageSourceMode === 'upload'"
                          (click)="setImageSourceMode('upload')">
                          <mat-icon>upload_file</mat-icon>
                          Upload
                        </button>
                      </div>

                      @if (imageSourceMode === 'url') {
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Image URL</mat-label>
                          <input matInput formControlName="backgroundImage" placeholder="https://example.com/image.jpg">
                          <mat-icon matSuffix>image</mat-icon>
                        </mat-form-field>
                      } @else {
                        <div class="upload-area" 
                          (click)="fileInput.click()"
                          (dragover)="onDragOver($event)"
                          (dragleave)="onDragLeave($event)"
                          (drop)="onDrop($event)"
                          [class.drag-over]="isDragging">
                          <input type="file" #fileInput 
                            accept="image/*" 
                            (change)="onFileSelected($event)"
                            style="display: none">
                          <mat-icon>cloud_upload</mat-icon>
                          <p>Drag & drop an image here or click to browse</p>
                          <span class="hint">Supports JPG, PNG, GIF (max 5MB)</span>
                        </div>
                      }

                      @if (imagePreview || invitationForm.get('customStyles.backgroundImage')?.value) {
                        <div class="image-preview">
                          <img [src]="imagePreview || invitationForm.get('customStyles.backgroundImage')?.value" alt="Background preview">
                          <button type="button" mat-icon-button class="remove-image" (click)="removeBackgroundImage()" matTooltip="Remove image">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>

              <div class="button-row">
                <a mat-button routerLink="/admin/invitations">Cancel</a>
                <button mat-stroked-button type="button" (click)="togglePreview()" class="preview-btn-mobile">
                  <mat-icon>visibility</mat-icon>
                  {{ showPreview ? 'Hide' : 'Show' }} Preview
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="saving || invitationForm.invalid">
                  @if (saving) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ isEdit ? 'Update' : 'Create' }} Invitation
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Preview Section -->
      @if (showPreview) {
        <div class="preview-section">
          <div class="preview-header">
            <mat-icon>visibility</mat-icon>
            <span>Live Preview</span>
            <div class="device-selector">
              <button mat-icon-button 
                [class.active]="previewDevice === 'desktop'" 
                (click)="setPreviewDevice('desktop')"
                matTooltip="Desktop / Laptop">
                <mat-icon>laptop</mat-icon>
              </button>
              <button mat-icon-button 
                [class.active]="previewDevice === 'phone'" 
                (click)="setPreviewDevice('phone')"
                matTooltip="Mobile">
                <mat-icon>smartphone</mat-icon>
              </button>
            </div>
            <button mat-icon-button (click)="togglePreview()" matTooltip="Close Preview">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="preview-container" [class]="'preview-container device-' + previewDevice">
            <div class="device-frame" [class]="'device-frame-' + previewDevice">
              <div class="device-screen">
                <div class="invitation-preview" 
                     [class]="'invitation-preview ' + getSelectedTheme()?.animation"
                     [style.--primary-color]="getPreviewPrimaryColor()" 
                     [style.--accent-color]="getPreviewAccentColor()"
                     [style.background-image]="getPreviewBackgroundImage()">
              
                  <div class="preview-overlay"></div>
                  
                  @if (!previewShowDetails) {
                    <!-- Envelope View -->
                    <!-- Floating Header -->
                    <div class="preview-floating-header">
                      <h1>{{ invitationForm.get('title')?.value || 'Your Event Title' }}</h1>
                      <p class="preview-hosted-by">{{ invitationForm.get('hostName')?.value || 'Host Name' }}</p>
                    </div>

                    <!-- Animated Envelope -->
                    <div class="preview-envelope-container" (click)="togglePreviewDetails()">
                      <div class="preview-envelope bounce">
                        <div class="preview-envelope-back"></div>
                        <div class="preview-envelope-front">
                          <div class="preview-envelope-flap"></div>
                          <div class="preview-envelope-letter">
                            <div class="preview-letter-content">
                              <mat-icon class="preview-letter-icon">{{ getEventIcon(invitationForm.get('eventType')?.value) }}</mat-icon>
                              <span class="preview-letter-text">You're Invited!</span>
                            </div>
                          </div>
                        </div>
                        <div class="preview-envelope-shadow"></div>
                      </div>
                      <p class="preview-tap-hint">
                        <mat-icon>touch_app</mat-icon>
                        Tap to open
                      </p>
                    </div>

                    <!-- Quick Info Pills -->
                    <div class="preview-quick-info">
                      <div class="preview-info-pill">
                        <mat-icon>event</mat-icon>
                        <span>{{ invitationForm.get('eventDate')?.value | date:'MMM d, yyyy' }}</span>
                      </div>
                      <div class="preview-info-pill">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ invitationForm.get('eventTime')?.value || 'Time' }}</span>
                      </div>
                    </div>
                  } @else {
                    <!-- Inline Details View -->
                    <div class="preview-details-inline">
                      <button mat-icon-button class="preview-details-close" (click)="closePreviewDetails()">
                        <mat-icon>close</mat-icon>
                      </button>
                      
                      <div class="preview-details-header">
                        <div class="preview-event-badge">
                          <mat-icon>{{ getEventIcon(invitationForm.get('eventType')?.value) }}</mat-icon>
                          <span>{{ invitationForm.get('eventType')?.value || 'Event' }}</span>
                        </div>
                        <h2>{{ invitationForm.get('title')?.value || 'Your Event Title' }}</h2>
                        <p>Hosted by {{ invitationForm.get('hostName')?.value || 'Host Name' }}</p>
                      </div>

                      <div class="preview-details-content">
                        <div class="preview-details-row">
                          <mat-icon>event</mat-icon>
                          <div>
                            <span class="preview-details-label">Date</span>
                            <span class="preview-details-value">{{ invitationForm.get('eventDate')?.value | date:'EEEE, MMMM d, yyyy' }}</span>
                          </div>
                        </div>
                        
                        <div class="preview-details-row">
                          <mat-icon>schedule</mat-icon>
                          <div>
                            <span class="preview-details-label">Time</span>
                            <span class="preview-details-value">{{ invitationForm.get('eventTime')?.value || 'Time TBD' }}</span>
                          </div>
                        </div>

                        <mat-divider></mat-divider>
                        
                        <div class="preview-details-row">
                          <mat-icon>location_on</mat-icon>
                          <div>
                            <span class="preview-details-label">Where</span>
                            <span class="preview-details-value">{{ invitationForm.get('venue')?.value || 'Venue TBD' }}</span>
                            @if (invitationForm.get('venueAddress')?.value) {
                              <span class="preview-details-address">{{ invitationForm.get('venueAddress')?.value }}</span>
                            }
                            @if (invitationForm.get('venueMapUrl')?.value) {
                              <a class="preview-map-link">
                                <mat-icon>map</mat-icon>
                                View on Map
                              </a>
                            }
                          </div>
                        </div>
                        
                        @if (invitationForm.get('dressCode')?.value) {
                          <mat-divider></mat-divider>
                          <div class="preview-details-row">
                            <mat-icon>checkroom</mat-icon>
                            <div>
                              <span class="preview-details-label">Dress Code</span>
                              <span class="preview-details-value">{{ invitationForm.get('dressCode')?.value }}</span>
                            </div>
                          </div>
                        }
                        
                        @if (invitationForm.get('description')?.value) {
                          <mat-divider></mat-divider>
                          <div class="preview-details-section">
                            <h4>About This Event</h4>
                            <p>{{ invitationForm.get('description')?.value }}</p>
                          </div>
                        }

                        @if (invitationForm.get('additionalInfo')?.value) {
                          <mat-divider></mat-divider>
                          <div class="preview-details-section">
                            <h4>Additional Information</h4>
                            <p>{{ invitationForm.get('additionalInfo')?.value }}</p>
                          </div>
                        }

                        @if (invitationForm.get('spotifyPlaylistUrl')?.value) {
                          <mat-divider></mat-divider>
                          <div class="preview-details-spotify">
                            <h4><mat-icon>library_music</mat-icon> Event Playlist</h4>
                            <p>Check out our playlist for this event!</p>
                            <a class="preview-spotify-link">
                              <mat-icon>play_circle</mat-icon>
                              Open in Spotify
                            </a>
                          </div>
                        }
                        
                        @if (invitationForm.get('rsvpDeadline')?.value) {
                          <mat-divider></mat-divider>
                          <div class="preview-details-row deadline">
                            <mat-icon>timer</mat-icon>
                            <div>
                              <span class="preview-details-label">Please Respond by</span>
                              <span class="preview-details-value">{{ invitationForm.get('rsvpDeadline')?.value | date:'MMMM d, yyyy' }}</span>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="preview-details-actions">
                        <button mat-raised-button class="preview-rsvp-btn">
                          <mat-icon>how_to_reg</mat-icon>
                          Respond Now
                        </button>
                        <p class="preview-details-note">This is how guests will see the details</p>
                      </div>
                    </div>
                  }
              
                  <!-- Canvas Animation Layer -->
                  @if (getSelectedTheme()?.animation) {
                    <app-animation-canvas 
                      [animation]="getSelectedTheme()!.animation!"
                      [primaryColor]="getPreviewPrimaryColor()"
                      [accentColor]="getPreviewAccentColor()">
                    </app-animation-canvas>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .form-preview-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .form-section {
      flex: 1;
      max-width: 50%;
    }

    .form-preview-layout.preview-active .form-section {
      max-width: 50%;
    }

    .preview-section {
      flex: 1;
      max-width: 50%;
      position: sticky;
      top: 24px;
      background: #f5f5f5;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #667eea;
      color: white;
      font-weight: 500;
    }

    .preview-header mat-icon:first-child {
      font-size: 20px;
    }

    .preview-header span {
      flex: 1;
    }

    .preview-header button {
      color: white;
    }

    .device-selector {
      display: flex;
      gap: 4px;
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 4px;
      margin-right: 8px;
    }

    .device-selector button {
      color: rgba(255,255,255,0.7);
      width: 36px;
      height: 36px;
    }

    .device-selector button.active {
      color: white;
      background: rgba(255,255,255,0.2);
      border-radius: 6px;
    }

    .device-selector button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .preview-container {
      height: 80vh;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: #1a1a2e;
      transition: all 0.3s ease;
      padding: 16px;
    }

    /* Device Frames */
    .device-frame {
      background: #0d0d0d;
      border-radius: 16px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.5);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .device-frame-desktop {
      width: 100%;
      max-width: 100%;
      border-radius: 8px;
      border: 3px solid #2a2a2a;
    }

    .device-frame-phone {
      width: 375px;
      max-width: 100%;
      border-radius: 40px;
      padding: 14px;
      border: 4px solid #2a2a2a;
      position: relative;
    }

    .device-frame-phone::before {
      content: '';
      display: block;
      width: 120px;
      height: 28px;
      background: #0d0d0d;
      border-radius: 0 0 20px 20px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }

    .device-frame-phone::after {
      content: '';
      display: block;
      width: 4px;
      height: 80px;
      background: #2a2a2a;
      position: absolute;
      right: -4px;
      top: 120px;
      border-radius: 0 4px 4px 0;
    }

    .device-screen {
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .device-frame-phone .device-screen {
      border-radius: 28px;
      min-height: 667px;
      overflow-y: auto;
    }

    .preview-toggle {
      margin-left: auto;
    }

    .preview-btn-mobile {
      display: none;
    }

    mat-card-header {
      position: relative;
    }
    
    form {
      padding-top: 20px;
    }
    
    .section-title {
      color: #667eea;
      font-size: 1rem;
      font-weight: 500;
      margin: 24px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #eee;
    }
    
    .section-title:first-of-type {
      margin-top: 0;
    }
    
    .form-row {
      margin-bottom: 16px;
    }
    
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .toggle-field {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8px 0;
    }
    
    .toggle-hint {
      font-size: 12px;
      color: #666;
      margin: 8px 0 0;
    }
    
    .custom-styles-panel {
      margin: 24px 0;
    }
    
    .custom-styles-panel mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .custom-styles-content {
      padding-top: 16px;
    }
    
    .button-row {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
    
    .theme-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid #ddd;
    }

    /* Theme Grid */
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .theme-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      background: white;
    }

    .theme-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .theme-card.selected {
      border-color: #667eea;
      border-width: 3px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .theme-preview {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .theme-animation-preview {
      font-size: 24px;
      animation: bounce 1s ease infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .theme-info {
      padding: 8px 10px;
      text-align: center;
    }

    .theme-name {
      display: block;
      font-weight: 500;
      font-size: 0.85rem;
      color: #333;
    }

    .theme-desc {
      display: block;
      font-size: 0.7rem;
      color: #888;
      margin-top: 2px;
    }

    .theme-check {
      position: absolute;
      top: 6px;
      right: 6px;
      color: white;
      background: #667eea;
      border-radius: 50%;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    /* Success Card */
    .success-card {
      text-align: center;
      padding: 40px 20px;
    }
    
    .success-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #4caf50;
    }
    
    .success-card h2 {
      margin: 20px 0 10px;
      color: #333;
    }
    
    .success-card p {
      color: #666;
      margin-bottom: 20px;
    }
    
    .link-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 8px 16px;
      margin: 20px auto;
      max-width: 500px;
    }
    
    .link-box input {
      flex: 1;
      border: none;
      background: none;
      font-size: 14px;
      color: #667eea;
      outline: none;
    }
    
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 24px;
    }
    
    /* Background Image Section */
    .background-image-section {
      width: 100%;
    }

    .section-label {
      display: block;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 12px;
    }

    .image-source-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .image-source-tabs button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .image-source-tabs button.active {
      background-color: #667eea;
      color: white;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover {
      border-color: #667eea;
      background: #f0f0ff;
    }

    .upload-area.drag-over {
      border-color: #667eea;
      background: #e8e8ff;
    }

    .upload-area mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
    }

    .upload-area p {
      margin: 12px 0 4px;
      color: #666;
    }

    .upload-area .hint {
      font-size: 12px;
      color: #999;
    }

    .image-preview {
      position: relative;
      margin-top: 16px;
      border-radius: 8px;
      overflow: hidden;
      max-width: 300px;
    }

    .image-preview img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .image-preview .remove-image {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
    }

    .image-preview .remove-image:hover {
      background: rgba(255, 0, 0, 0.8);
    }

    /* Invitation Preview Styles - Matching Real Invitation */
    .invitation-preview {
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

    .device-phone .invitation-preview {
      padding: 16px 16px 32px;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 0;
      pointer-events: none;
    }

    .preview-content {
      position: relative;
      z-index: 1;
      max-width: 700px;
      margin: 0 auto;
    }

    .preview-invitation-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
      padding-top: 20px;
    }

    .device-phone .preview-invitation-header {
      margin-bottom: 24px;
      padding-top: 10px;
    }

    .preview-event-badge {
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

    .device-phone .preview-event-badge {
      padding: 8px 16px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .preview-event-badge mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .device-phone .preview-event-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .preview-invitation-header h1 {
      font-size: 2.8rem;
      margin: 0 0 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: 300;
      letter-spacing: 1px;
      line-height: 1.2;
    }

    .device-phone .preview-invitation-header h1 {
      font-size: 2rem;
    }

    .preview-hosted-by {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .device-phone .preview-hosted-by {
      font-size: 1rem;
    }

    .preview-details-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      margin: 0 20px 24px;
    }

    .device-phone .preview-details-card {
      margin: 0 0 20px;
      padding: 16px;
      border-radius: 16px;
    }

    .preview-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px 0;
    }

    .device-phone .preview-main-info {
      grid-template-columns: 1fr;
      gap: 0;
      padding: 16px 0;
    }

    .preview-info-block, .preview-venue-section, .preview-deadline-section {
      display: flex;
      gap: 16px;
      padding: 20px 0;
    }

    .device-phone .preview-info-block,
    .device-phone .preview-venue-section,
    .device-phone .preview-deadline-section {
      padding: 14px 0;
      gap: 12px;
    }

    .preview-info-block mat-icon, .preview-venue-section mat-icon, .preview-deadline-section mat-icon {
      color: var(--primary-color, #667eea);
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .device-phone .preview-info-block mat-icon,
    .device-phone .preview-venue-section mat-icon,
    .device-phone .preview-deadline-section mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .preview-label {
      display: block;
      font-size: 0.8rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .device-phone .preview-label {
      font-size: 0.7rem;
      margin-bottom: 4px;
    }

    .preview-value {
      display: block;
      font-size: 1.15rem;
      color: #333;
      font-weight: 500;
    }

    .device-phone .preview-value {
      font-size: 0.95rem;
    }

    .preview-venue-name {
      font-size: 1.25rem;
    }

    .device-phone .preview-venue-name {
      font-size: 1rem;
    }

    .preview-address {
      display: block;
      color: #666;
      margin-top: 6px;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .device-phone .preview-address {
      font-size: 0.85rem;
      margin-top: 4px;
    }

    .preview-map-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-color, #667eea);
      text-decoration: none;
      margin-top: 12px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
    }

    .preview-map-link:hover {
      text-decoration: underline;
    }

    .preview-map-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .preview-description-section, .preview-additional-info {
      padding: 24px 0;
    }

    .device-phone .preview-description-section,
    .device-phone .preview-additional-info {
      padding: 16px 0;
    }

    .preview-description-section h3, .preview-additional-info h3 {
      color: var(--primary-color, #667eea);
      font-size: 1rem;
      margin: 0 0 12px;
      font-weight: 600;
    }

    .device-phone .preview-description-section h3,
    .device-phone .preview-additional-info h3 {
      font-size: 0.9rem;
      margin: 0 0 8px;
    }

    .preview-description-section p, .preview-additional-info p {
      color: #555;
      line-height: 1.8;
      margin: 0;
      font-size: 0.95rem;
      white-space: pre-line;
    }

    .device-phone .preview-description-section p,
    .device-phone .preview-additional-info p {
      font-size: 0.85rem;
      line-height: 1.6;
    }

    .preview-spotify-section {
      padding: 24px 0;
      text-align: center;
    }

    .device-phone .preview-spotify-section {
      padding: 16px 0;
    }

    .preview-spotify-section h3 {
      color: var(--primary-color, #667eea);
      font-size: 1rem;
      margin: 0 0 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .device-phone .preview-spotify-section h3 {
      font-size: 0.9rem;
    }

    .preview-spotify-section p {
      color: #555;
      font-size: 0.9rem;
      margin: 0 0 16px;
    }

    .device-phone .preview-spotify-section p {
      font-size: 0.8rem;
      margin: 0 0 12px;
    }

    .preview-spotify-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1DB954;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .preview-spotify-link:hover {
      background: #1ed760;
      transform: scale(1.05);
    }

    .device-phone .preview-spotify-link {
      padding: 10px 20px;
      font-size: 0.8rem;
    }

    .preview-deadline {
      color: #e91e63 !important;
    }

    .preview-rsvp-cta {
      text-align: center;
      padding: 30px 0;
    }

    .device-phone .preview-rsvp-cta {
      padding: 20px 0;
    }

    .preview-rsvp-button {
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%) !important;
      color: white !important;
      padding: 16px 48px !important;
      font-size: 1.2rem !important;
      border-radius: 50px !important;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
      transition: all 0.3s ease !important;
      height: auto !important;
    }

    .preview-rsvp-button:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
    }

    .device-phone .preview-rsvp-button {
      padding: 12px 32px !important;
      font-size: 1rem !important;
    }

    .preview-rsvp-button mat-icon {
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .device-phone .preview-rsvp-button mat-icon {
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .preview-rsvp-hint {
      color: white;
      opacity: 0.9;
      margin-top: 16px;
      font-size: 0.95rem;
    }

    .device-phone .preview-rsvp-hint {
      margin-top: 12px;
      font-size: 0.8rem;
    }

    .preview-contact-section {
      text-align: center;
      color: white;
      padding: 30px 20px;
    }

    .device-phone .preview-contact-section {
      padding: 20px 16px;
    }

    .preview-contact-section p {
      margin: 0 0 16px;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .device-phone .preview-contact-section p {
      font-size: 0.85rem;
      margin: 0 0 12px;
    }

    .preview-contact-info {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .device-phone .preview-contact-info {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .preview-contact-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 12px 24px;
      border-radius: 50px;
      color: white;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    }

    .preview-contact-link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .device-phone .preview-contact-link {
      padding: 10px 20px;
      font-size: 0.8rem;
    }

    .preview-contact-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .device-phone .preview-contact-link mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Floating Header for Envelope View */
    .preview-floating-header {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
      margin-bottom: 40px;
      padding-top: 20px;
    }

    .device-phone .preview-floating-header {
      margin-bottom: 24px;
      padding-top: 16px;
    }

    .preview-floating-header h1 {
      font-size: 2.2rem;
      margin: 0 0 8px;
      font-weight: 300;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
      letter-spacing: 1px;
    }

    .device-phone .preview-floating-header h1 {
      font-size: 1.6rem;
    }

    .preview-floating-header .preview-hosted-by {
      font-size: 1rem;
      opacity: 0.9;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
      margin: 0;
    }

    .device-phone .preview-floating-header .preview-hosted-by {
      font-size: 0.85rem;
    }

    /* Envelope Container */
    .preview-envelope-container {
      position: relative;
      z-index: 2;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    .preview-envelope {
      position: relative;
      width: 180px;
      height: 126px;
      perspective: 1000px;
      transition: transform 0.3s ease;
    }

    .device-phone .preview-envelope {
      width: 150px;
      height: 105px;
    }

    .preview-envelope:hover {
      transform: scale(1.05);
    }

    .preview-envelope.bounce {
      animation: previewEnvelopeBounce 2s ease-in-out infinite;
    }

    @keyframes previewEnvelopeBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    .preview-envelope-back {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 8px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .preview-envelope-front {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-envelope-flap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--accent-color, #764ba2) 100%);
      clip-path: polygon(0 0, 50% 100%, 100% 0);
      transform-origin: top center;
      z-index: 2;
    }

    .device-phone .preview-envelope-flap {
      height: 35px;
    }

    .preview-envelope-letter {
      position: absolute;
      top: 28px;
      left: 12px;
      right: 12px;
      bottom: 12px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(0, 0, 0, 0.05);
    }

    .device-phone .preview-envelope-letter {
      top: 24px;
      left: 10px;
      right: 10px;
      bottom: 10px;
    }

    .preview-letter-content {
      text-align: center;
      color: var(--primary-color, #667eea);
    }

    .preview-letter-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      margin-bottom: 4px;
    }

    .device-phone .preview-letter-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .preview-letter-text {
      display: block;
      font-weight: 600;
      font-size: 0.7rem;
    }

    .device-phone .preview-letter-text {
      font-size: 0.6rem;
    }

    .preview-envelope-shadow {
      position: absolute;
      bottom: -15px;
      left: 10%;
      width: 80%;
      height: 15px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%);
    }

    .preview-tap-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 0.85rem;
      margin-top: 24px;
      opacity: 0.9;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
      animation: previewPulse 2s ease-in-out infinite;
    }

    .device-phone .preview-tap-hint {
      font-size: 0.75rem;
      margin-top: 20px;
    }

    .preview-tap-hint mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @keyframes previewPulse {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 0.5; }
    }

    /* Quick Info Pills */
    .preview-quick-info {
      position: relative;
      z-index: 2;
      display: flex;
      gap: 12px;
      margin-top: 30px;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0 16px;
    }

    .device-phone .preview-quick-info {
      gap: 8px;
      margin-top: 20px;
    }

    .preview-info-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 10px 16px;
      border-radius: 50px;
      color: white;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.3);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    .device-phone .preview-info-pill {
      padding: 8px 12px;
      font-size: 0.75rem;
      gap: 5px;
    }

    .preview-info-pill mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .device-phone .preview-info-pill mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Inline Details View Styles */
    .preview-details-inline {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      bottom: 12px;
      background: white;
      z-index: 10;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .device-phone .preview-details-inline {
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border-radius: 12px;
    }

    .preview-details-close {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 11;
      background: rgba(0, 0, 0, 0.3) !important;
      color: white !important;
    }

    .preview-details-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: white;
      padding: 32px 20px 24px;
      text-align: center;
      border-radius: 16px 16px 0 0;
    }

    .device-phone .preview-details-header {
      padding: 28px 16px 20px;
      border-radius: 12px 12px 0 0;
    }

    .preview-event-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 0.8rem;
      margin-bottom: 12px;
      backdrop-filter: blur(10px);
      text-transform: capitalize;
    }

    .preview-event-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .preview-details-header h2 {
      font-size: 1.6rem;
      margin: 0 0 8px;
      font-weight: 300;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
    }

    .device-phone .preview-details-header h2 {
      font-size: 1.3rem;
    }

    .preview-details-header p {
      font-size: 0.95rem;
      opacity: 0.9;
      margin: 0;
    }

    .device-phone .preview-details-header p {
      font-size: 0.85rem;
    }

    .preview-details-content {
      padding: 16px;
      flex: 1;
      overflow-y: auto;
    }

    .device-phone .preview-details-content {
      padding: 12px;
    }

    .preview-details-row {
      display: flex;
      gap: 12px;
      padding: 12px 0;
    }

    .device-phone .preview-details-row {
      gap: 10px;
      padding: 10px 0;
    }

    .preview-details-row mat-icon {
      color: var(--primary-color);
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .device-phone .preview-details-row mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .preview-details-row.deadline mat-icon {
      color: #e91e63;
    }

    .preview-details-row.deadline .preview-details-value {
      color: #e91e63;
    }

    .preview-details-label {
      display: block;
      font-size: 0.65rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .preview-details-value {
      display: block;
      font-size: 0.95rem;
      color: #333;
      font-weight: 500;
    }

    .device-phone .preview-details-value {
      font-size: 0.85rem;
    }

    .preview-details-address {
      display: block;
      color: #666;
      margin-top: 3px;
      font-size: 0.8rem;
      line-height: 1.3;
    }

    .preview-map-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color);
      text-decoration: none;
      margin-top: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
    }

    .preview-map-link mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .preview-details-section {
      padding: 12px 0;
    }

    .preview-details-section h4 {
      color: var(--primary-color);
      font-size: 0.85rem;
      margin: 0 0 8px;
      font-weight: 600;
    }

    .preview-details-section p {
      color: #555;
      line-height: 1.5;
      margin: 0;
      font-size: 0.85rem;
      white-space: pre-line;
    }

    .device-phone .preview-details-section p {
      font-size: 0.8rem;
    }

    .preview-details-spotify {
      padding: 12px 0;
      text-align: center;
    }

    .preview-details-spotify h4 {
      color: var(--primary-color);
      font-size: 0.85rem;
      margin: 0 0 6px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .preview-details-spotify h4 mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .preview-details-spotify p {
      color: #555;
      font-size: 0.8rem;
      margin: 0 0 10px;
    }

    .preview-spotify-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #1DB954;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .preview-spotify-link:hover {
      background: #1ed760;
      transform: scale(1.05);
    }

    .preview-spotify-link mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .preview-details-actions {
      padding: 16px;
      background: #f8f9fa;
      text-align: center;
      border-top: 1px solid #eee;
      border-radius: 0 0 16px 16px;
    }

    .device-phone .preview-details-actions {
      padding: 12px;
      border-radius: 0 0 12px 12px;
    }

    .preview-rsvp-btn {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%) !important;
      color: white !important;
      padding: 10px 28px !important;
      font-size: 0.95rem !important;
      border-radius: 50px !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
      height: auto !important;
    }

    .device-phone .preview-rsvp-btn {
      padding: 8px 24px !important;
      font-size: 0.85rem !important;
    }

    .preview-rsvp-btn mat-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .preview-details-note {
      color: #888;
      font-size: 0.7rem;
      margin: 10px 0 0;
      font-style: italic;
    }

    .preview-details-content mat-divider {
      margin: 4px 0;
    }

    @media (max-width: 1100px) {
      .form-preview-layout {
        flex-direction: column;
      }

      .form-section {
        max-width: 100% !important;
        width: 100%;
      }

      .preview-section {
        max-width: 100%;
        width: 100%;
        position: relative;
        top: 0;
      }

      .preview-container {
        height: auto;
        max-height: 80vh;
      }

      .preview-toggle {
        display: none;
      }

      .preview-btn-mobile {
        display: inline-flex;
      }

      .device-selector {
        display: none;
      }

      .device-frame {
        width: 100% !important;
        border-radius: 0 !important;
        border: none !important;
        padding: 0 !important;
      }

      .device-frame::before,
      .device-frame::after {
        display: none !important;
      }

      .device-screen {
        border-radius: 0 !important;
      }
    }

    @media (max-width: 600px) {
      .two-col {
        grid-template-columns: 1fr;
      }

      .page-container {
        padding: 16px;
      }
    }
  `]
})
export class InvitationFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  invitationForm: FormGroup;
  themes: Theme[] = [];
  isEdit = false;
  saving = false;
  invitationId: string | null = null;
  createdInvitation: Invitation | null = null;

  // Image upload properties
  imageSourceMode: 'url' | 'upload' = 'url';
  imagePreview: string | null = null;
  isDragging = false;
  showPreview = true;
  previewDevice: 'desktop' | 'phone' = 'desktop';
  previewShowDetails = false;
  selectedBuiltInTheme: string | null = null;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Built-in animated themes
  builtInThemes: { [eventType: string]: BuiltInTheme[] } = {
    wedding: [
      { id: 'romantic-rose', name: 'Romantic Rose', description: 'Floating hearts', gradient: 'linear-gradient(135deg, #e91e63 0%, #f8bbd9 100%)', primaryColor: '#e91e63', accentColor: '#f8bbd9', animation: 'hearts' },
      { id: 'elegant-gold', name: 'Elegant Gold', description: 'Golden sparkles', gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #b38728 100%)', primaryColor: '#bf953f', accentColor: '#fcf6ba', animation: 'sparkles' },
      { id: 'classic-white', name: 'Classic White', description: 'Subtle stars', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', primaryColor: '#667eea', accentColor: '#764ba2', animation: 'stars' }
    ],
    birthday: [
      { id: 'party-confetti', name: 'Party Confetti', description: 'Colorful confetti', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)', primaryColor: '#ff6b6b', accentColor: '#ffd93d', animation: 'confetti' },
      { id: 'balloon-fiesta', name: 'Balloon Fiesta', description: 'Flying balloons', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', primaryColor: '#ff6b95', accentColor: '#fed6e3', animation: 'balloons' },
      { id: 'cosmic-party', name: 'Cosmic Party', description: 'Starry night', gradient: 'linear-gradient(135deg, #0c0c3d 0%, #4a00e0 100%)', primaryColor: '#8e2de2', accentColor: '#4a00e0', animation: 'stars' },
      { id: 'candy-pop', name: 'Candy Pop', description: 'Sweet sparkles', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', primaryColor: '#ff9a9e', accentColor: '#fecfef', animation: 'sparkles' }
    ],
    corporate: [
      { id: 'professional-blue', name: 'Professional Blue', description: 'Elegant stars', gradient: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)', primaryColor: '#1a237e', accentColor: '#534bae', animation: 'stars' },
      { id: 'modern-slate', name: 'Modern Slate', description: 'Subtle sparkles', gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', primaryColor: '#2c3e50', accentColor: '#4ca1af', animation: 'sparkles' }
    ],
    party: [
      { id: 'neon-nights', name: 'Neon Nights', description: 'Fireworks show', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', primaryColor: '#ff00ff', accentColor: '#00ffff', animation: 'fireworks' },
      { id: 'disco-fever', name: 'Disco Fever', description: 'Party confetti', gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', primaryColor: '#fc466b', accentColor: '#3f5efb', animation: 'confetti' },
      { id: 'tropical-vibes', name: 'Tropical Vibes', description: 'Fun balloons', gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 50%, #ffb347 100%)', primaryColor: '#f857a6', accentColor: '#ffb347', animation: 'balloons' },
      { id: 'retro-wave', name: 'Retro Wave', description: 'Synthwave sparkles', gradient: 'linear-gradient(135deg, #ff0084 0%, #33001b 100%)', primaryColor: '#ff0084', accentColor: '#33001b', animation: 'sparkles' }
    ],
    other: [
      { id: 'minimal-clean', name: 'Minimal Clean', description: 'Simple elegance', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', primaryColor: '#667eea', accentColor: '#764ba2', animation: 'stars' },
      { id: 'sunset-glow', name: 'Sunset Glow', description: 'Warm sparkles', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', primaryColor: '#fa709a', accentColor: '#fee140', animation: 'sparkles' },
      { id: 'cherry-blossom', name: 'Cherry Blossom', description: 'Floating petals', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', primaryColor: '#fcb69f', accentColor: '#ffecd2', animation: 'hearts' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialog: MatDialog
  ) {
    this.invitationForm = this.fb.group({
      title: ['', Validators.required],
      eventType: ['wedding', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      venue: ['', Validators.required],
      venueAddress: ['', Validators.required],
      venueMapUrl: [''],
      description: [''],
      dressCode: [''],
      additionalInfo: [''],
      theme: [''],
      hostName: ['', Validators.required],
      hostContact: [''],
      hostEmail: [''],
      rsvpDeadline: [''],
      maxGuests: [''],
      isActive: [true],
      selectedThemeId: [''],
      spotifyPlaylistUrl: [''],
      customStyles: this.fb.group({
        primaryColor: ['#667eea'],
        accentColor: ['#764ba2'],
        backgroundImage: [''],
        animation: ['none']
      })
    });
  }

  ngOnInit() {
    this.loadThemes();

    this.invitationId = this.route.snapshot.paramMap.get('id');
    if (this.invitationId) {
      this.isEdit = true;
      this.loadInvitation();
    }
  }

  loadThemes() {
    this.themeService.getAll().subscribe({
      next: (data) => {
        this.themes = data;
      }
    });
  }

  loadInvitation() {
    if (!this.invitationId) return;

    this.invitationService.getById(this.invitationId).subscribe({
      next: (invitation) => {
        this.invitationForm.patchValue({
          ...invitation,
          eventDate: new Date(invitation.eventDate),
          rsvpDeadline: invitation.rsvpDeadline ? new Date(invitation.rsvpDeadline) : null
        });

        // Restore the selected built-in theme
        if (invitation.selectedThemeId) {
          this.selectedBuiltInTheme = invitation.selectedThemeId;
        }

        // Restore background image preview if exists
        if (invitation.customStyles?.backgroundImage) {
          this.imagePreview = invitation.customStyles.backgroundImage;
        }
      },
      error: () => {
        this.snackBar.open('Failed to load invitation', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/invitations']);
      }
    });
  }

  getShareableLink(): string {
    if (!this.createdInvitation) return '';
    return `${window.location.origin}/invitation/${this.createdInvitation._id}`;
  }

  copyLink() {
    const link = this.getShareableLink();
    this.clipboard.copy(link);
    this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
  }

  onSubmit() {
    if (this.invitationForm.invalid) return;

    this.saving = true;
    const formData = this.invitationForm.value;

    // Generate slug from title
    formData.slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const request = this.isEdit
      ? this.invitationService.update(this.invitationId!, formData)
      : this.invitationService.create(formData);

    request.subscribe({
      next: (invitation) => {
        if (this.isEdit) {
          this.snackBar.open('Invitation updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/invitations']);
        } else {
          // Show success card with shareable link
          this.createdInvitation = invitation;
          this.saving = false;
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to save invitation', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  // Image source mode toggle
  setImageSourceMode(mode: 'url' | 'upload') {
    this.imageSourceMode = mode;
  }

  // File selection handler
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  // Process the selected file
  private handleFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview = result;
      this.invitationForm.get('customStyles.backgroundImage')?.setValue(result);
    };
    reader.onerror = () => {
      this.snackBar.open('Failed to read image file', 'Close', { duration: 3000 });
    };
    reader.readAsDataURL(file);
  }

  // Remove background image
  removeBackgroundImage() {
    this.imagePreview = null;
    this.invitationForm.get('customStyles.backgroundImage')?.setValue('');
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Preview toggle
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  // Set preview device type
  setPreviewDevice(device: 'desktop' | 'phone') {
    this.previewDevice = device;
  }

  // Get event icon for preview
  getEventIcon(eventType: string): string {
    const icons: { [key: string]: string } = {
      wedding: 'favorite',
      birthday: 'cake',
      corporate: 'business',
      party: 'celebration',
      other: 'event'
    };
    return icons[eventType] || 'event';
  }

  // Toggle preview details view
  togglePreviewDetails(): void {
    this.previewShowDetails = !this.previewShowDetails;
  }

  // Close preview details
  closePreviewDetails(): void {
    this.previewShowDetails = false;
  }

  // Preview color methods
  getPreviewPrimaryColor(): string {
    return this.invitationForm.get('customStyles.primaryColor')?.value || '#667eea';
  }

  getPreviewAccentColor(): string {
    return this.invitationForm.get('customStyles.accentColor')?.value || '#764ba2';
  }

  getPreviewBackgroundImage(): string {
    const bgImage = this.invitationForm.get('customStyles.backgroundImage')?.value;
    if (bgImage) {
      return `url('${bgImage}')`;
    }
    return 'none';
  }

  // Get themes for current event type
  getThemesForEventType(): BuiltInTheme[] {
    const eventType = this.invitationForm.get('eventType')?.value || 'wedding';
    return this.builtInThemes[eventType] || this.builtInThemes['other'];
  }

  // Handle event type change
  onEventTypeChange(eventType: string) {
    // Clear selected theme when event type changes
    this.selectedBuiltInTheme = null;
  }

  // Select a built-in theme (click again to deselect)
  selectBuiltInTheme(theme: BuiltInTheme) {
    if (this.selectedBuiltInTheme === theme.id) {
      // Deselect - reset to defaults
      this.selectedBuiltInTheme = null;
      this.invitationForm.patchValue({
        selectedThemeId: '',
        customStyles: {
          primaryColor: '#667eea',
          accentColor: '#764ba2',
          animation: 'none'
        }
      });
    } else {
      // Select the theme
      this.selectedBuiltInTheme = theme.id;
      this.invitationForm.patchValue({
        selectedThemeId: theme.id,
        customStyles: {
          primaryColor: theme.primaryColor,
          accentColor: theme.accentColor,
          animation: theme.animation
        }
      });
    }
  }

  // Get currently selected theme
  getSelectedTheme(): BuiltInTheme | null {
    if (!this.selectedBuiltInTheme) return null;
    const themes = this.getThemesForEventType();
    return themes.find(t => t.id === this.selectedBuiltInTheme) || null;
  }
}

// Interface for built-in themes
interface BuiltInTheme {
  id: string;
  name: string;
  description: string;
  gradient: string;
  primaryColor: string;
  accentColor: string;
  animation: 'confetti' | 'hearts' | 'balloons' | 'sparkles' | 'stars' | 'fireworks';
}
