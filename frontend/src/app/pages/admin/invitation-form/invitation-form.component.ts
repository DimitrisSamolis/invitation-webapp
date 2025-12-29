import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
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
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { InvitationService } from '../../../services/invitation.service';
import { ThemeService } from '../../../services/theme.service';
import { Theme, Invitation } from '../../../models/models';

@Component({
  selector: 'app-invitation-form',
  standalone: true,
  imports: [
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
    ClipboardModule
  ],
  template: `
    <div class="container">
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
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>{{ isEdit ? 'edit' : 'add' }}</mat-icon>
            <mat-card-title>{{ isEdit ? 'Edit' : 'Create' }} Invitation</mat-card-title>
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

              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Event Type</mat-label>
                  <mat-select formControlName="eventType">
                    <mat-option value="wedding">💒 Wedding</mat-option>
                    <mat-option value="birthday">🎂 Birthday</mat-option>
                    <mat-option value="corporate">💼 Corporate</mat-option>
                    <mat-option value="party">🎉 Party</mat-option>
                    <mat-option value="other">📅 Other</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Theme Style</mat-label>
                  <mat-select formControlName="theme">
                    <mat-option value="">No Theme</mat-option>
                    @for (theme of themes; track theme._id) {
                      <mat-option [value]="theme._id">
                        <span class="theme-option">
                          <span class="color-dot" [style.background]="theme.primaryColor"></span>
                          {{ theme.name }}
                        </span>
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
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
              <h3 class="section-title">Venue Details</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Venue Name</mat-label>
                  <input matInput formControlName="venue" placeholder="e.g., Grand Ballroom, Hilton Hotel">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Venue Address</mat-label>
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

              <!-- RSVP Settings -->
              <h3 class="section-title">RSVP Settings</h3>
              
              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>RSVP Deadline</mat-label>
                  <input matInput [matDatepicker]="rsvpPicker" formControlName="rsvpDeadline">
                  <mat-datepicker-toggle matSuffix [for]="rsvpPicker"></mat-datepicker-toggle>
                  <mat-datepicker #rsvpPicker></mat-datepicker>
                  <mat-hint>Guests won't be able to RSVP after this date</mat-hint>
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
                    Custom Colors (Optional)
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
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Background Image URL (Optional)</mat-label>
                      <input matInput formControlName="backgroundImage" placeholder="https://example.com/image.jpg">
                    </mat-form-field>
                  </div>
                </div>
              </mat-expansion-panel>

              <div class="button-row">
                <a mat-button routerLink="/admin/invitations">Cancel</a>
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
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
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
    
    @media (max-width: 600px) {
      .two-col {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InvitationFormComponent implements OnInit {
  invitationForm: FormGroup;
  themes: Theme[] = [];
  isEdit = false;
  saving = false;
  invitationId: string | null = null;
  createdInvitation: Invitation | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard
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
      customStyles: this.fb.group({
        primaryColor: ['#667eea'],
        accentColor: ['#764ba2'],
        backgroundImage: ['']
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
}
