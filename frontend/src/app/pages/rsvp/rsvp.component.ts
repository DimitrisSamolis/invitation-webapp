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
  templateUrl: './rsvp.component.html',
  styleUrl: './rsvp.component.scss'
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
