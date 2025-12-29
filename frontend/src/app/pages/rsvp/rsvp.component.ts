import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvitationService } from '../../services/invitation.service';
import { GuestService } from '../../services/guest.service';
import { Invitation } from '../../models/models';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    @if (loading) {
      <div class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else if (!invitation) {
      <div class="not-found">
        <mat-icon>error_outline</mat-icon>
        <h2>Invitation Not Found</h2>
        <a mat-raised-button color="primary" routerLink="/">Go Home</a>
      </div>
    } @else if (submitted) {
      <div class="success-container">
        <mat-card>
          <mat-card-content>
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h2>Thank You!</h2>
            <p>Your RSVP has been submitted successfully.</p>
            <a mat-raised-button color="primary" [routerLink]="['/invitation', invitation._id]">
              View Invitation
            </a>
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="rsvp-container">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>mail</mat-icon>
            <mat-card-title>RSVP</mat-card-title>
            <mat-card-subtitle>{{ invitation.title }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="rsvpForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Your Name</mat-label>
                <input matInput formControlName="name">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone (Optional)</mat-label>
                <input matInput formControlName="phone">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Will you attend?</mat-label>
                <mat-select formControlName="rsvpStatus">
                  <mat-option value="confirmed">Yes, I'll be there!</mat-option>
                  <mat-option value="declined">Sorry, I can't make it</mat-option>
                </mat-select>
              </mat-form-field>

              @if (rsvpForm.get('rsvpStatus')?.value === 'confirmed') {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Number of Guests</mat-label>
                  <mat-select formControlName="numberOfGuests">
                    @for (num of [1, 2, 3, 4, 5]; track num) {
                      <mat-option [value]="num">{{ num }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Dietary Restrictions (Optional)</mat-label>
                  <textarea matInput formControlName="dietaryRestrictions" rows="2"></textarea>
                </mat-form-field>
              }

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Message for the Host (Optional)</mat-label>
                <textarea matInput formControlName="message" rows="3"></textarea>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="submitting || rsvpForm.invalid" class="full-width">
                @if (submitting) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Submit RSVP
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .loading, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 20px;
    }
    
    .not-found mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
    }
    
    .rsvp-container, .success-container {
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    mat-card {
      max-width: 500px;
      width: 100%;
      height: fit-content;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    button[type="submit"] {
      height: 48px;
      margin-top: 16px;
    }
    
    .success-container mat-card-content {
      text-align: center;
      padding: 40px 20px;
    }
    
    .success-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #4caf50;
    }
    
    .success-container h2 {
      margin: 20px 0 10px;
    }
    
    .success-container p {
      color: #666;
      margin-bottom: 20px;
    }
  `]
})
export class RsvpComponent implements OnInit {
  invitation: Invitation | null = null;
  loading = true;
  submitting = false;
  submitted = false;
  rsvpForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private guestService: GuestService,
    private snackBar: MatSnackBar
  ) {
    this.rsvpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      rsvpStatus: ['confirmed', Validators.required],
      numberOfGuests: [1],
      dietaryRestrictions: [''],
      message: ['']
    });
  }

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

  onSubmit() {
    if (this.rsvpForm.invalid || !this.invitation) return;

    this.submitting = true;
    const formData = this.rsvpForm.value;

    this.guestService.submitRsvp(this.invitation._id!, formData).subscribe({
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
