import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, TitleCasePipe, SlicePipe } from '@angular/common';
import { GuestService } from '../../../services/guest.service';
import { Guest } from '../../../models/models';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    DatePipe,
    TitleCasePipe,
    SlicePipe
  ],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private guestService = inject(GuestService);
  private snackBar = inject(MatSnackBar);

  guests: Guest[] = [];
  loading = true;
  invitationId: string | null = null;
  displayedColumns = ['name', 'invitation', 'numberOfGuests', 'rsvpStatus', 'message', 'respondedAt', 'actions'];

  constructor() { }

  ngOnInit() {
    this.invitationId = this.route.snapshot.paramMap.get('invitationId');
    this.loadGuests();
  }

  loadGuests() {
    const request = this.invitationId
      ? this.guestService.getByInvitation(this.invitationId)
      : this.guestService.getAll();

    request.subscribe({
      next: (data) => {
        this.guests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load guests', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusCount(status: string): number {
    return this.guests.filter(g => g.rsvpStatus === status).length;
  }

  getInvitationTitle(guest: Guest): string {
    if (!guest.invitationId) return '';
    if (typeof guest.invitationId === 'string') return '';
    return guest.invitationId.title || '';
  }

  updateStatus(guest: Guest, status: Guest['rsvpStatus']) {
    this.guestService.updateRsvpStatus(guest._id!, status).subscribe({
      next: (updated) => {
        const index = this.guests.findIndex(g => g._id === guest._id);
        if (index !== -1) {
          this.guests[index] = updated;
          // Reassign array to trigger change detection
          this.guests = [...this.guests];
        }
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteGuest(guest: Guest) {
    if (confirm(`Are you sure you want to remove ${guest.name}?`)) {
      this.guestService.delete(guest._id!).subscribe({
        next: () => {
          this.guests = this.guests.filter(g => g._id !== guest._id);
          this.snackBar.open('Guest removed', 'Close', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Failed to remove guest', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
