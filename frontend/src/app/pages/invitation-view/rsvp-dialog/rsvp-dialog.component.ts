import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GuestService } from '../../../services/guest.service';
import { Invitation } from '../../../models/models';

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
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './rsvp-dialog.component.html',
  styleUrl: './rsvp-dialog.component.scss'
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
